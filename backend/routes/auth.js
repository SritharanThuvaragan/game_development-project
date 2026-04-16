const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();
// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (forcing 2FA on by default)
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isTwoFactorEnabled: true
    });

    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully. 2FA is active.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (User not found)' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (Wrong password)' });
    }

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled && user.email) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = code;
      user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      await user.save();

      await sendEmail({
        to: user.email,
        subject: 'Banana Quiz Game - Your Login Code',
        text: `Your 2FA login code is: ${code}\n\nIt will expire in 10 minutes.`
      });

      return res.json({ requires2FA: true, username: user.username });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret_key_banana_123',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Setup 2FA
router.post('/setup-2fa', async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.email = email;
    user.isTwoFactorEnabled = true;
    await user.save();
    
    res.json({ message: '2FA enabled successfully. Future logins will require email verification.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error setting up 2FA' });
  }
});

// Verify 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    const { username, code } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.twoFactorCode !== code || user.twoFactorExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired 2FA code' });
    }
    
    // Clear code
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret_key_banana_123',
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during 2FA verification' });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Please provide a username' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = code;
    user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Banana Quiz Game - Password Reset Code',
      text: `Your password reset code is: ${code}\n\nIt will expire in 10 minutes. If you did not request this, please ignore this email.`
    });

    res.json({ message: 'Password reset code sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during forgot password' });
  }
});

// Reset Password - Verify OTP and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { username, code, newPassword } = req.body;
    
    if (!username || !code || !newPassword) {
      return res.status(400).json({ message: 'Please provide username, code, and new password' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.twoFactorCode !== code || user.twoFactorExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
