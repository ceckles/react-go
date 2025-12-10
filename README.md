# 📝 Todo Application

<div align="center">

![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Fiber](https://img.shields.io/badge/Fiber-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Chakra UI](https://img.shields.io/badge/Chakra%20UI-319795?style=for-the-badge&logo=chakra-ui&logoColor=white)

A modern full-stack todo application built with Go (Fiber) backend and React (Vite + TypeScript) frontend.

[Live Demo](https://react-go-api-task.vercel.app) • [API](https://react-go-gpfo.onrender.com/api)

</div>

---

## 🚀 Features

- ✅ Create, read, update, and delete todos
- 🔄 Real-time todo status toggling
- 🎨 Modern UI built with Chakra UI
- ⚡ Fast development with Vite and Air hot reload
- 🔒 Type-safe with TypeScript
- 📦 RESTful API architecture
- 🌐 CORS-enabled for cross-origin requests

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Go** 1.21 or higher ([Download](https://go.dev/dl/))
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **pnpm** ([Installation Guide](https://pnpm.io/installation))
- **MongoDB Atlas** account or local MongoDB installation

## 🏗️ Project Structure

```
react-go/
├── client/                 # React frontend application
│   ├── src/               # Source files
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── main.go                # Go backend server
├── go.mod                 # Go module dependencies
├── go.sum                 # Go dependency checksums
├── air.toml               # Air hot reload configuration
└── .env                   # Environment variables (create this)
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Frontend Configuration (for client/.env)
VITE_BACKEND_URL=http://localhost:3001/api
```

**Note:** For production deployments, set these as environment variables in your hosting platform.

### MongoDB Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user and get your connection string
4. Add your IP address to the whitelist
5. Copy the connection string and add it to your `.env` file

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ceckles/react-go.git
cd react-go
```

### 2. Backend Setup

1. **Install Go dependencies:**
   ```bash
   go mod tidy
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env  # If you have an example file
   # Or create manually with the variables above
   ```

3. **Install Air for hot reloading (optional but recommended):**
   ```bash
   go install github.com/cosmtrek/air@latest
   ```

### 3. Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create `.env` file in client directory (if needed):**
   ```env
   VITE_BACKEND_URL=http://localhost:3001/api
   ```

## 🚦 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
# From root directory
air
# Or without Air:
go run main.go
```

The backend server will run on `http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
# From client directory
cd client
pnpm run dev
```

The React app will run on `http://localhost:5173`

### Production Build

**Build Frontend:**
```bash
cd client
pnpm run build
```

**Run Backend:**
```bash
go build -o main main.go
./main
```

## 📡 API Documentation

### Base URL
- **Local:** `http://localhost:3001/api`
- **Production:** `https://react-go-gpfo.onrender.com/api`

### Endpoints

#### Health Check
```http
GET /
```
**Response:**
```json
{
  "status": "OK"
}
```

#### Get All Todos
```http
GET /api/todos
```
**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "body": "Complete the project",
    "complete": false
  }
]
```

#### Get Single Todo
```http
GET /api/todos/:id
```
**Parameters:**
- `id` (string, required) - MongoDB ObjectID

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "body": "Complete the project",
  "complete": false
}
```

#### Create Todo
```http
POST /api/todos
Content-Type: application/json
```
**Request Body:**
```json
{
  "body": "New todo item",
  "complete": false
}
```
**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "body": "New todo item",
  "complete": false
}
```

#### Update Todo (Toggle Completion)
```http
PATCH /api/todos/:id
```
**Parameters:**
- `id` (string, required) - MongoDB ObjectID

**Response:** `200 OK`
```json
{
  "message": "Todo updated successfully"
}
```

#### Delete Todo
```http
DELETE /api/todos/:id
```
**Parameters:**
- `id` (string, required) - MongoDB ObjectID

**Response:** `200 OK`
```json
{
  "message": "Todo deleted successfully"
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid ID"
}
```

```json
{
  "error": "Body is required"
}
```

## 🛠️ Tech Stack

### Backend
- **[Go](https://go.dev/)** - Programming language
- **[Fiber](https://gofiber.io/)** - Express-inspired web framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[MongoDB Go Driver](https://www.mongodb.com/docs/drivers/go/)** - Official MongoDB driver
- **[Air](https://github.com/cosmtrek/air)** - Live reload utility
- **[godotenv](https://github.com/joho/godotenv)** - Environment variable management

### Frontend
- **[React](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Chakra UI](https://chakra-ui.com/)** - Component library
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching
- **[React Icons](https://react-icons.github.io/react-icons/)** - Icon library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

## 🚀 Deployment

### Backend Deployment (Render)

The backend is deployed on [Render](https://render.com) at:
- **URL:** `https://react-go-gpfo.onrender.com/api`

**Steps:**
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `go build -o main main.go`
4. Set start command: `./main`
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: `3001` (or let Render assign one)

### Frontend Deployment (Vercel)

The frontend is deployed on [Vercel](https://vercel.com) at:
- **URL:** `https://react-go-api-task.vercel.app`

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd client
   vercel
   ```

4. **Production deployment:**
   ```bash
   vercel --prod
   ```

5. **Configure Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `VITE_BACKEND_URL` with your backend API URL

### Environment Variables for Production

**Backend (Render):**
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (optional, Render assigns automatically)

**Frontend (Vercel):**
- `VITE_BACKEND_URL` - Backend API URL (e.g., `https://react-go-gpfo.onrender.com/api`)

## 🔧 Development Tools

### Air Configuration

The project uses [Air](https://github.com/cosmtrek/air) for hot reloading during development. Configuration is in `air.toml`:

- Monitors `.go` files for changes
- Excludes `tmp/` and `client/` directories
- Automatically rebuilds and restarts the server

### Vite Configuration

Vite is configured in `client/vite.config.ts` with React plugin support for fast HMR (Hot Module Replacement).

## 📝 License

This project is open source and available under the [MIT License](LICENSE).



## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ceckles/react-go/issues).

