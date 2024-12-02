const { initializeFirebase } = require('./services/firebase.js');
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 8080;

// Connection checker
const { checkDatabaseConnection } = require('./services/checkConnection.js');

// User Routes
const userRouter = require('./server/user.js');

// Diary Routes
const diaryRouter = require('./server/diary.js');

// Middleware
app.use(cors());
app.use(express.json());

// Route untuk root path ("/")
app.get('/', (req, res) => {
  res.send('Welcome to the DIY API!'); // Menampilkan pesan selamat datang
});

// Check database connection
checkDatabaseConnection();

// User routes
app.use('/user', userRouter);

// Diary routes
app.use('/diary', diaryRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status_code: 500,
    message: 'Internal Server Error',
    error: err.message || err,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}.`);
});
