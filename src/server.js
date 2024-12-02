const { initializeFirebase } = require('./services/firebase.js'); // Ensure Firebase is initialized

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

// Initialize Firebase before the app starts
initializeFirebase();  // This ensures Firebase is initialized before the routes

app.use(cors());
app.use(express.json());

checkDatabaseConnection();

// User routes
app.use('/', userRouter);

// Diary routes
app.use('/diary', diaryRouter);

// Error Handling middleware (this goes last)
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
