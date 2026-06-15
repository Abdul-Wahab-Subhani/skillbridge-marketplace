const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT and attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Not authorized, user not found or deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

/**
 * Restricts access to the given roles.
 * Usage: authorize('admin'), authorize('provider', 'admin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Access denied. Requires role(s): ${roles.join(', ')}`);
  }
  next();
};

module.exports = { protect, authorize };
