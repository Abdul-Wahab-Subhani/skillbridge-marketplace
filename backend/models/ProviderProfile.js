const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: { type: String, trim: true, default: '' }, // e.g. "Full Stack Developer"
    bio: { type: String, trim: true, maxlength: 1000, default: '' },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    hourlyRate: { type: Number, default: 0, min: 0 },
    portfolio: [portfolioItemSchema],
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
  },
  { timestamps: true }
);

providerProfileSchema.index({ skills: 1 });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
