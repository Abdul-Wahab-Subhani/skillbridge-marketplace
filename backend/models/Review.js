const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
      unique: true, // one review per completed request
    },
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

reviewSchema.index({ provider: 1 });

module.exports = mongoose.model('Review', reviewSchema);
