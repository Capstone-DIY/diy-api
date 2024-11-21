const jwt = require('jsonwebtoken');

// Middleware untuk verifikasi token JWT
const authenticateJWT = (req, res, next) => {
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
    req.userId = decoded.id;  // Menyimpan userId dari token pada request object
    next();  // Lanjut ke route handler berikutnya
  } catch (err) {
    return res.status(403).json({
      status_code: 403,
      message: 'Token tidak valid atau telah kadaluarsa',
    });
  }
};

module.exports = { authenticateJWT };
