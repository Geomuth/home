// ===================== INITIALIZATION =====================

let blogs = []; // Global blogs array

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeChatbot();
    initializeSearch();
    setupScrollSpy();
    initializeMessageIcon();
}); 

function initializeMessageIcon() {
    const messageIcon = document.getElementById('message');
    const chatModal = document.getElementById('ai-chat');
    const chatClose = document.getElementById('chatClose');
    
    if (messageIcon) {
        // Click message icon to toggle chat modal
        messageIcon.addEventListener('click', () => {
            chatModal.classList.toggle('active');
            
            // Auto-focus the chat input when opening
            if (chatModal.classList.contains('active')) {
                setTimeout(() => {
                    document.getElementById('userInput').focus();
                }, 300);
            }
        });
        
        // Show tooltip on hover
        messageIcon.addEventListener('mouseenter', () => {
            messageIcon.title = 'Click to chat with AI assistant';
        });
    }
    
    if (chatClose) {
        // Click close button to close chat modal
        chatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            chatModal.classList.remove('active');
        });
    }
}

function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

function setupScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Load Blogs
async function loadBlogs() {
    // Blogs loading removed - user will add their own HTML/CSS
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';

        if (!query) {
            searchResults.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #9ca3af;">Enter a search term</p>';
            return;
        }

        const results = blogs.filter(blog =>
            blog.title.toLowerCase().includes(query) ||
            blog.excerpt.toLowerCase().includes(query) ||
            blog.category.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            searchResults.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #9ca3af;">No results found. Try different keywords!</p>';
            return;
        }

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <h3>${result.title}</h3>
                <p>${result.excerpt}</p>
                <small><strong>Category:</strong> ${result.category} | <strong>Date:</strong> ${result.date}</small>
            `;
            searchResults.appendChild(resultItem);
        });
    }
}

// ===================== CHATBOT =====================

function initializeChatbot() {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatBox = document.getElementById('chatBox');

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        displayMessage(message, 'user');
        userInput.value = '';
        sendBtn.disabled = true;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            const aiResponse = data.response || 'I encountered an error. Please try again.';
            displayMessage(aiResponse, 'bot');
        } catch (error) {
            console.error('Chat error:', error);
            displayMessage('Connection error. Please check if the server is running.', 'bot');
        } finally {
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ===================== CONTACT FORM =====================

function initializeContactForm() {
    // Contact form removed - user will add their own HTML/CSS
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

