// analytics/firebaseAnalyze.js
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey:  import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:  import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // ADDED: Log this!
};

// console.log("Firebase Config:", firebaseConfig); // ADDED: Log the entire config

const app = initializeApp(firebaseConfig);

let analytics;
if (firebaseConfig.measurementId) {
   console.log("Analytics Instance:", analytics);
  try {
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase Analytics:", error);
  }
} else {
  console.warn("Firebase Measurement ID not found. Analytics will not be initialized.");
}

export { analytics, app };