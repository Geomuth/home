// ... (keep your existing UI initialization code)

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    displayMessage(message, 'user');
    userInput.value = '';
    sendBtn.disabled = true;

    try {
        // This MUST be a relative path for Vercel
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        displayMessage(data.response || 'Error: No response', 'bot');
    } catch (error) {
        displayMessage('Connection error. Check Vercel logs.', 'bot');
    } finally {
        sendBtn.disabled = false;
    }
}
