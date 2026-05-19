const express = require('express');
const router = express.Router();
const HomeSettings = require('../models/HomeSettings');
const { protect, admin } = require('../middleware/auth');

// @desc    Get home settings
// @route   GET /api/home
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await HomeSettings.create({
        banners: [
          {
            title: "Recycled Bags, Refined For You",
            subtitle: "Discover our collection of sustainably crafted handbags.",
            image: "/cover.png",
            link: "/collection"
          }
        ]
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update home settings
// @route   PUT /api/home
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (settings) {
      settings.banners = req.body.banners;
      await settings.save();
    } else {
      settings = await HomeSettings.create({
        banners: req.body.banners
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
