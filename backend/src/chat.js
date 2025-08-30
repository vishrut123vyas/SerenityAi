const express = require('express');
const router = express.Router();
const { ChatMessage, User } = require('./models');
const { authenticateToken } = require('./authMiddleware');

// POST /api/chat/send - Send a chat message with AI response
router.post('/send', async (req, res) => {
  try {
    const { message, chatType = 'ai', sessionId, emotionalData, crisisLevel } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || `session_${Date.now()}`;
    
    // Save user message
    const userMessage = await ChatMessage.create({
      userId: req.user?.id || null,
      sessionId: currentSessionId,
      message: message,
      senderType: 'user',
      timestamp: new Date()
    });

    // Generate AI response
    const aiResponse = generateAIResponse(message, chatType, emotionalData, crisisLevel);
    
    // Save AI response
    const aiMessage = await ChatMessage.create({
      userId: req.user?.id || null,
      sessionId: currentSessionId,
      message: aiResponse,
      senderType: 'ai',
      timestamp: new Date()
    });

    res.json({
      success: true,
      response: aiResponse,
      sessionId: currentSessionId,
      userMessage: userMessage,
      aiMessage: aiMessage
    });

  } catch (err) {
    console.error('Chat send error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/chat/history - Get chat history for authenticated user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all messages grouped by session
    const messages = await ChatMessage.findAll({
      where: { userId },
      order: [['timestamp', 'ASC']]
    });

    // Group messages by session
    const sessions = {};
    messages.forEach(msg => {
      if (!sessions[msg.sessionId]) {
        sessions[msg.sessionId] = {
          id: msg.sessionId,
          messages: [],
          startTime: msg.timestamp,
          lastMessage: msg.timestamp
        };
      }
      sessions[msg.sessionId].messages.push({
        id: msg.id,
        text: msg.message,
        sender: msg.senderType,
        time: msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      sessions[msg.sessionId].lastMessage = msg.timestamp;
    });

    // Convert to array and sort by last message time
    const sessionsArray = Object.values(sessions).sort((a, b) => 
      new Date(b.lastMessage) - new Date(a.lastMessage)
    );

    res.json({
      success: true,
      sessions: sessionsArray
    });

  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// GET /api/chat/session/:sessionId - Get messages for a specific session
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const messages = await ChatMessage.findAll({
      where: { userId, sessionId },
      order: [['timestamp', 'ASC']]
    });

    res.json({
      success: true,
      sessionId: sessionId,
      messages: messages.map(msg => ({
        id: msg.id,
        text: msg.message,
        sender: msg.senderType,
        time: msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    });

  } catch (err) {
    console.error('Session messages error:', err);
    res.status(500).json({ error: 'Failed to fetch session messages' });
  }
});

// POST /api/chat - Add a chat message (legacy endpoint)
router.post('/', async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) return res.status(400).json({ error: 'userId and message are required' });
    const chatMsg = await ChatMessage.create({ userId, message });
    res.status(201).json(chatMsg);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/chat/user/:userId - Get all messages for a user (legacy endpoint)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await ChatMessage.findAll({ where: { userId }, order: [['timestamp', 'ASC']] });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Response Generation Function
function generateAIResponse(userMessage, chatType = 'ai', emotionalData = {}, crisisLevel = 0) {
  const message = userMessage.toLowerCase();
  
  // Crisis detection
  if (crisisLevel > 0.7 || message.includes('suicide') || message.includes('kill myself') || message.includes('end it all')) {
    return "I'm very concerned about what you're saying. Your life has value, and there are people who care about you. Please, right now, call the National Suicide Prevention Lifeline at 988 or text HOME to 741741. You don't have to go through this alone. Would you like me to help you connect with immediate support?";
  }
  
  if (message.includes('hurt myself') || message.includes('self-harm')) {
    return "I hear that you're in a lot of pain right now. Hurting yourself isn't the answer, and you deserve help and support. Can you tell me what's making you feel this way? I want to help you find healthier ways to cope with these feelings.";
  }

  // AI Assistant responses
  if (chatType === 'ai') {
    if (message.includes('anxiety') || message.includes('worried') || message.includes('nervous')) {
      return "I understand anxiety can feel overwhelming and all-consuming. Let's take a moment together. Can you tell me what's making you feel anxious right now? Sometimes just talking about it can help. I'm here to listen without judgment.";
    }
    
    if (message.includes('depression') || message.includes('sad') || message.includes('hopeless')) {
      return "I hear the heaviness in your words, and I want you to know that your feelings are valid. Depression can make everything feel impossible, but you're not alone in this. Can you tell me more about what you're experiencing? I'm here to support you through this.";
    }
    
    if (message.includes('stress') || message.includes('overwhelmed')) {
      return "Stress can feel like it's taking over everything. Let's break it down together - what's the most pressing thing on your mind right now? Sometimes just identifying the source can help us find solutions. I'm here to help you navigate this.";
    }
    
    if (message.includes('meditation') || message.includes('breathing')) {
      return "That's a wonderful choice! Meditation can be a powerful tool for mental wellness. Let's start simple - find a comfortable position and take a deep breath in through your nose for 4 counts, hold for 4, then exhale slowly for 6 counts. Would you like me to guide you through a longer session?";
    }
    
    if (message.includes('sleep') || message.includes('insomnia')) {
      return "Sleep issues can be incredibly frustrating and affect everything else. Let's work on creating a calming bedtime routine. Try to avoid screens an hour before bed, maybe read a book or listen to calming music. Would you like me to suggest some specific relaxation techniques for sleep?";
    }
    
    if (message.includes('relationship') || message.includes('family') || message.includes('friend')) {
      return "Relationships can be complex and challenging. It sounds like this is really affecting you. Can you tell me more about the specific situation? I'm here to help you navigate these difficult dynamics and find healthy ways to communicate.";
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm your advanced SerenityAI assistant. I can analyze your emotions in real-time, detect crisis situations, and provide personalized mental health support. I'm here to listen, understand, and help you on your wellness journey. How are you feeling today?";
    }
    
    return "Thank you for sharing that with me. I'm here to support you on your mental wellness journey. Is there anything specific you'd like to work on today, or would you like me to suggest some self-care activities that might help?";
  }
  
  // Psychologist responses
  if (chatType === 'psychologist') {
    if (message.includes('anxiety') || message.includes('panic')) {
      return "I understand anxiety can be very distressing and overwhelming. What you're experiencing is real and valid. Can you tell me more about when these feelings started and what seems to trigger them? This will help me provide more targeted support and coping strategies.";
    }
    
    if (message.includes('depression') || message.includes('hopeless')) {
      return "I hear the pain in your words, and I want you to know that you're not alone. Depression can make everything feel overwhelming and hopeless. Have you noticed any patterns in when these feelings are better or worse? Understanding these patterns can help us develop effective strategies.";
    }
    
    if (message.includes('relationship') || message.includes('family')) {
      return "Relationships can be complex and challenging, especially when they're affecting your mental health. It sounds like this is really impacting you. Can you tell me more about the specific situation? I'm here to help you navigate this and develop healthy boundaries and communication skills.";
    }
    
    if (message.includes('trauma') || message.includes('ptsd')) {
      return "I understand that trauma can have profound effects on mental health and daily functioning. What you've experienced is significant, and it's important to work through it in a safe, supportive environment. Can you tell me more about what you're experiencing? I'm here to provide trauma-informed support.";
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello, I'm Dr. Sarah Chen, a licensed clinical psychologist. I'm here to provide professional mental health support in a safe, confidential environment. What brings you here today? I'm ready to listen and help you work through whatever you're experiencing.";
    }
    
    return "Thank you for reaching out. I'm here to provide professional support and guidance. Can you tell me more about what's been on your mind lately? I want to understand your situation better so I can help you effectively. Remember, this is a safe space for you to share.";
  }
  
  return "I'm here to listen and support you. Please tell me more about what you're experiencing, and I'll do my best to help you through this.";
}

module.exports = router; 