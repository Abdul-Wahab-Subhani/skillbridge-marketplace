const asyncHandler = require('express-async-handler');
const ServiceRequest = require('../models/ServiceRequest');
const Service = require('../models/Service');
const ProviderProfile = require('../models/ProviderProfile');
const logActivity = require('../utils/logActivity');
const { emitToUser } = require('../utils/socket');

// Allowed status transitions, keyed by who is allowed to make them.
// Format: { fromStatus: { toStatus: ['allowedRole', ...] } }
const TRANSITIONS = {
  Pending: {
    Accepted: ['provider', 'admin'],
    Rejected: ['provider', 'admin'],
    Cancelled: ['customer', 'admin'],
  },
  Accepted: {
    'In Progress': ['provider', 'admin'],
    Cancelled: ['customer', 'admin'],
  },
  'In Progress': {
    Completed: ['provider', 'admin'],
    Cancelled: ['admin'],
  },
  Completed: {
    Delivered: ['customer', 'admin'],
  },
  Delivered: {},
  Rejected: {},
  Cancelled: {},
};

// @desc    Customer submits a new service request for a listing
// @route   POST /api/requests
// @access  Private (customer)
const createRequest = asyncHandler(async (req, res) => {
  const { serviceId, requirements, budget, deadline } = req.body;

  if (!serviceId || !requirements || !budget || !deadline) {
    res.status(400);
    throw new Error('serviceId, requirements, budget and deadline are required');
  }

  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    res.status(404);
    throw new Error('Service not found or no longer available');
  }

  if (new Date(deadline) <= new Date()) {
    res.status(400);
    throw new Error('Deadline must be in the future');
  }

  const request = await ServiceRequest.create({
    service: service._id,
    customer: req.user._id,
    provider: service.provider,
    requirements,
    budget,
    deadline,
  });

  service.ordersCount += 1;
  await service.save();

  await logActivity(req.user._id, 'REQUEST_CREATED', `Requested service "${service.title}"`, {
    requestId: request._id,
  });

  emitToUser(service.provider, 'request:new', {
    requestId: request._id,
    serviceTitle: service.title,
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    Get requests submitted by the logged-in customer
// @route   GET /api/requests/customer/mine
// @access  Private (customer)
const getMyCustomerRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { customer: req.user._id };
  if (status) query.status = status;

  const requests = await ServiceRequest.find(query)
    .populate('service', 'title category price deliveryTime')
    .populate('provider', 'name avatar')
    .sort('-createdAt');

  res.json({ success: true, count: requests.length, data: requests });
});

// @desc    Get requests received by the logged-in provider
// @route   GET /api/requests/provider/mine
// @access  Private (provider)
const getMyProviderRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { provider: req.user._id };
  if (status) query.status = status;

  const requests = await ServiceRequest.find(query)
    .populate('service', 'title category price deliveryTime')
    .populate('customer', 'name avatar email')
    .sort('-createdAt');

  res.json({ success: true, count: requests.length, data: requests });
});

// @desc    Get a single request (only participants or admin)
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id)
    .populate('service')
    .populate('customer', 'name avatar email')
    .populate('provider', 'name avatar email');

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  const isParticipant =
    request.customer._id.toString() === req.user._id.toString() ||
    request.provider._id.toString() === req.user._id.toString();

  if (!isParticipant && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this request');
  }

  res.json({ success: true, data: request });
});

// @desc    Update the status of a request following the workflow rules
// @route   PUT /api/requests/:id/status
// @access  Private (customer/provider/admin - based on transition rules)
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Target status is required');
  }

  const request = await ServiceRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  const isCustomer = request.customer.toString() === req.user._id.toString();
  const isProvider = request.provider.toString() === req.user._id.toString();
  const role = req.user.role === 'admin' ? 'admin' : isCustomer ? 'customer' : isProvider ? 'provider' : null;

  if (!role) {
    res.status(403);
    throw new Error('Not authorized to update this request');
  }

  const allowedTransitions = TRANSITIONS[request.status] || {};
  const allowedRoles = allowedTransitions[status];

  if (!allowedRoles || !allowedRoles.includes(role)) {
    res.status(400);
    throw new Error(
      `Cannot transition from "${request.status}" to "${status}" as ${role}`
    );
  }

  const previousStatus = request.status;
  request.status = status;
  request.statusHistory.push({ status, changedBy: req.user._id, note: note || '' });
  await request.save();

  // When a project is marked Completed, bump provider's completed project count
  if (status === 'Completed') {
    await ProviderProfile.findOneAndUpdate(
      { user: request.provider },
      { $inc: { completedProjects: 1, totalEarnings: request.budget } }
    );
  }

  await logActivity(
    req.user._id,
    'REQUEST_STATUS_UPDATED',
    `Request ${request._id} moved from ${previousStatus} to ${status}`,
    { requestId: request._id, previousStatus, newStatus: status }
  );

  // Real-time notification to the other participant
  const notifyTarget = isCustomer ? request.provider : request.customer;
  emitToUser(notifyTarget, 'request:statusUpdated', {
    requestId: request._id,
    status,
  });

  res.json({ success: true, data: request });
});

// @desc    Get all requests (admin analytics)
// @route   GET /api/requests
// @access  Private (admin)
const getAllRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await ServiceRequest.countDocuments(query);

  const requests = await ServiceRequest.find(query)
    .populate('service', 'title category')
    .populate('customer', 'name email')
    .populate('provider', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: requests.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: requests,
  });
});

module.exports = {
  createRequest,
  getMyCustomerRequests,
  getMyProviderRequests,
  getRequestById,
  updateRequestStatus,
  getAllRequests,
  TRANSITIONS,
};
