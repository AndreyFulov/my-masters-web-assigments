package handler

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"shop-simple-api/models"
	"shop-simple-api/service"
	"strings"
	"time"
	"uuid"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type ProductHandler struct {
	service service.ProductService
}

func NewProductHandler(service service.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

// RegisterRoutes registers endpoints to a Fiber v3 router/group
func (h *ProductHandler) RegisterRoutes(router fiber.Router) {
	products := router.Group("/products")

	products.Post("/", h.CreateProduct)
	products.Get("/", h.GetAllProducts)
	products.Get("/:id", h.GetProductByID)
	products.Put("/:id", h.UpdateProduct)
	products.Delete("/:id", h.DeleteProduct)
	products.Post("/:id/images", h.UploadProductImage)
}

// POST /products
func (h *ProductHandler) CreateProduct(c fiber.Ctx) error {
	var product models.Product

	// v3 unified binding syntax
	if err := c.Bind().Body(&product); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	createdProduct, err := h.service.CreateProduct(&product)
	if err != nil {
		return h.handleError(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Product created successfully",
		"data":    createdProduct,
	})
}

// GET /products
func (h *ProductHandler) GetAllProducts(c fiber.Ctx) error {
	products, err := h.service.GetAllProducts()
	if err != nil {
		return h.handleError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": products,
	})
}

// GET /products/:id
func (h *ProductHandler) GetProductByID(c fiber.Ctx) error {
	// v3 generic param extraction
	id := fiber.Params[uint](c, "id", 0)
	if id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid or missing product ID",
		})
	}

	product, err := h.service.GetProductByID(id)
	if err != nil {
		return h.handleError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": product,
	})
}

// PUT /products/:id
func (h *ProductHandler) UpdateProduct(c fiber.Ctx) error {
	id := fiber.Params[uint](c, "id", 0)
	if id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid or missing product ID",
		})
	}

	var product models.Product
	if err := c.Bind().Body(&product); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	updatedProduct, err := h.service.UpdateProduct(id, &product)
	if err != nil {
		return h.handleError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Product updated successfully",
		"data":    updatedProduct,
	})
}

// DELETE /products/:id
func (h *ProductHandler) DeleteProduct(c fiber.Ctx) error {
	id := fiber.Params[uint](c, "id", 0)
	if id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid or missing product ID",
		})
	}

	if err := h.service.DeleteProduct(id); err != nil {
		return h.handleError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Product deleted successfully",
	})
}

func (h *ProductHandler) UploadProductImage(c fiber.Ctx) error {
	productID := fiber.Params[uint](c, "id", 0)
	if productID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid or missing product ID",
		})
	}

	// 1. Parse uploaded file from multipart form
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Image file is required in 'image' field",
		})
	}

	// 2. Validate file extension / MIME type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
	}
	if !allowedExtensions[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Only .jpg, .jpeg, .png, and .webp files are allowed",
		})
	}

	// 3. Ensure uploads folder exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create upload directory",
		})
	}

	// 4. Generate unique filename to avoid collision
	uniqueFilename := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	savePath := filepath.Join(uploadDir, uniqueFilename)

	// 5. Save file to disk
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save file",
		})
	}

	// 6. Save image record to database
	imageURL := fmt.Sprintf("/uploads/%s", uniqueFilename)
	imgRecord, err := h.service.AddProductImage(productID, imageURL)
	if err != nil {
		// Clean up uploaded file if DB record insertion fails
		_ = os.Remove(savePath)
		return h.handleError(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Image uploaded successfully",
		"data":    imgRecord,
	})
}

// handleError maps domain/gorm errors to HTTP responses
func (h *ProductHandler) handleError(c fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, service.ErrProductNotFound), errors.Is(err, gorm.ErrRecordNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	case errors.Is(err, service.ErrInvalidInput):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Internal server error",
		})
	}
}
