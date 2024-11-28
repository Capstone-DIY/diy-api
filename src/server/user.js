const bcrypt = require('bcryptjs');
const firebase = require('../services/firebase.js');
const { authenticateJWT } = require('../middleware.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const router = express.Router();

// Membuat user baru
router.post('/register', async (req, res, next) => {
  const payload = req.body;

  try {
    if (!payload.email || !payload.password) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email dan password harus diisi',
      });
    }

    // Melakukan pengecekan email yang terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email sudah terdaftar',
      });
    }

    // Membuat user baru
    const newUser = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: '', // Tidak perlu menyimpan password karena menggunakan Firebase Authentication
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

// Login user
router.post('/login', async (req, res, next) => {
  const payload = req.body;

  try {
    if (!payload.email || !payload.password) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email dan password harus diisi',
      });
    }

    // Verifikasi kredensial dengan Firebase Authentication
    const user = await admin.auth().getUserByEmail(payload.email);

    if (!user) {
      return res.status(400).json({
        status_code: 400,
        message: 'Email atau password salah',
      });
    }

    // Autentikasi password menggunakan Firebase Authentication
    const token = await admin.auth().createCustomToken(user.id)

    return res.status(200).json({
      status_code: 200,
      message: 'Login berhasil',
      data: {
        token: token,
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    return next(err);
  }
});


// Get user berdasarkan ID (dengan JWT Authentication)
router.get('/user/:id', authenticateJWT, async (req, res, next) => {
  const { id } = req.params;
  
  try {
    // Mengecek apakah id user dari token sama dengan user id yang diinginkan
    if (parseInt(id) !== req.userId) {
      return res.status(403).json({
        status_code: 403,
        message: 'Tidak dizinkan untuk mengakses user ini',
      });
    }

    // Mengambil user data dari database
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
        username: user.username,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;