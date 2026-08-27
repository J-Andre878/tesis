import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgWtqlL2NtkT5GH-BK_wlFKrILzcy2xb8",
  authDomain: "habitquest-45d72.firebaseapp.com",
  projectId: "habitquest-45d72",
  storageBucket: "habitquest-45d72.firebasestorage.app",
  messagingSenderId: "247485386223",
  appId: "1:247485386223:web:3eec5e965612d8cce37a1a"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export const db = getFirestore(app);
