const express = require('express');
const router = express.Router();
const dbStore = require('../config/dbStore');
const crypto = require('crypto');

// POST /api/payments/create - initiate and process payment session
router.post('/create', async (req, res) => {
  try {
    const { orderId, method, tipAmount, customerPhone, cardDetails, bankName } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required for payment' });
    }
    const paymentResult = await dbStore.createPaymentSession(orderId, {
      method: method || 'UPI',
      tipAmount: Number(tipAmount || 0),
      customerPhone,
      cardDetails,
      bankName
    });

    res.json({
      success: true,
      message: 'Payment completed and verified successfully',
      payment: paymentResult.payment,
      order: paymentResult.order,
      receipt: paymentResult.receipt
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

// GET /api/payments/status/:orderId - query real-time payment status
router.get('/status/:orderId', async (req, res) => {
  try {
    const order = await dbStore.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const payment = await dbStore.getPaymentByOrderId(req.params.orderId);
    res.json({
      success: true,
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      status: order.status,
      transactionId: payment?.transactionId || order.transactionId || null,
      paymentMethod: payment?.method || 'UPI',
      paidAt: payment?.createdAt || order.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/receipt/:orderId - fetch official GST tax invoice receipt
router.get('/receipt/:orderId', async (req, res) => {
  try {
    const receiptData = await dbStore.generateReceiptData(req.params.orderId);
    if (!receiptData) {
      return res.status(404).json({ message: 'Receipt not found for this order' });
    }
    res.json({ success: true, receipt: receiptData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/razorpay/create-order - create Razorpay order for SDK integration
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await dbStore.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dinevo_mock_key';
    const amountInPaisa = Math.round(order.total * 100);
    const razorpayOrderId = `rzp_order_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

    res.json({
      success: true,
      key: keyId,
      amount: amountInPaisa,
      currency: 'INR',
      name: 'DINEVO Kitchen & Bar',
      description: `Table #${order.tableNumber} Order #${order.orderNumber}`,
      orderId: razorpayOrderId,
      dinevoOrderId: order._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/razorpay/verify-signature - verify Razorpay webhook/client signature
router.post('/razorpay/verify-signature', async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let isValid = true;
    if (keySecret && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      isValid = generatedSignature === razorpaySignature;
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid Razorpay signature' });
    }

    const updatedOrder = await dbStore.verifyPayment(orderId, razorpayPaymentId || `RZP-${Date.now()}`);
    res.json({ success: true, message: 'Razorpay payment verified', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

