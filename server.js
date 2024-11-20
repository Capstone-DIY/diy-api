const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/user.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

// User routes
app.get('/users', userRoutes.getUsers);
app.get('/users/:id', userRoutes.getUserById);
app.post('/register', userRoutes.createUser);
app.post('/login', userRoutes.userLogin);
app.put('/users/:id', userRoutes.updatetUserById);

app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}.`);
});