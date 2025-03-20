// routes/auth.js
const express = require("express");
const { signInWithEmailAndPassword } = require("firebase/auth");
const { admin, auth } = require("../utils/firebase");
const { decryptData } = require("../utils/cryptoHelper");
const router = express.Router();

const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());

// Login Page
router.get("/login", (req, res) => {
  if (req.cookies.session) {
    res.clearCookie("session");
  }
  const message = req.query.message || null;
  res.render("login", { message });
});

// Handle Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Authenticate user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await admin.auth().getUser(userCredential.user.uid);
    const userData = await admin.firestore().collection("users").doc(user.uid).get();
    const customClaims = user.customClaims || {};

    if (
      (customClaims.role === "admin" && decryptData(userData.data().role) === "admin") ||
      (customClaims.role === "moderator" && decryptData(userData.data().role) === "moderator")
    ) {
      console.log("Authenticated user is an admin or moderator");

      const idToken = await userCredential.user.getIdToken();
      const expiresIn = 60 * 60 * 24 * 1000; // 24 hours

      const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

      res
        .cookie("session", sessionCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: expiresIn,
        })
        .redirect("/");
    } else {
      res.redirect("/login?message=Only admins are allowed");
    }
  } catch (error) {
    console.error("Login failed:", error.code);
    res.status(400).json({ error: error.code, message: error.message, success: false });
  }
});

module.exports = router;
