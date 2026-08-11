const dbStore = require('../config/dbStore');

// GET /api/restaurants
exports.getRestaurants = async (req, res, next) => {
  try {
    const restaurants = await dbStore.getRestaurants();
    res.json({
      success: true,
      data: restaurants,
      message: 'Restaurants fetched successfully'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/restaurants/:id
exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await dbStore.getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({
      success: true,
      data: restaurant,
      message: 'Restaurant details fetched successfully'
    });
  } catch (err) {
    next(err);
  }
};
