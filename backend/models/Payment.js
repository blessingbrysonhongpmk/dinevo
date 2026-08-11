const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    sessionCode: { type: String, required: true },
    amount: { type: Number, required: true },
    provider: { type: String, default: 'DINEVO_PAYMENT_GATEWAY' },
    method: { type: String, enum: ['UPI', 'CARD', 'NET_BANKING'], default: 'UPI' },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    transactionId: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
