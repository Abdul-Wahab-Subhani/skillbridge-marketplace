const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const ProviderProfile = require('../models/ProviderProfile');
const { cloudinary } = require('../config/cloudinary');
const logActivity = require('../utils/logActivity');

// @desc    Browse/search/filter all active services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Service.countDocuments(query);

  const services = await Service.find(query)
    .populate('provider', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: services.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: services,
  });
});

// @desc    Get single service by ID (includes provider rating)
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate(
    'provider',
    'name avatar email createdAt'
  );

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  const providerProfile = await ProviderProfile.findOne({ user: service.provider._id });

  res.json({ success: true, data: { service, providerProfile } });
});

// @desc    Get all services belonging to the logged-in provider
// @route   GET /api/services/provider/mine
// @access  Private (provider)
const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: services.length, data: services });
});

// @desc    Create a new service listing
// @route   POST /api/services
// @access  Private (provider)
const createService = asyncHandler(async (req, res) => {
  const { title, description, category, price, deliveryTime, tags } = req.body;

  if (!title || !description || !category || !price || !deliveryTime) {
    res.status(400);
    throw new Error('Title, description, category, price and delivery time are required');
  }

  const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));

  const service = await Service.create({
    provider: req.user._id,
    title,
    description,
    category,
    price,
    deliveryTime,
    tags: tags
      ? Array.isArray(tags)
        ? tags
        : String(tags).split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    images,
  });

  await logActivity(req.user._id, 'SERVICE_CREATED', `Created service "${title}"`, {
    serviceId: service._id,
  });

  res.status(201).json({ success: true, data: service });
});

// @desc    Update a service listing (owner only)
// @route   PUT /api/services/:id
// @access  Private (provider - owner)
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  if (service.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this service');
  }

  const fields = ['title', 'description', 'category', 'price', 'deliveryTime', 'isActive'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) service[field] = req.body[field];
  });

  if (req.body.tags !== undefined) {
    service.tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean);
  }

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    service.images.push(...newImages);
  }

  const updated = await service.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete a service listing (owner only)
// @route   DELETE /api/services/:id
// @access  Private (provider - owner, or admin)
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  const isOwner = service.provider.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this service');
  }

  // Clean up images from Cloudinary
  for (const img of service.images) {
    if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  }

  await service.deleteOne();
  res.json({ success: true, message: 'Service deleted successfully' });
});

module.exports = {
  getServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
};
