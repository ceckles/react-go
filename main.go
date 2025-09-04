package main

import (
	"fmt"
	"log"

	"encoding/json"

	"github.com/gofiber/fiber/v3"
)

type Todo struct {
	ID        int    `json:"id"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

func main() {
	fmt.Println("Hello, World!")
	app := fiber.New()

	todos := []Todo{}

	//Base route
	app.Get("/", func(c fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"msg": "Hello, World!"})
	})

	app.Post("/api/todos", func(c fiber.Ctx) error {
		todo := &Todo{}
		if err := json.Unmarshal(c.Body(), todo); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
		}

		if todo.Body == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Body is required"})
		}

		todo.ID = len(todos) + 1
		todos= append(todos, *todo)

		return c.Status(201).JSON(todo)
	})

	log.Fatal(app.Listen(":3000"))
}
