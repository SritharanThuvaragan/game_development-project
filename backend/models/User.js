const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  totalScore: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    maxLength: 200,
    default: ""
  },
  avatarColor: {
    type: String,
    default: "#f7b924"
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
