const express = require("express");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const axios = require("axios");
const cors = require("cors");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { sendSignupEmail } = require("./utils/mails");
const jwt = require("jsonwebtoken");


// Load environment variables
require("dotenv").config();

// Connect to database
connectDB();


// Initialize Express App
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Ensure JSON parsing


const crmPool = new Pool({
  user: process.env.CRM_DB_USER,
  host: process.env.CRM_DB_HOST,
  database: process.env.CRM_DB_NAME,
  password: process.env.CRM_DB_PASS,
  port: process.env.CRM_DB_PORT,
});

// Import Routes
const emailRoutes = require("./routes/emailRoutes");
const LoginRoutes = require("./routes/LoginRoutes");

// const authRoutes = require("./routes/authRoutes");
// const chatbotRoutes = require("./routes/chatbotRoutes");
const mailRoutes = require("./routes/mailRoutes");
const buismailRoutes = require("./routes/buismailRoutes"); // ✅ Correct import
const persmailRoutes = require("./routes/persmailRoutes"); // ✅ Correct import
const loanagainstController = require("./routes/loanagainstRoutes");

// Use Routes

// app.use("/api/auth", authRoutes);
// app.use("/api/chatbot", chatbotRoutes);
app.use("/api/email", emailRoutes); // Uses /api/email/send
app.use("/api", mailRoutes);
app.use("/api", buismailRoutes); // ✅ Correctly using mailRoutes
app.use("/api", persmailRoutes); // ✅ Correctly using mailRoutes
app.use("/api", LoginRoutes);
app.use("/api", loanagainstController);
app.get("/", (req, res) => {
  console.log("Root route accessed");
  res.send("Welcome to the API");
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));


const CustomerSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, 
  location: { type: String, required: true },
  dob: { type: String, required: true },
  contactSource: { type: String, required: true },
  referenceName: { type: String }, // optional
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', CustomerSchema);

// Signup API
app.post('/api/customers/signup', async (req, res) => {
  try {
    const { firstname, lastname, contactNumber, email, location, dob, contactSource, referenceName } = req.body;
    console.log("📥 Signup request received:", req.body);

    const usernamePart = firstname.slice(0, 4);
    const contactPart = contactNumber.slice(-4);
    const generatedPassword = `${usernamePart}@${contactPart}`;

    // Step 1: Check duplicate locally
    const existingUser = await Customer.findOne({ $or: [{ email }, { contactNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Step 2: Login to CRM
    console.log("🔐 Logging in to CRM...");
    const crmLoginResponse = await axios.post(`${process.env.CRM_BASE_URL}/login`, {
      username: process.env.CRM_USERNAME,
      password: process.env.CRM_PASSWORD,
    });

    const crmToken = crmLoginResponse.data.token;
    console.log("✅ CRM Token:", crmToken);

    // Step 3: Prepare CRM payload
      const crmPayload = {
  firstname,
  lastname,
  mobilenumber: contactNumber,
  locationid: location || null,
  email,
  dateofbirth: dob || null,
  pannumber: req.body.pannumber || null,
  aadharnumber: req.body.aadharnumber || null,
  presentaddress: req.body.presentaddress || null,
  pincode: req.body.pincode || null,
  permanentaddress: req.body.permanentaddress || null,
  gender: req.body.gender || null,
  materialstatus: req.body.materialstatus || null,
  noofdependent: req.body.noofdependent || null,
  educationalqualification: req.body.educationalqualification || null,
  type: "Customer",
  status: "Active",
  referencename: referenceName || null,
  organizationid: 0, // 👈 keep this zero for unassigned customers
  createdon: new Date().toISOString(),
  connectorid: null,
  createdby: "Website",
  productname: req.body.productname || null,
  remarks: req.body.remarks || null,
  connectorcontactid: null,
  extcustomerid: null,
  contacttype: "Customer"
};



    // Step 4: Send data to CRM
    console.log("📤 Sending to CRM /leadpersonal...");
    const crmResponse = await axios.post(
      `${process.env.CRM_BASE_URL}/leadpersonal`,
      crmPayload,
      { headers: { Authorization: `Bearer ${crmToken}` } }
    );

    if (crmResponse.status === 201 || crmResponse.status === 200) {
      console.log("✅ CRM registration successful.");

      // Step 5: Save locally
      const customer = new Customer({
        firstname,
        lastname,
        contactNumber,
        email,
        password: generatedPassword,
        location,
        dob,
        contactSource,
        referenceName,
      });

      await customer.save();

      // Step 6: Send Email Notification
      try {
        await sendSignupEmail(
          email,
          firstname,
          email,            // username
          generatedPassword // password
        );
        console.log("📧 Signup email sent successfully to", email);
      } catch (emailErr) {
        console.error("⚠️ Failed to send email:", emailErr.message);
      }

      return res.status(201).json({
        message: "Customer registered successfully (Synced with CRM & Email sent)",
        customer,
        generatedPassword,
      });
    }

    return res.status(400).json({ message: "Failed to register in CRM" });

  } catch (err) {
    console.error("❌ Signup error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "CRM registration failed. Customer not saved locally.",
      error: err.response?.data || err.message,
    });
  }
});




// Customer Login API
app.post("/api/customers/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 1️⃣ Check local MongoDB users
    const localUser = await Customer.findOne({ email });
    if (localUser && localUser.password === password) {
      const token = jwt.sign(
        { id: localUser._id, source: "local" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        message: "Login successful (Local User)",
        source: "local",
        token,
        user: localUser,
      });
    }

    // 🔹 2️⃣ Check CRM Unassigned Contacts
    const crmQuery = `
      SELECT id, firstname, lastname, mobilenumber, email, password, organizationid
      FROM leadpersonaldetails
      WHERE (email = $1 OR mobilenumber = $1)
    `;
    const { rows } = await crmPool.query(crmQuery, [email]);
    const crmUser = rows[0];

    if (crmUser && crmUser.password === password && crmUser.organizationid === 0) {
      const token = jwt.sign(
        { id: crmUser.id, source: "crm" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        message: "Login successful (Unassigned CRM Contact)",
        source: "crm",
        token,
        user: crmUser,
      });
    }

    // 🔹 3️⃣ If neither found
    return res.status(400).json({ message: "Invalid email or password" });

  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




const PartnerSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  pan: { type: String, required: true },
  dob: { type: String, required: true },
  profession: { type: String, required: true },
  pincode: { type: String, required: true },
  password: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

const Partner = mongoose.model('Partner', PartnerSchema);

app.post("/api/partners/signup", async (req, res) => {
  try {
    const { firstname, lastname, phone, email, pan, dob, profession, pincode } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !phone || !email || !pan || !dob || !profession || !pincode) {
      return res.status(400).json({ message: "All fields are required" });
    }

  // Generate password
    const usernamePart =firstname.slice(0, 4); 
    const contactPart = phone.slice(-4);
    const generatedPassword = `${usernamePart}@${contactPart}`;

    // Check for existing partner
    const existingPartner = await Partner.findOne({ $or: [{ email }, { phone }] });
    if (existingPartner) {
      return res.status(400).json({ message: "Partner already registered" });
    }

    // Save new partner
    const newPartner = new Partner({
      firstname,
      lastname,
      phone,
      email,
      pan,
      dob,
      profession,
      pincode,
      password : generatedPassword,
    });

    await newPartner.save();
    res.status(201).json({ message: "Partner registered successfully",newPartner });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/partners/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check local DB
    const user = await Partner.findOne({ email });
    if (user && user.password === password) {
      return res.status(200).json({
        message: "Login successful (Local User)",
        source: "local",
        user,
      });
    }

    //check CRM API
    const crmLoginUrl = "https://oneassist.net.in/crmapi/login";
    const crmPayload = {
      username: email,
      password: password,
    };

    try {
      const crmResponse = await axios.post(crmLoginUrl, crmPayload);

      if (crmResponse.data && crmResponse.data.user) {
        const crmUser = crmResponse.data.user;
        const crmToken = crmResponse.data.token;

        return res.status(200).json({
          message: "Login successful (CRM User)",
          source: "crm",
          user: crmUser,
          crmToken: crmToken,
        });
      } else {
        return res.status(400).json({
          message: "Invalid CRM login response",
        });
      }
    } catch (crmError) {
      console.error("CRM login error:", crmError.message);
      return res.status(400).json({
        message: "Invalid email or password (CRM)",
      });
    }

  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

app.get("/api/dashboard", (req, res) => {
  res.status(200).json({
    message: "you have been registered successfully our team will contact you soon",
  });
});



// Define Port and Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
