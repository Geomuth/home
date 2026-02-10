const axios = require('axios');

module.exports = async (req, res) => {
    // CORS headers
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
        // CORRECT ENDPOINT - Using the latest stable API
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        console.log('Sending request to Gemini API...');
        
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{
                parts: [{
                    text: `You are TechGeo's expert AI assistant. Provide helpful, concise, and accurate information about technology, programming, web development, cloud computing, cybersecurity, AI/ML, databases, and software engineering.
                    
User question: "${message}"

Keep responses clear, actionable, and professional.`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
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
            },
            timeout: 30000
        });

        console.log('Received response from Gemini API');
        
        // Extract the response text
        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          'Sorry, I could not generate a response at this time.';

        console.log('AI Response length:', aiResponse.length);

        res.status(200).json({
            success: true,
            response: aiResponse,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('[GEMINI_AI_ERROR] Full error:', JSON.stringify(error.response?.data || error.message, null, 2));
        
        let errorMessage = 'I\'m having trouble connecting to the AI service. Please try again.';
        let statusCode = 500;
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            
            if (error.response.status === 400) {
                errorMessage = 'Invalid request. Please check your API configuration.';
                statusCode = 400;
            } else if (error.response.status === 401 || error.response.status === 403) {
                errorMessage = 'Authentication error. Please check your API key.';
                statusCode = 401;
            } else if (error.response.status === 404) {
                // Model not found - try alternative
                errorMessage = 'Service configuration issue. Trying alternative model...';
                statusCode = 404;
            } else if (error.response.status === 429) {
                errorMessage = 'Rate limit exceeded. Please wait a moment.';
                statusCode = 429;
            }
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. The AI service is taking too long to respond.';
        } else if (error.request) {
            errorMessage = 'No response from AI service. Please check your internet connection.';
        }

        // If 404 error, try the legacy model as fallback
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
                
                console.log('Fallback model succeeded');
                
                return res.status(200).json({
                    success: true,
                    response: fallbackText,
                    timestamp: new Date(),
                    note: 'Using legacy model'
                });
                
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError.message);
            }
        }

        res.status(statusCode).json({
            success: false,
            response: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
