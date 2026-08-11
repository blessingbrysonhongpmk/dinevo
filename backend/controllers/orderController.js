const dbStore = require('../config/dbStore');

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { restaurantId, tableNumber, sessionCode, items, customerNote, tableCode } = req.body;
    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty or missing required table information' });
    }

    let restId = restaurantId;
    if (!restId) {
      const rest = await dbStore.findRestaurantByTableCode(tableCode || `DINEVO-T${tableNumber}`);
      if (rest) restId = rest._id;
    }

    const order = await dbStore.createOrder({
      restaurantId: restId,
      tableNumber,
      sessionCode,
      items,
      customerNote
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await dbStore.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({
      success: true,
      data: order,
      message: 'Order status fetched successfully'
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, servingCode } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Order status is required' });
    }

    const updatedOrder = await dbStore.updateOrderStatus(req.params.id, status, servingCode);
    res.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    });
  } catch (err) {
    next(err);
  }
};
