import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAp1dlV-elX9POrcRvsqqCGHdwKQrRRMOo",
  authDomain: "sgadhavtesting-f0c9a.firebaseapp.com",
  projectId: "sgadhavtesting-f0c9a",
  storageBucket: "sgadhavtesting-f0c9a.firebasestorage.app",
  messagingSenderId: "789080714751",
  appId: "1:789080714751:web:53fc95907fd21f816d8bca"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
