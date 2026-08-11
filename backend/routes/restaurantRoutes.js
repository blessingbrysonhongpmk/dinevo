const express = require('express');
const router = express.Router();
const dbStore = require('../config/dbStore');

function norm(s) {
  return (s || '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// GET /api/restaurants - get all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await dbStore.getRestaurants();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants/table/:code - resolve table code
router.get('/table/:code', async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
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
      tableNumber: table ? table.tableNumber : '08'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants/:id - restaurant profile
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await dbStore.getRestaurantById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
