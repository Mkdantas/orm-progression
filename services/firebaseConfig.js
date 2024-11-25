// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_PYF4HwJYq1X283XPiAFs5o7ryJr-OLs",
  authDomain: "progresso-orm.firebaseapp.com",
  projectId: "progresso-orm",
  storageBucket: "progresso-orm.firebasestorage.app",
  messagingSenderId: "738374778754",
  appId: "1:738374778754:web:631c510b63a70ea6d4199b",
  measurementId: "G-CFCWHPD81S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)