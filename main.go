package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Todo struct {
	ID       primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Complete bool               `json:"complete"`
	Body     string             `json:"body"`
}

var collection *mongo.Collection

func initEnv() {
	// Only load .env if MONGODB_URI is not already set (i.e., local dev)
	if os.Getenv("MONGODB_URI") == "" {
		err := godotenv.Load(".env")
		if err != nil {
			log.Println("No .env file found, relying on environment variables")
		}
	}
}

func main() {
	// Initialize environment variables
	initEnv()

	//Load env variables
	MONGODB_URI := os.Getenv("MONGODB_URI")
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "3000"
	}

	//Connect to MongoDB
	clientOptions := options.Client().ApplyURI(MONGODB_URI)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	//Disconnect client once main function is finished
	defer client.Disconnect(context.Background())

	// Check the connection
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB!")

	//Get a handle for your collection
	collection = (client.Database("golang_db").Collection("todos"))

	app := fiber.New()

	// Add CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "http://127.0.0.1:5173", "https://react-go-gpfo.onrender.com", "https://react-go-api-task.vercel.app"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept"},
	}))

	app.Get("/", func(c fiber.Ctx) error {
		//Health check endpoint status 200 Ok
		return c.Status(200).JSON(fiber.Map{"status": "OK"})
	})

	app.Get("/api/health", func(c fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"status": "healthy"})
	})

	//Todo CRUD routes
	app.Get("/api/todos", getTodos)
	app.Get("/api/todos/:id", getTodo)
	app.Post("/api/todos", createTodo)
	app.Patch("/api/todos/:id", updateTodo)
	app.Delete("/api/todos/:id", deleteTodo)

	//Start the server on ENV PORT
	log.Fatal(app.Listen("0.0.0.0:" + PORT))
}

func getTodos(c fiber.Ctx) error {
	var todos []Todo

	//Fetch all todos from the database
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return err
	}

	//Close the connection once finished
	defer cursor.Close(context.Background())

	//Iterate through the cursor and decode each document into a Todo struct
	for cursor.Next(context.Background()) {
		var todo Todo
		if err := cursor.Decode(&todo); err != nil {
			return err
		}
		todos = append(todos, todo)
	}
	//Return the todos as JSON response
	return c.Status(fiber.StatusOK).JSON(todos)
}

func getTodo(c fiber.Ctx) error {
	id := c.Params("id")
	//Convert the id string to a MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID",
		})
	}

	//Create a filter to find the document by its ID
	filter := bson.M{"_id": objectID}
	var todo Todo
	//Find the todo in the database
	if err := collection.FindOne(context.Background(), filter).Decode(&todo); err != nil {
		return err
	}
	//Return the todo as JSON response
	return c.Status(fiber.StatusOK).JSON(todo)

}
func createTodo(c fiber.Ctx) error {
	todo := new(Todo)
	//Parse the request body into the Todo struct
	if err := json.Unmarshal(c.Body(), todo); err != nil {
		return err
	}
	//Validate the input
	if todo.Body == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Body is required",
		})
	}
	//Generate a new ObjectID
	todo.ID = primitive.NewObjectID()

	//Insert the new todo into the database
	if _, err := collection.InsertOne(context.Background(), todo); err != nil {
		return err
	}

	//return the newly created todo as JSON response
	return c.Status(201).JSON(todo)
}

func updateTodo(c fiber.Ctx) error {
	id := c.Params("id")
	//convert the id string to a MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID",
		})
	}

	// Create a filter to find the document by its ID
	filter := bson.M{"_id": objectID}
	
	// Use MongoDB's aggregation pipeline to atomically toggle the boolean
	// This prevents race conditions by doing the read and update in a single operation
	update := bson.A{
		bson.M{
			"$set": bson.M{
				"complete": bson.M{
					"$not": "$complete", // Toggle the boolean value atomically
				},
			},
		},
	}
	
	// Use FindOneAndUpdate with aggregation pipeline and ReturnDocument.After
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedTodo Todo
	err = collection.FindOneAndUpdate(context.Background(), filter, update, opts).Decode(&updatedTodo)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(404).JSON(fiber.Map{
				"error": "Todo not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update todo",
		})
	}

	// Return the updated todo data
	return c.Status(200).JSON(updatedTodo)
}

func deleteTodo(c fiber.Ctx) error {
	id := c.Params("id")
	//Convert the id string to a MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID",
		})
	}

	//Create a filter to find the document by its ID
	filter := bson.M{"_id": objectID}
	//Execute the delete operation in MongoDB
	_, err = collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}
	//Return a success message
	return c.Status(200).JSON(fiber.Map{
		"message": "Todo deleted successfully",
	})
}
