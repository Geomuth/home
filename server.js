const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// Serve index.html for all non-API routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.post('/api/chat', require('./api/chat'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        service: 'TechGeo AI Assistant',
        aiProvider: 'Google Gemini',
        aiConfigured: !!process.env.GEMINI_API_KEY
    });
});

// ===================== LOCAL DEVELOPMENT ONLY =====================

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
        console.log(`  POST /api/chat    - AI Chat with Gemini`);
        console.log(`  GET  /api/health  - Health check`);
    });
}

module.exports = app;
