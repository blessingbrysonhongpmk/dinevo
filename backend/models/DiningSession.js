const mongoose = require('mongoose');

const DiningSessionSchema = new mongoose.Schema(
  {
    sessionCode: { type: String, required: true, unique: true }, // e.g. D4821
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableNumber: { type: String, required: true },
    tableCode: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiningSession', DiningSessionSchema);
