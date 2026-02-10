const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // 1. Handle CORS and Options
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Check for the API Key
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ response: "Error: GEMINI_API_KEY is not set in Vercel." });
    }

    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ response: "No message provided." });
        }

        // 3. Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        // 4. Send clean JSON back
        return res.status(200).json({ response: text });

    } catch (error) {
        console.error("Gemini Error:", error);
        return res.status(500).json({ 
            response: "The AI is having trouble. Check Vercel logs.",
            error: error.message 
        });
    }
};
