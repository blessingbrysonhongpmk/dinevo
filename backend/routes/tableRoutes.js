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
      tableCode: code
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
