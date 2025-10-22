const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
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

    // Generate password
    const usernamePart =firstname.slice(0, 4); 
    const contactPart = contactNumber.slice(-4);
    const generatedPassword = `${usernamePart}@${contactPart}`;

    // Check if already registered
    const existingUser = await Customer.findOne({
      $or: [{ email }, { contactNumber }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already registered' });
    }

    // Create and save new customer
    const customer = new Customer({
      firstname,
      lastname,
      contactNumber,
      email,
      password: generatedPassword,
      location,
      dob,
      contactSource,
      referenceName
    });

    await customer.save();

    res.status(201).json({
      message: 'Customer registered successfully',
      customer,
      generatedPassword // optional: show the generated password
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Customer Login API
app.post("/api/customers/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check local DB
    const user = await Customer.findOne({ email });
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



// Define Port and Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
