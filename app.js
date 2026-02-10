async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // 1. UI Feedback
        displayMessage(message, 'user');
        userInput.value = '';
        sendBtn.disabled = true;
        
        // Add a temporary "Typing..." placeholder
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'chat-message bot-message';
        typingDiv.innerHTML = `<p><i>TechGeo is thinking...</i></p>`;
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            // 2. Fetch from Gemini Endpoint
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            // Remove typing indicator
            document.getElementById(typingId)?.remove();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            
            // 3. Display Gemini Response
            // (Note: Backend code I gave you sends { response: "text" })
            const aiResponse = data.response || 'I am sorry, I could not process that.';
            displayMessage(aiResponse, 'bot');

        } catch (error) {
            document.getElementById(typingId)?.remove();
            console.error('Chat Error:', error);
            
            // Updated validation error message for Gemini
            displayMessage('Connection issue. Please ensure your GEMINI_API_KEY is set in Vercel.', 'bot');
        } finally {
            sendBtn.disabled = false;
            userInput.focus();
        }
    }
