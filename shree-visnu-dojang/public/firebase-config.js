// Import Firebase modules using Google's CDN for browsers
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Your exact Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjS_u82Lt-6cxdxnVUDJZwyMfc_uuk8Js",
  authDomain: "shree-visnu-taekwondo-dojang.firebaseapp.com",
  projectId: "shree-visnu-taekwondo-dojang",
  storageBucket: "shree-visnu-taekwondo-dojang.firebasestorage.app",
  messagingSenderId: "179404801523",
  appId: "1:179404801523:web:7ae17a89326eb9f48d7e86",
  measurementId: "G-X1D1JY1X1C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
