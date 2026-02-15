// Keyword-Response Pairs
// Format: keywords (separated by |) : response
// The system will search for near matches

const chatResponses = {
  'where|location|located': 'We are located in Mombasa',
  'hello|hi|hey|greetings': 'Hello! Welcome to TechGeo',
  'what|company|who are you': 'TechGeo is a tech solutions company',
  'contact|phone|email': 'Contact us: info@techgeo.com or call +254-xxx-xxx',
  'services|offer|do': 'We offer web development, mobile apps, and cloud solutions',
  'price|cost|fee': 'Contact our sales team for pricing details',
  'hours|open|closed': 'We are open Monday-Friday 9AM-6PM EAT',
  'team|staff|people': 'Our team consists of experienced tech professionals',
  'project|portfolio|work': 'Check our portfolio at techgeo.com/portfolio',
  'support|help|issue': 'How can we assist you today?',
  'okay|yeah|yes|ok': 'Thanks for being intrested, any other question dont hesitate to reach us'
};

// Export for use in server
if (typeof module !== 'undefined' && module.exports) {
  module.exports = chatResponses;
}
