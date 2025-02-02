const express = require('express');
const User = require('../models/User');
const router = express.Router();

// ✅ Login Route - Ensures Session is Set
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Store full user in session
    req.session.user = {
      _id: user._id,
      email: user.email,
      role: user.role
    };

    console.log("✅ Session After Login:", req.session); // Debugging

    res.json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Logout Route - Destroys Session
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout Error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie('connect.sid', { path: '/', secure: true, sameSite: "none" });
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
