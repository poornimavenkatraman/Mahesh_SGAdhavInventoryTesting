import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyC8VdFzzaNpJ3KOFuhpq6T0tsL7XIos7i4",
  authDomain: "sgadhav-inventory.firebaseapp.com",
  projectId: "sgadhav-inventory",
  storageBucket: "sgadhav-inventory.firebasestorage.app",
  messagingSenderId: "1069908384107",
  appId: "1:1069908384107:web:42d0456d3571560cab942e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
