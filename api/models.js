const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
        );

        res.json({
            success: true,
            models: response.data.models
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch models',
            details: error.message
        });
    }
};
