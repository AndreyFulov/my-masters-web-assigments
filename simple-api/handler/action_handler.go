package handler

import (
	"shop-simple-api/service"

	"github.com/gofiber/fiber/v3"
)

type ActionHandler struct {
	logger *service.ActionLogger
}

func NewActionHandler(logger *service.ActionLogger) *ActionHandler {
	return &ActionHandler{logger: logger}
}

func (h *ActionHandler) RegisterRoutes(router fiber.Router) {
	router.Post("/actions/log", h.LogAction)
	router.Get("/actions/logs", h.GetLogs)
}
func (h *ActionHandler) GetLogs(c fiber.Ctx) error {
	limit := fiber.Query[int](c, "limit", 100) // Default last 100 entries

	logs, err := h.logger.GetLogs(limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read logs",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": logs,
	})
}
func (h *ActionHandler) LogAction(c fiber.Ctx) error {
	var input struct {
		Action  string                 `json:"action"`
		Payload map[string]interface{} `json:"payload"`
	}

	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	if input.Action == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Action name required"})
	}

	ip := c.IP()
	if err := h.logger.Log(input.Action, ip, input.Payload); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not write log"})
	}

	return c.SendStatus(fiber.StatusOK)
}
