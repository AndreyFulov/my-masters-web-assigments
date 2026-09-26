package service

import (
	"errors"
	"shop-simple-api/models"
	"shop-simple-api/repository"
)

type OrderService interface {
	CreateOrder(input *repository.CreateOrderInput) (*models.Order, error)
	GetOrderByID(id uint) (*models.Order, error)
	GetAllOrders() ([]models.Order, error)
	UpdateOrderStatus(id uint, status models.OrderStatus) (*models.Order, error)
}

type orderService struct {
	repo repository.OrderRepository
}

func NewOrderService(repo repository.OrderRepository) OrderService {
	return &orderService{repo: repo}
}

func (s *orderService) CreateOrder(input *repository.CreateOrderInput) (*models.Order, error) {
	if input == nil || len(input.Items) == 0 {
		return nil, errors.New("cart is empty")
	}
	if input.CustomerName == "" || input.CustomerPhone == "" {
		return nil, errors.New("customer name and phone are required")
	}
	return s.repo.CreateOrder(input)
}

func (s *orderService) GetOrderByID(id uint) (*models.Order, error) {
	return s.repo.GetByID(id)
}

func (s *orderService) GetAllOrders() ([]models.Order, error) {
	return s.repo.GetAll()
}
func (s *orderService) UpdateOrderStatus(id uint, status models.OrderStatus) (*models.Order, error) {
	order, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	order.Status = status
	return s.repo.UpdateOrderStatus(id, status)
}
