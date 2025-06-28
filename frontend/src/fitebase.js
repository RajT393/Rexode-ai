// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// ✅ REPLACE with your actual Firebase project config
  const firebaseConfig = {
    apiKey: "AIzaSyAosyGSsH6mk5tAbARE-lUtFzHGdFd9vtk",
    authDomain: "rexode-88124.firebaseapp.com",
    projectId: "rexode-88124",
    storageBucket: "rexode-88124.firebasestorage.app",
    messagingSenderId: "387268228393",
    appId: "1:387268228393:web:bbcd0604766d0d6726b338",
    measurementId: "G-20FDW337DL"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
signInAnonymously(auth);


export {
  db,
  auth,
  collection,
  addDoc,
  doc,
  getDoc
};