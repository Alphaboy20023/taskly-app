import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDo2Po6LRvD8OUt-PhdcDgWSIs0yQaqiZg",
  authDomain: "taskly-bfb94.firebaseapp.com",
  projectId: "taskly-bfb94",
  storageBucket: "taskly-bfb94.firebasestorage.app",
  messagingSenderId: "920965485386",
  appId: "1:920965485386:web:ee48e4891a56f7e678a7b3",
  measurementId: "G-C6EZ0PCMY4"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };