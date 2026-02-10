const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
            error: 'AI service not configured. Please add OPENAI_API_KEY environment variable.'
        });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are TechGeo's expert AI assistant. Provide helpful, concise, and accurate information about technology, programming, web development, cloud computing, cybersecurity, AI/ML, databases, and software engineering.
                    
Keep responses clear and actionable. Use examples when helpful.`
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const aiResponse = completion.choices[0].message.content;

        res.status(200).json({
            success: true,
            response: aiResponse,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('[AI_ERROR]', error.message);

        let errorMessage = 'I\'m having trouble processing that right now. Please try again.';
        if (error.message?.includes('401') || error.message?.includes('403')) {
            errorMessage = 'Authentication error. Please check your API key.';
        } else if (error.message?.includes('429')) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
        }

        res.status(500).json({
            success: false,
            response: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
