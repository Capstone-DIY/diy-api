const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const router = express.Router();

router.post('/', async (req, res, next) => {
  const payload = req.body;

  try {
    if (!payload.password) {
      throw new Error('Password wajib dimasukan');
    }

    // Mencari username di database dari username di payload
    const user = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    // Membandingkan password yang sudah dihash di database dengan password di payload
    const isPasswordMatch = await bcrypt.compare(
      payload.password,
      user?.password?? ''
    );

    if (user === null || !isPasswordMatch) {
      throw new Error('Username atau password salah');
    }

    const token = jwt.sign({id: user.userId}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    return res.status(200).json({
      status_code: 200,
      message: 'Login berhasil',
      data: {
        token: token,
        id: user.userId,
        username: user.username,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;