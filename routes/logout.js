const express = require("express");

const router = express.Router();

router.get("/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // Redirect to the login page
  res.redirect("/login");
});

module.exports = router;
