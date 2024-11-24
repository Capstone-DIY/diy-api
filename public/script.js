// Mengimpor Firebase SDK modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Event listener untuk login
document.getElementById('authForm').addEventListener('submit', async (event) => {
  event.preventDefault();  // Cegah form untuk reload halaman
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Menggunakan signInWithEmailAndPassword dari Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert('Login berhasil');

    // Sembunyikan halaman login dan tampilkan halaman diary
    document.getElementById('auth').style.display = 'none';  // Menyembunyikan halaman login
    document.getElementById('diary').style.display = 'block'; // Menampilkan halaman diary

    // Menyimpan token autentikasi
    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem('authToken', token);

  } catch (error) {
    alert('Login gagal: ' + error.message);
  }
});

// Event listener untuk register
document.getElementById('registerBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Menggunakan createUserWithEmailAndPassword dari Firebase Auth
    await createUserWithEmailAndPassword(auth, email, password);
    alert('Pendaftaran berhasil, silakan login');
  } catch (error) {
    alert('Pendaftaran gagal: ' + error.message);
  }
});

// Fungsi untuk menyimpan diary
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
