const mongoose = require('mongoose');

const homeSettingsSchema = new mongoose.Schema({
  banners: [{
    image: { type: String, required: true },
    link: { type: String, default: '/collection' },
    title: { type: String },
    subtitle: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('HomeSettings', homeSettingsSchema);
