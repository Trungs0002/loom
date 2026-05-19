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
        ],
        collectionBanner: "/cover.png",
        aboutPage: {
          banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaPYMaiQe0s4wgYylHTX3to9okdYtXdfgL5DEFpiNSIL6WJ2x3SkYnsnYGE_DUCbHaf9ejPgD1DL5kmDz5wCx9af7mJe18jcFDyxhkCPNeMfOeyZ1QDob6ODHDqvbsD9_tYaWRRgL8s9UgB47aSbivKhZlfC1501SaTaUCk3qbkcCWbzZ_pRqZnRtBW2utMKT-S25X3C3COHOG6ETOLiMu9m96bdQRQOfIIxA3ci5688YTOJhR9XveHYJpYxEcN3ukyfB57llzmpU",
          title: "Our Story",
          description: "Loom was founded on the belief that luxury should not come at the cost of our planet. We redefine elegance through sustainable innovation.",
          missionTitle: "Elegance with a Purpose",
          missionDescription1: "At Loom, we don't just make bags; we create symbols of change. Our mission is to eliminate the concept of \"waste\" by transforming discarded materials into high-end fashion staples.",
          missionDescription2: "Every design is born from a desire for minimalism and a commitment to longevity. We believe in buying less but buying better—pieces that stand the test of time both in quality and style.",
          missionImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvDxFiEhNKrrtjVprXgItoY0V2MpLUTRYOl3twUpwxGp2egcZRSfyxN0-uWALUqxTTo4USfifPLZSFPecftvwteEKpbEyh5Jltmo5XhlIh-uoWKa8vroI2xpEjMU6mzfHPYlX-19ttxhBdc5LfbM7oxtopYcya9H8FXoFQFxjhnFhEnUNXwrzkJmM9PwMPt1YqkJG8CwcrP2kdEs61NsaIt8B4KI2klmj2KumeCsaU8-S0XDLpgWYD7sNpcgwW4e7KxPw1YqLhWWI",
          spotlightTitle: "Recycled Denim: Our Signature",
          spotlightDescription: "We specialize in transforming vintage denim and post-consumer textile waste into premium fabrics. This process saves thousands of gallons of water and prevents tons of fabric from reaching landfills.",
          spotlightImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhnk20scGCchHeulXPn_48JVAc_YrBf_XDGsn9LyynbXqXDDpcSPjtTBXcA5Ja2gB2DM2_ZPHc8P8YIyma5XbKy03N7XcLGvDidbfPux776krFzT1icHOOx3r_oh1G8DsUR28pZ71vG1at6HSmBUIwUBdfJLCgWJRzVsYqJOHMV7aFKscZZv7w3RkeI94XIIhn1ihlPvl4CRiXIxteib5FB_9Wd-x9echkbLlmGJplZHdt-TkJgcKTN0VeihaJtN2j45bmco687Fw"
        }
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
      settings.collectionBanner = req.body.collectionBanner;
      settings.aboutPage = {
        ...settings.aboutPage,
        ...req.body.aboutPage
      };
      await settings.save();
    } else {
      settings = await HomeSettings.create({
        banners: req.body.banners,
        collectionBanner: req.body.collectionBanner,
        aboutPage: req.body.aboutPage
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
