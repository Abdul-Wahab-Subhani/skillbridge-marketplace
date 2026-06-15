const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/logActivity');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user (customer, provider, or admin*)
// @route   POST /api/auth/register
// @access  Public
// *Admin accounts should normally be created by an existing admin via
//  the admin routes; this endpoint allows it only for initial seeding
//  and is gated behind a registration secret in production.
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, adminSecret } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  let finalRole = 'customer';
  if (role === 'provider') finalRole = 'provider';
  if (role === 'admin') {
    if (adminSecret !== process.env.ADMIN_REGISTRATION_SECRET) {
      res.status(403);
      throw new Error('Invalid admin registration secret');
    }
    finalRole = 'admin';
  }

  const user = await User.create({
    name,
    email,
    password,
    role: finalRole,
    phone,
  });

  // Automatically create an empty provider profile for new providers
  if (finalRole === 'provider') {
    await ProviderProfile.create({ user: user._id });
  }

  await logActivity(user._id, 'USER_REGISTERED', `${user.role} account created`, {
    email: user.email,
  });

  // Send welcome email
  try {
    await sendEmail({
      to: user.email,
      subject: `Welcome to Teyzix Marketplace, ${user.name}!`,
      html: `<p>Hi ${user.name},</p><p>Welcome to Teyzix Marketplace. We're glad to have you on board.</p><p><a href="${process.env.CLIENT_URL}">Go to Marketplace</a></p>`,
    });
  } catch (err) {
    console.error('Failed to send welcome email:', err.message);
  }

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    token: generateToken(user._id, user.role),
  });
});

// @desc    Authenticate user & return token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact support.');
  }

  user.lastLogin = new Date();
  await user.save();

  await logActivity(user._id, 'USER_LOGIN', 'User logged in');

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    token: generateToken(user._id, user.role),
  });
});

// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = await ProviderProfile.findOne({ user: user._id });
  }

  res.json({ success: true, data: { user, providerProfile } });
});

// @desc    Update own account details (name, phone)
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone ?? user.phone;

  const updated = await user.save();
  res.json({ success: true, data: updated });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Logout (client deletes token; endpoint provided for activity log / future blacklist)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  await logActivity(req.user._id, 'USER_LOGOUT', 'User logged out');
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  changePassword,
  logoutUser,
};
