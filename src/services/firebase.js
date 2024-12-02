// services/firebase.js

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const firebaseAdmin = require('firebase-admin');

// Initialize Secret Manager client
const client = new SecretManagerServiceClient();

// Function to retrieve a secret from Google Secret Manager
async function getSecret(secretName) {
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${process.env.GCLOUD_PROJECT}/secrets/${secretName}/versions/latest`,
    });
    
    const payload = version.payload.data.toString('utf8');
    return JSON.parse(payload); // Return the Service Account JSON
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw new Error('Error retrieving secret');
  }
}

// Function to initialize Firebase
async function initializeFirebase() {
  try {
    const serviceAccount = await getSecret('firebase-service-account');

    // Initialize Firebase only if it hasn't been initialized already
    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });

      console.log('Firebase initialized');
    } else {
      console.log('Firebase already initialized');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw new Error('Firebase initialization failed');
  }
}

module.exports = { initializeFirebase, firebaseAdmin };
