import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// In demo mode we never touch Firebase at all (no project exists yet, so a
// placeholder config would throw as soon as any service initializes). Real
// initialization only happens once VITE_DEMO_MODE is off and real keys are
// supplied.
export const app = DEMO_MODE ? null : initializeApp(firebaseConfig);
export const db = DEMO_MODE ? null : getFirestore(app);
export const storage = DEMO_MODE ? null : getStorage(app);
export const auth = DEMO_MODE ? null : getAuth(app);