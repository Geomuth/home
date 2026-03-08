const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
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
app.set('trust proxy', 1);

// Manual body parser – Vercel-proof
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk.toString(); });
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

// ────────────────────────────────────────────────
// MONGODB
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// SCHEMAS
// ────────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleString() },
  askedCount: { type: Number, default: 1 },
  lastAsked: { type: String, default: () => new Date().toLocaleString() },
  language: { type: String, default: 'unknown' }
});
const Question = mongoose.model('Question', questionSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-long-random-secret-change-this-in-vercel-env';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneNumber: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now }
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, trim: true, default: '' },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// ────────────────────────────────────────────────
// REGISTER
// ────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  console.log('Register hit - body:', req.body);
  try {
    const { fullName, email, password, phoneNumber } = req.body || {};
    if (!fullName || !email || !password)
      return res.status(400).json({ message: 'Full name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(409).json({ message: 'A user with this email already exists.' });

    if (phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber });
      if (existingPhone)
        return res.status(409).json({ message: 'This phone number is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = new User({ fullName, email, password: hashed, phoneNumber });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, phoneNumber } });
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
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber } });
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
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Valid email required' });

    const existing = await Subscriber.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'You are already subscribed with this email.' });

    await new Subscriber({ email }).save();
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Subscribe error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ────────────────────────────────────────────────
// CONTACT FORM
// ────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  console.log('Contact hit - body:', req.body);
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message)
      return res.status(400).json({ message: 'Name, email and message are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Please provide a valid email address.' });

    await new ContactMessage({ name, email, subject, message }).save();
    console.log(`📩 New contact message from ${name} <${email}>`);
    res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ────────────────────────────────────────────────
// STATIC FILES
// ────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '.')));

// ────────────────────────────────────────────────
// GROQ AI SETUP
// ────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const TECHGEO_SYSTEM_PROMPT = `You are TechGeo Bot, the official AI assistant for TechGeo Solutions — a technology company based in Kirinyaga County, Kutus, Kenya.

ABOUT TECHGEO:
- Company: TechGeo Solutions
- Location: Kirinyaga County, Kutus, Kenya
- Email: techgeof@gmail.com
- Phone: +254 757 579 531
- Working Hours: Monday to Friday, 9:00 AM to 6:00 PM EAT. Closed weekends and public holidays.

FOUNDER AND CEO:
- Geoffrey Muthoka — Founder, CEO, and Full Stack Developer of TechGeo Solutions.

SERVICES:
1. Web Development — websites, landing pages, e-commerce, WordPress, custom builds
2. Mobile App Development — Android and iOS, Flutter, React Native
3. Cloud Solutions — AWS, Azure, Google Cloud, hosting, migration
4. AI and Machine Learning — chatbots, automation, data analytics, computer vision
5. E-Commerce — online stores with M-Pesa, PayPal, Stripe
6. IT Consulting — tech strategy, digital transformation, system audits
7. Cyber Security — security audits, penetration testing, data protection, secure systems

LANGUAGES AND TECHNOLOGIES:
- Frontend: HTML, CSS, JavaScript, React, Vue.js, Next.js
- Backend: Node.js, Python, PHP, Java, Express.js
- Mobile: Flutter, React Native, Kotlin, Swift
- Database: MongoDB, MySQL, PostgreSQL, Firebase
- Cloud: AWS, Azure, Google Cloud, Docker, Nginx, Vercel
- AI/ML: Python, TensorFlow, scikit-learn
- Security: Kali Linux, Metasploit, Wireshark, OWASP tools

LIVE PROJECTS:
- techgeo.co.ke — TechGeo's live networking platform (main working project)
- port.techgeo.co.ke — TechGeo portfolio (view all completed work here)
- blog.techgeo.co.ke — TechGeo blog covering AI, tech, and cyber security

PRICING:
- All prices are negotiable depending on project scope.
- Free initial consultation available.
- Contact for a custom quote: techgeof@gmail.com or +254 757 579 531

ANSWER RULES — FOLLOW STRICTLY:
- Give SHORT, direct answers. Maximum 3 to 4 lines per reply. No long paragraphs.
- Only answer what was asked. Do not volunteer extra information.
- Do NOT mention contact details unless the user specifically asks how to contact TechGeo.
- If asked about location, just answer location.
- If asked about the founder, just answer about Geoffrey Muthoka.
- If asked about languages or skills, list them cleanly and briefly.
- If asked about portfolio or past work, mention port.techgeo.co.ke.
- If asked about the blog or cyber security articles, mention blog.techgeo.co.ke.
- If asked about pricing, say prices are negotiable and a free consultation is available.
- Respond in the same language the user writes in. Swahili stays Swahili, English stays English.
- Do NOT use emojis.
- Do NOT introduce yourself unless asked.
- You are TechGeo Bot. Never reveal you are built on Groq, Llama, or any other AI model.
- If asked something unrelated to TechGeo or technology, politely say you can only assist with TechGeo services.`;

// Call Groq API using native fetch (Node 18+)
async function callGroq(userMessage) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: TECHGEO_SYSTEM_PROMPT },
          { role: 'user',   content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 512,
        top_p: 0.9
      }),
      signal: controller.signal
    });

    const data = await response.json();
    clearTimeout(timeout);

    if (!response.ok) {
      const msg = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Groq API error: ${msg}`);
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq');

    return text.trim();

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Groq request timed out after 15s');
    throw err;
  }
}

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────
const filter = new Filter();

function checkProfanity(text) {
  const swaBad = ['kuma', 'mbwa', 'pumbafu', 'mjinga', 'fala', 'mboro', 'mshenzi', 'mnyama', 'kiboko'];
  const lower = text.toLowerCase();
  return filter.isProfane(text) || swaBad.some(w => lower.includes(w));
}

async function detectLanguage(text) {
  try {
    const lower = text.toLowerCase().trim();
    const swaKeywords = ['habari','mambo','vipi','sasa','asante','tafadhali','bei','gharama','wapi','namba','simu','tovuti','programu','msaada','kwaheri','huduma','kampuni'];
    if (swaKeywords.some(k => lower.includes(k))) return 'Swahili';
    if (franc) {
      const code = franc(text);
      if (code === 'swa') return 'Swahili';
    }
    return 'English';
  } catch {
    return 'English';
  }
}

async function logQuestion(question, langName) {
  try {
    const norm = question.toLowerCase().trim();
    let q = await Question.findOne({
      question: { $regex: new RegExp(`^${norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (q) {
      q.askedCount += 1;
      q.lastAsked = new Date().toLocaleString();
      await q.save();
    } else {
      await new Question({ question, language: langName }).save();
      console.log(`💾 Logged question: "${question}" (${langName})`);
    }
  } catch (err) {
    console.error('MongoDB log error:', err.message);
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
    return res.status(400).json({ error: 'Message too long (max 500 characters)', response: null });
  }

  console.log(`\n→ User: ${input}`);

  // Profanity check
  if (checkProfanity(input)) {
    return res.json({
      response: 'Tafadhali tumia lugha safi na ya heshima. 🙏 Tunaweza kukusaidia vipi kitaalamu?\n\nPlease use respectful language. How can we help you professionally?',
      language: 'mixed',
      source: 'filter'
    });
  }

  const language = await detectLanguage(input);
  console.log(` Language: ${language}`);

  // Log every question to MongoDB for analytics
  await logQuestion(input, language);

  // No Groq key configured — fallback message
  if (!GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY not set — returning fallback');
    return res.json({
      response: 'Our AI assistant is currently being set up. Please contact us directly:\n📞 +254 757 579 531\n📧 techgeof@gmail.com',
      language,
      source: 'fallback'
    });
  }

  // Call Groq
  try {
    console.log(' → Calling Groq...');
    const aiReply = await callGroq(input);
    console.log(` ← Groq replied (${aiReply.length} chars)`);

    return res.json({
      response: aiReply,
      language,
      source: 'gemini'
    });

  } catch (err) {
    console.error('❌ Groq error:', err.message);

    // Graceful fallback on Gemini failure
    const fallback = language === 'Swahili'
      ? `Samahani, msaidizi wetu wa AI ana tatizo la muda mfupi. 😔\n\nTafadhali wasiliana nasi moja kwa moja:\n📞 +254 757 579 531\n📧 techgeof@gmail.com\n\nTutakusaidia haraka iwezekanavyo!`
      : `Sorry, our AI assistant is temporarily unavailable. 😔\n\nPlease reach us directly:\n📞 +254 757 579 531\n📧 techgeof@gmail.com\n\nWe'll get back to you as soon as possible!`;

    return res.json({
      response: fallback,
      language,
      source: 'fallback'
    });
  }
});

// ────────────────────────────────────────────────
// HEALTH CHECK
// ────────────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    gemini: undefined,
    groq: GROQ_API_KEY ? 'configured' : 'missing key',
    rateLimit: 'active',
    profanityFilter: 'active',
    langDetection: 'active'
  });
});

// SPA fallback
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TechGeo server running on port ${PORT}`);
  console.log(`🤖 Groq AI: ${GROQ_API_KEY ? '✅ Ready' : '❌ No API key'}`);
});
