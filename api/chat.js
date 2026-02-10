const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with your Google API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    // Standard CORS headers for Vercel
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing in Vercel settings.' });
    }

    try {
        // Use Gemini 1.5 Flash (Fast and Free Tier available)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are TechGeo's expert AI assistant. Provide helpful, concise information about technology and programming."
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            response: text,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('[GEMINI_ERROR]', error);
        res.status(500).json({
            success: false,
            response: "I'm having trouble connecting to my brain. Try again in a second!",
            error: error.message
        });
    }
};
