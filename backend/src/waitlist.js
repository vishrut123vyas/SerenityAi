const express = require('express');
const router = express.Router();
const { WaitlistSignup } = require('./models');

// POST /api/waitlist - Add email to waitlist
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const signup = await WaitlistSignup.create({ email });
    res.status(201).json(signup);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already signed up' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/waitlist - List all signups (admin use)
router.get('/', async (req, res) => {
  try {
    const signups = await WaitlistSignup.findAll({ order: [['timestamp', 'DESC']] });
    res.json(signups);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 