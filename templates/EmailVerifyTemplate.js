const BaseTemplate = require("./BaseTemplate");

class EmailVerifyTemplate extends BaseTemplate {
  constructor(userName, verifyLink) {
    super("Verify Your Email ✉️");
    this.userName = userName;
    this.verifyLink = verifyLink;
  }

  getTemplate() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Verify Your Email</title>
          <style>
              body { font-family: Arial, sans-serif; background: #fff8dc; padding: 20px; }
              .container { max-width: 600px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { background: #fea500; padding: 10px; text-align: center; color: white; font-size: 24px; border-radius: 8px 8px 0 0; }
              .content { padding: 20px; font-size: 16px; color: #333; }
              .footer { text-align: center; font-size: 14px; color: #666; }
              .button { display: inline-block; padding: 10px 20px; background: #ff4500; color: white; text-decoration: none; border-radius: 5px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">Verify Your Email</div>
              <div class="content">
                  <p>Hi <strong>${this.userName}</strong>,</p>
                  <p>Thank you for signing up at Manga Store! Please confirm your email by clicking the button below:</p>
                  <a href="${this.verifyLink}" class="button">Verify Email</a>
                  <p>If you didn’t sign up, please ignore this email.</p>
              </div>
              <div class="footer">&copy; ${new Date().getFullYear()} Manga Store.</div>
          </div>
      </body>
      </html>
    `;
  }
}

module.exports = EmailVerifyTemplate;
