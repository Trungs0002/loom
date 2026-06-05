const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// POST /api/orders
router.post('/', protect, async (req, res) => {
  const { recipientName, phone, address, note, items, totalAmount, paymentMethod } = req.body;

  if (items && items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    const order = new Order({
      user: req.user._id,
      recipientName,
      phone,
      address,
      note,
      items,
      totalAmount,
      paymentMethod
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/orders/dashboard-stats (Admin only)
router.get('/dashboard-stats', protect, admin, async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();

    // Sales by month (last 6 months)
    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          amount: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    // Top selling products (by quantity)
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          count: { $sum: "$items.quantity" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersCount,
      productsCount,
      usersCount,
      monthlySales: monthlySales.reverse(),
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/stats (Admin only)
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const oldStatus = order.status;
      order.status = req.body.status || order.status;
      
      // Log history if status changed
      if (oldStatus !== order.status) {
        order.history.push({
          status: order.status,
          user: req.user.name,
          changedAt: Date.now()
        });
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/comments
router.post('/:id/comments', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const comment = {
        text: req.body.text,
        author: req.user.name,
        createdAt: Date.now()
      };
      order.comments.push(comment);
      await order.save();
      res.status(201).json(comment);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
