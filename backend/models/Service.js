const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Mobile Development',
        'Graphic Design',
        'Content Writing',
        'Digital Marketing',
        'Video Editing',
        'UI/UX Design',
        'SEO',
        'Other',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    deliveryTime: {
      type: Number, // in days
      required: [true, 'Delivery time is required'],
      min: 1,
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    tags: [{ type: String, trim: true, lowercase: true }],
    isActive: { type: Boolean, default: true },
    ordersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
