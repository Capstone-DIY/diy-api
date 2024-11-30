const firebase = require('./services/firebase.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verifyIdToken = async (req, res, next) => {
  const idToken = req.header('Authorization')?.split(' ')[1];

  if (!idToken) {
    return res.status(401).json({
      status_code: 401,
      message: 'Token tidak ditemukan, silakan login terlebih dahulu',
    });
  }

  try {
    const decodedToken = await firebase.auth().verifyIdToken(idToken); // Verifikasi token dengan Firebase
    const userIdFromToken = decodedToken.uid;

    // Verifikasi userId di database untuk memastikan user ada
    const user = await prisma.user.findUnique({
      where: { id: userIdFromToken },
    });

    if (!user) {
      return res.status(403).json({
        status_code: 403,
        message: 'User tidak ditemukan, token tidak valid',
      });
    }
    
    req.userId = user.id;  // Menyimpan userId dari token ke request object
    next();  // Lanjut ke route handler berikutnya
  } catch (err) {
    if (err.code === 'auth/argument-error' || err.code === 'auth/id-token-expired') {
      return res.status(403).json({
        status_code: 403,
        message: 'Token tidak valid atau telah kadaluarsa',
      });
    }
    
    return res.status(500).json({
      status_code: 500,
      message: 'Terjadi kesalahan saat verifikasi token',
    });
  }
};

module.exports = { verifyIdToken };
