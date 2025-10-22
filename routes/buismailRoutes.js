const express = require("express");
const router = express.Router();
const { sendMail } = require("../controllers/buismailController");

router.post("/buismail/send", sendMail); // Matches: POST /api/mail/send

module.exports = router;