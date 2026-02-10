const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('./'));

// ===================== LOCAL DEVELOPMENT ONLY =====================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║     🚀 TechGeo Server Started 🚀      ║
║   http://localhost:${PORT}          ║
╚════════════════════════════════════════╝
    `);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`OpenAI Configured: ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`);
    });
}

module.exports = app;
