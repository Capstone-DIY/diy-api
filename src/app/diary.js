const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT } = require('../middleware.js'); // Import middleware
const prisma = new PrismaClient();
const router = express.Router();

// Route untuk membuat diary
router.post('/create', authenticateJWT, async (req, res, next) => {
  const payload = req.body;
  const userId = req.userId; // Mengambil userId dari request object yang sudah di-decode dari token

  if (!payload.title || !payload.story) {
    return res.status(400).json({
      status_code: 400,
      message: 'Title dan story harus diisi',
    });
  }

  try {
    // Membuat diary untuk user yang sedang login
    const newDiary = await prisma.diary.create({
      data: {
        date: new Date(),
        title: payload.title,
        story: payload.story,
        emotion: payload.emotion, // Optional
        created_at: new Date(),
        updated_at: new Date(),
        userId: userId,  // Menyertakan userId yang didapat dari token
      },
    });

    return res.status(201).json({
      status_code: 201,
      message: 'Diary berhasil ditambahkan',
      data: {
        diaryId: newDiary.diaryId,
        title: newDiary.title,
        story: newDiary.story,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
