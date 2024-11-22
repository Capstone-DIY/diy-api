const bcrypt = require('bcryptjs');
const { authenticateJWT } = require('../middleware.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const router = express.Router();

// Handler

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

    // Hash password sebelum dimasukan ke database
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Membuat user baru
    const newUser = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
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

// Get user berdasarkan ID (dengan JWT Authentication)
router.get('/user/:id', authenticateJWT, async (req, res, next) => {
  const { id } = req.params;

  // Verifikasi user yang sudah login dengan token
  try {
    // Mengecek apakah id user dari token sama dengan user id yang diinginkan
    if (parseInt(id) !== req.id) {
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

// Delete user by ID (dengan JWT Authentication)
router.delete('/user/:id', authenticateJWT, async (req, res, next) => {
  const { id } = req.params;

  // Verifikasi user yang sudah login dengan token
  try {
    // Cek apakah id dari token sama dengan user id yang diinginkan
    if (parseInt(id) !== req.id) {
      return res.status(403).json({
        status_code: 403,
        message: 'Unauthorized to delete this user',
      });
    }

    // Cek apakah pengguna dengan id tersebut ada di database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: 'User not found',
      });
    }

    // Menghapus pengguna dari database
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'User deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;