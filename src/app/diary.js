const { authenticateJWT } = require('../middleware.js');
const { parse } = require('date-fns'); 

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const router = express.Router();

// Membuat diary baru
router.post('/create', authenticateJWT, async (req, res, next) => {
  const userId = req.userId; // Mengambil userId dari request object yang sudah di-decode dari token

  const payload = req.body;

  if (!payload.date || !payload.title || !payload.story) {
    return res.status(400).json({
      status_code: 400,
      message: 'Date, Title atau story harus diisi',
    });
  }

  try {

    const parseDate = (dateString) => {
      // Format yang bisa diterima
      const formats = [
        'EEEE, dd - MMMM - yyyy',
        'EEEE, dd MMMM yyyy',
        'dd-MM-yyyy',
        'dd MM yyyy',
        'dd/MM/yyyy',
        'yyyy-MM-dd'
      ];

      for(let formatSting of formats) {
        const parsedDate = parse(dateString, formatSting, new Date());
        if(!isNaN(parsedDate)) {
          // Ubah format yang bisa diterima PostgreSQL
          return format(parsedDate, 'yyyy-MM-dd');
        }
      };

      return null;
    };

    // Membuat diary untuk user yang sedang login
    const newDiary = await prisma.diary.create({
      data: {   
        date: parseDate(payload.date),
        title: payload.title,
        story: payload.story,
        
        // TODO: Ambil emotion dari prediksi model
        emotion: payload.emotion,

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

module.exports = router;
