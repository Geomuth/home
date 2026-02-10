[file name]: api/chat.js
[file content begin]
const axios = require('axios');

module.exports = async (req, res) => {
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
            error: 'AI service not configured. Please add GEMINI_API_KEY environment variable.',
            response: 'I am currently unavailable. Please check the backend configuration.'
        });
    }

    try {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const response = await axios.post(GEMINI_API_URL, {
            contents: [
                {
                    parts: [
                        {
                            text: `You are TechGeo's expert AI assistant. Provide helpful, concise, and accurate information about technology, programming, web development, cloud computing, cybersecurity, AI/ML, databases, and software engineering.
                            
Context: User is asking: "${message}"

Keep responses clear and actionable. Use examples when helpful. Format your response professionally.`
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
                topP: 0.8,
                topK: 40
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          'I received an unexpected response format from the AI service.';

        res.status(200).json({
            success: true,
            response: aiResponse,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('[GEMINI_AI_ERROR]', error.response?.data || error.message);

        let errorMessage = 'I\'m having trouble processing that right now. Please try again.';
        let statusCode = 500;
        
        if (error.response) {
            if (error.response.status === 400) {
                errorMessage = 'Invalid request to AI service.';
                statusCode = 400;
            } else if (error.response.status === 401 || error.response.status === 403) {
                errorMessage = 'Authentication error. Please check your API key.';
                statusCode = 401;
            } else if (error.response.status === 429) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
                statusCode = 429;
            } else if (error.response.status === 503) {
                errorMessage = 'AI service is temporarily unavailable. Please try again later.';
                statusCode = 503;
            }
        } else if (error.request) {
            errorMessage = 'No response received from AI service. Please check your internet connection.';
        }

        res.status(statusCode).json({
            success: false,
            response: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
[file content end]
