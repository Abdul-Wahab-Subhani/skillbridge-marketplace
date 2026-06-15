const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { makeUploader } = require('../config/cloudinary');
const {
  getServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

const router = express.Router();
const serviceUpload = makeUploader('services');

const serviceValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('deliveryTime')
    .isInt({ min: 1 })
    .withMessage('Delivery time must be at least 1 day'),
];

// Public
router.get('/', getServices);
router.get('/:id', getServiceById);

// Private - provider
router.get('/provider/mine', protect, authorize('provider'), getMyServices);
router.post(
  '/',
  protect,
  authorize('provider'),
  serviceUpload.array('images', 5),
  serviceValidation,
  validate,
  createService
);
router.put(
  '/:id',
  protect,
  authorize('provider'),
  serviceUpload.array('images', 5),
  updateService
);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
