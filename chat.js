// Keyword-Response Pairs
// Format: keywords (separated by |) : response
// Includes both English and Swahili keywords
// The server will search for matches in any language

const chatResponses = {
  // Location / Mahali
  'where|location|located|address|wapi|mahali|anuani': 'We are located in Mombasa, Kenya. Tupo Mombasa, Kenya. Karibu!',
  
  // Greetings / Salamu
  'hello|hi|hey|greetings|habari|sasa|mambo|vipi|jambo': 'Hello! Welcome to TechGeo. Habari! Karibu TechGeo!',
  
  // Company / Kampuni
  'what|company|who are you|about|kampuni|nani|kuhusu': 'TechGeo is a tech solutions company. TechGeo ni kampuni ya teknolojia inayotoa suluhisho za kidijitali.',
  
  // Contact / Mawasiliano
  'contact|phone|email|call|reach|wasiliana|simu|barua pepe|piga': 'Contact us: info@techgeo.com or call +254-xxx-xxx. Wasiliana nasi: info@techgeo.com au piga +254-xxx-xxx',
  
  // Services / Huduma
  'services|offer|do|provide|huduma|toa|mnatoa|huduma gani': 'We offer web development, mobile apps, and cloud solutions. Tunatoa huduma za: ukuzaji wa tovuti, programu za simu, na suluhisho za wingu.',
  
  // Pricing / Bei
  'price|cost|fee|how much|bei|gharama|kiasi|ngapi': 'Contact our sales team for pricing details. Wasiliana na timu yetu ya mauzo kwa bei na gharama.',
  
  // Hours / Saa za kazi
  'hours|open|closed|time|working hours|saa|kazi|saa za kazi|fungua|funga': 'We are open Monday-Friday 9AM-6PM EAT. Tunafanya kazi Jumatatu-Ijumaa 9AM-6PM EAT',
  
  // Team / Timu
  'team|staff|people|employees|timu|wafanyakazi|watu': 'Our team consists of experienced tech professionals. Timu yetu ina wataalamu wenye ujuzi wa teknolojia.',
  
  // Portfolio / Kazi zetu
  'project|portfolio|work|examples|kazije|mifano|kazi zenu': 'Check our portfolio at techgeo.com/portfolio. Angalia kazi zetu kwenye techgeo.com/portfolio',
  
  // Support / Msaada
  'support|help|issue|problem|assist|msaada|shida|tatizo|saidia': 'How can we assist you today? Tukusaidie vipi leo?',
  
  // Acknowledgement / Shukrani
  'okay|yeah|yes|ok|thanks|thank you|asante|sawa|ndio|ndiyo': 'Thanks for being interested! Any other question dont hesitate to reach us. Asante kwa swali lako! Una swali lingine? Karibu tuwasiliane.',
  
  // Additional Swahili specific patterns
  'tafadhali|please': 'Tafadhali uliza swali lako. Please ask your question.',
  'samahani|sorry|pole': 'Hakuna shida. Unaweza kuuliza tena? No problem. You can ask again?',
  'kwaheri|bye|goodbye': 'Kwaheri! Tutaonana. Goodbye! See you soon.',
  
  // Common questions / Maswali ya kawaida
  'mombasa|location specific': 'Ndio, tupo Mombasa. Yes, we are in Mombasa.',
  'kenya|nchi': 'Ndio, sisi ni kampuni ya Kenya. Yes, we are a Kenyan company.',
  
  // Business hours specific
  'jumatatu|monday|jumanne|tuesday|jumatano|wednesday|alhamisi|thursday|ijumaa|friday': 'Tunafanya kazi siku hizi. We work on these days.',
  'jumamosi|saturday|sabato|jumapili|sunday': 'Tumefunga wikendi. We are closed on weekends.'
};

// Export for use in server
if (typeof module !== 'undefined' && module.exports) {
  module.exports = chatResponses;
}
