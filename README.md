
# SecureTodo App

A secure Todo application built with the MERN stack (MongoDB, Express, React, Node.js) featuring user authentication, task management, and more.

## Features

- User authentication (register, login, logout)
- Todo management (create, read, update, delete)
- Task prioritization
- Task filtering and sorting
- Responsive design
- JWT-based authentication
- Security features (password hashing, protected routes, etc.)

## Project Structure

- `backend/` - Express.js server with MongoDB integration
- `src/` - React frontend application

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB installation)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd ..
   npm install
   ```

### Configuration

1. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/todoApp
   JWT_SECRET=your_jwt_secret_key
   COOKIE_SECRET=your_cookie_secret_key
   NODE_ENV=development
   ```

2. Replace `MONGODB_URI` with your actual MongoDB connection string.

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend:
   ```
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Todos
- `GET /api/todos` - Get all todos for current user
- `POST /api/todos` - Create a new todo
- `GET /api/todos/:id` - Get a specific todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion status
