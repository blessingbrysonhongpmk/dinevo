const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const dbStore = require('../config/dbStore');

// GET /api/foods
router.get('/', async (req, res, next) => {
  try {
    const { category, restaurant } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (restaurant) filter.restaurant = restaurant;

    const foods = await dbStore.getMenuItems(filter);
    // Return direct array for frontend compatibility while supporting standard format
    res.json(foods);
  } catch (err) {
    next(err);
  }
});

// GET /api/foods/category/:category
router.get('/category/:category', foodController.getFoodsByCategory);

// GET /api/foods/:id
router.get('/:id', async (req, res, next) => {
  try {
    const food = await dbStore.getMenuItemById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    res.json(food);
  } catch (err) {
    next(err);
  }
});

// POST /api/foods - Add new food item (Admin)
router.post('/', foodController.createFood);

// PUT /api/foods/:id - Edit food item (Admin)
router.put('/:id', foodController.updateFood);

// DELETE /api/foods/:id - Delete food item (Admin)
router.delete('/:id', foodController.deleteFood);

// PATCH /api/foods/:id/availability - Toggle availability (Admin)
router.patch('/:id/availability', foodController.toggleAvailability);

module.exports = router;

