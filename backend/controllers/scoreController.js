const User = require('../models/User');

// @route   POST /api/scores/update
// @desc    Add points to user's total score
// @access  Public (or protected if you add auth middleware)
exports.updateScore = async (req, res) => {
  try {
    const { username, pointsToAdd } = req.body;

    if (!username || typeof pointsToAdd !== 'number') {
      return res.status(400).json({ message: 'Please provide username and pointsToAdd' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.totalScore += pointsToAdd;
    await user.save();

    res.status(200).json({ 
      message: 'Score updated successfully', 
      totalScore: user.totalScore 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/scores/leaderboard
// @desc    Get top 100 players by score
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('username totalScore createdAt')
      .sort({ totalScore: -1 })
      .limit(100);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

// @route   GET /api/scores/user/:username
// @desc    Get a specific user's score
// @access  Public
exports.getUserScore = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ username: user.username, totalScore: user.totalScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user score' });
  }
};
