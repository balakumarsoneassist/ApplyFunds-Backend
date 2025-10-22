const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a New User
exports.register = async (req, res) => {
  console.log("✅ Register Route Hit!");

  if (!req.body) {
    return res.status(400).json({ msg: "No request body received" });
  }

  const { fullName, mobile, email, password, userType } = req.body;

  if (!fullName || !mobile || !email || !password || !userType) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔑 Hashed Password:", hashedPassword);

    user = new User({
      fullName,
      mobile,
      email,
      password: hashedPassword,
      userType,
    });

    await user.save();
    console.log("✅ User Registered Successfully:", user);

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("❌ Error in Register Route:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Login a User
exports.login = async (req, res) => {
  console.log("✅ Login Route Hit!");

  if (!req.body) {
    return res.status(400).json({ msg: "No request body received" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("✅ Login Successful:", user.email);

    res.json({ token, user });
  } catch (error) {
    console.error("❌ Error in Login Route:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
