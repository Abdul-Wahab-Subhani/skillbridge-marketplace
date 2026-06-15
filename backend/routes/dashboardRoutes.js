const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getCustomerDashboard,
  getProviderDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/customer', protect, authorize('customer'), getCustomerDashboard);
router.get('/provider', protect, authorize('provider'), getProviderDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
