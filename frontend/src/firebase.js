import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBhGoiK8au5pJov4ztQg_yB-Zx6fNyYO80",
  authDomain: "forageia.firebaseapp.com",
  projectId: "forageia",
  storageBucket: "forageia.firebasestorage.app",
  messagingSenderId: "338246157448",
  appId: "1:338246157448:web:3dadca689d00ff67dacb3d"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)