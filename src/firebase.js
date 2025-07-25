import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLf2glzj15CkCEzG0CPfJ7Xl_3Y4IOEqA",
  authDomain: "chefvoice-2k25.firebaseapp.com",
  projectId: "chefvoice-2k25",
  storageBucket: "chefvoice-2k25.firebasestorage.app",
  messagingSenderId: "312338905218",
  appId: "1:312338905218:web:23a43244308fd77c67dc9b",
  measurementId: "G-JM3S6R4LV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the Auth instance
const auth = getAuth(app);

// Get the Firestore instance  <--- ADD THIS LINE
const db = getFirestore(app); // <--- ADD THIS LINE

// Export both auth and db  <--- MODIFY THIS LINE
export { auth, db };