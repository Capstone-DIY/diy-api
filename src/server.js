const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 8000;

// Connection checker
const { checkDatabaseConnection } = require('./services/checkConnection.js');

// TODO: Load model
// const loadModel = require('./services/loadModel.js');
// let model;

// async function initModel() {
  //   model = await loadModel();
  //   console.log('Model siap digunakan');
  // }
  
  // initModel();

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

app.use((err, res) => {
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