const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateJWT = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Mengambil token dari Authorization header (Bearer <token>)

  if (!token) {
    return res.status(401).json({
      status_code: 401,
      message: 'Token tidak ditemukan, silakan login terlebih dahulu',
    });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil userId dari decoded token
    const userIdFromToken = decoded.id;  // Sesuaikan dengan nama field pada token, biasanya "id" atau "userId"

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

    // Jika user ditemukan, lanjutkan ke route handler berikutnya
    req.userId = user.id;  // Menyimpan userId dari token ke request object
    next();  // Lanjut ke route handler berikutnya
  } catch (err) {
    return res.status(403).json({
      status_code: 403,
      message: 'Token tidak valid atau telah kadaluarsa',
    });
  }
};

module.exports = { authenticateJWT };
