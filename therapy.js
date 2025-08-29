const express = require('express');
const router = express.Router();
const { TherapySession, TherapyFeedback } = require('./models');

// POST /api/therapy/session - Log a therapy session
router.post('/session', async (req, res) => {
  try {
    const { userId, therapyType, frequencies, lightColor, duration } = req.body;
    const session = await TherapySession.create({ userId, therapyType, frequencies, lightColor, duration });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/therapy/feedback - Log feedback for a session
router.post('/feedback', async (req, res) => {
  try {
    const { userId, sessionId, feedback } = req.body;
    const fb = await TherapyFeedback.create({ userId, sessionId, feedback });
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/therapy/history?userId=xxx - Get all therapy sessions for a user
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const sessions = await TherapySession.findAll({ where: { userId }, order: [['timestamp', 'DESC']] });
    // Optionally join feedback
    const feedbacks = await TherapyFeedback.findAll({ where: { userId } });
    const feedbackMap = {};
    feedbacks.forEach(fb => { feedbackMap[fb.sessionId] = fb.feedback; });
    const result = sessions.map(s => ({
      therapyType: s.therapyType,
      frequencies: s.frequencies,
      lightColor: s.lightColor,
      duration: s.duration,
      timestamp: s.timestamp,
      feedback: feedbackMap[s.id] || null
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 