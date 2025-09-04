package main

import (
	"encoding/json"
	"fmt"
	"log"

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

	//Create a TODO
	app.Post("/api/todos", func(c fiber.Ctx) error {
		todo := &Todo{}
		if err := json.Unmarshal(c.Body(), todo); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
		}

		if todo.Body == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Body is required"})
		}

		todo.ID = len(todos) + 1
		todos = append(todos, *todo)
		return c.Status(201).JSON(todo)
	})

	//Update a TODO
	app.Patch("/api/todos/:id", func(c fiber.Ctx) error {
		id := c.Params("id")
		for i, todo := range todos {
			if fmt.Sprint(todo.ID) == id {
				todos[i].Completed = !todos[i].Completed
				return c.Status(200).JSON(todos[i])
			}
		}
		return c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
	})

	//Delete a TODO
	app.Delete("/api/todos/:id", func(c fiber.Ctx) error {
		id := c.Params("id")
		for i, todo := range todos {
			if fmt.Sprint(todo.ID) == id {
				todos = append(todos[:i], todos[i+1:]...)
				return c.Status(200).JSON(fiber.Map{"msg": "Todo deleted"})
			}
		}
		return c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
	})

	//Get all TODOs
	app.Get("/api/todos", func(c fiber.Ctx) error {
		return c.Status(200).JSON(todos)
	})

	//Get a single TODO
	app.Get("/api/todos/:id", func(c fiber.Ctx) error {
		id := c.Params("id")
		for _, todo := range todos {
			if fmt.Sprint(todo.ID) == id {
				return c.Status(200).JSON(todo)
			}
		}
		return c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
	})

	//Start server
	log.Fatal(app.Listen(":3000"))
}
