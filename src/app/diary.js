const { authenticateJWT } = require('../middleware.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const router = express.Router();

// Membuat diary baru
router.post('/create', authenticateJWT, async (req, res, next) => {
  const payload = req.body;
  const userId = req.userId; // Mengambil userId dari request object yang sudah di-decode dari token

  if (!payload.date || !payload.title || !payload.story) {
    return res.status(400).json({
      status_code: 400,
      message: 'Date, Title atau story harus diisi',
    });
  }

  try {
    // Membuat diary untuk user yang sedang login
    const newDiary = await prisma.diary.create({
      data: {   
        date: payload.date,
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

// Menampilkan semua diary berdasarkan user id
router.get('/:userId', authenticateJWT, async (req, res, next) => {
  const id = req.params.id;  // Mengambil id user dari params

  try {
    const diaries = await prisma.diary.findMany({
      where: { userId: parseInt(id) },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'Diary berhasil ditemukan',
      data: diaries,
    });
  } catch (err) {
    return next(err);
  }
});

// Menampilkan diary berdasarkan id diary
router.get('/:diaryId', authenticateJWT, async (req, res, next) => {
  const id = req.params.id;  // Mengambil id diary dari params

  try {
    const diary = await prisma.diary.findUnique({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'Diary berhasil ditemukan',  
      data: diary,
    });
  } catch (err) {
    return next(err);
  }
});

// Mengedit diary berdasarkan id
router.put('/:diaryID', authenticateJWT, async (req, res, next) => {
  const payload = req.body;
  const userId = req.userId; // Mengambil userId dari request object yang sudah di-decode dari token

  try {
    // Membuat diary untuk user yang sedang login
    const newDiary = await prisma.diary.update({
      data: {   
        date: payload.date,
        title: payload.title,
        story: payload. story,
        emotion: payload.emotion, // Optional
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


// Menghapus diary berdasarkan id
router.delete('/:diaryId', authenticateJWT, async (req, res, next) => {
  const id = req.params.id;  // Mengambil id diary dari params

  try {
    const deletedDiary = await prisma.diary.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'Diary berhasil dihapus',
      data: deletedDiary,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
