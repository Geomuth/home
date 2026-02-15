const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const chatResponses = require('./chat.js');
const rateLimit = require('express-rate-limit');
const Filter = require('bad-words');

// Dynamic import for franc (ES Module)
let franc;
let langs;

// Load ES modules dynamically
(async () => {
  franc = await import('franc');
  langs = await import('langs');
})();

const app = express();
const filter = new Filter();

// ============================================
// FEATURE 1: RATE LIMITING
// ============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { 
    error: 'Too many requests, please try again later',
    response: null 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ============================================
// MongoDB Connection
// ============================================
const MONGODB_URI = process.env.techgeo_MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Missing techgeo_MONGODB_URI environment variable');
  process.exit(1);
}

const connectWithRetry = () => {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err);
      console.log('🔄 Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Define Schema for unmatched questions
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleString() },
  askedCount: { type: Number, default: 1 },
  lastAsked: { type: String, default: () => new Date().toLocaleString() },
  language: { type: String, default: 'unknown' }
});

const Question = mongoose.model('Question', questionSchema);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// ============================================
// Preprocess responses
// ============================================
const processedResponses = (() => {
  const responses = [];
  for (const [keywords, response] of Object.entries(chatResponses)) {
    const keywordList = keywords.split('|').map(k => k.toLowerCase().trim());
    responses.push({
      keywords: keywordList,
      response: response,
      allKeywords: keywords
    });
  }
  return responses;
})();

// ============================================
// Helper Functions
// ============================================

function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  
  return (intersection.size / union.size) * 60;
}

// ============================================
// FEATURE 9: LANGUAGE DETECTION (Swahili + English)
// ============================================
async function detectLanguage(input) {
  try {
    // Wait for franc to be loaded if not already
    if (!franc) {
      franc = await import('franc');
      langs = await import('langs');
    }
    
    const detectedLang = franc.franc(input);
    
    // Check for Swahili specific keywords (fallback detection)
    const swahiliKeywords = ['habari', 'sasa', 'mambo', 'vipi', 'tafadhali', 'asante', 
                             'sawa', 'ndio', 'hapana', 'sijui', 'naomba', 'msaada',
                             'bei', 'gharama', 'wapi', 'nani', 'lini', 'kwa nini'];
    
    const inputLower = input.toLowerCase();
    const hasSwahili = swahiliKeywords.some(keyword => inputLower.includes(keyword));
    
    // Override if Swahili detected
    if (hasSwahili || detectedLang === 'swa') {
      return { code: 'swa', name: 'Swahili' };
    }
    
    if (detectedLang === 'und' || detectedLang === 'eng') {
      return { code: 'eng', name: 'English' };
    }
    
    try {
      const language = langs.default.where('3', detectedLang);
      return {
        code: language['1'],
        name: language['name']
      };
    } catch (e) {
      return { code: 'eng', name: 'English' };
    }
  } catch (error) {
    console.log('Language detection error:', error);
    return { code: 'eng', name: 'English' };
  }
}

// ============================================
// FEATURE 3: PROFANITY FILTER (with Swahili support)
// ============================================
function checkProfanity(input) {
  // Add Swahili profanity words to filter
  const swahiliProfanity = ['kuma', 'mbwa', 'pumbafu', 'mjinga', 'fala']; // Add more as needed
  
  const inputLower = input.toLowerCase();
  
  // Check English profanity
  if (filter.isProfane(input)) {
    return true;
  }
  
  // Check Swahili profanity
  for (const word of swahiliProfanity) {
    if (inputLower.includes(word)) {
      return true;
    }
  }
  
  return false;
}

// ============================================
// Main matching function
// ============================================
function findBestMatch(input) {
  const normalizedInput = input.toLowerCase().trim();
  const inputWords = normalizedInput.split(/\s+/);
  
  let bestMatch = null;
  let highestScore = 0;
  let matchType = 'none';
  
  // PHASE 1: Exact match
  for (const response of processedResponses) {
    for (const keyword of response.keywords) {
      if (normalizedInput === keyword) {
        return {
          response: response.response,
          score: 100,
          type: 'exact'
        };
      }
    }
  }
  
  // PHASE 2: Contains match
  for (const response of processedResponses) {
    for (const keyword of response.keywords) {
      if (normalizedInput.includes(keyword)) {
        const score = 80 + (keyword.length * 0.5);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = response.response;
          matchType = 'contains';
        }
      }
    }
  }
  
  // PHASE 3: Word matching
  if (!bestMatch) {
    for (const response of processedResponses) {
      let wordMatchCount = 0;
      
      for (const keyword of response.keywords) {
        const keywordWords = keyword.split(/\s+/);
        
        for (const kw of keywordWords) {
          for (const word of inputWords) {
            if (word === kw) {
              wordMatchCount += 2;
            }
            else if (word.length > 3 && kw.length > 3) {
              if (word.includes(kw) || kw.includes(word)) {
                wordMatchCount += 1;
              }
              const similarity = calculateSimilarity(word, kw);
              if (similarity > 70) {
                wordMatchCount += 1.5;
              }
            }
          }
        }
      }
      
      if (wordMatchCount > highestScore) {
        highestScore = wordMatchCount;
        bestMatch = response.response;
        matchType = 'word';
      }
    }
  }
  
  // PHASE 4: Similarity check
  if (!bestMatch || highestScore < 5) {
    for (const response of processedResponses) {
      for (const keyword of response.keywords) {
        const similarity = calculateSimilarity(normalizedInput, keyword);
        if (similarity > 65) {
          if (similarity > highestScore) {
            highestScore = similarity;
            bestMatch = response.response;
            matchType = 'similar';
          }
        }
      }
    }
  }
  
  if (bestMatch && highestScore > 10) {
    return {
      response: bestMatch,
      score: Math.round(highestScore),
      type: matchType
    };
  }
  
  return null;
}

// Enhanced unmatched question saving
async function addUnmatchedQuestion(questionText, language = 'unknown') {
  try {
    const normalizedQuestion = questionText.toLowerCase().trim();
    
    const existingQuestion = await Question.findOne({
      question: { $regex: new RegExp('^' + normalizedQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
    });
    
    if (existingQuestion) {
      existingQuestion.askedCount += 1;
      existingQuestion.lastAsked = new Date().toLocaleString();
      await existingQuestion.save();
      console.log(`📊 Updated count for: "${questionText}" (asked ${existingQuestion.askedCount} times)`);
      
      if (existingQuestion.askedCount === 5) {
        console.log('🔔 POPULAR QUESTION ALERT: Consider adding to chat.js!');
      }
      
      return { saved: true, isNew: false, count: existingQuestion.askedCount };
    } else {
      const newQuestion = new Question({
        question: questionText,
        language: language,
        askedCount: 1,
        lastAsked: new Date().toLocaleString()
      });
      await newQuestion.save();
      console.log(`💾 Saved new question: "${questionText}" (Language: ${language})`);
      return { saved: true, isNew: true, count: 1 };
    }
  } catch (err) {
    console.error('Database save error:', err);
    return { saved: false };
  }
}

// ============================================
// Swahili Responses for Common Questions
// ============================================
const swahiliResponses = {
  default: "Samahani, sikuelewa vizuri. Timu yetu inafanyia kazi swali lako. Unaweza kutupigia +254757579531 au kututumia barua pepe techgeof@gmail.com kwa majibu ya haraka.",
  location: "Tupo Mombasa, Kenya. Karibu!",
  greeting: "Habari! Karibu TechGeo!",
  company: "TechGeo ni kampuni ya teknolojia inayotoa suluhisho za kidijitali.",
  contact: "Wasiliana nasi: info@techgeo.com au piga +254-xxx-xxx",
  services: "Tunatoa huduma za: ukuzaji wa tovuti, programu za simu, na suluhisho za wingu.",
  pricing: "Wasiliana na timu yetu ya mauzo kwa bei na gharama.",
  hours: "Tunafanya kazi Jumatatu-Ijumaa 9AM-6PM EAT",
  team: "Timu yetu ina wataalamu wenye ujuzi wa teknolojia.",
  portfolio: "Angalia kazi zetu kwenye techgeo.com/portfolio",
  support: "Tukusaidie vipi leo?",
  acknowledgement: "Asante kwa swali lako! Una swali lingine? Karibu tuwasiliane."
};

// ============================================
// Get response in appropriate language
// ============================================
function getLocalizedResponse(intent, language) {
  if (language === 'swa') {
    return swahiliResponses[intent] || swahiliResponses.default;
  }
  return null; // Will use default from chat.js
}

// ============================================
// MAIN CHAT ENDPOINT
// ============================================

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  // ========== INPUT VALIDATION ==========
  if (!message) {
    return res.status(400).json({ 
      error: 'Message is required',
      response: null,
      confidence: 0
    });
  }
  
  if (typeof message !== 'string') {
    return res.status(400).json({ 
      error: 'Message must be a string',
      response: null,
      confidence: 0
    });
  }
  
  if (message.length > 500) {
    return res.status(400).json({ 
      error: 'Message too long (max 500 characters)',
      response: null,
      confidence: 0
    });
  }
  
  const input = message.trim();
  
  if (input.length === 0) {
    const lang = await detectLanguage(input);
    return res.json({ 
      response: lang.code === 'swa' ? 
        "Tafadhali andika ujumbe. Niko hapa kusaidia!" : 
        "Please type a message. I'm here to help!",
      matched: false,
      confidence: 0,
      language: lang.name
    });
  }
  
  console.log(`\n📨 Received: "${input}"`);
  
  // ========== FEATURE 9: DETECT LANGUAGE ==========
  const language = await detectLanguage(input);
  console.log(`🌐 Language detected: ${language.name} (${language.code})`);
  
  // ========== FEATURE 3: CHECK PROFANITY ==========
  if (checkProfanity(input)) {
    console.log('⚠️ Profanity detected');
    return res.json({ 
      response: language.code === 'swa' ?
        "Tafadhali weka heshima katika mazungumzo. Nikusaidie vipi kwa kitaalamu?" :
        "Please keep the conversation respectful. How can I help you professionally?",
      matched: false,
      confidence: 0,
      language: language.name
    });
  }
  
  // ========== FIND MATCH ==========
  const matchResult = findBestMatch(input);
  let reply = null;
  let matched = false;
  let confidence = 0;
  
  if (matchResult) {
    reply = matchResult.response;
    matched = true;
    confidence = matchResult.score;
    console.log(`✅ Matched: ${matchResult.type} (confidence: ${confidence}%)`);
    
    // Try to determine intent for Swahili response
    const intent = matchResult.type;
    const swahiliReply = getLocalizedResponse(intent, language.code);
    
    // If Swahili and we have a translation, use it
    if (language.code === 'swa' && swahiliReply) {
      reply = swahiliReply;
    }
  }
  
  // ========== HANDLE UNMATCHED QUESTIONS ==========
  if (!reply) {
    console.log(`❌ No match found for: "${input}"`);
    
    await addUnmatchedQuestion(input, language.code);
    
    // Provide appropriate response based on language
    if (language.code === 'swa') {
      reply = swahiliResponses.default;
    } else {
      reply = "I didn't get you well, our team is working on it. You can reach us on +254757579531 or email us at techgeof@gmail.com for quick instant answers";
    }
  }
  
  // ========== FEATURE 10: ADD CONFIDENCE SCORE ==========
  console.log(`💬 Response sent (confidence: ${confidence}%)`);
  
  res.json({ 
    response: reply,
    matched: matched,
    confidence: confidence,
    language: language.name
  });
});

// ============================================
// Health check endpoint
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    responsesLoaded: processedResponses.length,
    rateLimiting: 'active',
    profanityFilter: 'active',
    languageDetection: 'active (Swahili/English)'
  });
});

// ============================================
// STATIC FILES AND SERVER
// ============================================

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📚 Loaded ${processedResponses.length} response patterns`);
  console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`🛡️  Rate Limiting: Active`);
  console.log(`🚫 Profanity Filter: Active (English + Swahili)`);
  console.log(`🌐 Language Detection: Active (Swahili/English)`);
  console.log(`📊 Confidence Scores: Active`);
  console.log(`🇰🇪 Swahili Support: Enabled with ${Object.keys(swahiliResponses).length} responses\n`);
});
