// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Signup Route
router.post('/signup', async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Validate role
  const allowedRoles = ["teacher", "student"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role selected" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Create new user
    user = new User({
      name,
      email,
      password, // Stored as plain text (not recommended)
      role
    });

    await user.save();

    // Initialize session => store userId
    req.session.userId = user._id;
    // Optionally store role if needed: req.session.role = user.role;

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    next(error);
  }
});

// Login Route
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare plain text passwords
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Initialize session => store userId
    req.session.userId = user._id;
    // Optionally store role if needed: req.session.role = user.role;

    // Respond with user data (excluding password)
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
});

// Logout Route
router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: 'Could not log out. Please try again.' });
    }
    // Clear the session cookie
    res.clearCookie('connect.sid', {
      path: '/',
      // In production over HTTPS, set these if you have them in session cookie config
      secure: false,
      sameSite: 'lax',
    });
    return res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
