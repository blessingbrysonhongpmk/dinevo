const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    spiceLevel: { type: String, default: 'Medium' },
    addOns: [{ name: String, price: Number }],
    notes: { type: String, default: '' }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. DINEVO-8421
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    tableNumber: { type: String, required: true },
    tableCode: { type: String, default: 'DINEVO-T08' },
    sessionCode: { type: String, default: 'D4821' },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      default: 'PAID'
    },
    status: {
      type: String,
      enum: ['received', 'confirmed', 'preparing', 'ready', 'served', 'PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
      default: 'received'
    },
    servingCode: { type: String, default: '5831' },
    rating: { type: Number, default: 0 },
    customerFeedback: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
