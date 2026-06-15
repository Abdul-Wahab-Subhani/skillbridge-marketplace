const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  changePassword,
  logoutUser,
  deleteMe,
} = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['customer', 'provider', 'admin'])
      .withMessage('Invalid role'),
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginUser
);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  validate,
  changePassword
);
router.post('/logout', protect, logoutUser);

// Deactivate own account (soft delete)
router.delete('/me', protect, deleteMe);

module.exports = router;
