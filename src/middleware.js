const firebase = require('firebase-admin');

// Insiasi firebase SDK
firebase.initializeApp({
  // TODO: Ganti path servieAccountKey.jsonc
  credential: firebase.credential.cert(require('../../diy-capstone-eb89d-firebase-adminsdk-gnq0v-0110e924ef.json'))
});

// Middleware untuk verifikasi token JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Mengambil token dari Authorization header (Bearer <token>)

  if (!token) {
    return res.status(401).json({
      status_code: 401,
      message: 'Token tidak ditemukan, silakan login terlebih dahulu',
    });
  }

  // Verifikasi token dengan firebase SDK
  firebase.auth().verifyIdToken(token)
    .then(decodedToken => {
      req.userId = decodedToken.uid;  // Mengambil userId dari decoded token
      next(); // Lanjut ke route handler berikutnya
    })
    .catch(error => {
      return res.status(403).json({
        status_code: 403,
        message: 'Token tidak valid atau telah kadaluarsa',
      });
    });
};

module.exports = { authenticateJWT };
