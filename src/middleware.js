// middleware.js
const { firebase } = require('./services/firebase.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verifyIdToken = async (req, res, next) => {
  const idToken = req.header('Authorization')?.split(' ')[1];

  if (!idToken) {
    return res.status(401).json({
      status_code: 401,
      message: 'Unauthorized Token',
    });
  }

  try {
    const decodedToken = await firebase.auth().verifyIdToken(idToken);
    const userUid = decodedToken.uid;

    // Verifikasi userUid di database untuk memastikan user ada
    const user = await prisma.user.findUnique({
      where: { firebase_uid: userUid },
    });

    if (!user) {
      return res.status(403).json({
        status_code: 403,
        message: 'User not found, invalid token',
      });
    }
    
    req.userUid = user.firebase_uid;
    next()
  } catch (err) {
    if (err.code === 'auth/argument-error' || err.code === 'auth/id-token-expired') {
      return res.status(403).json({
        status_code: 403,
        message: 'Invalid token or token expired',
      });
    }
    
    return res.status(500).json({
      status_code: 500,
      message: 'Token verification failed',
    });
  }
};

module.exports = { verifyIdToken };
