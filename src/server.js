const { initializeFirebase } = require('./services/firebase.js');
initializeFirebase();

const InputError = require('./exceptions/InputError.js');
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

app.use(cors());
app.use(express.json());

checkDatabaseConnection();

// User routes
app.use('/', userRouter);

// Diary routes
app.use('/diary', diaryRouter);

// Error Handling middleware (this goes last)
app.use((err, req, res, next) => {
  if (err instanceof InputError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  if (err.isBoom) {
    return res.status(err.output.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  next(err);
});

app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}.`);
});
