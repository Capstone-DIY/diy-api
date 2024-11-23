// Import the necessary Firebase modules from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8JSHZFuw-RiAOkUwNx4FwH6EBLYXN-go",
  authDomain: "diy-capstone-eb89d.firebaseapp.com",
  projectId: "diy-capstone-eb89d",
  storageBucket: "diy-capstone-eb89d.firebasestorage.app",
  messagingSenderId: "770018117414",
  appId: "1:770018117414:web:d4e695b558bacacd2de3e7",
  measurementId: "G-RTZM1Y1PPN"
};

// Initialize Firebase app and Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


document.getElementById('authForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Sign-in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert('Login berhasil');

    // Get ID token from Firebase
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Save token to localStorage
    localStorage.setItem('authToken', token);

    // Hide login form and show diary form
    document.getElementById('auth').style.display = 'none';
    document.getElementById('diary').style.display = 'block';
  } catch (error) {
    alert('Login gagal: ' + error.message);
  }
});


document.getElementById('registerBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Create a new user with email and password
    await createUserWithEmailAndPassword(auth, email, password);
    alert('Pendaftaran berhasil, silakan login');
  } catch (error) {
    alert('Pendaftaran gagal: ' + error.message);
  }
});

document.getElementById('saveDiaryBtn').addEventListener('click', async () => {
  const title = document.getElementById('diaryTitle').value;
  const story = document.getElementById('diaryStory').value;

  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Silakan login terlebih dahulu');
    return;
  }

  const response = await fetch('http://localhost:5000/api/diaries/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, story }),
  });

  if (response.ok) {
    alert('Diary berhasil disimpan');
  } else {
    alert('Gagal menyimpan diary');
  }
});