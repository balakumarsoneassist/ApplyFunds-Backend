const User = require("../models/user");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// OTP Mocking (replace with Twilio for real OTPs)
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
const sendOTP = async (req, res) => {
  const { phone } = req.body;

  try {
    let user = await User.findOne({ phone });
    console.log(user);

    if (!user) {
      user = new User({ phone, otp: generateOTP() });
    } else {
      user.otp = generateOTP();
    }

    await user.save();
    console.log("OTP Sent:", user.otp); // Mock OTP (replace with Twilio)

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

// Verify OTP and Login
const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { sendOTP, verifyOTP };
