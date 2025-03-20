const admin = require("firebase-admin");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
});
const db = admin.firestore();
module.exports = { admin, db };
