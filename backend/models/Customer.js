const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    name: { type: String, default: 'Guest' },
    loyaltyPoints: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', CustomerSchema);
