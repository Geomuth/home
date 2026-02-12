const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    if (!message?.trim()) {
        return res.status(400).json({ error: 'Message required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'AI not configured' });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await axios.post(url, {
            contents: [{
                parts: [{ text: message }]
            }]
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        res.json({ response: text });
    } catch (error) {
        res.status(500).json({
            error: 'AI request failed',
            details: error.message
        });
    }
};
