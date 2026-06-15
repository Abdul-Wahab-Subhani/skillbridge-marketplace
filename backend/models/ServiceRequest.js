const mongoose = require('mongoose');

// Defines the allowed linear workflow for project tracking
const STATUS_FLOW = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered'];
const TERMINAL_REJECTED = 'Rejected';
const TERMINAL_CANCELLED = 'Cancelled';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [...STATUS_FLOW, TERMINAL_REJECTED, TERMINAL_CANCELLED],
      required: true,
    },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requirements: {
      type: String,
      required: [true, 'Requirements description is required'],
      trim: true,
      maxlength: 3000,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: [...STATUS_FLOW, TERMINAL_REJECTED, TERMINAL_CANCELLED],
      default: 'Pending',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: 'Pending' }],
    },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ customer: 1, status: 1 });
serviceRequestSchema.index({ provider: 1, status: 1 });

serviceRequestSchema.statics.STATUS_FLOW = STATUS_FLOW;
serviceRequestSchema.statics.TERMINAL_REJECTED = TERMINAL_REJECTED;
serviceRequestSchema.statics.TERMINAL_CANCELLED = TERMINAL_CANCELLED;

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
