const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const chatResponses = require('./chat.js');

const app = express();
const QUESTIONS_FILE = path.join(__dirname, 'questions.json');

// Load or initialize questions
function loadQuestions() {
  try {
    if (fs.existsSync(QUESTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading questions:', err.message);
  }
  return [];
}

function saveQuestions(questions) {
  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
  } catch (err) {
    console.error('Error saving questions:', err.message);
  }
}

function addUnmatchedQuestion(question) {
  const questions = loadQuestions();
  // Only add if not already logged
  if (!questions.some(q => q.question.toLowerCase() === question.toLowerCase())) {
    questions.push({
      question: question,
      timestamp: new Date().toLocaleString()
    });
    saveQuestions(questions);
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Match keywords to response
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const input = message.toLowerCase().trim();
  let reply = null;

  // Perfect match first
  for (const [keywords, response] of Object.entries(chatResponses)) {
    const keywordList = keywords.split('|').map(k => k.toLowerCase().trim());
    if (keywordList.includes(input)) {
      reply = response;
      break;
    }
  }

  // If no perfect match, try keyword contains (near match)
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
    // Log unmatched question for training
    addUnmatchedQuestion(message);
    reply = 'I don\'t understand that yet. Your question has been saved for training.';
  }

  res.json({ response: reply });
});

// Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
  console.log('Chat responses loaded from chat.js');
});
