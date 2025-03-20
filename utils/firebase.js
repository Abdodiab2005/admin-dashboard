const admin = require("firebase-admin");
const { getAuth } = require("firebase/auth");
const { initializeApp } = require("firebase/app");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
});
const db = admin.firestore();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = { db, admin, auth };
