# Go-React Todo Application

A full-stack todo application built with Go (Fiber) backend and React (Vite) frontend.

## Prerequisites

- Go 1.21 or higher
- Node.js 18 or higher
- pnpm
- MongoDB Atlas account (or local MongoDB installation)

## Project Structure

```
GO-TASK/
├── client/          # React frontend
├── main.go         # Go backend server
├── air.toml        # Air configuration for hot reload
└── .env            # Environment variables
```

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ceckles/react-go.git
cd react-go
```

### 2. Backend Setup

1. Install Go dependencies:
```bash
go mod tidy
```

2. Create `.env` file in the root directory:
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
```

3. Install Air for hot reloading:
```bash
go install github.com/cosmtrek/air@latest
```

### 3. Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
pnpm install
```

## Running the Application

### Start the Backend Server

From the root directory:
```bash
air
```
The server will run on http://localhost:3001

### Start the Frontend Development Server

From the client directory:
```bash
pnpm run dev
```
The React app will run on http://localhost:5173

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo by ID
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/:id` - Toggle todo completion status
- `DELETE /api/todos/:id` - Delete a todo

## Technologies Used

### Backend
- Go
- Fiber (web framework)
- MongoDB (database)
- Air (hot reloading)

### Frontend
- React
- Vite
- Chakra UI
- React Query
- TypeScript

## Deployment

### Environment Variables

Make sure to set these secrets in your GitHub repository:
- `MONGODB_URI`: Your MongoDB connection string
- `VITE_BACKEND_URL`: for the url of the backend

### Deployment to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to Vercel:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

The deployment will:
- Build and deploy your Go backend as serverless functions
- Build and deploy your React frontend
- Provide you with a production URL

Environment Variables:
- Add your `MONGODB_URI` in the Vercel dashboard under Settings > Environment Variables

Backedn deployed to Render at https://react-go-gpfo.onrender.com/api