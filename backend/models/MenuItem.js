const mongoose = require('mongoose');

const AddOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const MenuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    category: { type: String, required: true }, // e.g. Signature, Burgers, Chicken, Rice & Meals, Spicy, Starters, Sides, Beverages, Desserts
    veg: { type: Boolean, default: true },
    spiceLevel: { type: Number, default: 0 }, // 0: None, 1: Mild, 2: Medium, 3: Hot, 4: Extra Hot
    rating: { type: Number, default: 4.8 },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isSignature: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    isDessert: { type: Boolean, default: false },
    ingredients: [{ type: String }],
    allergens: [{ type: String }],
    addOns: [AddOnSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', MenuItemSchema);
