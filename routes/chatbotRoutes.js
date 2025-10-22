const express = require("express");
const { chatbotResponse } = require("../controllers/chatbotController");

const router = express.Router();

// Chatbot API Endpoint
router.post("/", chatbotResponse);

module.exports = router;