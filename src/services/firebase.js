const firebase = require('firebase-admin');
const serviceAccount = require('../../../diy-capstone-eb89d-firebase-adminsdk-gnq0v-8ec5c1b3f0.json'); // Path ke file service account Firebase

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

module.exports = firebase;
