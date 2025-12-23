
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAGHcySeJp2BidB3GMNkeG_3gB_4fU3ybc",
  authDomain: "insanus-planner---ter2.firebaseapp.com",
  projectId: "insanus-planner---ter2",
  storageBucket: "insanus-planner---ter2.firebasestorage.app",
  messagingSenderId: "1041626167126",
  appId: "1:1041626167126:web:4f3af8354ddb3321d988f7",
  measurementId: "G-NB6K7XDDV3"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
