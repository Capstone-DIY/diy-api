const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const firebase = require('firebase-admin');

// Initialize secret manager client
const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${process.env.GCLOUD_PROJECT}/secrets/${secretName}/versions/latest`,
    });
    
    const payload = version.payload.data.toString('utf8');
    return JSON.parse(payload); // Mengembalikan Service Account JSON
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw new Error('Error retrieving secret');
  }
}


async function initializeFirebase() {
  try {
    const serviceAccount = await getSecret('firebase-service-account');

    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
    });

    console.log('Firebase initialized');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

// Memastikan Firebase terinisialisasi sebelum aplikasi berjalan
(async () => {
  await initializeFirebase();
})();

module.exports = firebase;
