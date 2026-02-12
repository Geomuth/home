// ... (Top part unchanged: initializeNavigation, initializeMessageIcon, initializeChatbot)

function initializeChatbot() {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatBox = document.getElementById('chatBox');

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !sendBtn.disabled) sendMessage();
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        displayMessage(message, 'user');
        userInput.value = '';
        sendBtn.disabled = true;
        userInput.disabled = true;  // Prevent input during loading

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.response || 'I encountered an error. Please try again.';
            displayMessage(aiResponse, 'bot');
        } catch (error) {
            console.error('Chat error:', error);
            displayMessage(`Error: ${error.message || 'Connection failed. Check if server is running or API key is set.'}`, 'bot error');  // Show specific errors
        } finally {
            sendBtn.disabled = false;
            userInput.disabled = false;
            userInput.focus();
        }
    }

    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;  // Auto-scroll
    }
}

// ... (escapeHtml unchanged)
