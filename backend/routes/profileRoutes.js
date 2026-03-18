const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();
const User    = require('../models/User');
const GameHistory = require('../models/GameHistory');

// ─── GET profile ───────────────────────────────────────────
// GET /api/profile/:username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Aggregate stats from history
    const history = await GameHistory.find({ username: req.params.username })
      .sort({ createdAt: -1 })
      .limit(100);

    const wins   = history.filter(h => h.result === 'correct').length;
    const fails  = history.filter(h => h.result === 'fail').length;
    const bestXP = wins > 0 ? Math.max(...history.filter(h=>h.result==='correct').map(h=>h.points)) : 0;
    const avgTime = wins > 0
      ? Math.round(history.filter(h=>h.result==='correct').reduce((a,h)=>a+h.timeTaken,0) / wins)
      : 0;

    // Streak calculation
    let streak = 0, maxStreak = 0, cur = 0;
    for (const h of [...history].reverse()) {
      if (h.result === 'correct') { cur++; if (cur > maxStreak) maxStreak = cur; }
      else cur = 0;
    }
    streak = cur; // current streak (from latest)

    res.json({
      username:   user.username,
      totalScore: user.totalScore,
      bio:        user.bio        || '',
      avatarColor:user.avatarColor|| '#f7b924',
      joinedAt:   user.createdAt,
      stats: { wins, fails, bestXP, avgTime, maxStreak, streak, total: history.length },
      history: history.slice(0, 20),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── UPDATE profile ────────────────────────────────────────
// POST /api/profile/:username/update
router.post('/:username/update', async (req, res) => {
  try {
    const { bio, avatarColor, newPassword, currentPassword } = req.body;
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bio !== undefined) user.bio = bio.slice(0, 200);
    if (avatarColor) user.avatarColor = avatarColor;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ message: 'Current password incorrect' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: 'Profile updated', bio: user.bio, avatarColor: user.avatarColor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── LOG game entry ─────────────────────────────────────────
// POST /api/profile/history/add
router.post('/history/add', async (req, res) => {
  try {
    const { username, result, points, timeTaken, difficulty } = req.body;
    if (!username || !result) return res.status(400).json({ message: 'Missing fields' });
    const entry = new GameHistory({ username, result, points, timeTaken, difficulty });
    await entry.save();
    res.status(201).json({ message: 'History recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
