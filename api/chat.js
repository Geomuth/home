const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Safety Check 1: API Key
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY");
    return res.status(500).json({ response: "Server configuration error: API Key missing." });
  }

  try {
    const { message } = req.body;
    
    // Safety Check 2: Message content
    if (!message) {
      return res.status(400).json({ response: "Please provide a message." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ response: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ 
      response: "I'm having trouble connecting to my brain right now.",
      error: error.message 
    });
  }
};
