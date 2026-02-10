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
        // Click icon to open/close chat
        messageIcon.addEventListener('click', () => {
            chatModal.classList.toggle('active');
            
            // Focus input field automatically when opened
            if (chatModal.classList.contains('active')) {
                setTimeout(() => {
                    userInput.focus();
                }, 300);
            }
        });
        
        // Simple tooltip
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

    // Close mobile menu when a link is clicked
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

    // Trigger on button click
    sendBtn.addEventListener('click', sendMessage);

    // Trigger on 'Enter' key
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

        try {
            // 2. Fetch response from our Vercel API endpoint
            // NOTE: We use a relative path '/api/chat' which Vercel routes to chat.js
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            
            // 3. Display AI response
            const aiResponse = data.response || 'I am sorry, I could not process that.';
            displayMessage(aiResponse, 'bot');

        } catch (error) {
            console.error('Chat Error:', error);
            displayMessage('Connection lost. Please ensure your OpenAI key is set in Vercel.', 'bot');
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
        
        // Use escapeHtml to prevent XSS attacks
        messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
        
        chatBox.appendChild(messageDiv);
        
        // Auto-scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// ===================== UTILITIES =====================

/**
 * Security helper to prevent malicious code injection
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
