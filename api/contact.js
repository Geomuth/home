const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateInput = (name, email, subject, message) => {
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
        return 'All fields are required';
    }
    if (!validateEmail(email)) {
        return 'Invalid email address';
    }
    return null;
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body;

    const validationError = validateInput(name, email, subject, message);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    console.log(`[CONTACT] From: ${email}, Subject: ${subject}`);

    res.status(200).json({
        success: true,
        message: 'Your message has been received. We will respond soon!',
        data: { name, email, subject }
    });
};
