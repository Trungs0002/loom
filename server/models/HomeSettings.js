const mongoose = require('mongoose');

const homeSettingsSchema = new mongoose.Schema({
  banners: [{
    image: { type: String, required: true },
    link: { type: String, default: '/collection' },
    title: { type: String },
    subtitle: { type: String }
  }],
  collectionBanner: { type: String },
  aboutPage: {
    banner: { type: String },
    title: { type: String },
    description: { type: String },
    // Mission Section
    missionTitle: { type: String },
    missionDescription1: { type: String },
    missionDescription2: { type: String },
    missionImage: { type: String },
    // Spotlight Section
    spotlightTitle: { type: String },
    spotlightDescription: { type: String },
    spotlightImage: { type: String }
  },
  giftPage: {
    banner: { type: String },
    product1: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    product2: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
  },
  homeEthos: {
    image: { type: String },
    label: { type: String },
    title: { type: String },
    description: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('HomeSettings', homeSettingsSchema);
