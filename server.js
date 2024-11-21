const express = require('express');
const cors = require('cors');

// Connection checker
const { checkDatabaseConnection } = require('./src/app/checkConnection.js');

// Import Routes
const { createAuthHandler } = require('./src/app/auth.js');
const { createUserHandler, getUserByIdHandler, deleteUserByIdHandler } = require('./src/app/user.js');
const { authenticateJWT } = require('./src/middleware.js'); // Import middleware

// Diary routes
const diaryRouter = require('./src/app/diary.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PORT = process.env.PORT || 8000;

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

checkDatabaseConnection();

// Auth route
app.post('/login', createAuthHandler);  // Route untuk login

// User routes
app.post('/register', createUserHandler);

// Use JWT authentication middleware for secure routes
app.get('/users/:userId', authenticateJWT, getUserByIdHandler);  // Secure route with JWT
app.delete('/users/:userId', authenticateJWT, deleteUserByIdHandler);  // Secure route with JWT

// Diary routes
app.use('/diary', diaryRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status_code: 500,
    message: 'Internal Server Error',
    error: err.message || err,
  });
});

app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}.`);
});