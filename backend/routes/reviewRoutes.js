const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { createReview, getProviderReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('customer'),
  [
    body('requestId').notEmpty().withMessage('requestId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  ],
  validate,
  createReview
);

router.get('/provider/:providerId', getProviderReviews);

module.exports = router;
