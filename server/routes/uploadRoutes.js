const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect, admin } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'loom',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// POST /api/upload (admin only)
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // Cloudinary returns the full secure_url
  res.json({ url: req.file.path });
});

// POST /api/upload/base64 (protected)
// This is for customization previews during checkout
router.post('/base64', protect, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'No image data' });

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'loom_custom',
    });

    res.json({ url: uploadResponse.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
