const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware 
app.use(cors());
app.use(express.json());

// Serve static files from ROOT – make this the very first thing
app.use('/', express.static(path.join(__dirname, '.'), {
  index: false,
  extensions: ['html', 'css', 'js']
}));

// Explicitly serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes (your api folder)
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

// Test endpoint
app.get('/api/test-gemini', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  }
  
  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const axios = require('axios');
    
    const response = await axios.post(testUrl, {
      contents: [{ parts: [{ text: "Hello" }] }]
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

// Catch-all SPA fallback – skip if it looks like a static file request
app.get('*', (req, res) => {
  const isFileRequest = /\.[a-zA-Z0-9]+$/.test(req.path);
  const isApiRequest = req.path.startsWith('/api/');
  
  if (isFileRequest || isApiRequest) {
    return res.status(404).send('Not found');
  }
  
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Gemini configured: ${!!process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
  });
}

module.exports = app;
