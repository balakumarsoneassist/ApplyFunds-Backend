// utils/mail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendSignupEmail(to, name, username, password) {
  const mailOptions = {
    from: `"CRM Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to CRM - Your Login Details",
    html: `
      <h2>Dear ${name},</h2>
      <p>Thank you for registering with <b>CRM Apply Funds</b>.</p>
      <p>Here are your login details:</p>
      <ul>
        <li><b>Username:</b> ${username}</li>
        <li><b>Password:</b> ${password}</li>
      </ul>
      <p>You can log in at <a href="http://localhost:3000/login">CRM Portal</a>.</p>
      <p>Best regards,<br><b>CRM Team</b></p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendSignupEmail };
