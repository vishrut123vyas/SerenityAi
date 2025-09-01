// serenityai-website/api.js

// serenityai-website/api.js
window.SERENITY_API_URL = 'https://serenityai-production.up.railway.app/api';
const API_URL = window.SERENITY_API_URL;


// --- Token Management ---
export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

// --- Auth API ---
export async function registerUser(email, password, name) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function getProfile() {
  const token = getToken();
  if (!token) return { error: 'Not logged in' };
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// --- Assessment API ---
export async function getAssessmentQuestions() {
  const res = await fetch(`${API_URL}/assessment/questions`);
  return res.json();
}

export async function submitAssessment(answers) {
  const token = getToken();
  if (!token) return { error: 'Not logged in' };
  const res = await fetch(`${API_URL}/assessment/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });
  return res.json();
}

export async function getAssessmentResults() {
  const token = getToken();
  if (!token) return { error: 'Not logged in' };
  const res = await fetch(`${API_URL}/assessment/results`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// --- Chat API ---
export async function sendChatMessage(messageData) {
  const token = getToken();
  if (!token) {
    // Fallback for demo mode
    return {
      success: true,
      response: generateDemoResponse(messageData.message, messageData.chatType)
    };
  }
  
  try {
    const res = await fetch(`${API_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(messageData)
    });
    
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    
    return res.json();
  } catch (error) {
    console.error('Chat API error:', error);
    // Fallback response
    return {
      success: true,
      response: generateDemoResponse(messageData.message, messageData.chatType)
    };
  }
}

export async function getChatHistory() {
  const token = getToken();
  if (!token) {
    // Return empty history for demo mode
    return { success: true, sessions: [] };
  }
  
  try {
    const res = await fetch(`${API_URL}/chat/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    
    return res.json();
  } catch (error) {
    console.error('Chat history API error:', error);
    return { success: true, sessions: [] };
  }
}

// --- Demo Response Generator ---
function generateDemoResponse(userMessage, chatType) {
  const message = userMessage.toLowerCase();
  
  // Enhanced AI responses for demo mode
  if (chatType === 'ai') {
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm your SerenityAI assistant. I'm here to support your mental wellness journey. How are you feeling today?";
    }
    
    if (message.includes('anxiety') || message.includes('worried')) {
      return "I understand anxiety can feel overwhelming. Let's take a moment together. Can you tell me what's making you feel anxious? Sometimes just talking about it can help. I'm here to listen without judgment.";
    }
    
    if (message.includes('depression') || message.includes('sad')) {
      return "I hear the heaviness in your words, and I want you to know that your feelings are valid. Depression can make everything feel impossible, but you're not alone in this. Can you tell me more about what you're experiencing?";
    }
    
    if (message.includes('stress') || message.includes('overwhelmed')) {
      return "Stress can feel like it's taking over everything. Let's break it down together - what's the most pressing thing on your mind right now? Sometimes just identifying the source can help us find solutions.";
    }
    
    if (message.includes('meditation') || message.includes('breathing')) {
      return "That's a wonderful choice! Let's start simple - find a comfortable position and take a deep breath in through your nose for 4 counts, hold for 4, then exhale slowly for 6 counts. Would you like me to guide you through a longer session?";
    }
    
    if (message.includes('sleep') || message.includes('insomnia')) {
      return "Sleep issues can be incredibly frustrating. Let's work on creating a calming bedtime routine. Try to avoid screens an hour before bed, maybe read a book or listen to calming music. Would you like me to suggest some specific relaxation techniques?";
    }
    
    return "Thank you for sharing that with me. I'm here to support you on your mental wellness journey. Is there anything specific you'd like to work on today, or would you like me to suggest some self-care activities?";
  }
  
  if (chatType === 'psychologist') {
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello, I'm Dr. Sarah Chen, a licensed clinical psychologist. I'm here to provide professional mental health support in a safe, confidential environment. What brings you here today?";
    }
    
    if (message.includes('anxiety') || message.includes('panic')) {
      return "I understand anxiety can be very distressing and overwhelming. What you're experiencing is real and valid. Can you tell me more about when these feelings started and what seems to trigger them?";
    }
    
    if (message.includes('depression') || message.includes('hopeless')) {
      return "I hear the pain in your words, and I want you to know that you're not alone. Depression can make everything feel overwhelming and hopeless. Have you noticed any patterns in when these feelings are better or worse?";
    }
    
    return "Thank you for reaching out. I'm here to provide professional support and guidance. Can you tell me more about what's been on your mind lately? I want to understand your situation better so I can help you effectively.";
  }
  
  return "I'm here to listen and support you. Please tell me more about what you're experiencing, and I'll do my best to help you through this.";
}

// --- Utility: Check if logged in ---
export function isLoggedIn() {
  return !!getToken();

} 
