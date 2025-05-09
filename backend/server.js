
require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const { Auth, authConfig } = require('./auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Initialize Auth.js
app.use('/api/auth', Auth(authConfig));

// Routes
app.use('/api/todos', require('./routes/todoRoutes'));
app.use('/api/auth/email', require('./routes/authRoutes'));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
