const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const chatResponses = require('./chat.js');

const app = express();

// Use the URI you provided (it is recommended to put this in Vercel Environment Variables as MONGODB_URI)
const MONGODB_URI = process.env.techgeo_MONGODB_URI || "mongodb+srv://Vercel-Admin-que:mvRfaAQoDqeGGRxH@que.3lbt0r3.mongodb.net/?retryWrites=true&w=majority";

// MongoDB Connection with caching for Serverless Performance
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) return cachedConnection;
  
  try {
    cachedConnection = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('MongoDB Connected Successfully');
    return cachedConnection;
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    throw err;
  }
}

// Define Schema for Unmatched Questions
const messageSchema = new mongoose.Schema({
  question: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  await connectToDatabase();
  const input = message.toLowerCase().trim();
  let reply = null;

  // Search logic from chat.js
  for (const [keywords, response] of Object.entries(chatResponses)) {
    const keywordList = keywords.split('|').map(k => k.toLowerCase().trim());
    if (keywordList.includes(input)) {
      reply = response;
      break;
    }
  }

  if (!reply) {
    for (const [keywords, response] of Object.entries(chatResponses)) {
      const keywordList = keywords.split('|').map(k => k.toLowerCase().trim());
      if (keywordList.some(k => input.includes(k) || k.split(' ').some(word => input.includes(word)))) {
        reply = response;
        break;
      }
    }
  }

  if (!reply) {
    // Save unmatched question to MongoDB instead of a local file
    try {
      await Message.create({ question: message });
    } catch (err) {
      console.error('Failed to log question to MongoDB:', err.message);
    }
    reply = "I don't understand that yet. Your question has been saved for training.";
  }

  res.json({ response: reply });
});

// Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all for SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export for Vercel
module.exports = app;

// Local development listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
