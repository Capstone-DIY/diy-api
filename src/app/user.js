const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT } = require('../middleware.js'); // Import middleware
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

// Get user by ID (with JWT Authentication)
async function getUserByIdHandler(req, res, next) {
  const { userId } = req.params;

  // Verifying the logged-in user with the token
  try {
    // Check if the token's userId matches the requested userId (authorization)
    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({
        status_code: 403,
        message: 'Unauthorized to access this user\'s data',
      });
    }

    // Fetch user data from the database
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(userId) },
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

// Delete user by ID (with JWT Authentication)
async function deleteUserByIdHandler(req, res, next) {
  const { userId } = req.params;

  // Verifying the logged-in user with the token
  try {
    // Check if the token's userId matches the requested userId (authorization)
    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({
        status_code: 403,
        message: 'Unauthorized to delete this user',
      });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: 'User not found',
      });
    }

    // Delete the user from the database
    await prisma.user.delete({
      where: { userId: parseInt(userId) },
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
