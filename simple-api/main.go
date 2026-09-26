package main

import (
	"log"

	"shop-simple-api/handler"
	"shop-simple-api/models"
	"shop-simple-api/repository"
	"shop-simple-api/service"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/static"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("shop.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}

	// Auto-migrate both models
	db.AutoMigrate(&models.Product{}, &models.ProductImage{}, &models.Order{}, &models.OrderItem{})

	productRepo := repository.NewProductRepository(db)
	productService := service.NewProductService(productRepo)
	productHandler := handler.NewProductHandler(productService)

	orderRepo := repository.NewOrderRepository(db)
	orderService := service.NewOrderService(orderRepo)
	orderHandler := handler.NewOrderHandler(orderService)

	actionLogger := service.NewActionLogger("actions.log")
	actionHandler := handler.NewActionHandler(actionLogger)

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "http://localhost:3000"}, // Your frontend URL
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "OPTIONS"},
	}))
	app.Use(logger.New())

	// Serve uploaded images statically at http://localhost:3000/uploads/...
	app.Use("/uploads", static.New("./uploads"))

	api := app.Group("/api/v1")
	productHandler.RegisterRoutes(api)
	orderHandler.RegisterRoutes(api)
	actionHandler.RegisterRoutes(api)
	log.Fatal(app.Listen(":3001"))
}
