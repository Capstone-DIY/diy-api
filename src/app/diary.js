// TODO: Complete this by tomorrow!
const uuid  = require('uuid');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDiaryHandler(req, res, next) {
  const payload = req.body;
  try {
    const newDiary = await prisma.diary.create({
      data: {
        diaryId: uuid(),
        date: new Date(),
        title: payload.title,
        story: payload.story,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return res.status(200).json({message: 'Diary berhasil ditambahkan'});
  } catch (err) {
    return next(err);
  }
};

async function getAllDiaryHandler(req, res, next) {
  try {
    const diaries = await prisma.diary.findMany();
    return res.status(200).json({data: diaries});
  } catch (err) {
    return next(err);
  }
};

module.exports = { createDiaryHandler, getAllDiaryHandler };