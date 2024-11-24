// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC8JSHZFuw-RiAOkUwNx4FwH6EBLYXN-go",
  authDomain: "diy-capstone-eb89d.firebaseapp.com",
  projectId: "diy-capstone-eb89d",
  storageBucket: "diy-capstone-eb89d.firebasestorage.app",
  messagingSenderId: "770018117414",
  appId: "1:770018117414:web:d4e695b558bacacd2de3e7",
  measurementId: "G-RTZM1Y1PPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);