package service

import (
	"errors"
	"shop-simple-api/models"
	"shop-simple-api/repository"
)

var (
	ErrProductNotFound = errors.New("product not found")
	ErrInvalidInput    = errors.New("invalid product data")
)

type ProductService interface {
	CreateProduct(product *models.Product) (*models.Product, error)
	GetProductByID(id uint) (*models.Product, error)
	GetAllProducts(alsoInvisible bool) ([]models.Product, error)
	UpdateProduct(id uint, product *models.Product) (*models.Product, error)
	DeleteProduct(id uint) error
	AddProductImage(productID uint, imageURL string) (*models.ProductImage, error)
}

type productService struct {
	repo repository.ProductRepository
}

func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{repo: repo}
}

func (s *productService) CreateProduct(product *models.Product) (*models.Product, error) {
	if product == nil {
		return nil, ErrInvalidInput
	}

	if err := s.repo.Create(product); err != nil {
		return nil, err
	}
	return product, nil
}

func (s *productService) GetProductByID(id uint) (*models.Product, error) {
	if id == 0 {
		return nil, ErrInvalidInput
	}

	product, err := s.repo.GetById(id)
	if err != nil {
		return nil, err
	}
	return product, nil
}

func (s *productService) GetAllProducts(alsoInvisible bool) ([]models.Product, error) {
	if alsoInvisible {
		return s.repo.GetAll()
	} else {
		return s.repo.GetVisible()
	}
}

func (s *productService) UpdateProduct(id uint, updatedData *models.Product) (*models.Product, error) {
	if id == 0 || updatedData == nil {
		return nil, ErrInvalidInput
	}

	existingProduct, err := s.repo.GetById(id)
	if err != nil {
		return nil, err
	}

	// Ensure ID is maintained
	updatedData.ID = existingProduct.ID

	if err := s.repo.Update(updatedData); err != nil {
		return nil, err
	}

	return updatedData, nil
}

func (s *productService) DeleteProduct(id uint) error {
	if id == 0 {
		return ErrInvalidInput
	}

	// Verify existence prior to deletion if needed
	if _, err := s.repo.GetById(id); err != nil {
		return err
	}

	return s.repo.Delete(id)
}

// Add to ProductService interface:
// AddProductImage(productID uint, imageURL string) (*models.ProductImage, error)

func (s *productService) AddProductImage(productID uint, imageURL string) (*models.ProductImage, error) {
	if productID == 0 || imageURL == "" {
		return nil, ErrInvalidInput
	}

	// Verify product exists first
	if _, err := s.repo.GetById(productID); err != nil {
		return nil, err
	}

	img := &models.ProductImage{
		ProductID: productID,
		URL:       imageURL,
	}

	if err := s.repo.AddImage(img); err != nil {
		return nil, err
	}

	return img, nil
}
