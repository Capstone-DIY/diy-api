const { verifyIdToken } = require('../middleware.js'); // Import middleware yang benar
const { PrismaClient } = require('@prisma/client');
const { model } = require('@tensorflow/tfjs-node');
const axios = require('axios');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

// List of responses based on emotion
const emotionResponses = {
    Sadness: [
        'It seems like you are feeling down, I hope things get better soon.',
        'Sadness can be hard, but it will pass in time.'
    ],
    Joy: [
        'It looks like you’re in a great mood! Enjoy the happiness!',
        'Joy is a beautiful feeling, may it last forever!'
    ],
    Love: [
        'Love is the strongest emotion. Cherish it!',
        'Love brings warmth to life. It’s wonderful you’re feeling this!'
    ],
    Anger: [
        'Anger is powerful, but make sure to calm down and take care of yourself.',
        'It’s okay to feel angry, just remember to release it in a healthy way.'
    ],
    Fear: [
        'Fear can be overwhelming, but remember it’s just a feeling, not a fact.',
        'It’s okay to be afraid, just don’t let it control you.'
    ],
    Surprise: [
        'What a surprise! Hope it’s a pleasant one.',
        'Surprises can be exciting! Hope it was a good one.'
    ]
};

// List of quotes based on emotion
const emotionQuotes = {
  Sadness: [
      'It seems like you are feeling down, I hope things get better soon.',
      'Sadness can be hard, but it will pass in time.'
  ],
  Joy: [
      'It looks like you’re in a great mood! Enjoy the happiness!',
      'Joy is a beautiful feeling, may it last forever!'
  ],
  Love: [
      'Love is the strongest emotion. Cherish it!',
      'Love brings warmth to life. It’s wonderful you’re feeling this!'
  ],
  Anger: [
      'Anger is powerful, but make sure to calm down and take care of yourself.',
      'It’s okay to feel angry, just remember to release it in a healthy way.'
  ],
  Fear: [
      'Fear can be overwhelming, but remember it’s just a feeling, not a fact.',
      'It’s okay to be afraid, just don’t let it control you.'
  ],
  Surprise: [
      'What a surprise! Hope it’s a pleasant one.',
      'Surprises can be exciting! Hope it was a good one.'
  ],
  Neutral: [
        'Stay positive.',
        'Keep going, one step at a time.',
        'Things may be tough, but you’re tougher.',
        'Take it easy, tomorrow is another day.',
        'Keep your head up, better days are ahead.'
  ]
};

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

  // Get emotion from model API
  const modelUrl = process.env.MODEL_API_URL;
  console.log(modelUrl);
  const prediction = await axios.post(modelUrl, {
    text: cleanStory,
  }, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const data = prediction.data;
  const emotion = data.label;

  // Randomly select a response for the chosen emotion
  const response = emotionResponses[emotion][Math.floor(Math.random() * emotionResponses[emotion].length)];
  
  try {
    
    const newDiary = await prisma.diary.create({
      data: {   
        date: new Date(),
        title: payload.title,
        story: cleanStory,
        emotion: emotion,
        response: response,
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
        response: newDiary.response,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Get diary by diary id
// router.get('/:diaryId', verifyIdToken, async (req, res, next) => {
//   const id = req.params.diaryId;
  
//   try {
//     const diary = await prisma.diary.findUnique({
//       where: { id: parseInt(id) },
//     });
    
//     if (!diary) {
//       return res.status(404).json({
//         status_code: 404,
//         message: 'Diary not found',
//       });
//     }

//     return res.status(200).json({
//       status_code: 200,
//       message: 'Diary found',  
//       data: diary,
//     });
//   } catch (err) {
//     return next(err);
//   }
// });

// Edit diary
// router.put('/:diaryId', verifyIdToken, async (req, res, next) => {
//   const userId = req.userId;

//   const id = req.params.diaryId;
//   const payload = req.body;

//   if (!payload.title || !payload.story) {
//     return res.status(400).json({
//       status_code: 400,
//       message: 'Title and story must be filled',
//     });
//   }

//   try {
//     const diary = await prisma.diary.findUnique({
//       where: { id: parseInt(id) },
//     });
    
//     if (!diary) {
//       return res.status(404).json({
//         status_code: 404,
//         message: 'Diary not found',
//       });
//     }

//     // Melakukan pembaruan diary
//     const updatedDiary = await prisma.diary.update({
//       where: { id: parseInt(id) },
//       data: {
//         title: payload.title,
//         story: payload.story,

//         // TODO: Ambil emotion dari prediksi model
//         // emotion: payload.emotion,

//         // TODO: Ambil response dari model
//         // response: payload.response,

//         updated_at: new Date(),
//         userId: userId,
//       },
//     });

//     return res.status(201).json({
//       status_code: 201,
//       message: 'Diary successfully updated',
//       data: updatedDiary,
//     });
//   } catch (err) {
//     return next(err);
//   }
// });

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

// Get a quote based on the most dominant emotion
router.get('/quote', verifyIdToken, async (req, res, next) => {

  try {
    // Get the dominant emotion sent from the frontend (e.g. 'joy', 'sadness', etc.)
    const dominantEmotion = req.query.dominantEmotion;
      
    const emotions = ['Sadness', 'Joy', 'Love', 'Anger', 'Fear', 'Surprise'];

    if (emotions.includes(dominantEmotion)) {

      const responses = emotionQuotes[dominantEmotion];
      const randomQuote = responses[Math.floor(Math.random() * responses.length)];
      
      res.json({ quote: randomQuote });
    } else {
      // If the emotion is not recognized, send a random neutral quote 
      const neutralQuotes = emotionQuotes.Neutral;
      const randomNeutralQuote = neutralQuotes[Math.floor(Math.random() * neutralQuotes.length)];

      res.json({ quote: randomNeutralQuote });
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
