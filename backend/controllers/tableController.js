const dbStore = require('../config/dbStore');

// GET /api/tables/:tableCode
exports.getTableByCode = async (req, res, next) => {
  try {
    const { tableCode } = req.params;
    const restaurant = await dbStore.findRestaurantByTableCode(tableCode);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'The requested table code is invalid'
      });
    }

    const cleanCode = (tableCode || '').trim().toUpperCase();
    const tableObj = restaurant.tables
      ? restaurant.tables.find((t) => t.code.toUpperCase() === cleanCode || t.tableNumber === tableCode)
      : null;

    const tableNumber = tableObj ? tableObj.tableNumber : '08';

    res.json({
      success: true,
      data: {
        tableCode: cleanCode,
        tableNumber,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        tagline: restaurant.tagline,
        coverImage: restaurant.coverImage,
        isActive: true
      },
      message: 'Table validated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tables (Admin)
exports.getAllTables = async (req, res, next) => {
  try {
    const tables = await dbStore.getTables();
    res.json(tables);
  } catch (err) {
    next(err);
  }
};

// POST /api/tables (Admin)
exports.createTable = async (req, res, next) => {
  try {
    const { tableNumber, code } = req.body;
    if (!tableNumber) {
      return res.status(400).json({ message: 'Table number is required' });
    }
    const tables = await dbStore.createTable({ tableNumber, code });
    res.status(201).json({ success: true, tables, message: 'Table created successfully' });
  } catch (err) {
    next(err);
  }
};

