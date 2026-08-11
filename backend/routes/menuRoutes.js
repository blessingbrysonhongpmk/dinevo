const express = require('express');
const router = express.Router();
const dbStore = require('../config/dbStore');

// GET /api/foods or /api/menu - get all items or filter by query params
router.get('/', async (req, res) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
    if (req.query.category) filter.category = req.query.category;
    const items = await dbStore.getMenuItems(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/foods/category/:category - filter by category name
router.get('/category/:category', async (req, res) => {
  try {
    const filter = { category: req.params.category, isAvailable: true };
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
    const items = await dbStore.getMenuItems(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/foods/:id or /api/menu/item/:id - single food item details
router.get('/:id', async (req, res) => {
  try {
    const item = await dbStore.getMenuItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/item/:id - compatibility alias
router.get('/item/:id', async (req, res) => {
  try {
    const item = await dbStore.getMenuItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/restaurant/:restaurantId - full menu for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const filter = { restaurant: req.params.restaurantId, isAvailable: true };
    if (req.query.category) filter.category = req.query.category;
    const items = await dbStore.getMenuItems(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
