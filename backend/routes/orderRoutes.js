const express = require('express');
const router = express.Router();
const dbStore = require('../config/dbStore');

// GET /api/orders/restaurant/all - get all orders for kitchen / staff board
router.get('/restaurant/all', async (req, res) => {
  try {
    const orders = await dbStore.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders - create pending order with backend price validation
router.post('/', async (req, res) => {
  try {
    const { restaurantId, tableNumber, sessionCode, items, customerNote } = req.body;
    const order = await dbStore.createOrder({
      restaurantId,
      tableNumber,
      sessionCode,
      items,
      customerNote
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/:id - get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await dbStore.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status - status transition control with serving code validation
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, servingCode } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const order = await dbStore.updateOrderStatus(req.params.id, status, servingCode);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/orders/:id/rate - rate dining experience
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }
    const order = await dbStore.rateOrder(req.params.id, rating, feedback);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
