package repository

import (
	"errors"
	"fmt"
	"shop-simple-api/models"

	"gorm.io/gorm"
)

var ErrInsufficientStock = errors.New("insufficient stock for one or more items")

type CreateOrderItemInput struct {
	ProductID uint `json:"product_id"`
	Quantity  int  `json:"quantity"`
}

type CreateOrderInput struct {
	CustomerName  string                 `json:"customer_name"`
	CustomerEmail string                 `json:"customer_email"`
	CustomerPhone string                 `json:"customer_phone"`
	Items         []CreateOrderItemInput `json:"items"`
}

type OrderRepository interface {
	CreateOrder(input *CreateOrderInput) (*models.Order, error)
	GetByID(id uint) (*models.Order, error)
	GetAll() ([]models.Order, error)
	UpdateOrderStatus(id uint, status models.OrderStatus) (*models.Order, error)
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) CreateOrder(input *CreateOrderInput) (*models.Order, error) {
	var createdOrder models.Order

	// Execute inside an atomic transaction
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var totalAmount float64
		var orderItems []models.OrderItem

		for _, itemInput := range input.Items {
			if itemInput.Quantity <= 0 {
				return fmt.Errorf("invalid quantity for product %d", itemInput.ProductID)
			}

			// Lock the product row for update to prevent race conditions
			var product models.Product
			if err := tx.First(&product, itemInput.ProductID).Error; err != nil {
				return fmt.Errorf("product %d not found: %w", itemInput.ProductID, err)
			}

			if product.Stock < itemInput.Quantity {
				return fmt.Errorf("%w: %s has only %d in stock", ErrInsufficientStock, product.Name, product.Stock)
			}

			// Deduct stock
			product.Stock -= itemInput.Quantity
			if err := tx.Save(&product).Error; err != nil {
				return err
			}

			itemTotal := product.Price * float64(itemInput.Quantity)
			totalAmount += itemTotal

			orderItems = append(orderItems, models.OrderItem{
				ProductID: product.ID,
				Quantity:  itemInput.Quantity,
				Price:     product.Price,
			})
		}

		// Save Order Header
		createdOrder = models.Order{
			CustomerName:  input.CustomerName,
			CustomerEmail: input.CustomerEmail,
			CustomerPhone: input.CustomerPhone,
			TotalAmount:   totalAmount,
			Status:        models.StatusPending,
			Items:         orderItems,
		}

		if err := tx.Create(&createdOrder).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Preload items and products for the response
	r.db.Preload("Items.Product.Images").First(&createdOrder, createdOrder.ID)
	return &createdOrder, nil
}

func (r *orderRepository) GetByID(id uint) (*models.Order, error) {
	var order models.Order
	if err := r.db.Preload("Items.Product.Images").First(&order, id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) GetAll() ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.Preload("Items.Product.Images").Order("created_at desc").Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}
func (r *orderRepository) UpdateOrderStatus(id uint, status models.OrderStatus) (*models.Order, error) {
	var order models.Order
	if err := r.db.First(&order, id).Error; err != nil {
		return nil, err
	}

	order.Status = status
	if err := r.db.Save(&order).Error; err != nil {
		return nil, err
	}

	return &order, nil
}
