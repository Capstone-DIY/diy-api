const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Handlers

// Create a new user
async function createUserHandler(req, res, next) {
  const payload = req.body;

  try {
    if (!payload.username || !payload.password) {
      return res.status(400).json({
        status_code: 400,
        message: 'Username and password are required',
      });
    }

    // Check if user with the same username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (existingUser) {
      return res.status(400).json({
        status_code: 400,
        message: 'Username already exists',
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        username: payload.username,
        password: hashedPassword,
        userId: uuid.v4(), // Generate a unique userId
      },
    });

    return res.status(201).json({
      status_code: 201,
      message: 'User created successfully',
      data: {
        id: newUser.userId,
        username: newUser.username,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// Get user by ID
async function getUserByIdHandler(req, res, next) {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: 'User found',
      data: {
        id: user.userId,
        username: user.username,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// Delete user by ID
async function deleteUserByIdHandler(req, res, next) {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: 'User not found',
      });
    }

    await prisma.user.delete({
      where: { userId: userId },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'User deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createUserHandler, getUserByIdHandler, deleteUserByIdHandler };