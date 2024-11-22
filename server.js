const express = require('express');
const cors = require('cors');

// Connection checker
const { checkDatabaseConnection } = require('./src/app/checkConnection.js');

// User Routes
const authRouter = require('./src/app/auth.js');
const userRouter = require('./src/app/user.js');

// Diary Routes
const diaryRouter = require('./src/app/diary.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json());

checkDatabaseConnection();

// Auth route
app.use('/login', authRouter);

// User routes
app.use('/', userRouter);

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