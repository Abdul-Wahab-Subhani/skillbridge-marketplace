const asyncHandler = require('express-async-handler');
const ServiceRequest = require('../models/ServiceRequest');
const Service = require('../models/Service');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Review = require('../models/Review');

const ACTIVE_STATUSES = ['Pending', 'Accepted', 'In Progress'];

// @desc    Customer dashboard summary
// @route   GET /api/dashboard/customer
// @access  Private (customer)
const getCustomerDashboard = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  const [activeRequests, completedProjects, totalSpentAgg] = await Promise.all([
    ServiceRequest.find({ customer: customerId, status: { $in: [...ACTIVE_STATUSES, 'Completed'] } })
      .populate('service', 'title category')
      .populate('provider', 'name avatar')
      .sort('-createdAt'),
    ServiceRequest.find({ customer: customerId, status: 'Delivered' })
      .populate('service', 'title category')
      .populate('provider', 'name avatar')
      .sort('-createdAt'),
    ServiceRequest.aggregate([
      { $match: { customer: customerId, status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$budget' } } },
    ]),
  ]);

  const statusCounts = await ServiceRequest.aggregate([
    { $match: { customer: customerId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      activeRequests,
      completedProjects,
      totalSpent: totalSpentAgg[0]?.total || 0,
      statusBreakdown: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    },
  });
});

// @desc    Provider dashboard summary
// @route   GET /api/dashboard/provider
// @access  Private (provider)
const getProviderDashboard = asyncHandler(async (req, res) => {
  const providerId = req.user._id;

  const [pendingRequests, activeProjects, profile, servicesCount] = await Promise.all([
    ServiceRequest.find({ provider: providerId, status: 'Pending' })
      .populate('service', 'title category')
      .populate('customer', 'name avatar')
      .sort('-createdAt'),
    ServiceRequest.find({ provider: providerId, status: { $in: ['Accepted', 'In Progress'] } })
      .populate('service', 'title category')
      .populate('customer', 'name avatar')
      .sort('-createdAt'),
    ProviderProfile.findOne({ user: providerId }),
    Service.countDocuments({ provider: providerId }),
  ]);

  // Monthly earnings breakdown (last 6 months) based on completed/delivered requests
  const earningsByMonth = await ServiceRequest.aggregate([
    {
      $match: {
        provider: providerId,
        status: { $in: ['Completed', 'Delivered'] },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
        total: { $sum: '$budget' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  const statusCounts = await ServiceRequest.aggregate([
    { $match: { provider: providerId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      pendingRequests,
      activeProjects,
      totalEarnings: profile?.totalEarnings || 0,
      completedProjects: profile?.completedProjects || 0,
      avgRating: profile?.avgRating || 0,
      numReviews: profile?.numReviews || 0,
      servicesCount,
      earningsByMonth,
      statusBreakdown: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    },
  });
});

// @desc    Admin dashboard summary (platform-wide analytics)
// @route   GET /api/dashboard/admin
// @access  Private (admin)
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [userStats, serviceStats, requestStats, totalReviews, recentUsers] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Service.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ServiceRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Review.countDocuments(),
    User.find().sort('-createdAt').limit(5).select('name email role createdAt'),
  ]);

  const totalUsers = await User.countDocuments();
  const totalServices = await Service.countDocuments();
  const totalRequests = await ServiceRequest.countDocuments();

  const revenueAgg = await ServiceRequest.aggregate([
    { $match: { status: 'Delivered' } },
    { $group: { _id: null, total: { $sum: '$budget' } } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalServices,
      totalRequests,
      totalReviews,
      totalRevenue: revenueAgg[0]?.total || 0,
      usersByRole: userStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      servicesByCategory: serviceStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      requestsByStatus: requestStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      recentUsers,
    },
  });
});

module.exports = { getCustomerDashboard, getProviderDashboard, getAdminDashboard };
