const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with the API Key from your Vercel Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    // 1. Set CORS headers so your website can talk to this API
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    // 2. Validation Checks
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error("CRITICAL: GEMINI_API_KEY is missing!");
        return res.status(500).json({ error: 'Server configuration error: Key missing.' });
    }

    try {
        // 3. Connect to Gemini 1.5 Flash (the fast, free-tier model)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are TechGeo's AI assistant. You are helpful, expert in tech, and concise."
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        // 4. Send the successful response back to app.js
        res.status(200).json({
            success: true,
            response: text
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            success: false,
            response: "I'm having a bit of trouble thinking right now. Please try again!",
            details: error.message
        });
    }
};
