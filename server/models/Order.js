const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  note: { type: String },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    isCustomized: { type: Boolean, default: false },
    customName: { type: String },
    embroiderIcon: { type: String }, // For legacy, but we'll use left/right now
    selectedIconLeft: { type: String },
    selectedIconRight: { type: String },
    iconPosition: { type: String, enum: ['none', 'before', 'after', 'both'], default: 'before' },
    fontFamily: { type: String, default: 'Mrs Saint Delafield' },
    fontWeight: { type: String, default: 'normal' },
    fontStyle: { type: String, default: 'normal' },
    embroideryPos: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 }
    },
    customPreviewFabric: { type: String }, // Cloudinary URL
    customPreviewPlacement: { type: String } // Cloudinary URL
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery (COD)' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  history: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    user: String
  }],
  comments: [{
    text: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
