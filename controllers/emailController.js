const nodemailer = require("nodemailer");

const sendEmail = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Transporter Configuration (Using Gmail SMTP)
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS, // App Password (Not your Gmail password)
    },
  });

  // Email Options
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: "oviyabalu1012@gmail.com", // Your receiving email
    subject: `New Contact Form Submission - ${subject}`,
    html: `
      <h3>New Message from Contact Form</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Message:</b> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Email sending failed", error });
  }
};

module.exports = { sendEmail };