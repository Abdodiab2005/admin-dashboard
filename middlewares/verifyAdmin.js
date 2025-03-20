const { decryptData } = require("../utils/cryptoHelper");
const { admin } = require("../utils/firebase");
const { getAuth } = require("firebase-admin/auth");

const verifyAdmin = async (req, res, next) => {
  const sessionCookie = req.cookies.session || "";

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    const userDoc = await admin.firestore().collection("users").doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    if (!userDoc.exists) {
      throw new Error("User document does not exist");
    }

    if (
      (decodedClaims.role === "admin" && decryptData(userData.role) === "admin") ||
      (decodedClaims.role === "moderator" && decryptData(userData.role) === "moderator")
    ) {
      // Check if the session cookie is about to expire in the next 1 hour
      const expiresIn = decodedClaims.exp * 1000 - Date.now();
      if (expiresIn < 60 * 60 * 1000) {
        const newSessionCookie = await getAuth().createSessionCookie(sessionCookie, { expiresIn: 24 * 60 * 60 * 1000 });
        res.cookie("session", newSessionCookie, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
      }
      return next();
    } else {
      return res.redirect("/login?message=Only admins are allowed");
    }
  } catch (error) {
    return res.redirect("/login?message=Access denied");
  }
};

module.exports = verifyAdmin;
