package handler

import (
	"errors"
	"shop-simple-api/models"
	"shop-simple-api/repository"
	"shop-simple-api/service"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type OrderHandler struct {
	service service.OrderService
}

func NewOrderHandler(service service.OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

func (h *OrderHandler) RegisterRoutes(router fiber.Router) {
	orders := router.Group("/orders")
	orders.Post("/", h.CreateOrder)
	orders.Get("/", h.GetAllOrders)
	orders.Get("/:id", h.GetOrderByID)
	orders.Put("/:id/status", h.UpdateOrderStatus)
}

func (h *OrderHandler) CreateOrder(c fiber.Ctx) error {
	var input repository.CreateOrderInput

	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	order, err := h.service.CreateOrder(&input)
	if err != nil {
		if errors.Is(err, repository.ErrInsufficientStock) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Order created successfully",
		"data":    order,
	})
}

func (h *OrderHandler) GetAllOrders(c fiber.Ctx) error {
	orders, err := h.service.GetAllOrders()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": orders})
}

func (h *OrderHandler) GetOrderByID(c fiber.Ctx) error {
	id := fiber.Params[uint](c, "id", 0)
	order, err := h.service.GetOrderByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": order})
}

func (h *OrderHandler) UpdateOrderStatus(c fiber.Ctx) error {
	id := fiber.Params[uint](c, "id", 0)
	if id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	var input struct {
		Status string `json:"status"`
	}

	// Fiber v3: c.Bind().Body(&input) | Fiber v2: c.BodyParser(&input)
	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Parse and validate the status
	orderStatus, err := models.ParseOrderStatus(input.Status)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	// Pass the typed orderStatus to your service
	updatedOrder, err := h.service.UpdateOrderStatus(id, orderStatus)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Order status updated successfully",
		"data":    updatedOrder,
	})
}
