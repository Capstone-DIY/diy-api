const { verifyIdToken } = require('../middleware.js'); // Import middleware yang benar
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

// const { getEmotion } = require('../services/inferenceService');
// const loadModel = require('../services/loadModel');
// let model;

// async function initModel() {
//   model = await loadModel();
// };
// initModel();

// Create new diary
router.post('/create', verifyIdToken, async (req, res, next) => {
  const userUid = req.userUid;
  
  if (!userUid) {
    return res.status(400).json({
      status_code: 400,
      message: 'User not found',
    });
  }

  const userId = await prisma.user.findUnique({
    where: { firebase_uid: userUid },
  }).then((user) => user.id);

  const payload = req.body;

  if (!payload.title || !payload.story) {
    return res.status(400).json({
      status_code: 400,
      message: 'Title and story must be filled',
    });
  }
  
  let cleanStory = payload.story;
  cleanStory = cleanStory
    .replace(/\n+/g, ' ')    // Replace all newlines with spaces
    .replace(/\s+/g, ' ')    // Replace double spaces with single spaces
    .trim();                 // Remove leading and trailing spaces

  try {
    // TODO: Mengambil prediksi emosi dari model
    //const emotion = await getEmotion(model, cleanStory);
    
    const newDiary = await prisma.diary.create({
      data: {   
        date: new Date(),
        title: payload.title,
        story: cleanStory,
        
        // TODO: Ambil emotion dari prediksi model
        // emotion: emotion,

        created_at: new Date(),
        updated_at: new Date(),
        userId: userId,
      },
    });

    return res.status(201).json({
      status_code: 201,
      message: 'Diary successfully created',
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

// Get diary by diary id
router.get('/:diaryId', verifyIdToken, async (req, res, next) => {
  const id = req.params.diaryId;
  
  try {
    const diary = await prisma.diary.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!diary) {
      return res.status(404).json({
        status_code: 404,
        message: 'Diary not found',
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: 'Diary found',  
      data: diary,
    });
  } catch (err) {
    return next(err);
  }
});

// Edit diary
router.put('/:diaryId', verifyIdToken, async (req, res, next) => {
  const userId = req.userId;

  const id = req.params.diaryId;
  const payload = req.body;

  if (!payload.title || !payload.story) {
    return res.status(400).json({
      status_code: 400,
      message: 'Title and story must be filled',
    });
  }

  try {
    const diary = await prisma.diary.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!diary) {
      return res.status(404).json({
        status_code: 404,
        message: 'Diary not found',
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
        userId: userId,
      },
    });

    return res.status(201).json({
      status_code: 201,
      message: 'Diary successfully updated',
      data: updatedDiary,
    });
  } catch (err) {
    return next(err);
  }
});

// Delete diary by diary id
router.delete('/:diaryId', verifyIdToken, async (req, res, next) => {
  const id = req.params.diaryId;

  try {
    const diary = await prisma.diary.findUnique({
      where: { id: parseInt(id) },
    });

    if (!diary) {
      return res.status(404).json({
        status_code: 404,
        message: 'Diary not found',
      });
    }
    
    const deletedDiary = await prisma.diary.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'Diary successfully deleted',
      data: deletedDiary,
    });
  } catch (err) {
    return next(err);
  }
});

// Get all diary by user id
router.get('/', verifyIdToken, async (req, res, next) => {
  const userUid = req.userUid;

  try {
    const user = await prisma.user.findUnique({
      where: { firebase_uid: userUid },
    });

    if (!user) {
      // user tidak ditemukan
      return res.status(404).json({
        status_code: 404,
        message: 'User tidak ditemukan',
      });
    }

    const userId = user.id;

    const diaries = await prisma.diary.findMany({
      where: { userId: userId },
    });

    if (diaries.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: 'Diary not found',
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: 'Diary found',
      data: diaries,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
