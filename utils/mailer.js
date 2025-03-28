require("dotenv").config();
const { auth } = require("firebase-admin");
const nodemailer = require("nodemailer");

// Create a transporter using SMTP settings from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email using a template instance
 * @param {string} to - Recipient email address
 * @param {BaseTemplate} templateInstance - An instance of a template class
 * @returns {Promise<void>}
 */
const sendEmail = async (to, templateInstance) => {
  const mailOptions = {
    from: `"Manga Store 🥭" <${process.env.SMTP_USER}>`,
    to,
    subject: templateInstance.subject,
    html: templateInstance.getTemplate(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
