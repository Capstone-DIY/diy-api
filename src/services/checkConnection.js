const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection is successful');
  } catch (error) {
    console.error('Database connection failed', error);
  }
}

module.exports = { checkDatabaseConnection };