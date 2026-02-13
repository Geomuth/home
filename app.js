document.addEventListener('DOMContentLoaded', function () {
  const messageIcon = document.getElementById('message');
  const chatModal = document.getElementById('ai-chat');
  const closeBtn = document.getElementById('chatClose');
  const sendBtn = document.getElementById('sendBtn');
  const userInput = document.getElementById('userInput');
  const chatBox = document.getElementById('chatBox');

  // Toggle modal
  messageIcon?.addEventListener('click', () => {
    chatModal.classList.toggle('active');
    if (chatModal.classList.contains('active')) {
      userInput?.focus();
    }
  });

  closeBtn?.addEventListener('click', () => {
    chatModal.classList.remove('active');
  });

  // Send message
  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // User message
    chatBox.innerHTML += `<div class="chat-message user-message"><p>${text}</p></div>`;
    userInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error('Network error');

      const data = await res.json();
      chatBox.innerHTML += `<div class="chat-message bot-message"><p>${data.response || 'No reply'}</p></div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
      chatBox.innerHTML += `<div class="chat-message bot-message" style="color:red;"><p>Error: ${err.message}</p></div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  sendBtn?.addEventListener('click', sendMessage);
  userInput?.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });
});
