const express = require("express");
const { sendMail } = require("../controllers/loanagainstController");
const router = express.Router();

router.post("/api/send-loan", sendMail);

module.exports = router;
