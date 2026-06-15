const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  createRequest,
  getMyCustomerRequests,
  getMyProviderRequests,
  getRequestById,
  updateRequestStatus,
  getAllRequests,
} = require('../controllers/requestController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('customer'),
  [
    body('serviceId').notEmpty().withMessage('serviceId is required'),
    body('requirements').trim().notEmpty().withMessage('Requirements are required'),
    body('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
    body('deadline').isISO8601().withMessage('Deadline must be a valid date'),
  ],
  validate,
  createRequest
);

router.get('/customer/mine', protect, authorize('customer'), getMyCustomerRequests);
router.get('/provider/mine', protect, authorize('provider'), getMyProviderRequests);
router.get('/', protect, authorize('admin'), getAllRequests);
router.get('/:id', protect, getRequestById);
router.put(
  '/:id/status',
  protect,
  [body('status').notEmpty().withMessage('status is required')],
  validate,
  updateRequestStatus
);

module.exports = router;
