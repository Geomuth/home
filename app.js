document.addEventListener('DOMContentLoaded', () => {
    // ── Elements ─────────────────────────────────────────────────
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

    // ── Helpers ──────────────────────────────────────────────────
    const getToken = () => localStorage.getItem('techgeo_token');
    const setToken = token => localStorage.setItem('techgeo_token', token);
    const removeToken = () => localStorage.removeItem('techgeo_token');
    const isLoggedIn = () => !!getToken();
    const closeModal = modal => modal?.classList.remove('active');

    // ── Mobile Menu ──────────────────────────────────────────────
    hamburger?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger?.classList.remove('active');
        });
    });

    // ── Modals (outside click + Esc) ─────────────────────────────
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

    // ── Auth Tabs ────────────────────────────────────────────────
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

    // ── Login / Register ─────────────────────────────────────────
    loginForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value.trim();
        console.log('Attempting login:', { email });

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
                alert('Logged in successfully');
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login fetch error:', err);
            alert('Network error – please try again');
        }
    });

    registerForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const fullName = registerForm.querySelector('input[type="text"]').value.trim();
        const email = registerForm.querySelector('input[type="email"]').value.trim();
        const password = registerForm.querySelector('input[type="password"]').value.trim();
        console.log('Attempting register:', { fullName, email });

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
                alert('Account created successfully');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Register fetch error:', err);
            alert('Network error – please try again');
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
        alert('Logged out');
    }

    // Initial setup for login/logout button
    if (isLoggedIn()) {
        loginBtn.textContent = 'Logout';
        loginBtn.addEventListener('click', handleLogout);
    } else {
        loginBtn.addEventListener('click', openLogin);
    }

    // ── Search Modal ─────────────────────────────────────────────
    searchBtn?.addEventListener('click', () => searchModal.classList.add('active'));

    // ── Chat Access Control + Send ───────────────────────────────
    messageIcon?.addEventListener('click', () => {
        if (!isLoggedIn()) {
            authModal.classList.add('active');
            return;
        }
        chatModal.classList.add('active');
        userInput?.focus();
    });

    function toggleSendButton() {
        sendBtn.disabled = !userInput?.value.trim();
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        chatBox.innerHTML += `<div class="chat-message user-message"><p>${text}</p></div>`;
        userInput.value = '';
        toggleSendButton();
        chatBox.scrollTop = chatBox.scrollHeight;

        const loadingId = 'loading-' + Date.now();
        chatBox.innerHTML += `<div class="chat-message bot-message" id="${loadingId}"><p>Thinking...</p></div>`;
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
                    alert('Session expired. Please log in again.');
                    return;
                }
                throw new Error('Server error');
            }

            const data = await res.json();
            document.getElementById(loadingId).innerHTML = `<p>${data.response}</p>`;
        } catch (err) {
            console.error('Chat fetch error:', err);
            document.getElementById(loadingId).innerHTML = `<p style="color:#e74c3c;">Error: ${err.message}</p>`;
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

    // ── Newsletter Subscription ──────────────────────────────────
    subscribeForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('subscribeEmail')?.value.trim();
        if (!email) return;

        console.log('Submitting subscription:', { email });

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
                subscribeMsg.textContent = data.message;
                subscribeMsg.className = 'success';
                subscribeForm.reset();
            } else {
                subscribeMsg.textContent = data.message || 'Subscription failed';
                subscribeMsg.className = 'error';
            }
        } catch (err) {
            console.error('Subscribe fetch error:', err);
            subscribeMsg.textContent = 'Network error – try again later';
            subscribeMsg.className = 'error';
        }
    });
});
