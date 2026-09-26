package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Price       float64        `json:"price"`
	Stock       int            `json:"stock"`
	Images      []ProductImage `json:"images" gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE"`
}

type ProductImage struct {
	gorm.Model
	ProductID uint   `json:"product_id"`
	URL       string `json:"url"`
}
