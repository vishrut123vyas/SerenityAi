// Chat Page JavaScript

let currentChatType = 'ai';
let chatHistory = [];
let currentSession = null;

// Initialize chat
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    setupEventListeners();
});

function setupEventListeners() {
    // Auto-resize textarea
    const messageInput = document.getElementById('message-input');
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Handle Enter key
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Chat Type Switching
function switchChatType(type) {
    currentChatType = type;
    
    // Update UI
    const buttons = document.querySelectorAll('.chat-type-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.chat-type-btn').classList.add('active');
    
    // Update chat interface
    updateChatInterface();
    
    // Clear current chat
    clearChat();
}

function updateChatInterface() {
    const chatAvatar = document.getElementById('chat-avatar');
    const chatTitle = document.getElementById('chat-title');
    const chatStatus = document.getElementById('chat-status');
    
    if (currentChatType === 'ai') {
        chatAvatar.innerHTML = '<i class="fas fa-robot"></i>';
        chatTitle.textContent = 'AI Assistant';
        chatStatus.textContent = 'Online • Ready to help';
    } else {
        chatAvatar.innerHTML = '<i class="fas fa-user-md"></i>';
        chatTitle.textContent = 'Licensed Psychologist';
        chatStatus.textContent = 'Connecting...';
        
        // Simulate connecting to psychologist
        setTimeout(() => {
            chatStatus.textContent = 'Online • Dr. Sarah Chen';
        }, 2000);
    }
}

// Message Functions
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Generate response
    setTimeout(() => {
        const response = generateResponse(message);
        addMessage(response, currentChatType);
    }, 1000 + Math.random() * 2000); // Random delay for realism
}

function sendQuickResponse(text) {
    const messageInput = document.getElementById('message-input');
    messageInput.value = text;
    sendMessage();
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    const isAI = sender === 'ai' || sender === 'psychologist';
    
    messageDiv.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${isAI ? (sender === 'ai' ? 'fa-robot' : 'fa-user-md') : 'fa-user'}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to chat history
    chatHistory.push({
        text: text,
        sender: sender,
        timestamp: new Date().toISOString()
    });
    
    saveChatHistory();
}

function generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // AI Assistant responses
    if (currentChatType === 'ai') {
        if (lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
            return "I understand anxiety can be overwhelming. Let me help you with some techniques. First, try taking 3 deep breaths: inhale for 4 counts, hold for 4, exhale for 6. Would you like me to guide you through a quick meditation session?";
        }
        
        if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
            return "I'm sorry you're feeling this way. It's important to acknowledge these feelings. Have you considered talking to a professional? I can also recommend some self-care activities or connect you with a psychologist through our platform.";
        }
        
        if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
            return "Sleep issues can really impact your well-being. Try establishing a bedtime routine: avoid screens 1 hour before bed, practice relaxation techniques, and keep your room cool and dark. Would you like to try our sleep preparation meditation?";
        }
        
        if (lowerMessage.includes('meditation') || lowerMessage.includes('breathing')) {
            return "Great choice! Meditation can be very helpful. I recommend starting with just 5 minutes. Focus on your breath and gently bring your attention back when your mind wanders. Would you like me to guide you through a session?";
        }
        
        if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much')) {
            return "Feeling overwhelmed is completely normal. Let's break this down. Can you identify one small thing you can do right now? Sometimes just taking one step at a time helps. Remember, it's okay to ask for help.";
        }
        
        // Default responses
        const defaultResponses = [
            "I'm here to support you. Can you tell me more about what you're experiencing?",
            "That sounds challenging. How long have you been feeling this way?",
            "I appreciate you sharing that with me. What do you think might help you feel better?",
            "You're not alone in this. Many people experience similar feelings. What coping strategies have worked for you in the past?",
            "Thank you for being open with me. How can I best support you right now?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Psychologist responses (more professional)
    else {
        if (lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
            return "Thank you for sharing that with me. Anxiety can manifest in many ways. Can you describe what specific symptoms you're experiencing? This will help me provide more targeted support.";
        }
        
        if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
            return "I hear you, and I want you to know that your feelings are valid. Depression can affect every aspect of life. Have you noticed any changes in your sleep, appetite, or daily activities?";
        }
        
        if (lowerMessage.includes('relationship') || lowerMessage.includes('family')) {
            return "Relationships can be complex and challenging. It sounds like this is really affecting you. Can you tell me more about the specific situation you're dealing with?";
        }
        
        if (lowerMessage.includes('work') || lowerMessage.includes('job')) {
            return "Work-related stress is very common and can significantly impact mental health. What aspects of your work situation are most challenging for you right now?";
        }
        
        // Professional default responses
        const professionalResponses = [
            "I appreciate you reaching out. Can you help me understand more about your current situation?",
            "That sounds like it's been really difficult for you. How long have you been experiencing these feelings?",
            "I want to understand better how this is affecting your daily life. Can you give me some examples?",
            "Thank you for sharing that. What would you like to focus on in our conversation today?",
            "I'm here to listen and support you. What feels most important to address right now?"
        ];
        
        return professionalResponses[Math.floor(Math.random() * professionalResponses.length)];
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Chat Management
function startNewChat() {
    clearChat();
    currentSession = {
        id: Date.now(),
        type: currentChatType,
        startTime: new Date().toISOString()
    };
    
    // Add welcome message
    if (currentChatType === 'ai') {
        addMessage("Hello! I'm your SerenityAI assistant. I'm here to provide mental health support, answer questions, and guide you through wellness practices. How can I help you today?", 'ai');
    } else {
        addMessage("Hello, I'm Dr. Sarah Chen, a licensed clinical psychologist. I'm here to provide professional mental health support. What brings you here today?", 'psychologist');
    }
}

function clearChat() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';
    chatHistory = [];
    
    // Add welcome message back
    if (currentChatType === 'ai') {
        addMessage("Hello! I'm your SerenityAI assistant. I'm here to provide mental health support, answer questions, and guide you through wellness practices. How can I help you today?", 'ai');
    } else {
        addMessage("Hello, I'm Dr. Sarah Chen, a licensed clinical psychologist. I'm here to provide professional mental health support. What brings you here today?", 'psychologist');
    }
}

function exportChat() {
    if (chatHistory.length === 0) {
        alert('No chat history to export');
        return;
    }
    
    const chatText = chatHistory.map(msg => 
        `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender.toUpperCase()}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            addMessage(`📎 Attached: ${file.name}`, 'user');
        }
    };
    input.click();
}

// Chat History Management
function loadChatHistory() {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const sessionList = document.getElementById('session-list');
    
    if (sessions.length === 0) {
        sessionList.innerHTML = '<p class="no-sessions">No previous sessions</p>';
        return;
    }
    
    const recentSessions = sessions.slice(-5).reverse();
    sessionList.innerHTML = recentSessions.map(session => `
        <div class="session-item" onclick="loadSession(${session.id})">
            <div class="session-icon">
                <i class="fas ${session.type === 'ai' ? 'fa-robot' : 'fa-user-md'}"></i>
            </div>
            <div class="session-info">
                <h4>${session.type === 'ai' ? 'AI Assistant' : 'Dr. Sarah Chen'}</h4>
                <p>${formatDate(session.startTime)}</p>
            </div>
        </div>
    `).join('');
}

function saveChatHistory() {
    if (currentSession) {
        let sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const existingIndex = sessions.findIndex(s => s.id === currentSession.id);
        
        if (existingIndex >= 0) {
            sessions[existingIndex].messages = chatHistory;
        } else {
            currentSession.messages = chatHistory;
            sessions.push(currentSession);
        }
        
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
}

function loadSession(sessionId) {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
        currentSession = session;
        chatHistory = session.messages || [];
        
        // Clear and reload messages
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        
        chatHistory.forEach(msg => {
            const messageDiv = document.createElement('div');
            const isAI = msg.sender === 'ai' || msg.sender === 'psychologist';
            
            messageDiv.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas ${isAI ? (msg.sender === 'ai' ? 'fa-robot' : 'fa-user-md') : 'fa-user'}"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${msg.text}</div>
                    <div class="message-time">${formatTime(msg.timestamp)}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageDiv);
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Handle key press for Enter
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Global functions
window.switchChatType = switchChatType;
window.sendMessage = sendMessage;
window.sendQuickResponse = sendQuickResponse;
window.clearChat = clearChat;
window.exportChat = exportChat;
window.attachFile = attachFile;
window.startNewChat = startNewChat;
window.loadSession = loadSession;
window.handleKeyPress = handleKeyPress;
window.toggleMobileMenu = toggleMobileMenu; 