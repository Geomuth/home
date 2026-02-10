const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

    const { message } = req.body;

    // Validation: Check if API Key exists
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Validation Failed: GEMINI_API_KEY is missing in Vercel settings." });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(message);
        const response = await result.response;
        res.status(200).json({ response: response.text() });
    } catch (error) {
        res.status(500).json({ error: "Gemini Error", details: error.message });
    }
};
