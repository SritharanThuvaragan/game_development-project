const express = require('express');
const router = express.Router();
const { updateScore, getLeaderboard, getUserScore } = require('../controllers/scoreController');

// Update player score after answering question
router.post('/update', updateScore);

// Get global leaderboard
router.get('/leaderboard', getLeaderboard);

// Get specific user score
router.get('/user/:username', getUserScore);

module.exports = router;
