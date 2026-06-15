const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  setUserStatus,
  getActivityLogs,
  getTopProviders,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), setUserStatus);
router.get('/activity', protect, authorize('admin'), getActivityLogs);
router.get('/top-providers', getTopProviders);

module.exports = router;
