// src/firebase-cdn.js

// Import from CDN-style URLs using dynamic import
const firebaseAppScript = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
const firestoreScript = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
const authScript = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

export async function initFirebase() {
  await Promise.all([
    import(firebaseAppScript),
    import(firestoreScript),
    import(authScript),
  ]);

  const firebaseConfig = {
    apiKey: "AIzaSyAosyGSsH6mk5tAbARE-lUtFzHGdFd9vtk",
    authDomain: "rexode-88124.firebaseapp.com",
    projectId: "rexode-88124",
    storageBucket: "rexode-88124.firebasestorage.app",
    messagingSenderId: "387268228393",
    appId: "1:387268228393:web:bbcd0604766d0d6726b338",
    measurementId: "G-20FDW337DL"
  };

  
  // Initialize Firebase
  window.firebase.initializeApp(firebaseConfig);
  const db = window.firebase.firestore();
  const auth = window.firebase.auth();

  return { db, auth };
}
