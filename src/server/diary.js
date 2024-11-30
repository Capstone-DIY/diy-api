const { verifyIdToken } = require('../middleware.js'); // Import middleware yang benar
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

// Membuat diary baru
router.post('/create', verifyIdToken, async (req, res, next) => {
  const userId = req.userId; // Mengambil userId dari request object yang sudah di-decode dari token

  // Cek user id
  if (!userId) {
    return res.status(400).json({
      status_code: 400,
      message: 'UserId tidak ditemukan',
    });
  }

  const payload = req.body;

  if (!payload.title || !payload.story) {
    return res.status(400).json({
      status_code: 400,
      message: 'Title atau story harus diisi',
    });
  }

  // Pembersihan dan pengolahan story
  let cleanStory = payload.story;

  // Menghapus semua line breaks (\n) dan mengganti dengan spasi
  cleanStory = cleanStory
    .replace(/\n+/g, ' ')    // Mengganti semua newline (paragraf) menjadi satu spasi
    .replace(/\s+/g, ' ')    // Mengganti spasi ganda menjadi satu spasi
    .trim();                 // Menghilangkan spasi di awal dan akhir

  try {
    // TODO: Mengambil prediksi emosi dari model
    //const emotion = await getEmotion(model, cleanStory);

    // Membuat diary untuk user yang sedang login
    const newDiary = await prisma.diary.create({
      data: {   
        date: new Date(),
        title: payload.title,
        story: cleanStory,
        
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
        diaryId: newDiary.id,
        title: newDiary.title,
        story: newDiary.story,
        emotion: newDiary.emotion,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Menampilkan diary berdasarkan id diary
router.get('/:diaryId', verifyIdToken, async (req, res, next) => {
  const id = req.params.diaryId;  // Mengambil diary id dari params
  
  try {
    const diary = await prisma.diary.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!diary) {
      return res.status(404).json({
        status_code: 404,
        message: 'Diary tidak ditemukan',
      });
    }

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
router.put('/:diaryId', verifyIdToken, async (req, res, next) => {
  const userId = req.userId; // Mengambil userId dari request object yang sudah di-decode dari token

  const id = req.params.diaryId;  // Mengambil diary id dari params
  const payload = req.body;

  if (!payload.title || !payload.story) {
    return res.status(400).json({
      status_code: 400,
      message: 'Title atau story harus diisi',
    });
  }

  try {
    const diary = await prisma.diary.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!diary) {
      return res.status(404).json({
        status_code: 404,
        message: 'Diary tidak ditemukan',
      });
    }

    // Melakukan pembaruan diary
    const updatedDiary = await prisma.diary.update({
      where: { id: parseInt(id) },
      data: {
        title: payload.title,
        story: payload.story,

        // TODO: Ambil emotion dari prediksi model
        // emotion: payload.emotion,

        // TODO: Ambil response dari model
        // response: payload.response,

        updated_at: new Date(),
        userId: userId,  // Menyertakan userId yang didapat dari token
      },
    });

    return res.status(201).json({
      status_code: 201,
      message: 'Diary berhasil diedit',
      data: updatedDiary,
    });
  } catch (err) {
    return next(err);
  }
});

// Menghapus diary berdasarkan id
router.delete('/:diaryId', verifyIdToken, async (req, res, next) => {
  const id = req.params.diaryId;  // Mengambil diary id dari params

  try {
    const diary = await prisma.diary.findUnique({
      where: { id: parseInt(id) },
    });

    if (!diary) {
      return res.status(404).json({
        status_code: 404,
        message: 'Diary tidak ditemukan',
      });
    }

    // Melakukan penghapusan diary
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
router.get('/', verifyIdToken, async (req, res, next) => {
  // Tidak memerlukan parameter karena sudah mengambil dari token
  const id = req.userId;  // Mengambil user id dari params

  try {
    const diaries = await prisma.diary.findMany({
      where: { userId: id },
    });

    if (diaries.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: 'Diary tidak ditemukan',
      });
    }

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
