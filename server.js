const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the root
// On Vercel, it's actually better to let Vercel handle this via vercel.json
app.use(express.static(path.join(__dirname, './')));

// Your API Route (matches your earlier chat logic)
app.post('/api/chat', require('./chat.js')); 

// Catch-all to serve index.html for any frontend route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// IMPORTANT: Export for Vercel, only listen locally
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => console.log(`Local dev on http://localhost:${PORT}`));
}

module.exports = app;
