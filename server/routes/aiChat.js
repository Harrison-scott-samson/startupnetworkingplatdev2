const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const { auth } = require("../middleware/auth");
const { AIChatMessage } = require("../models/Others");

const router = express.Router();

/*
---------------------------------------
Get Chat History
---------------------------------------
*/
router.get("/history", auth, async (req, res) => {
  try {
    const history = await AIChatMessage.find({ user: req.user.id })
      .sort({ createdAt: 1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});


/*
---------------------------------------
AI Chat Endpoint (using Claude AI)
---------------------------------------
*/
router.post("/", auth, async (req, res) => {

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    /*
    Save user message
    */
    await AIChatMessage.create({
      user: req.user.id,
      role: "user",
      content: message
    });


    /*
    Demo mode if API key missing
    */
    if (!process.env.CLAUDE_API_KEY ||
        process.env.CLAUDE_API_KEY === "your_claude_api_key_here") {

      const mockResponse =
        "AI is currently running in demo mode. Add CLAUDE_API_KEY to enable real responses.";

      await AIChatMessage.create({
        user: req.user.id,
        role: "assistant",
        content: mockResponse
      });

      return res.json({ response: mockResponse });
    }


    /*
    Initialize Anthropic (Claude)
    */
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });


    /*
    Fetch previous messages for context
    */
    const history = await AIChatMessage.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Format history for Claude
    const chatMessages = history.reverse().map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content
    }));

    // Ensure the last message in chatMessages is the user message if not already included
    // Actually, historical messages are fetched. The current message is already saved in DB above.
    // If historical messages include the current one, it's fine. 
    // Usually Claude expects messages to end with a user role.
    
    /*
    Generate AI response
    */
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1024,
      system: "You are Startup Copilot, an expert AI advisor helping founders build startups, find investors, build teams, and validate ideas. Provide actionable, concise, and professional advice.",
      messages: chatMessages
    });

    const aiResponse = completion.content[0].text;


    /*
    Save AI response
    */
    await AIChatMessage.create({
      user: req.user.id,
      role: "assistant",
      content: aiResponse
    });


    /*
    Send response
    */
    res.json({
      response: aiResponse
    });

  }
  catch (error) {
    console.error("Claude AI Chat Error:", error);
    res.status(500).json({ error: "AI service temporarily unavailable." });
  }

});


module.exports = router;