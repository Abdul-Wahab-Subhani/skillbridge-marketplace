const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const logActivity = require('../utils/logActivity');

// @desc    Submit a rating & review for a delivered project
// @route   POST /api/reviews
// @access  Private (customer)
const createReview = asyncHandler(async (req, res) => {
  const { requestId, rating, comment } = req.body;

  if (!requestId || !rating) {
    res.status(400);
    throw new Error('requestId and rating are required');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const request = await ServiceRequest.findById(requestId);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (request.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to review this project');
  }

  if (request.status !== 'Delivered') {
    res.status(400);
    throw new Error('You can only review a project after it has been delivered');
  }

  if (request.isReviewed) {
    res.status(400);
    throw new Error('This project has already been reviewed');
  }

  const review = await Review.create({
    request: requestId,
    service: request.service,
    customer: req.user._id,
    provider: request.provider,
    rating,
    comment,
  });

  request.isReviewed = true;
  await request.save();

  // Recalculate provider's average rating
  const stats = await Review.aggregate([
    { $match: { provider: request.provider } },
    { $group: { _id: '$provider', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await ProviderProfile.findOneAndUpdate(
      { user: request.provider },
      {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews,
      }
    );
  }

  await logActivity(req.user._id, 'REVIEW_SUBMITTED', `Reviewed request ${requestId}`, {
    rating,
  });

  res.status(201).json({ success: true, data: review });
});

// @desc    Get all reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ provider: req.params.providerId })
    .populate('customer', 'name avatar')
    .populate('service', 'title')
    .sort('-createdAt');

  const profile = await ProviderProfile.findOne({ user: req.params.providerId });

  res.json({
    success: true,
    count: reviews.length,
    avgRating: profile?.avgRating || 0,
    numReviews: profile?.numReviews || 0,
    data: reviews,
  });
});

module.exports = { createReview, getProviderReviews };
