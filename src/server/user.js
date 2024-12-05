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
      displayName: payload.name,
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

    return res.status(200).json({
      status_code: 200,
      message: 'Login successful',
      data: {
        name: user.displayName,
        email: user.email,
        firebase_uid: user.uid,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Get user profile by firebase UID with Firebase ID Token
router.get('/user/:id', verifyIdToken, async (req, res, next) => {
  const { id } = req.params;

  // Get user firebase ID from database
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
  const userUid = user.firebase_uid;

  try {
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
        name: user.name,
        username: user.username,
        dob: user.dob,
        contact_number: user.contact_number,
        gender: user.gender,
      },
    });
  } catch (err) {
    return next(err);
  }
});


// Update user profile by firebase UID with Firebase ID Token
router.patch('/user/update/:id', verifyIdToken, async (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: 'User not found',
      });
    }

    if (user.firebase_uid !== req.userUid) {
      return res.status(403).json({
        status_code: 403,
        message: 'Unauthorized to update this user',
      });
    }
      
    // Check the dob input format
    if (payload.dob) {
      const dobRegex = /^\d{1,2}-\d{1,2}-\d{4}$/;
      if (!dobRegex.test(payload.dob)) {
        return res.status(400).json({
          status_code: 400,
          message: 'Invalid date of birth format. Please use DD-MM-YYYY.',
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name: payload.name,
        username: payload.username,
        dob: payload.dob,
        contact_number: payload.contact_number,
        gender: payload.gender,
      }
    });

    firebase.auth().updateUser(user.firebase_uid, {
      displayName: payload.name,
    });

    return res.status(200).json({
      status_code: 200,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
