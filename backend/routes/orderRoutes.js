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

// GET /api/orders/analytics - get sales analytics
router.get('/analytics', async (req, res) => {
  try {
    const orders = await dbStore.getAllOrders();
    const salesData = {};
    orders.forEach(o => {
       if (o.status === 'COMPLETED' || o.paymentStatus === 'PAID') {
          const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          salesData[date] = (salesData[date] || 0) + (o.total || 0);
       }
    });
    
    // orders are returned in desc order by getAllOrders, so reverse chartData to be chronological
    let chartData = Object.keys(salesData).map(date => ({
      date,
      revenue: salesData[date]
    })).reverse();
    
    if (chartData.length === 0) {
      // Provide some dummy data if empty for demo purposes
      chartData = [
        { date: 'Aug 5', revenue: 150 },
        { date: 'Aug 6', revenue: 200 },
        { date: 'Aug 7', revenue: 180 },
        { date: 'Aug 8', revenue: 250 },
        { date: 'Aug 9', revenue: 300 },
        { date: 'Aug 10', revenue: 120 }
      ];
    }
    
    res.json(chartData);
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
