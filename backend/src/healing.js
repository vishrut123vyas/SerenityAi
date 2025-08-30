const express = require('express');
const { HealingSession, AssessmentResponse } = require('./models');
const { authenticateToken } = require('./authMiddleware');

const router = express.Router();

// Dummy logic for personalized recommendation based on latest assessment
function getHealingRecommendation(score) {
  if (score < 5) return { type: 'sound', frequency: '432Hz', duration: 10, message: 'Mild relaxation sound therapy' };
  if (score < 10) return { type: 'sound', frequency: '528Hz', duration: 15, message: 'Moderate healing sound therapy' };
  if (score < 15) return { type: 'light', frequency: 'blue light', duration: 10, message: 'High intensity light therapy' };
  return { type: 'light', frequency: 'red light', duration: 20, message: 'Severe case: deep healing light therapy' };
}

// GET /api/healing/recommendation
router.get('/recommendation', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const latest = await AssessmentResponse.findOne({ where: { userId }, order: [['createdAt', 'DESC']] });
    if (!latest) return res.status(404).json({ error: 'No assessment found' });
    const rec = getHealingRecommendation(latest.score);
    res.json(rec);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
});

// POST /api/healing/log
router.post('/log', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, frequency, duration } = req.body;
    const session = await HealingSession.create({ userId, type, frequency, duration });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log healing session' });
  }
});

// GET /api/healing/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await HealingSession.findAll({ where: { userId }, order: [['timestamp', 'DESC']] });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch healing history' });
  }
});

module.exports = router; 