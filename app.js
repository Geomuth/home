document.addEventListener('DOMContentLoaded', () => {
    // ══════════════════════════════════════════════════════════════
    // ELEMENT SELECTORS
    // ══════════════════════════════════════════════════════════════
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const messageIcon = document.getElementById('message');
    const chatModal = document.getElementById('ai-chat');
    const chatClose = document.getElementById('chatClose');
    const loginBtn = document.getElementById('loginBtn');
    const authModal = document.getElementById('authModal');
    const closeAuth = document.getElementById('closeAuth');
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const closeSearch = document.getElementById('closeSearch');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const subscribeForm = document.getElementById('subscribeForm');
    const subscribeMsg = document.getElementById('subscribeMessage');
    const contactForm = document.getElementById('contactForm');
    const contactFormMsg = document.getElementById('contactFormMessage');
    const navbar = document.querySelector('.navbar');

    // ══════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ══════════════════════════════════════════════════════════════
    const getToken = () => localStorage.getItem('techgeo_token');
    const setToken = token => localStorage.setItem('techgeo_token', token);
    const removeToken = () => localStorage.removeItem('techgeo_token');
    const isLoggedIn = () => !!getToken();
    const closeModal = modal => modal?.classList.remove('active');

    // ══════════════════════════════════════════════════════════════
    // NAVBAR SCROLL EFFECT
    // ══════════════════════════════════════════════════════════════
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ══════════════════════════════════════════════════════════════
    // MOBILE MENU TOGGLE
    // ══════════════════════════════════════════════════════════════
    hamburger?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking nav links
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger?.classList.remove('active');
        });
    });

    // ══════════════════════════════════════════════════════════════
    // ACTIVE NAV LINK HIGHLIGHTING
    // ══════════════════════════════════════════════════════════════
    const sections = document.querySelectorAll('section[id]');
    const navLinksArray = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinksArray.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // ══════════════════════════════════════════════════════════════
    // MODAL CONTROLS
    // ══════════════════════════════════════════════════════════════
    [chatModal, authModal, searchModal].forEach(modal => {
        modal?.addEventListener('click', e => {
            if (e.target === modal) closeModal(modal);
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal(chatModal);
            closeModal(authModal);
            closeModal(searchModal);
        }
    });

    chatClose?.addEventListener('click', () => closeModal(chatModal));
    closeAuth?.addEventListener('click', () => closeModal(authModal));
    closeSearch?.addEventListener('click', () => closeModal(searchModal));

    // ══════════════════════════════════════════════════════════════
    // AUTH TAB SWITCHING
    // ══════════════════════════════════════════════════════════════
    showLogin?.addEventListener('click', () => {
        showLogin.classList.add('active');
        showRegister.classList.remove('active');
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    });

    showRegister?.addEventListener('click', () => {
        showRegister.classList.add('active');
        showLogin.classList.remove('active');
        registerForm.style.display = 'flex';
        loginForm.style.display = 'none';
    });

    // ══════════════════════════════════════════════════════════════
    // LOGIN FUNCTIONALITY
    // ══════════════════════════════════════════════════════════════
    loginForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value.trim();

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                setToken(data.token);
                closeModal(authModal);
                loginBtn.textContent = 'Logout';
                loginBtn.removeEventListener('click', openLogin);
                loginBtn.addEventListener('click', handleLogout);
                showNotification('Logged in successfully!', 'success');
                loginForm.reset();
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            showNotification('Network error – please try again', 'error');
        }
    });

    // ══════════════════════════════════════════════════════════════
    // REGISTER FUNCTIONALITY
    // ══════════════════════════════════════════════════════════════
    registerForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const fullName = registerForm.querySelector('input[type="text"]').value.trim();
        const email = registerForm.querySelector('input[type="email"]').value.trim();
        const password = registerForm.querySelector('input[type="password"]').value.trim();

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                setToken(data.token);
                closeModal(authModal);
                loginBtn.textContent = 'Logout';
                loginBtn.removeEventListener('click', openLogin);
                loginBtn.addEventListener('click', handleLogout);
                showNotification('Account created successfully!', 'success');
                registerForm.reset();
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (err) {
            console.error('Register error:', err);
            showNotification('Network error – please try again', 'error');
        }
    });

    function openLogin(e) {
        e.preventDefault();
        authModal.classList.add('active');
    }

    function handleLogout(e) {
        e.preventDefault();
        removeToken();
        loginBtn.textContent = 'Login';
        loginBtn.removeEventListener('click', handleLogout);
        loginBtn.addEventListener('click', openLogin);
        closeModal(chatModal);
        showNotification('Logged out successfully', 'success');
    }

    // Initialize login/logout button
    if (isLoggedIn()) {
        loginBtn.textContent = 'Logout';
        loginBtn.addEventListener('click', handleLogout);
    } else {
        loginBtn.addEventListener('click', openLogin);
    }

    // ══════════════════════════════════════════════════════════════
    // SEARCH FUNCTIONALITY
    // ══════════════════════════════════════════════════════════════
    searchBtn?.addEventListener('click', () => searchModal.classList.add('active'));

    const searchInput = document.getElementById('searchInput');
    const searchSubmit = document.getElementById('searchSubmit');
    const searchResults = document.getElementById('searchResults');

    const searchableContent = [
        { title: 'Web Development', content: 'Custom websites and web applications', link: '#services' },
        { title: 'Mobile Apps', content: 'iOS and Android applications', link: '#services' },
        { title: 'Cloud Solutions', content: 'Scalable cloud infrastructure', link: '#services' },
        { title: 'AI & Machine Learning', content: 'Intelligent automation solutions', link: '#services' },
        { title: 'E-Commerce', content: 'Online store solutions', link: '#services' },
        { title: 'Cybersecurity', content: 'Digital asset protection', link: '#services' },
        { title: 'Contact Us', content: 'Get in touch with our team', link: '#contacts' },
        { title: 'About TechGeo', content: 'Learn more about our company', link: '#about' },
        { title: 'FAQ', content: 'Frequently asked questions', link: '#faq' }
    ];

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            searchResults.innerHTML = '<p style="color: #999; padding: 10px;">Please enter a search term</p>';
            return;
        }

        const results = searchableContent.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            searchResults.innerHTML = '<p style="color: #999; padding: 10px;">No results found</p>';
        } else {
            searchResults.innerHTML = results.map(result => `
                <div style="padding: 15px; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.2s;" 
                     onclick="window.location.href='${result.link}'; document.getElementById('searchModal').classList.remove('active');">
                    <h4 style="color: var(--secondary-color); margin-bottom: 5px;">${result.title}</h4>
                    <p style="color: #666; font-size: 14px;">${result.content}</p>
                </div>
            `).join('');
        }
    }

    searchSubmit?.addEventListener('click', performSearch);
    searchInput?.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });

    // ══════════════════════════════════════════════════════════════
    // CHAT FUNCTIONALITY
    // ══════════════════════════════════════════════════════════════
    messageIcon?.addEventListener('click', () => {
        if (!isLoggedIn()) {
            authModal.classList.add('active');
            showNotification('Please login to use the AI assistant', 'info');
            return;
        }

        if (chatModal.classList.contains('active')) {
            chatModal.classList.remove('active');
        } else {
            chatModal.classList.add('active');
            userInput?.focus();
        }
    });

    function toggleSendButton() {
        sendBtn.disabled = !userInput?.value.trim();
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Add user message
        chatBox.innerHTML += `<div class="chat-message user-message"><p>${escapeHtml(text)}</p></div>`;
        userInput.value = '';
        toggleSendButton();
        chatBox.scrollTop = chatBox.scrollHeight;

        // Add loading indicator
        const loadingId = 'loading-' + Date.now();
        chatBox.innerHTML += `<div class="chat-message bot-message" id="${loadingId}"><p>✨ Thinking...</p></div>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ message: text })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    removeToken();
                    closeModal(chatModal);
                    authModal.classList.add('active');
                    showNotification('Session expired. Please log in again.', 'error');
                    return;
                }
                throw new Error('Server error');
            }

            const data = await res.json();
            document.getElementById(loadingId).innerHTML = `<p>${escapeHtml(data.response)}</p>`;
        } catch (err) {
            console.error('Chat error:', err);
            document.getElementById(loadingId).innerHTML = `<p style="color:#e74c3c;">❌ Error: ${err.message}</p>`;
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendBtn?.addEventListener('click', sendMessage);
    userInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    userInput?.addEventListener('input', toggleSendButton);
    toggleSendButton();

    // ══════════════════════════════════════════════════════════════
    // NEWSLETTER SUBSCRIPTION
    // ══════════════════════════════════════════════════════════════
    subscribeForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('subscribeEmail')?.value.trim();
        if (!email) return;

        subscribeMsg.textContent = '';
        subscribeMsg.className = '';

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                subscribeMsg.textContent = '✓ ' + data.message;
                subscribeMsg.className = 'success';
                subscribeForm.reset();
            } else {
                subscribeMsg.textContent = '✗ ' + (data.message || 'Subscription failed');
                subscribeMsg.className = 'error';
            }
        } catch (err) {
            console.error('Subscribe error:', err);
            subscribeMsg.textContent = '✗ Network error – try again later';
            subscribeMsg.className = 'error';
        }
    });

    // ══════════════════════════════════════════════════════════════
    // CONTACT FORM
    // ══════════════════════════════════════════════════════════════
    contactForm?.addEventListener('submit', async e => {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const subject = document.getElementById('contactSubject').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        if (!name || !email || !message) {
            contactFormMsg.textContent = '✗ Please fill in all required fields';
            contactFormMsg.className = 'error';
            return;
        }

        // Simulate sending (since there's no backend endpoint yet)
        contactFormMsg.textContent = '⏳ Sending message...';
        contactFormMsg.className = '';

        // Simulate API call
        setTimeout(() => {
            contactFormMsg.textContent = '✓ Thank you! Your message has been sent successfully.';
            contactFormMsg.className = 'success';
            contactForm.reset();
            
            // Clear message after 5 seconds
            setTimeout(() => {
                contactFormMsg.textContent = '';
                contactFormMsg.className = '';
            }, 5000);
        }, 1000);
    });

    // ══════════════════════════════════════════════════════════════
    // FAQ ACCORDION
    // ══════════════════════════════════════════════════════════════
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');

            // Close all other FAQs
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });

            // Toggle current FAQ
            if (!isActive) {
                question.classList.add('active');
                answer.classList.add('active');
            }
        });
    });

    // ══════════════════════════════════════════════════════════════
    // SCROLL ANIMATIONS
    // ══════════════════════════════════════════════════════════════
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, observerOptions);

    // Observe elements with fade-in-up class
    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });

    // ══════════════════════════════════════════════════════════════
    // NOTIFICATION SYSTEM
    // ══════════════════════════════════════════════════════════════
    function showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 80px;
                right: 20px;
                background: ${type === 'success' ? '#98e2a8' : type === 'error' ? '#e74c3c' : '#3284aa'};
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 9999;
                animation: slideIn 0.3s ease;
                max-width: 350px;
            ">
                ${message}
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ══════════════════════════════════════════════════════════════
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ══════════════════════════════════════════════════════════════
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ══════════════════════════════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ══════════════════════════════════════════════════════════════
    // INITIALIZE
    // ══════════════════════════════════════════════════════════════
    console.log('✨ TechGeo website loaded successfully!');
});
