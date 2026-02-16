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

// ────────────────────────────────────────────────
// CRITICAL FIXES – MUST BE FIRST
// ────────────────────────────────────────────────
app.set('trust proxy', 1);  // Fixes rate-limit X-Forwarded-For warning on Vercel

// Manual body parser – replaces express.json() for Vercel reliability
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = bodyData.trim() ? JSON.parse(bodyData) : {};
        console.log(`[BODY] ${req.method} ${req.path}:`, req.body);
        next();
      } catch (err) {
        console.error(`[BODY PARSE ERROR] ${req.path}:`, err.message);
        res.status(400).json({ message: 'Invalid JSON in request body' });
      }
    });
  } else {
    next();
  }
});

app.use(cors());

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
  console.log('Register hit - body:', req.body);

  try {
    const body = req.body || {};
    const { fullName, email, password } = body;

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
  console.log('Login hit - body:', req.body);

  try {
    const body = req.body || {};
    const { email, password } = body;

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
// SUBSCRIBE
// ────────────────────────────────────────────────

app.post('/api/subscribe', async (req, res) => {
  console.log('Subscribe hit - body:', req.body);

  try {
    const body = req.body || {};
    const { email } = body;

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
// YOUR ORIGINAL CODE (unchanged below this point)
// ────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, '.')));

// Preprocess chat.js responses
const processedResponses = Object.entries(chatResponses).map(([keywords, response]) => ({
  keywords: keywords.split('|').map(k => k.toLowerCase().trim()),
  response,
  originalKey: keywords
}));
console.log(`📚 Loaded ${processedResponses.length} response patterns`);

// ── Your helper functions (paste them here unchanged) ──
// calculateSimilarity, detectLanguage, checkProfanity, findBestMatch, logUnmatched

function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 82;
  const words1 = new Set(s1.split(/\s+/).filter(Boolean));
  const words2 = new Set(s2.split(/\s+/).filter(Boolean));
  const inter = [...words1].filter(x => words2.has(x)).length;
  const union = words1.size + words2.size - inter;
  return union === 0 ? 0 : Math.round((inter / union) * 85);
}

async function detectLanguage(text) {
  try {
    const lower = text.toLowerCase().trim();
    if (lower.length < 6) {
      const swaShort = ['habari','sasa','mambo','vipi','asante','sawa','bei','wapi','simu','tovuti','app','programu','msaada'];
      if (swaShort.some(w => lower.includes(w))) return { code: 'swa', name: 'Swahili' };
      return { code: 'eng', name: 'English' };
    }
    const code = franc(text);
    const swaKeywords = ['habari','mambo','vipi','sasa','asante','tafadhali','bei','gharama','wapi','namba','simu','tovuti','programu','msaada','kwaheri'];
    if (swaKeywords.some(k => lower.includes(k)) || code === 'swa') {
      return { code: 'swa', name: 'Swahili' };
    }
    return { code: 'eng', name: 'English' };
  } catch {
    return { code: 'eng', name: 'English' };
  }
}

function checkProfanity(text) {
  const swaBad = ['kuma','mbwa','pumbafu','mjinga','fala','mboro','mshenzi','mnyama','kiboko'];
  const lower = text.toLowerCase();
  return filter.isProfane(text) || swaBad.some(w => lower.includes(w));
}

function findBestMatch(input) {
  const norm = input.toLowerCase().trim();
  if (!norm) return null;
  let best = null;
  let bestScore = 0;
  let bestType = 'none';
  let bestKeywords = [];
  // ── 1. Priority business questions first ──
  const priorityChecks = [
    { keys: ['bei','price','cost','how much','pesa ngapi','bei gani','gharama','kiasi gani'], category: 'pricing' },
    { keys: ['tovuti','website','web development','kujenga tovuti','kutengeneza tovuti','web design'], category: 'website' },
    { keys: ['app','programu ya simu','mobile app','application','android','ios'], category: 'mobile apps' },
    { keys: ['wapi','location','address','ofisi iko wapi','tupo wapi','mnakaa wapi'], category: 'location' },
    { keys: ['namba','simu','phone','whatsapp','contact','wasiliana','barua pepe','email'], category: 'contact' },
    { keys: ['saa','hours','fungua','funga','masaa ya kazi','open','closed'], category: 'hours' },
    { keys: ['huduma','services','mnatoa nini','what do you offer'], category: 'services' },
    { keys: ['kazi','portfolio','projects','kazi zetu','past work'], category: 'portfolio' },
    { keys: ['ushauri','consultation','free consultation','mkakati'], category: 'consultation' },
  ];
  for (const p of priorityChecks) {
    const matched = p.keys.filter(k => norm.includes(k));
    if (matched.length > 0) {
      const entry = processedResponses.find(r => r.originalKey.includes(p.category));
      if (entry) {
        const score = 88 + matched.length * 6 + matched.reduce((s, k) => s + k.length, 0) * 0.4;
        if (score > bestScore) {
          bestScore = score;
          best = entry.response;
          bestType = 'priority';
          bestKeywords = matched;
        }
      }
    }
  }
  // ── 2. Normal contains (but only decent length keywords) ──
  if (bestScore < 70) {
    for (const r of processedResponses) {
      for (const kw of r.keywords) {
        if (kw.length < 5) continue;
        if (norm.includes(kw)) {
          const score = 75 + kw.length * 0.9;
          if (score > bestScore) {
            bestScore = score;
            best = r.response;
            bestType = 'contains';
            bestKeywords = [kw];
          }
        }
      }
    }
  }
  // ── 3. Word / partial match (fallback) ──
  if (bestScore < 50) {
    for (const r of processedResponses) {
      let score = 0;
      const matched = [];
      for (const kw of r.keywords) {
        if (kw.length < 5) continue;
        const parts = kw.split(/\s+/);
        for (const part of parts) {
          if (norm.includes(part)) {
            score += part.length > 6 ? 4 : 2.5;
            matched.push(part);
          }
        }
      }
      if (score > bestScore && score > 12) {
        bestScore = score;
        best = r.response;
        bestType = 'word';
        bestKeywords = [...new Set(matched)];
      }
    }
  }
  // ── 4. Similarity only when really low confidence ──
  if (bestScore < 30) {
    for (const r of processedResponses) {
      for (const kw of r.keywords) {
        if (kw.length < 6) continue;
        const sim = calculateSimilarity(norm, kw);
        if (sim > 78 && sim > bestScore) {
          bestScore = sim;
          best = r.response;
          bestType = 'similar';
          bestKeywords = [kw];
        }
      }
    }
  }
  if (best && bestScore > 18) {
    return {
      response: best,
      score: Math.round(bestScore),
      type: bestType,
      matchedKeywords: bestKeywords
    };
  }
  return null;
}

async function logUnmatched(question, langCode = 'unknown') {
  try {
    const norm = question.toLowerCase().trim();
    let q = await Question.findOne({ question: { $regex: new RegExp(`^${norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
    if (q) {
      q.askedCount += 1;
      q.lastAsked = new Date().toLocaleString();
      await q.save();
      if (q.askedCount % 5 === 0) {
        console.log(`🔥 Popular unmatched: "${question}" × ${q.askedCount}`);
      }
    } else {
      q = new Question({ question, language: langCode });
      await q.save();
      console.log(`💾 New unmatched: "${question}" (${langCode})`);
    }
  } catch (err) {
    console.error('MongoDB save failed:', err.message);
  }
}

// ────────────────────────────────────────────────
// MAIN CHAT ENDPOINT
// ────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  console.log('Chat hit - body:', req.body);

  const { message } = req.body || {};
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
