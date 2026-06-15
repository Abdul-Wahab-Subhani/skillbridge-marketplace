const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { makeUploader } = require('../config/cloudinary');
const {
  getProviders,
  getProviderById,
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  addPortfolioItem,
  deletePortfolioItem,
} = require('../controllers/providerController');

const router = express.Router();

const avatarUpload = makeUploader('avatars');
const portfolioUpload = makeUploader('portfolio');

// Public
router.get('/', getProviders);
router.get('/:id', getProviderById);

// Private - provider self-service
router.get('/profile/me', protect, authorize('provider'), getMyProfile);
router.put('/profile', protect, authorize('provider'), updateMyProfile);
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.post(
  '/portfolio',
  protect,
  authorize('provider'),
  portfolioUpload.single('image'),
  addPortfolioItem
);
router.delete(
  '/portfolio/:itemId',
  protect,
  authorize('provider'),
  deletePortfolioItem
);

module.exports = router;
