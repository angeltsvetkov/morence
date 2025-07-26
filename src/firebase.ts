// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyD-kj4Ty3WspQyozffN3i4tUd3JgBH9u3g",
  authDomain: "morence-1135b.firebaseapp.com",
  projectId: "morence-1135b",
  storageBucket: "morence-1135b.firebasestorage.app",
  messagingSenderId: "526618866716",
  appId: "1:526618866716:web:f230553a3146a395511bd9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
