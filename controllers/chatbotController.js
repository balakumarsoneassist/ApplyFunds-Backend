exports.chatbotResponse = (req, res) => {
    const { message } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
  
    let botResponse = "I'm just a basic bot!";
  
    if (message.toLowerCase().includes("hello")) {
      botResponse = "Hello! How can I assist you today?";
    } else if (message.toLowerCase().includes("how are you")) {
      botResponse = "I'm just a bot, but I'm doing great! How about you?";
    } else if (message.toLowerCase().includes("bye")) {
      botResponse = "Goodbye! Have a great day!";
    }
  
    res.json({ reply: botResponse });
  };