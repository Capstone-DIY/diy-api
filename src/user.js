const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Handlers
async function createUser (req, res) {
  const { username, password } = req.body;

  res.json({
    username: username,
    password: password,
    password,
    username,
  });

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    await database.user.create({
      data: {
        userId: uuid(),
        username: username,
        password: password,
      },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: Number(id),
      },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const userLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (user.password === password) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatetUserById = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    const user = await prisma.user.update({
      where: {
        userId: Number(id),
      },
      data: {
        username,
        password,
      },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createUser, getUsers, getUserById, userLogin, updatetUserById };