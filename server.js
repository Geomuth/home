const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
 
// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('./'));

// Validation helpers
const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateInput = (name, email, subject, message) => {
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
        return 'All fields are required';
    }
    if (!validateEmail(email)) {
        return 'Invalid email address';
    }
    return null;
};

// ===================== API ENDPOINTS =====================

/**
 * POST /api/contact
 * Handle contact form submissions
 */
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    const validationError = validateInput(name, email, subject, message);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    console.log(`[CONTACT] From: ${email}, Subject: ${subject}`);

    res.json({
        success: true,
        message: 'Your message has been received. We will respond soon!',
        data: { name, email, subject }
    });
});

/**
 * POST /api/chat
 * AI-powered chat using OpenAI GPT
 */
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
            error: 'AI service not configured. Please add OPENAI_API_KEY to .env'
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

        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('[AI_ERROR]', error.message);

        let errorMessage = 'I\'m having trouble processing that right now. Please try again.';
        if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage = 'Authentication error. Please check your API key.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
        }

        res.status(500).json({
            success: false,
            response: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/blogs
 * Search blogs
 */
app.get('/api/blogs', (req, res) => {
    const query = req.query.q?.toLowerCase().trim() || '';

    const blogs = [
        {
            id: 1,
            title: 'Introduction to AI Technology',
            excerpt: 'Explore the fundamentals of artificial intelligence and its applications in modern technology.',
            category: 'AI',
            date: 'Feb 10, 2026',
            emoji: '🤖'
        },
        {
            id: 2,
            title: 'Web Development Best Practices',
            excerpt: 'Learn the latest techniques and best practices for building scalable web applications.',
            category: 'Web Dev',
            date: 'Feb 08, 2026',
            emoji: '🌐'
        },
        {
            id: 3,
            title: 'Cloud Computing Essentials',
            excerpt: 'Understanding cloud infrastructure, deployment strategies, and cost optimization.',
            category: 'Cloud',
            date: 'Feb 05, 2026',
            emoji: '☁️'
        },
        {
            id: 4,
            title: 'Cybersecurity Tips & Tricks',
            excerpt: 'Essential cybersecurity practices to protect your digital assets and data.',
            category: 'Security',
            date: 'Feb 03, 2026',
            emoji: '🔒'
        },
        {
            id: 5,
            title: 'Mobile App Development',
            excerpt: 'Building responsive and efficient mobile applications for iOS and Android.',
            category: 'Mobile',
            date: 'Jan 30, 2026',
            emoji: '📱'
        },
        {
            id: 6,
            title: 'Data Science & Analytics',
            excerpt: 'Leveraging data to make informed business decisions and predictions.',
            category: 'Data',
            date: 'Jan 28, 2026',
            emoji: '📊'
        }
    ];

    if (query) {
        const results = blogs.filter(blog =>
            blog.title.toLowerCase().includes(query) ||
            blog.excerpt.toLowerCase().includes(query) ||
            blog.category.toLowerCase().includes(query)
        );
        return res.json(results);
    }

    res.json(blogs);
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'running',
        timestamp: new Date(),
        env: process.env.NODE_ENV || 'development'
    });
});

// ===================== ERROR HANDLING =====================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(err.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===================== SERVER START =====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     🚀 TechGeo Server Started 🚀      ║
║   http://localhost:${PORT}          ║
╚════════════════════════════════════════╝
    `);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`OpenAI Configured: ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`);
});

module.exports = app;
