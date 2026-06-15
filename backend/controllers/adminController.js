const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ProviderProfile = require('../models/ProviderProfile');

// @desc    Get all users (filterable by role)
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);

  const users = await User.find(query).sort('-createdAt').skip(skip).limit(Number(limit));

  res.json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: users,
  });
});

// @desc    Activate or deactivate a user account
// @route   PUT /api/admin/users/:id/status
// @access  Private (admin)
const setUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot modify the status of an admin account');
  }

  user.isActive = !!isActive;
  await user.save();

  res.json({ success: true, data: user });
});

// @desc    Get recent activity logs
// @route   GET /api/admin/activity
// @access  Private (admin)
const getActivityLogs = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const logs = await ActivityLog.find()
    .populate('user', 'name email role')
    .sort('-createdAt')
    .limit(Number(limit));

  res.json({ success: true, count: logs.length, data: logs });
});

// @desc    Get top-rated providers (for admin overview / landing page)
// @route   GET /api/admin/top-providers
// @access  Public
const getTopProviders = asyncHandler(async (req, res) => {
  const profiles = await ProviderProfile.find({ numReviews: { $gt: 0 } })
    .sort('-avgRating -numReviews')
    .limit(6)
    .populate('user', 'name avatar');

  res.json({ success: true, data: profiles });
});

module.exports = { getAllUsers, setUserStatus, getActivityLogs, getTopProviders };
