const axios = require('axios');

module.exports = async (req, res) => {
    // CORS headers (unchanged)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    } 
 
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error: 'AI service not configured.',
            response: 'I am currently unavailable. Please check the backend configuration.'
        });
    }

    try {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        console.log('Sending request to Gemini API...');
        
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{
                parts: [{
                    text: `You are TechGeo's expert AI assistant specializing in technology, programming, web development, cloud computing, cybersecurity, AI/ML, databases, and software engineering. Provide helpful, concise, accurate, and professional responses.
                    
User question: "${message}"

Structure responses clearly: Use bullet points or numbered steps for instructions. Keep it actionable and engaging.`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
            },
            safetySettings: [ /* unchanged */ ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('Received response from Gemini API');
        
        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          'Sorry, I could not generate a response at this time.';

        console.log('AI Response length:', aiResponse.length);

        res.status(200).json({
            success: true,
            response: aiResponse.trim(),  // Trim for cleanliness
            timestamp: new Date()
        });

    } catch (error) {
        // Enhanced error logging and user-friendly messages (unchanged core, but added details)
        console.error('[GEMINI_AI_ERROR] Full error:', JSON.stringify(error.response?.data || error.message, null, 2));
        
        let errorMessage = 'I\'m having trouble connecting to the AI service. Please try again later.';
        let statusCode = 500;
        
        if (error.response) {
            if (error.response.status === 400) {
                errorMessage = 'Invalid request. Please simplify your question.';
                statusCode = 400;
            } else if (error.response.status === 401 || error.response.status === 403) {
                errorMessage = 'Authentication issue. Contact support.';
                statusCode = 401;
            } else if (error.response.status === 404) {
                errorMessage = 'Model not found. Switching to backup...';
                statusCode = 404;
            } else if (error.response.status === 429) {
                errorMessage = 'Too many requests. Wait a minute and retry.';
                statusCode = 429;
            }
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timed out. Try a shorter question.';
        } else if (error.request) {
            errorMessage = 'No response from AI. Check your connection.';
        }

        // Fallback to gemini-pro (unchanged)
        if (statusCode === 404) {
            try {
                console.log('Trying legacy model as fallback...');
                const fallbackResponse = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        contents: [{
                            parts: [{ text: message }]
                        }]
                    },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 15000
                    }
                );
                
                const fallbackText = fallbackResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                                    'I received a response but could not process it.';
                
                return res.status(200).json({
                    success: true,
                    response: fallbackText.trim(),
                    timestamp: new Date(),
                    note: 'Using backup model (gemini-pro)'
                });
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError.message);
                errorMessage = 'Backup model also failed. Please try later.';
            }
        }

        res.status(statusCode).json({
            success: false,
            response: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
