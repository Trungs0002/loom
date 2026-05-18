const mongoose = require('mongoose');

const colorImageSchema = new mongoose.Schema({
  color: { type: String, required: true },
  image: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  // Legacy single image (used as fallback if colorImages not set)
  image: { type: String },
  // Color-specific images
  colorImages: [colorImageSchema],
  // Keep colors array for quick access to color names
  colors: [{ type: String }],
  material: { type: String },
  innerLining: { type: String },
  numberStraps: { type: String },
  detachableStrap: { type: String },
  adjustableStrap: { type: String },
  closureType: { type: String },
  innerCompartments: { type: String },
  dimensions: { type: String },
  weight: { type: String },
  careInstructions: { type: String },
  description: { type: String },
  stock: { type: Number, default: 0 },
  tags: [{ type: String }],
  wishlist: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
