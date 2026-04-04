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
    required: false,
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
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined to be ignored by unique index
    trim: true,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorCode: {
    type: String
  },
  twoFactorExpires: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
