const express = require('express');
const cors = require('cors');

// User routes
const { createAuthHandler } = require('./src/app/auth.js');
const { createUserHandler, getUserByIdHandler, deleteUserByIdHandler } = require('./src/app/user.js');

// Diary routes
const { createDiaryHandler, getAllDiaryHandler } = require('./src/app/diary.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
// app.post('/login', createAuthHandler);

// User routes
// app.post('/register', createUserHandler);
// app.get('/users/:userId', getUserByIdHandler);
// app.delete('/users/:userId', deleteUserByIdHandler);

// Diary routes
app.post('/diary/create', createDiaryHandler);
app.get('/diary', getAllDiaryHandler);

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