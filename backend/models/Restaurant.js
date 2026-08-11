const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tagline: { type: String, default: '' },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    address: { type: String, default: '' },
    openingHours: { type: String, default: '11:00 AM - 11:00 PM' },
    tables: [
      {
        tableNumber: { type: String, required: true },
        code: { type: String, required: true },
        status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'ORDERING', 'PREPARING', 'READY', 'SERVING', 'COMPLETED'], default: 'AVAILABLE' },
        activeSession: { type: String, default: null }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', RestaurantSchema);
