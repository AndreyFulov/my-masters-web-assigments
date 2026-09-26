package repository

import (
	"shop-simple-api/models"

	"gorm.io/gorm"
)

type ProductRepository interface {
	Create(product *models.Product) error
	GetById(id uint) (*models.Product, error)
	GetAll() ([]models.Product, error)
	Update(product *models.Product) error
	Delete(id uint) error
	AddImage(image *models.ProductImage) error // Added
	GetVisible() ([]models.Product, error)     // Added
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) GetById(id uint) (*models.Product, error) {
	var product models.Product
	// Preload images
	if err := r.db.Preload("Images").First(&product, id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) GetAll() ([]models.Product, error) {
	var products []models.Product
	// Preload images
	if err := r.db.Preload("Images").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *productRepository) GetVisible() ([]models.Product, error) {
	var products []models.Product
	// Preload images and filter by visible
	if err := r.db.Preload("Images").Where("visible = ?", true).Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *productRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}

func (r *productRepository) AddImage(image *models.ProductImage) error {
	return r.db.Create(image).Error
}
