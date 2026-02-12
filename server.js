const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware 
app.use(cors());
app.use(express.json());

// Serve static files FIRST (this fixes MIME type issues)
app.use(express.static(path.join(__dirname, '.'), {
  index: false,                    // prevent auto-serving index.html for directories
  extensions: ['html', 'css', 'js'] // explicitly recognize these file types
}));

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.get('/api/models', require('./api/models'));
app.post('/api/chat', require('./api/chat'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        service: 'TechGeo AI Assistant',
        aiProvider: 'Google Gemini',
        aiConfigured: !!process.env.GEMINI_API_KEY,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint to verify API connectivity
app.get('/api/test-gemini', async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
    }
    
    try {
        const testUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const axios = require('axios');
        
        const response = await axios.post(testUrl, {
            contents: [{
                parts: [{ text: "Hello" }]
            }]
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        res.json({
            success: true,
            message: 'Gemini API is reachable',
            model: 'gemini-1.5-flash',
            response: response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No text in response'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gemini API test failed',
            error: error.response?.data || error.message,
            suggestion: 'Try gemini-pro model instead'
        });
    }
});

// Catch-all for SPA/client-side routing – ONLY if not a file request
app.get('*', (req, res, next) => {
    // If the path has a file extension → skip (let static or 404 handle)
    if (/\.\w+$/.test(req.path)) {
        return next();
    }
    
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.status(404).send('Not found');
});

// ===================== START SERVER =====================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║     🚀 TechGeo Server Started 🚀      ║
║   http://localhost:${PORT}            ║
╚════════════════════════════════════════╝
    `);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Gemini AI Configured: ${process.env.GEMINI_API_KEY ? '✓' : '✗'}`);
        console.log(`API Endpoints:`);
        console.log(`  POST /api/chat         - AI Chat`);
        console.log(`  GET  /api/models       - List models`);
        console.log(`  GET  /api/health       - Health check`);
        console.log(`  GET  /api/test-gemini  - Test Gemini connection`);
    });
}

module.exports = app;
