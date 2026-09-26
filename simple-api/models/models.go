package models

import (
	"fmt"

	"gorm.io/gorm"
)

type OrderStatus string

const (
	StatusPending   OrderStatus = "pending"
	StatusCompleted OrderStatus = "completed"
	StatusCancelled OrderStatus = "cancelled"
)

func (s OrderStatus) IsValid() bool {
	switch s {
	case StatusPending, StatusCompleted, StatusCancelled:
		return true
	default:
		return false
	}
}

// ParseOrderStatus converts a raw string into a validated OrderStatus
func ParseOrderStatus(raw string) (OrderStatus, error) {
	status := OrderStatus(raw)
	if !status.IsValid() {
		return "", fmt.Errorf("invalid order status '%s': must be pending, completed, or cancelled", raw)
	}
	return status, nil
}

type Order struct {
	gorm.Model
	CustomerName  string      `json:"customer_name"`
	CustomerEmail string      `json:"customer_email"`
	CustomerPhone string      `json:"customer_phone"`
	TotalAmount   float64     `json:"total_amount"`
	Status        OrderStatus `json:"status" gorm:"default:'pending'"`
	Items         []OrderItem `json:"items" gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE"`
}

type OrderItem struct {
	gorm.Model
	OrderID   uint    `json:"order_id"`
	ProductID uint    `json:"product_id"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"` // Fixed snapshot price at time of order
}

type Product struct {
	gorm.Model
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Price       float64        `json:"price"`
	Stock       int            `json:"stock"`
	Images      []ProductImage `json:"images" gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE"`
	Visible     *bool          `json:"visible" gorm:"default:true"`
}

type ProductImage struct {
	gorm.Model
	ProductID uint   `json:"product_id"`
	URL       string `json:"url"`
}
