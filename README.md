# TechGeo - Modern Technology Solutions Platform

A comprehensive, modern web platform with AI-powered assistant using Google Gemini, built with Node.js/Express backend and vanilla JavaScript frontend.

## 🌟 Features

### ✨ Enhanced UI/UX
- **Smooth Animations**: Fade-in, slide-up, and bounce animations throughout
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Modern Gradient Hero**: Eye-catching hero section with animated background
- **Interactive Service Cards**: Hover effects and smooth transitions
- **Scroll-based Animations**: Elements animate into view as you scroll

### 🤖 AI Assistant
- **Powered by Google Gemini**: Intelligent chat responses
- **Bilingual Support**: English and Swahili language detection
- **Context-Aware Responses**: Smart keyword matching and priority checks
- **Profanity Filter**: Maintains professional conversation
- **Rate Limiting**: Prevents abuse with 100 requests per 15 minutes
- **Authentication Required**: Users must login to access chat

### 🔐 Authentication System
- **User Registration**: Create account with email and password
- **Secure Login**: JWT-based authentication
- **Password Encryption**: bcrypt hashing for security
- **Session Management**: 7-day token expiration
- **MongoDB Storage**: User data securely stored

### 📧 Communication Features
- **Newsletter Subscription**: Email collection for updates
- **Contact Form**: Functional contact form with validation
- **Real-time Notifications**: Success/error messages for user actions

### 🎨 Interactive Components
- **FAQ Accordion**: Expandable/collapsible questions
- **Search Functionality**: Site-wide search with results
- **Mobile Menu**: Hamburger menu for responsive navigation
- **Active Link Highlighting**: Shows current section in navigation
- **Smooth Scroll**: Anchor links scroll smoothly to sections

### 📊 Sections
1. **Hero Section**: Compelling call-to-action
2. **Services**: 6 service cards with icons
3. **About**: Company information with statistics
4. **FAQ**: 7 common questions with answers
5. **Contact**: Contact information and message form
6. **Footer**: Links, social media, and newsletter signup

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- MongoDB Atlas account
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create a .env file or set in Vercel:
# techgeo_MONGODB_URI=mongodb+srv://...
# JWT_SECRET=your-secret-key

# Development
npm run dev

# Production
npm start
```

### Deployment on Vercel

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add these in Vercel dashboard:
   - `techgeo_MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Random secret for JWT tokens
3. **Deploy**: Vercel will auto-deploy on push

## 📁 File Structure

```
techgeo/
├── index.html          # Main HTML with all sections
├── style.css           # Enhanced CSS with animations
├── app.js              # Frontend JavaScript logic
├── server.js           # Express backend server
├── chat.js             # Chat response keywords/answers
├── package.json        # Dependencies
├── vercel.json         # Vercel deployment config
├── logo.jpeg           # Company logo
└── README.md           # This file
```

## 🎯 Key Enhancements

### From Original Version:
✅ **Removed all Google Ads** - Clean, professional appearance  
✅ **Added smooth animations** - Modern, engaging UX  
✅ **Functional FAQ accordion** - Click to expand/collapse  
✅ **Working contact form** - With validation and feedback  
✅ **Enhanced search** - Site-wide search functionality  
✅ **Scroll animations** - Elements fade in on scroll  
✅ **Active nav highlighting** - Shows current section  
✅ **Improved chat UI** - Better styling and UX  
✅ **Notification system** - Toast messages for actions  
✅ **Mobile optimized** - Perfect on all devices  

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - Login with email/password

### Features
- `POST /api/chat` - Send message to AI assistant (requires auth)
- `POST /api/subscribe` - Subscribe to newsletter
- `GET /api/health` - Check server status

## 🎨 Customization

### Colors (CSS Variables)
```css
--primary-color: #98e2a8;    /* Green */
--secondary-color: #3284aa;   /* Blue */
--accent-color: #918e77;      /* Brown */
```

### Chat Responses
Edit `chat.js` to add/modify AI responses:
```javascript
'your keywords|separated|by|pipes': 'Your response here'
```

## 🔒 Security Features

- JWT token authentication
- bcrypt password hashing
- Rate limiting on API endpoints
- Input sanitization
- Profanity filtering
- CORS enabled
- MongoDB connection retry logic

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🐛 Troubleshooting

### Chat not working?
- Ensure you're logged in
- Check MongoDB connection
- Verify environment variables

### Styles not loading?
- Clear browser cache
- Check file paths
- Ensure CSS file is linked

### Authentication failing?
- Verify MongoDB URI is correct
- Check JWT_SECRET is set
- Review server logs

## 📞 Support

For issues or questions:
- **Email**: techgeof@gmail.com
- **Phone**: +254 757 579 531
- **Location**: Kirinyaga County, Kutus

## 📄 License

© 2024 TechGeo Solutions. All rights reserved.

## 🙏 Credits

- **Icons**: Font Awesome 6.6.0
- **Backend**: Node.js, Express, MongoDB
- **AI**: Google Gemini (via chat.js responses)
- **Hosting**: Vercel

---

**Built with ❤️ by TechGeo Team**
