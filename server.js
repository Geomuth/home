const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from ROOT – must be first
app.use('/', express.static(path.join(__dirname, '.'), {
  index: false,
  extensions: ['html', 'css', 'js']
}));

// Root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes (your api folder)
app.get('/api/models', require('./api/models'));
app.post('/api/chat', require('./api/chat'));

// Health check
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

// Test Gemini connection
app.get('/api/test-gemini', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  }

  try {
    const axios = require('axios');
    const testUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await axios.post(testUrl, {
      contents: [{ parts: [{ text: "Hello" }] }]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    res.json({
      success: true,
      message: 'Gemini API reachable',
      model: 'gemini-1.5-flash',
      responseSnippet: response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No text'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gemini test failed',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// SPA fallback – only send index.html for non-file, non-api paths
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || /\.[a-z0-9]+$/i.test(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server (local)
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
    console.log(`Gemini key: ${process.env.GEMINI_API_KEY ? 'present' : 'missing'}`);
  });
}

module.exports = app;
