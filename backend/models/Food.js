const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    rating: { type: Number, default: 4.8 },
    available: { type: Boolean, default: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    spiceLevel: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
    ingredients: [{ type: String }],
    allergens: [{ type: String }],
    addOns: [{ name: String, price: Number }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', FoodSchema);
