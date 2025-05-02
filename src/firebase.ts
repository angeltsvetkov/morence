import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
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