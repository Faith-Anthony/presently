import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Load configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. Debugging: Check if keys were found
// If the screen is blank or spinning, check the Console for this log.
if (!firebaseConfig.apiKey) {
  console.error("🔥 Firebase Config Error: API Key is missing! Check your .env.local file.");
} else {
  console.log("✅ Firebase Config Loaded successfully.");
}

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Export services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;