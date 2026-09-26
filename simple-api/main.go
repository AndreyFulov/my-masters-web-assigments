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
	db.AutoMigrate(&models.Product{}, &models.ProductImage{})

	productRepo := repository.NewProductRepository(db)
	productService := service.NewProductService(productRepo)
	productHandler := handler.NewProductHandler(productService)

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "http://localhost:3000"}, // Your frontend URL
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	}))
	app.Use(logger.New())

	// Serve uploaded images statically at http://localhost:3000/uploads/...
	app.Use("/uploads", static.New("./uploads"))

	api := app.Group("/api/v1")
	productHandler.RegisterRoutes(api)

	log.Fatal(app.Listen(":3001"))
}
