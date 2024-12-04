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

    const existingUser = await firebase.auth().getUserByEmail(payload.email).catch(() => null);
    if (existingUser) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email sudah terdaftar',
      });
    }

    const userRecord = await firebase.auth().createUser({
      email: payload.email,
      password: payload.password,
    });
    
    const newUser = await prisma.user.create({  
      data: {
        name: payload.name,
        email: payload.email,
        password: '',
        firebase_uid: userRecord.uid,
        contact_number: payload.contact_number,
      },
    });
    
    return res.status(201).json({
      status_code: 201,
      message: 'User successfully registered',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        firebase_uid: newUser.firebase_uid,
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
        message: 'Username and password must be filled',
      });
    }
    
    const user = await firebase.auth().getUserByEmail(payload.email);

    if (!user) {
      return res.status(400).json({
        status_code: 400,
        message: 'Wrong Email or Password',
      });
    }

    // Authenticate the password using Firebase Authentication
    // Firebase Admin does not support password verification directly,
    // Instead, use Firebase client-side SDK for password authentication (on your Android app, for example).
    // Create a custom token to use as a JWT
    const token = await firebase.auth().createCustomToken(user.uid);

    return res.status(200).json({
      status_code: 200,
      message: 'Login successful',
      data: {
        email: user.email,
        firebase_uid: user.uid,
        token: token,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Get user profile by firebase UID with JWT Authentication
router.get('/user/:id', verifyIdToken, async (req, res, next) => {
  const { id } = req.params;

  // Get user firebase ID from database
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
  const userUid = user.firebase_uid;

  try {
    // Check if the user is authorized to access this user
    if (userUid !== req.userUid) {
      return res.status(403).json({
        status_code: 403,
        message: 'Unauthorized to access this user',
      });
    }

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: 'User profile found',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        name: user.name,
        contact_number: user.contact_number,
        firebase_uid: user.firebase_uid,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
