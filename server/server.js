const express = require('express');
const cors = require('cors');
const connectDB = require('./connect');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Health check endpoint (for cron ping to keep Render alive)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const homeRoutes = require('./routes/homeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/payment', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
