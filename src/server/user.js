const { firebase } = require('../services/firebase.js');
const { verifyIdToken } = require('../middleware.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res, next) => {
  const payload = req.body;

  try {
    if (!payload.email || !payload.password) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email dan password harus diisi',
      });
    }
    
    // Check if email already exists in Firebase
    const existingUser = await firebase.auth().getUserByEmail(payload.email).catch(() => null);
    if (existingUser) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email sudah terdaftar',
      });
    }
     
    // Create a user in Firebase Authentication
    const userRecord = await firebase.auth().createUser({
      email: payload.email,
      password: payload.password,
      displayName: payload.name,
      phoneNumber: payload.contact_number,
    });

    // Create a new user in the database
    const newUser = await prisma.user.create({  
      data: {
        name: payload.name,
        email: payload.email,
        password: '', // Do not store password because using Firebase Authentication
        contact_number: payload.contact_number,
      },
    });
    
    return res.status(201).json({
      status_code: 201,
      message: 'Pengguna berhasil ditambahkan',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Login a user
router.post('/login', async (req, res, next) => {
  const payload = req.body;

  try {
    if (!payload.email || !payload.password) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email dan password harus diisi',
      });
    }

    // Get the user by email from Firebase Authentication
    const user = await firebase.auth().getUserByEmail(payload.email);

    if (!user) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email atau password salah',
      });
    }

    // Authenticate the password using Firebase Authentication
    // Firebase Admin does not support password verification directly,
    // Instead, use Firebase client-side SDK for password authentication (on your Android app, for example).
    // Create a custom token to use as a JWT
    const token = await firebase.auth().createCustomToken(user.uid);

    return res.status(200).json({
      status_code: 200,
      message: 'Login berhasil',
      data: {
        token: token,
        id: user.uid,
        email: user.email,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Get user by ID with JWT Authentication
router.get('/user/:id', verifyIdToken, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Ensure that the user ID from the token matches the requested user ID
    if (parseInt(id) !== req.userId) {
      return res.status(403).json({
        status_code: 403,
        message: 'Tidak dizinkan untuk mengakses user ini',
      });
    }

    // Get the user data from the database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: 'Pengguna tidak ditemukan',
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: 'Pengguna ditemukan',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
