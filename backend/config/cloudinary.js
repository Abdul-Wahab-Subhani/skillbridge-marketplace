const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generic storage factory - keeps uploads organized by folder (avatars, portfolios, services)
const makeUploader = (folder) =>
  multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `marketplace/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });

module.exports = { cloudinary, makeUploader };
