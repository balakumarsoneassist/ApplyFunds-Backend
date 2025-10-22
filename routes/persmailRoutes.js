const express = require("express");
const router = express.Router();
const { sendMail } = require("../controllers/persmailController");

router.post("/persmail/send", sendMail); // Matches: POST /api/mail/send

module.exports = router;