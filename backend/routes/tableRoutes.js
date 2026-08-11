const express = require('express');
const router = express.Router();
const dbStore = require('../config/dbStore');
const tableController = require('../controllers/tableController');

function norm(s) {
  return (s || '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// GET /api/tables - List all tables (Admin)
router.get('/', tableController.getAllTables);

// POST /api/tables - Create table (Admin)
router.post('/', tableController.createTable);

// PATCH /api/tables/:tableCode/book - Book a table (Customer)
router.patch('/:tableCode/book', async (req, res) => {
  try {
    const code = req.params.tableCode.trim().toUpperCase();
    const result = await dbStore.bookTable(code);

    if (!result.success) {
      return res.status(409).json(result);
    }

    // Create a dining session for this booking
    const session = await dbStore.createDiningSession(code);

    res.json({
      success: true,
      message: 'Table booked successfully',
      table: result.table,
      session,
      restaurantId: result.restaurantId,
      restaurantName: result.restaurantName
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/tables/:tableCode/release - Release table (Admin/System)
router.patch('/:tableCode/release', async (req, res) => {
  try {
    const code = req.params.tableCode.trim().toUpperCase();
    const result = await dbStore.releaseTable(code);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({ success: true, message: 'Table released', table: result.table });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/tables/:tableCode/status - Update table status
router.patch('/:tableCode/status', async (req, res) => {
  try {
    const code = req.params.tableCode.trim().toUpperCase();
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    await dbStore.updateTableStatus(code, status);
    res.json({ success: true, message: `Table status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tables/:tableCode - resolve table code
router.get('/:tableCode', async (req, res) => {
  try {
    const code = req.params.tableCode.trim().toUpperCase();
    const targetNorm = norm(code);

    const restaurant = await dbStore.findRestaurantByTableCode(code);
    if (!restaurant) {
      return res.status(404).json({ message: 'Invalid table code' });
    }

    const table = restaurant.tables
      ? restaurant.tables.find(
          (t) =>
            t.code.toUpperCase() === code ||
            norm(t.code) === targetNorm ||
            norm(t.tableNumber) === targetNorm
        )
      : null;

    res.json({
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      tagline: restaurant.tagline,
      coverImage: restaurant.coverImage,
      tableNumber: table ? table.tableNumber : '08',
      tableCode: code,
      status: table ? (table.status || 'AVAILABLE') : 'AVAILABLE'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
