const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const chatResponses = require('./chat.js');
const rateLimit = require('express-rate-limit');
const Filter = require('bad-words');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Dynamic import for franc
let franc;
let langs;
(async () => {
  const francModule = await import('franc');
  franc = francModule.franc;
  langs = await import('langs');
})();

const app = express();
const filter = new Filter();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later', response: null },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// MongoDB
const MONGODB_URI = process.env.techgeo_MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ Missing techgeo_MONGODB_URI');
  process.exit(1);
}
const connectWithRetry = () => {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
      console.error('❌ MongoDB error:', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleString() },
  askedCount: { type: Number, default: 1 },
  lastAsked: { type: String, default: () => new Date().toLocaleString() },
  language: { type: String, default: 'unknown' }
});
const Question = mongoose.model('Question', questionSchema);

// ────────────────────────────────────────────────
// AUTH & SUBSCRIPTION MODELS
// ────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-long-random-secret-change-this-in-vercel-env';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now }
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// ────────────────────────────────────────────────
// REGISTER
// ────────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ fullName, email, password: hashed });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ────────────────────────────────────────────────
// LOGIN
// ────────────────────────────────────────────────

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ────────────────────────────────────────────────
// SUBSCRIBE (email newsletter)
// ────────────────────────────────────────────────

app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email required' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'This email is already subscribed' });
    }

    const sub = new Subscriber({ email });
    await sub.save();

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Subscribe error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ────────────────────────────────────────────────
// (your original code continues unchanged below)
// ────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Preprocess chat.js responses
const processedResponses = Object.entries(chatResponses).map(([keywords, response]) => ({
  keywords: keywords.split('|').map(k => k.toLowerCase().trim()),
  response,
  originalKey: keywords
}));
console.log(`📚 Loaded ${processedResponses.length} response patterns`);

// HELPERS, calculateSimilarity, detectLanguage, checkProfanity, findBestMatch, logUnmatched
// ... (your original helper functions remain here unchanged)

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message required', response: null });
  }
  const input = message.trim();
  if (input.length > 500) {
    return res.status(400).json({ error: 'Message too long', response: null });
  }
  console.log(`\n→ ${input}`);
  const lang = await detectLanguage(input);
  console.log(` lang: ${lang.name}`);
  if (checkProfanity(input)) {
    return res.json({
      response: "Tafadhali tumia lugha safi na ya heshima. Tunaweza kukusaidia vipi kitaalamu?",
      matched: false,
      confidence: 0,
      language: lang.name
    });
  }
  const match = findBestMatch(input);
  let reply, matched = false, confidence = 0;
  if (match) {
    reply = match.response;
    matched = true;
    confidence = match.score;
    console.log(` MATCH: ${match.type} (${confidence}%) → ${match.matchedKeywords.join(', ')}`);
  } else {
    await logUnmatched(input, lang.code);
    reply =
      "Samahani, bado sielewi swali lako vizuri 😅\n\n" +
      "Unauliza kuhusu bei, kutengeneza tovuti, app, namba ya simu, au kitu kingine?\n\n" +
      "Au unaweza tuwasiliana moja kwa moja:\n" +
      "📞 +254 757 579 531\n" +
      "📧 techgeof@gmail.com";
  }
  res.json({
    response: reply,
    matched,
    confidence,
    language: lang.name
  });
});

// Health
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    responses: processedResponses.length,
    rateLimit: 'active',
    profanity: 'active',
    langDetection: 'active'
  });
});

// SPA fallback
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
