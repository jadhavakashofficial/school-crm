// backend/middleware/auth.js

const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authorized, no session' });
    }

    const user = await User.findById(req.session.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Authorize user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };