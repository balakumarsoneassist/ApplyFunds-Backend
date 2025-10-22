const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  response: { type: String, required: true },
});

module.exports = mongoose.model("Chat", ChatSchema);