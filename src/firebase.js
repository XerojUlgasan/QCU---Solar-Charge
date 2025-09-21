
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAeKh0RKBAAGHd5__l_liCj2kV9F5_oJJE",
  authDomain: "qcu---ecocharge.firebaseapp.com",
  projectId: "qcu---ecocharge",
  storageBucket: "qcu---ecocharge.firebasestorage.app",
  messagingSenderId: "627980239624",
  appId: "1:627980239624:web:553f1b719249093c8be2bd",
  measurementId: "G-V30DZDPS2H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth()

export {app, auth}