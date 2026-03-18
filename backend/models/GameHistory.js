const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  result:     { type: String, enum: ['correct', 'fail'], required: true },
  points:     { type: Number, default: 0 },
  timeTaken:  { type: Number, default: 0 },   // seconds
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
}, { timestamps: true });

module.exports = mongoose.model('GameHistory', GameHistorySchema);
