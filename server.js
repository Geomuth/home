const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const chatResponses = require('./chat.js');

const app = express();

// Use the Vercel Environment Variable
const MONGODB_URI = process.env.techgeo_MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas via Vercel Env'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define Schema for unmatched questions
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleString() }
});

const Question = mongoose.model('Question', questionSchema);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Function to save to MongoDB
async function addUnmatchedQuestion(questionText) {
  try {
    const exists = await Question.findOne({ question: questionText.toLowerCase() });
    if (!exists) {
      const newQuestion = new Question({ question: questionText });
      await newQuestion.save();
    }
  } catch (err) {
    console.error('Database save error:', err);
  }
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const input = message.toLowerCase().trim();
  let reply = null;

  // Matching logic
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
      if (keywordList.some(k => input.includes(k))) {
        reply = response;
        break;
      }
    }
  }

  if (!reply) {
    // Save to MongoDB instead of local file
    await addUnmatchedQuestion(message);
    reply = "I didn't get you well, our team is working on it. you can reach us on +254757579531 or email us at techgeof@gmail.com for quick instant answers";
  }

  res.json({ response: reply });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
