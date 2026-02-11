const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error: 'API key not configured'
        });
    }
 
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
        );

        res.status(200).json({
            success: true,
            models: response.data.models,
            availableForChat: response.data.models.filter(model => 
                model.supportedGenerationMethods && 
                model.supportedGenerationMethods.includes('generateContent')
            )
        });
    } catch (error) {
        console.error('Models error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch models',
            details: error.response?.data || error.message
        });
    }
};
