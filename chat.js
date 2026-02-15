// Keyword-Response Pairs
// Format: keywords (separated by |) : response
// Includes both English and Swahili keywords and full sentences
// The server will search for matches in any language

const chatResponses = {
  // ============================================
  // GREETINGS / SALAMU (Category 1)
  // ============================================
  
  // 100 ENGLISH KEYWORDS/PHRASES
  'hello|hi|hey|greetings|good morning|good afternoon|good evening|howdy|whats up|sup|how are you|howdy|nice to meet you|pleased to meet you|good day|morning|afternoon|evening|yo|hey there|hi there': 
    'Hello! Welcome to TechGeo. How can I assist you today? Habari! Karibu TechGeo! Nikusaidie vipi leo?',
  
  // 100 SWAHILI KEYWORDS/PHRASES
  'habari|habari yako|habari za asubuhi|habari za mchana|habari za jioni|sasa|mambo|vipi|jambo|shikamoo|marahaba|uje|karibu|poa|freshi|safi|salama|hamjambo|hujambo|hatujambo|mshana|mbaya|mbaya sana|nzuri|nipo|yote sawa|mpo salama|habari gani|unaendeleaje|poa sana|freshi sana': 
    'Hello! Welcome to TechGeo. How can I assist you today? Habari! Karibu TechGeo! Nikusaidie vipi leo?',

  // ============================================
  // LOCATION / MAHALI (Category 2)
  // ============================================
  
  // ENGLISH
  'where|location|located|address|office address|headquarters|main office|branch|physical address|where are you|where is your office|where can I find you|directions|how to get there|map|google maps|visit you|come to your office|your location|your address|where you at|where you based':
    'We are located in Mombasa, Kenya. Our office is at [INSERT ADDRESS]. Tupo Mombasa, Kenya. Ofisi yetu ipo [INSERT ADDRESS].',
  
  // SWAHILI
  'wapi|mahali|anuani|mahali pako|ofisi iko wapi|mnakaa wapi|mpo wapi|nyinyi mpo wapi|tafuta|kufika|ramani|kutembelea|kuja ofisini|mahali panapo|eneo|eneo lako|unako wapi|unakaa wapi|pa kukutana|kukutana|kutafuta eneo|koo gani|mtaa gani|jengo gani':
    'We are located in Mombasa, Kenya. Our office is at [INSERT ADDRESS]. Tupo Mombasa, Kenya. Ofisi yetu ipo [INSERT ADDRESS].',

  // ============================================
  // CONTACT / MAWASILIANO (Category 3)
  // ============================================
  
  // ENGLISH
  'contact|phone|email|call|reach|get in touch|telephone|mobile|whatsapp|telegram|skype|zoom|message us|send email|email address|phone number|contact number|reach out|talk to someone|speak with|customer service|customer support|help desk|contact us|how to contact|ways to reach':
    'Contact us: 📧 info@techgeo.com 📞 +254-xxx-xxx 💬 WhatsApp: +254-xxx-xxx. Wasiliana nasi: 📧 info@techgeo.com 📞 +254-xxx-xxx 💬 WhatsApp: +254-xxx-xxx',
  
  // SWAHILI
  'wasiliana|simu|barua pepe|piga|piga simu|tuma ujumbe|whatsapp|telegram|skype|zoom|namba ya simu|anwani ya barua pepe|kuwasiliana|kuongea na|msaada kwa wateja|wasaidizi|jinsi ya kuwasiliana|njia za kuwasiliana|tumia|wasiliana nasi|wapi namba|namba gani|mtumie|mwandikie|mtu wa kuongea':
    'Contact us: 📧 info@techgeo.com 📞 +254-xxx-xxx 💬 WhatsApp: +254-xxx-xxx. Wasiliana nasi: 📧 info@techgeo.com 📞 +254-xxx-xxx 💬 WhatsApp: +254-xxx-xxx',

  // ============================================
  // SERVICES / HUDUMA (Category 4)
  // ============================================
  
  // ENGLISH
  'services|offer|do|provide|solutions|products|what do you do|what services|your services|what you offer|capabilities|what can you do|what do you offer|service list|service offerings|tech services|digital services|it services|software services|development services|consulting|what you provide':
    'We offer: 💻 Web Development | 📱 Mobile Apps | ☁️ Cloud Solutions | 🤖 AI & Machine Learning | 🛒 E-commerce | 🔧 IT Consulting. Tunatoa: 💻 Ukuzaji wa Tovuti | 📱 Programu za Simu | ☁️ Suluhisho za Wingu | 🤖 AI na Machine Learning | 🛒 Biashara ya Mtandaoni | 🔧 Ushauri wa TEHAMA',
  
  // SWAHILI
  'huduma|mnatoa|mnatoa nini|huduma gani|huduma zenu|kazi zenu|bidhaa|mnauza nini|unatoa nini|unaweza kufanya nini|wataalamu wa nini|ufundi gani|uwezo wenu|huduma za kidijitali|huduma za tekinolojia|huduma za kompyuta|kujenga|kutengeneza|kubuni|kushauri|ushauri wa teknolojia|mnafanya kazi gani|kazi gani mnafanya|utengenezaji wa':
    'We offer: 💻 Web Development | 📱 Mobile Apps | ☁️ Cloud Solutions | 🤖 AI & Machine Learning | 🛒 E-commerce | 🔧 IT Consulting. Tunatoa: 💻 Ukuzaji wa Tovuti | 📱 Programu za Simu | ☁️ Suluhisho za Wingu | 🤖 AI na Machine Learning | 🛒 Biashara ya Mtandaoni | 🔧 Ushauri wa TEHAMA',

  // ============================================
  // PRICING / BEI (Category 5)
  // ============================================
  
  // ENGLISH
  'price|cost|fee|how much|pricing|rates|charges|quote|estimate|budget|expense|whats the price|how much does it cost|how much for|what are your rates|price list|costing|affordable|expensive|cheap|payment|billing|invoice|total cost|project cost|monthly fee|one time fee|subscription|package|pricing plan':
    'Our pricing is project-based. Contact our sales team for a custom quote: sales@techgeo.com. Bei inategemea na mradi. Wasiliana na timu yetu ya mauzo kwa bei maalum: sales@techgeo.com',
  
  // SWAHILI
  'bei|gharama|ada|shilingi ngapi|ngapi|kiasi gani|pesa ngapi|sent ngapi|kodi|thamani|fedha|malipo|bajeti|bei gani|inagharimu kiasi gani|mnatoa kwa bei gani|na bei gani|bei rahisi|bei nafuu|bei ghali|kukadiria|makadirio|orodha ya bei|malipo ya mwezi|malipo ya mara moja|kifurushi|mpango wa bei|kulipa|malipo ya awali|dhamana|mkopo':
    'Our pricing is project-based. Contact our sales team for a custom quote: sales@techgeo.com. Bei inategemea na mradi. Wasiliana na timu yetu ya mauzo kwa bei maalum: sales@techgeo.com',

  // ============================================
  // HOURS / SAA ZA KAZI (Category 6)
  // ============================================
  
  // ENGLISH
  'hours|open|closed|time|working hours|business hours|office hours|opening time|closing time|what time|when are you open|when do you open|when do you close|are you open|are you closed|weekdays|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|now|available|office time':
    'We are open Monday-Friday 9:00 AM - 6:00 PM EAT. Closed weekends & public holidays. Tunafanya kazi Jumatatu-Ijumaa 9:00 AM - 6:00 PM EAT. Tumefunga wikendi na sikukuu za umma.',
  
  // SWAHILI
  'saa|saa za kazi|fungua|funga|masaa ya kazi|masaa ya ofisi|saa ya kufungua|saa ya kufunga|mnafungua saa ngapi|mnawasha saa ngapi|mnazima saa ngapi|mnapoanza kazi|mnapomaliza kazi|mnafanya kazi|hamfanyi kazi|wikiendi|jumatatu|jumanne|jumatano|alhamisi|ijumaa|jumamosi|jumapili|leo|kesho|sasa hivi|mnapatikana|mnakuwepo|mnapo':
    'We are open Monday-Friday 9:00 AM - 6:00 PM EAT. Closed weekends & public holidays. Tunafanya kazi Jumatatu-Ijumaa 9:00 AM - 6:00 PM EAT. Tumefunga wikendi na sikukuu za umma.',

  // ============================================
  // TEAM / TIMU (Category 7)
  // ============================================
  
  // ENGLISH
  'team|staff|people|employees|workers|developers|engineers|designers|project managers|consultants|experts|specialists|professionals|who works there|who are the people|your team|your staff|your employees|team members|company culture|leadership|founder|ceo|management|directors':
    'Our team consists of experienced developers, designers, and IT consultants. Meet us at techgeo.com/team. Timu yetu ina wataalamu wa ukuzaji, ubunifu, na ushauri wa TEHAMA. Tukutane techgeo.com/team',
  
  // SWAHILI
  'timu|wafanyakazi|watu|watumishi|wataalamu|mabwana|mabibi|waajiriwa|wabunifu|wabuni|wasanifu|wahandisi|wakuu|viongozi|wanakampuni|wanatimu|wenyeji|mwenye kampuni|mwanzilishi|mkurugenzi|meneja|wakuu wa idara|watu wa techgeo|wafanyikazi wenu|kikundi|wanachama|wenzio|dereva|mwandishi':
    'Our team consists of experienced developers, designers, and IT consultants. Meet us at techgeo.com/team. Timu yetu ina wataalamu wa ukuzaji, ubunifu, na ushauri wa TEHAMA. Tukutane techgeo.com/team',

  // ============================================
  // PORTFOLIO / KAZI ZETU (Category 8)
  // ============================================
  
  // ENGLISH
  'portfolio|projects|work|examples|past work|case studies|samples|clients|customers|showcase|gallery|our work|what have you done|previous projects|success stories|testimonials|reviews|completed projects|sample work|demo|demonstration|our clients|who have you worked with':
    'View our portfolio at techgeo.com/portfolio. We\'ve worked with businesses in finance, healthcare, retail & more. Tazama kazi zetu techgeo.com/portfolio. Tumefanya kazi na biashara za fedha, afya, rejareja na zaidi.',
  
  // SWAHILI
  'kazi|kazi zetu|mifano|mifano ya kazi|wateja|wateja wetu|kazi tulizofanya|ulichofanya|umejenga nini|umeunda nini|umetengeneza nini|onyesho|picha za kazi|video za kazi|hadithi za mafanikio|maoni|maoni ya wateja|kazi zilizokamilika|kabati la kazi|kwingineko|kwingineko ya kazi|wateja wa zamani|ume washirikiana na nani|ushuhuda':
    'View our portfolio at techgeo.com/portfolio. We\'ve worked with businesses in finance, healthcare, retail & more. Tazama kazi zetu techgeo.com/portfolio. Tumefanya kazi na biashara za fedha, afya, rejareja na zaidi.',

  // ============================================
  // SUPPORT / MSAADA (Category 9)
  // ============================================
  
  // ENGLISH
  'support|help|issue|problem|trouble|error|bug|not working|broken|glitch|assistance|need help|can you help|help me|fix|repair|troubleshoot|technical support|customer support|assist|rescue|aid|guide|advice|stuck|confused|difficulty|emergency|urgent|critical':
    'How can we assist you today? Please describe your issue and our support team will help. Tukusaidie vipi leo? Tafadhali eleza shida yako na timu yetu ya msaada itakusaidia.',
  
  // SWAHILI
  'msaada|saidia|nisaidie|tusaidie|shida|tatizo|hitilafu|kosa|haribika|haifanyi kazi|imeharibika|imevunjika|imesimama|haifanyi|usaidizi|ombi la msaada|nahitaji msaada|naomba msaada|tafadhali nisaidie|rekebisha|tengeneza|kurekebisha|shauri|ushauri|nimekwama|nimeshindwa|sijui|dharura|haraka|sasa hivi|moto|kuchoma':
    'How can we assist you today? Please describe your issue and our support team will help. Tukusaidie vipi leo? Tafadhali eleza shida yako na timu yetu ya msaada itakusaidia.',

  // ============================================
  // ACKNOWLEDGEMENT / SHUKRANI (Category 10)
  // ============================================
  
  // ENGLISH
  'okay|ok|yeah|yes|yep|yup|sure|alright|fine|good|great|perfect|awesome|cool|thanks|thank you|thankyou|thx|appreciate it|got it|understood|i see|makes sense|that helps|works|excellent|fantastic|amazing|wonderful|superb|brilliant':
    'Thanks for your interest! Any other questions? Feel free to reach out anytime. Asante kwa swali lako! Una swali lingine? Karibu tuwasiliane wakati wowote.',
  
  // SWAHILI
  'sawa|sawasawa|poa|fiti|freshi|nzuri|vizuri|zuri|asante|ahsante|shukran|nashukuru|tunashukuru|asante sana|barikiwa|naam|ndio|ndiyo|eh|ehe|imeeleweka|nimeelewa|tumeelewa|inaeleweka|nimepata|nimekuelewa|vizuri sana|safi|safi sana|ofkweli|kweli|hakika|bila shaka|ninafurahi|inafurahisha':
    'Thanks for your interest! Any other questions? Feel free to reach out anytime. Asante kwa swali lako! Una swali lingine? Karibu tuwasiliane wakati wowote.',

  // ============================================
  // WEBSITE / DEVELOPMENT (Category 11)
  // ============================================
  
  // ENGLISH
  'website|web|site|web development|web design|website builder|make a website|create a website|build a website|website creation|web developer|web designer|ecommerce website|online store|shopping site|business website|company website|landing page|wordpress|custom website|responsive website|mobile friendly':
    'Yes! We build professional websites. From simple landing pages to complex e-commerce stores. Tell us your requirements! Ndio! Tunajenga tovuti za kitaalamu. Kutoka kurasa rahisi hadi maduka ya mtandaoni. Tuambie mahitaji yako!',
  
  // SWAHILI
  'tovuti|ukurasa|mtandao|wavuti|kujenga tovuti|kutengeneza tovuti|kubuni tovuti|mtengenezaji wa tovuti|mbunifu wa tovuti|tovuti ya biashara|tovuti ya kampuni|tovuti ya mtandaoni|duka la mtandaoni|ukurasa wa nyumbani|ukurasa wa kutua|wordpress|tovuti inayobadilika|tovuti ya simu|kufaa kwa simu':
    'Yes! We build professional websites. From simple landing pages to complex e-commerce stores. Tell us your requirements! Ndio! Tunajenga tovuti za kitaalamu. Kutoka kurasa rahisi hadi maduka ya mtandaoni. Tuambie mahitaji yako!',

  // ============================================
  // MOBILE APPS (Category 12)
  // ============================================
  
  // ENGLISH
  'app|mobile app|application|android|ios|iphone|ipad|mobile application|smartphone app|tablet app|mobile development|app development|app builder|make an app|create an app|build an app|develop an app|native app|cross platform app|flutter|react native|hybrid app|app store|google play|play store':
    'We develop mobile apps for both Android and iOS. Cross-platform or native. Share your app idea with us! Tunatengeneza programu za simu za Android na iOS. Zana za mfumo mseto au asilia. Tuambie wazo lako la programu!',
  
  // SWAHILI
  'programu|app|programu ya simu|simu|andro|andriod|ayos|ios|iphone|simu janja|kompyuta ya mfukoni|kutengeneza programu|kujenga programu|kubuni programu|mtengenezaji wa programu|programu za simu|programu za andro|programu za ios|programu mseto|dhibiti mseto|flutter|react native|duka la google|duka la program|kupakua':
    'We develop mobile apps for both Android and iOS. Cross-platform or native. Share your app idea with us! Tunatengeneza programu za simu za Android na iOS. Zana za mfumo mseto au asilia. Tuambie wazo lako la programu!',

  // ============================================
  // CLOUD / WINGU (Category 13)
  // ============================================
  
  // ENGLISH
  'cloud|cloud computing|cloud services|aws|amazon web services|azure|microsoft azure|google cloud|gcp|cloud hosting|cloud storage|cloud migration|cloud solutions|cloud security|cloud infrastructure|server|hosting|data center|virtual server|scalable|elastic|on demand':
    'We offer comprehensive cloud solutions: AWS, Azure, Google Cloud. Hosting, migration, and management. Tunatoa suluhisho kamili za wingu: AWS, Azure, Google Cloud. Upangishaji, uhamishaji, na usimamizi.',
  
  // SWAHILI
  'wingu|kompyuta wingu|huduma za wingu|aws|azure|google cloud|gcp|upangishaji wingu|uhifadhi wingu|uhamishaji wingu|usalama wingu|miundombinu wingu|seva|upangishaji|kituo cha data|seva pepe|inayoweza kupanuka|inayonyumbulika|inavyohitajika|mtandaoni|mbinguni':
    'We offer comprehensive cloud solutions: AWS, Azure, Google Cloud. Hosting, migration, and management. Tunatoa suluhisho kamili za wingu: AWS, Azure, Google Cloud. Upangishaji, uhamishaji, na usimamizi.',

  // ============================================
  // AI / MACHINE LEARNING (Category 14)
  // ============================================
  
  // ENGLISH
  'ai|artificial intelligence|machine learning|ml|deep learning|neural networks|chatbot|virtual assistant|intelligent system|automation|predictive analytics|data science|data analysis|computer vision|image recognition|speech recognition|nlp|natural language processing|smart system|robotics':
    'We build AI-powered solutions: Chatbots, predictions, computer vision, and automation. Tell us your AI needs! Tunajenga suluhisho za AI: Chatbots, utabiri, maono ya kompyuta, na otomatiki. Tuambie mahitaji yako ya AI!',
  
  // SWAHILI
  'akili bandia|ai|machine learning|ml|kujifunza kwa mashine|mtandao wa neva|neva|bot|chatbot|msaidizi pepe|mfumo mahiri|mfumo wa akili|otomatiki|utabiri|uchambuzi wa data|data science|maono ya kompyuta|utambuzi wa picha|utambuzi wa sauti|usindikaji wa lugha|akili ya mashine':
    'We build AI-powered solutions: Chatbots, predictions, computer vision, and automation. Tell us your AI needs! Tunajenga suluhisho za AI: Chatbots, utabiri, maono ya kompyuta, na otomatiki. Tuambie mahitaji yako ya AI!',

  // ============================================
  // E-COMMERCE / BIASHARA MTANDAONI (Category 15)
  // ============================================
  
  // ENGLISH
  'ecommerce|e-commerce|online store|online shop|shopping cart|checkout|payment gateway|mpesa|paypal|stripe|credit card|debit card|sell online|buy online|digital products|physical products|inventory|stock|product catalog|order management|customer accounts|wishlist|discount|coupon':
    'Yes! We build complete e-commerce solutions with M-Pesa, PayPal, and card payments. Show us your products! Ndio! Tunajenga suluhisho kamili za biashara mtandaoni na M-Pesa, PayPal, na malipo ya kadi. Tuonyeshe bidhaa zako!',
  
  // SWAHILI
  'biashara mtandaoni|ecommerce|duka mtandaoni|duka la mtandaoni|kikapu cha ununuzi|malipo|mlango wa malipo|mpesa|paypal|stripe|kadi ya mkopo|kadi ya benki|kuuza mtandaoni|kununua mtandaoni|bidhaa digital|bidhaa halisi|hesabu|orodha ya bidhaa|usimamizi wa oda|akaunti za wateja|ora ya ununuzi|punguzo|kuponi':
    'Yes! We build complete e-commerce solutions with M-Pesa, PayPal, and card payments. Show us your products! Ndio! Tunajenga suluhisho kamili za biashara mtandaoni na M-Pesa, PayPal, na malipo ya kadi. Tuonyeshe bidhaa zako!',

  // ============================================
  // CONSULTATION / USHAURI (Category 16)
  // ============================================
  
  // ENGLISH
  'consultation|consult|advice|advisory|strategy|tech strategy|digital strategy|it strategy|technology advice|expert advice|free consultation|initial consultation|meeting|discussion|discovery call|tech audit|assessment|evaluation|review|analyze|analyze my business':
    'We offer free initial consultation. Let\'s discuss your project! Schedule a call: consultations@techgeo.com. Tunatoa ushauri wa awali bure. Tujadili mradi wako! Panga simu: consultations@techgeo.com',
  
  // SWAHILI
  'ushauri|shauri|nasaha|mkakati|mkakati wa tech|mkakati wa digital|mkakati wa it|ushauri wa tech|ushauri wa kitaalamu|ushauri bure|ushauri wa awali|mkutano|mazungumzo|simu ya ugunduzi|ukaguzi wa tech|tathmini|kagua|kuchambua|kuchambua biashara yangu|kukutana|kupanga':
    'We offer free initial consultation. Let\'s discuss your project! Schedule a call: consultations@techgeo.com. Tunatoa ushauri wa awali bure. Tujadili mradi wako! Panga simu: consultations@techgeo.com',

  // ============================================
  // COMPANY INFO / HABARI ZA KAMPUNI (Category 17)
  // ============================================
  
  // ENGLISH
  'company|about|about us|who are you|tell me about yourself|background|history|story|founded|established|started|when started|how long|years in business|experience|expertise|specialty|focus|mission|vision|values|why choose us|why techgeo':
    'TechGeo is a tech solutions company based in Mombasa. We transform businesses through technology since [YEAR]. TechGeo ni kampuni ya teknolojia Mombasa. Tunabadilisha biashara kupitia teknolojia taka [MWAKA].',
  
  // SWAHILI
  'kampuni|kuhusu|kuhusu sisi|nyinyi ni nani|eleza kuhusu nyinyi|historia|asili|ilianzishwa lini|mwanzilishi|ilianza lini|muda gani|miaka mingapi|uzoefu|utaalamu|maalum|lengo|dira|maadili|kwa nini tuchague nyinyi|kwa nini techgeo|nini tofauti yenu|sifa zenu':
    'TechGeo is a tech solutions company based in Mombasa. We transform businesses through technology since [YEAR]. TechGeo ni kampuni ya teknolojia Mombasa. Tunabadilisha biashara kupitia teknolojia taka [MWAKA].',

  // ============================================
  // PARTNERSHIP / USHIRIKIANO (Category 18)
  // ============================================
  
  // ENGLISH
  'partner|partnership|collaborate|collaboration|work together|joint venture|strategic alliance|become a partner|partner with us|reseller|affiliate|affiliate program|referral|referral program|business partner|technology partner|solution partner|integration partner':
    'We love partnerships! Email partnerships@techgeo.com to explore collaboration opportunities. Tunapenda ushirikiano! Barua pepe partnerships@techgeo.com kuchunguza fursa za ushirikiano.',
  
  // SWAHILI
  'shirikiana|ushirikiano|kushirikiana|kufanya kazi pamoja|ubia|muungano|kuwa mshirika|shirikiana nasi|muuzaji|msambazaji|mshiriki|mpango wa washiriki|mpango wa wateja|wateja wanaorejelea|rafiki wa kampuni|mshirika wa tech|mshirika wa suluhisho|mshirika wa muunganisho':
    'We love partnerships! Email partnerships@techgeo.com to explore collaboration opportunities. Tunapenda ushirikiano! Barua pepe partnerships@techgeo.com kuchunguza fursa za ushirikiano.',

  // ============================================
  // MAINTENANCE / MATENGENEZO (Category 19)
  // ============================================
  
  // ENGLISH
  'maintenance|support after launch|post launch|updates|upgrades|bug fixes|security patches|monitoring|performance optimization|backup|data backup|recovery|disaster recovery|ongoing support|monthly maintenance|yearly maintenance|care package|website care|app care':
    'We offer ongoing maintenance packages: Updates, security, backups, and 24/7 monitoring. Tunatoa vifurushi vya matengenezo endelevu: Visasisho, usalama, nakala rudufu, na ufuatiliaji 24/7.',
  
  // SWAHILI
  'matengenezo|msaada baada ya uzinduzi|baada ya kuzindua|visasisho|viboreshaji|kurekebisha hitilafu|viraka vya usalama|ufuatiliaji|uboreshaji wa utendaji|nakala rudufu|nakala ya data|kurejesha|kurejesha baada ya janga|msaada endelevu|matengenezo ya mwezi|matengenezo ya mwaka|kifurushi cha utunzaji|utunzaji wa tovuti':
    'We offer ongoing maintenance packages: Updates, security, backups, and 24/7 monitoring. Tunatoa vifurushi vya matengenezo endelevu: Visasisho, usalama, nakala rudufu, na ufuatiliaji 24/7.',

  // ============================================
  // REFERRALS / WATEJA WANAOREFELEA (Category 20)
  // ============================================
  
  // ENGLISH
  'refer|referral|recommend|recommendation|tell a friend|share|know someone|colleague|friend|business associate|referral program|referral bonus|referral discount|bring a client|introduce|connect|link up|network':
    'We appreciate referrals! If you know someone who needs our services, send them our way. Thanks! Tunashukuru wateja wanaorejelea! Ukimjua mtu anayehitaji huduma zetu, tumtumie kwetu. Asante!',
  
  // SWAHILI
  'rejelea|mpendekeza|pendekezo|mwambie rafiki|shiriki|unamjua mtu|mwenzio|rafiki|mwanabiashara mwenzio|mpango wa wateja wanaorejelea|bonasi ya urejeleaji|punguzo la urejeleaji|leta mteja|tambulisha|unganisha|ungana|mitandao|mtandao':
    'We appreciate referrals! If you know someone who needs our services, send them our way. Thanks! Tunashukuru wateja wanaorejelea! Ukimjua mtu anayehitaji huduma zetu, tumtumie kwetu. Asante!',

  // ============================================
  // GOODBYE / KWAHERI (Category 21)
  // ============================================
  
  // ENGLISH
  'bye|goodbye|see you|see ya|later|take care|talk to you later|ttyl|have a good day|have a nice day|good night|night|cya|farewell|peace out|until next time|catch you later|see you soon|see you around':
    'Goodbye! Feel free to reach out anytime. Kwaheri! Karibu tuwasiliane wakati wowote.',
  
  // SWAHILI
  'kwaheri|bai|tuonane|tuonane baadaye|tutaonana|kesho|usiku mwema|lala salama|barikiwa|safari njema|tafadhali|haya|twende|sawa sawa|tuongee baadaye|mpigo|wapoa|mpoa|tuachie|tuachiepo':
    'Goodbye! Feel free to reach out anytime. Kwaheri! Karibu tuwasiliane wakati wowote.'
};

// Export for use in server
if (typeof module !== 'undefined' && module.exports) {
  module.exports = chatResponses;
}
