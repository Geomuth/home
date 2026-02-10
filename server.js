const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files with proper headers
app.use(express.static('./', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

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
        service: 'TechGeo API',
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
