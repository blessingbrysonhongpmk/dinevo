const express = require('express');
const router = express.Router();
const dbStore = require('../config/dbStore');

// POST /api/payments/create - initiate payment session
router.post('/create', async (req, res) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required for payment' });
    }
    const updatedOrder = await dbStore.createPaymentSession(orderId, method || 'UPI');
    res.json({
      success: true,
      message: 'Payment completed and verified by backend',
      order: updatedOrder
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/payments/verify - verify payment transaction
router.post('/verify', async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;
    if (!orderId || !transactionId) {
      return res.status(400).json({ message: 'Order ID and Transaction ID are required' });
    }
    const order = await dbStore.verifyPayment(orderId, transactionId);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
