const dbStore = require('../config/dbStore');

// GET /api/foods
exports.getFoods = async (req, res, next) => {
  try {
    const { category, restaurant } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (restaurant) filter.restaurant = restaurant;

    const foods = await dbStore.getMenuItems(filter);
    res.json({
      success: true,
      data: foods,
      message: 'Foods retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/foods/:id
exports.getFoodById = async (req, res, next) => {
  try {
    const food = await dbStore.getMenuItemById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    res.json({
      success: true,
      data: food,
      message: 'Food details retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/foods/category/:category
exports.getFoodsByCategory = async (req, res, next) => {
  try {
    const foods = await dbStore.getMenuItems({ category: req.params.category });
    res.json({
      success: true,
      data: foods,
      message: `Foods for category ${req.params.category} retrieved successfully`
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/foods (Admin)

exports.createFood = async (req, res, next) => {
  try {
    const food = await dbStore.createFoodItem(req.body);
    res.status(201).json({ success: true, data: food, message: 'Food item created' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/foods/:id (Admin)
exports.updateFood = async (req, res, next) => {
  try {
    const food = await dbStore.updateFoodItem(req.params.id, req.body);
    if (!food) return res.status(404).json({ message: 'Food item not found' });
    res.json({ success: true, data: food, message: 'Food item updated' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/foods/:id (Admin)
exports.deleteFood = async (req, res, next) => {
  try {
    const success = await dbStore.deleteFoodItem(req.params.id);
    if (!success) return res.status(404).json({ message: 'Food item not found' });
    res.json({ success: true, message: 'Food item deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/foods/:id/availability (Admin)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const food = await dbStore.toggleFoodAvailability(req.params.id, Boolean(isAvailable));
    if (!food) return res.status(404).json({ message: 'Food item not found' });
    res.json({ success: true, data: food, message: 'Availability updated' });
  } catch (err) {
    next(err);
  }
};

