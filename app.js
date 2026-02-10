// ===================== INITIALIZATION =====================

/**
 * Main entry point: Wait for the DOM to load before initializing modules
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeChatbot();
    initializeMessageIcon();
}); 

/**
 * Handles the floating message icon and modal toggling
 */
function initializeMessageIcon() {
    const messageIcon = document.getElementById('message');
    const chatModal = document.getElementById('ai-chat');
    const chatClose = document.getElementById('chatClose');
    const userInput = document.getElementById('userInput');
    
    if (messageIcon && chatModal) {
        messageIcon.addEventListener('click', () => {
            chatModal.classList.toggle('active');
            
            if (chatModal.classList.contains('active')) {
                setTimeout(() => {
                    userInput.focus();
                }, 300);
            }
        });
        
        messageIcon.title = 'Chat with TechGeo AI';
    }
    
    if (chatClose && chatModal) {
        chatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            chatModal.classList.remove('active');
        });
    }
}

/**
 * Mobile Navigation (Hamburger Menu) Logic
 */
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks) navLinks.classList.remove('active');
        });
    });
}

// ===================== CHATBOT LOGIC =====================

/**
 * Handles sending and receiving messages from the AI
 */
function initializeChatbot() {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatBox = document.getElementById('chatBox');

    if (!userInput || !sendBtn || !chatBox) return;

    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // 1. Display user message in UI
        displayMessage(message, 'user');
        userInput.value = '';
        sendBtn.disabled = true;

        // 2. Create "Thinking" indicator
        const tempId = 'thinking-' + Date.now();
        const thinkingDiv = document.createElement('div');
        thinkingDiv.id = tempId;
        thinkingDiv.className = 'chat-message bot-message';
        thinkingDiv.innerHTML = `<p><i>TechGeo is thinking...</i></p>`;
        chatBox.appendChild(thinkingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            // 3. Fetch response from Vercel Serverless Function
            // Because your file is in api/chat.js, this relative path works perfectly.
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ message })
            });

            // Remove thinking indicator
            const loader = document.getElementById(tempId);
            if (loader) loader.remove();

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            
            // 4. Display AI response
            const aiResponse = data.response || 'I am sorry, I could not process that.';
            displayMessage(aiResponse, 'bot');

        } catch (error) {
            // Remove thinking indicator on error
            const loader = document.getElementById(tempId);
            if (loader) loader.remove();

            console.error('Chat Error:', error);
            displayMessage('Connection issue. Please ensure your GEMINI_API_KEY is set in Vercel and your API folder is correct.', 'bot');
        } finally {
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    /**
     * Appends messages to the chat container
     */
    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        // Escape HTML for security, but allow the bot to send formatted text if needed
        messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// ===================== UTILITIES =====================

/**
 * Security helper to prevent XSS attacks
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
