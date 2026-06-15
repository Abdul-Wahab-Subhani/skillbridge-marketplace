const asyncHandler = require('express-async-handler');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const Service = require('../models/Service');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get list of providers (with optional skill/category filters & search)
// @route   GET /api/providers
// @access  Public
const getProviders = asyncHandler(async (req, res) => {
  const { skill, search, minRating, page = 1, limit = 12 } = req.query;
  const query = {};

  if (skill) query.skills = { $regex: skill, $options: 'i' };
  if (minRating) query.avgRating = { $gte: Number(minRating) };

  let profilesQuery = ProviderProfile.find(query).populate(
    'user',
    'name email avatar role isActive'
  );

  if (search) {
    const userIds = await User.find({
      name: { $regex: search, $options: 'i' },
      role: 'provider',
    }).distinct('_id');
    profilesQuery = ProviderProfile.find({
      ...query,
      user: { $in: userIds },
    }).populate('user', 'name email avatar role isActive');
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await ProviderProfile.countDocuments(query);
  const profiles = await profilesQuery
    .sort({ avgRating: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: profiles.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: profiles,
  });
});

// @desc    Get a single provider's public profile (with their services)
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.params.id }).populate(
    'user',
    'name email avatar role createdAt'
  );

  if (!profile) {
    res.status(404);
    throw new Error('Provider profile not found');
  }

  const services = await Service.find({ provider: req.params.id, isActive: true });

  res.json({ success: true, data: { profile, services } });
});

// @desc    Get own provider profile
// @route   GET /api/providers/profile/me
// @access  Private (provider)
const getMyProfile = asyncHandler(async (req, res) => {
  let profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await ProviderProfile.create({ user: req.user._id });
  }
  res.json({ success: true, data: profile });
});

// @desc    Create/update own provider profile (bio, skills, experience, pricing)
// @route   PUT /api/providers/profile
// @access  Private (provider)
const updateMyProfile = asyncHandler(async (req, res) => {
  const { title, bio, skills, experienceYears, hourlyRate, availability } = req.body;

  let profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = new ProviderProfile({ user: req.user._id });
  }

  if (title !== undefined) profile.title = title;
  if (bio !== undefined) profile.bio = bio;
  if (skills !== undefined) {
    profile.skills = Array.isArray(skills)
      ? skills
      : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (experienceYears !== undefined) profile.experienceYears = experienceYears;
  if (hourlyRate !== undefined) profile.hourlyRate = hourlyRate;
  if (availability !== undefined) profile.availability = availability;

  await profile.save();
  res.json({ success: true, data: profile });
});

// @desc    Upload/replace profile avatar
// @route   POST /api/providers/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }

  const user = await User.findById(req.user._id);

  // Remove old avatar from Cloudinary if it exists
  if (user.avatar?.publicId) {
    await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
  }

  user.avatar = { url: req.file.path, publicId: req.file.filename };
  await user.save();

  res.json({ success: true, data: user.avatar });
});

// @desc    Add a portfolio item (with optional image)
// @route   POST /api/providers/portfolio
// @access  Private (provider)
const addPortfolioItem = asyncHandler(async (req, res) => {
  const { title, description, link } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Portfolio item title is required');
  }

  let profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) profile = new ProviderProfile({ user: req.user._id });

  const item = { title, description, link };
  if (req.file) {
    item.image = { url: req.file.path, publicId: req.file.filename };
  }

  profile.portfolio.push(item);
  await profile.save();

  res.status(201).json({ success: true, data: profile.portfolio });
});

// @desc    Delete a portfolio item
// @route   DELETE /api/providers/portfolio/:itemId
// @access  Private (provider)
const deletePortfolioItem = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Provider profile not found');
  }

  const item = profile.portfolio.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Portfolio item not found');
  }

  if (item.image?.publicId) {
    await cloudinary.uploader.destroy(item.image.publicId).catch(() => {});
  }

  item.deleteOne();
  await profile.save();

  res.json({ success: true, data: profile.portfolio });
});

module.exports = {
  getProviders,
  getProviderById,
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  addPortfolioItem,
  deletePortfolioItem,
};
