const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'loom_secret_key', { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, pass } = req.body;
  try {
    const userExists = await User.findOne({ name });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);

    const user = await User.create({ name, pass: hashedPassword });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { name, pass } = req.body;
  try {
    const user = await User.findOne({ name });
    if (user && (await bcrypt.compare(pass, user.pass))) {
      res.json({
        _id: user.id,
        name: user.name,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid name or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-pass').populate('favorites');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/favorites
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (user) {
      res.json(user.favorites);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/favorites
router.post('/favorites', protect, async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isFavorite = user.favorites.includes(productId);
    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== productId);
    } else {
      user.favorites.push(productId);
    }

    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
