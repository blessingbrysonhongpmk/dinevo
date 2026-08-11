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

// GET /api/tables/:tableCode and GET /api/tables/code/:tableCode - resolve table code
const handleGetTableCode = async (req, res) => {
  try {
    const code = (req.params.tableCode || '').trim().toUpperCase();
    const targetNorm = norm(code);

    let restaurant = await dbStore.findRestaurantByTableCode(code);
    if (!restaurant) {
      const allRests = await dbStore.getRestaurants();
      restaurant = allRests[0];
    }

    if (!restaurant) {
      return res.status(500).json({ success: false, message: 'Restaurant unavailable' });
    }

    let table = restaurant.tables
      ? restaurant.tables.find(
          (t) =>
            t.code.toUpperCase() === code ||
            norm(t.code) === targetNorm ||
            norm(t.tableNumber) === targetNorm
        )
      : null;

    // Fallback to first table (Table 01) if code didn't match
    if (!table && restaurant.tables && restaurant.tables.length > 0) {
      table = restaurant.tables[0];
    }

    const tNumber = table ? table.tableNumber : '01';
    const tCode = table ? table.code : 'DINEVO-T01';
    const tStatus = table ? (table.status || 'AVAILABLE').toUpperCase() : 'AVAILABLE';

    res.json({
      success: true,
      data: {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        tagline: restaurant.tagline,
        coverImage: restaurant.coverImage,
        tableNumber: tNumber,
        tableCode: tCode,
        status: tStatus
      },
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      tagline: restaurant.tagline,
      coverImage: restaurant.coverImage,
      tableNumber: tNumber,
      tableCode: tCode,
      status: tStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.get('/code/:tableCode', handleGetTableCode);
router.get('/:tableCode', handleGetTableCode);

// POST /api/tables/merge - Merge tables
router.post('/merge', async (req, res) => {
  try {
    const { sourceCode, targetCode } = req.body;
    if (!sourceCode || !targetCode) return res.status(400).json({ success: false, message: 'Source and target codes are required' });
    const result = await dbStore.mergeTables(sourceCode, targetCode);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
