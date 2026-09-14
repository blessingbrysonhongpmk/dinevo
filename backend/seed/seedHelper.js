const dbStore = require('../config/dbStore');
const UserModel = require('../models/User');
const { defaultItems, defaultRestaurant } = require('./catalog_100');

async function seedAdminUser() {
  try {
    if (dbStore.isDbConnected()) {
      const adminExists = await UserModel.findOne({ email: 'admin@dinevo.com' });
      if (!adminExists) {
        await UserModel.create({
          email: 'admin@dinevo.com',
          password: 'dinevo123',
          name: 'DINEVO Admin',
          role: 'admin'
        });
        console.log('[dinevo] Created admin user in Atlas: admin@dinevo.com / dinevo123');
      } else {
        adminExists.password = 'dinevo123';
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('[dinevo] Verified & synced admin user credentials in Atlas');
      }
    }
  } catch (userErr) {
    console.warn('[dinevo] Admin user seed warning:', userErr.message);
  }
}

async function seedData(forceReset = false) {
  await seedAdminUser();

  const existing = await dbStore.countRestaurants();
  if (existing > 0 && !forceReset) {
    const itemCount = await dbStore.countMenuItems();
    if (itemCount === 0 || itemCount < 90) {
      const rest = (await dbStore.getRestaurants())[0];
      if (rest) {
        if (itemCount < 90 && forceReset) {
          await dbStore.clearAll();
          const newRest = await dbStore.createRestaurant(defaultRestaurant);
          await dbStore.insertMenuItems(defaultItems.map((i) => ({ ...i, restaurant: newRest._id })));
          console.log(`[dinevo] Synced ${defaultItems.length} unique gourmet menu items.`);
          return;
        }
        await dbStore.insertMenuItems(defaultItems.map((i) => ({ ...i, restaurant: rest._id })));
      }
    } else {
      console.log(`[dinevo] Atlas DB contains ${itemCount} clean unique food items. Skipping duplicate re-seed.`);
    }
    return;
  }

  if (forceReset) {
    await dbStore.clearAll();
  }

  const restaurant = await dbStore.createRestaurant(defaultRestaurant);
  await dbStore.insertMenuItems(defaultItems.map((i) => ({ ...i, restaurant: restaurant._id })));

  console.log(`[dinevo] Seeded 5-Star Luxury resort & ${defaultItems.length} unique food menu items.`);
  console.log(`[dinevo] Restaurant ID: ${restaurant._id}`);
}

module.exports = { seedData, seedAdminUser, defaultItems, defaultRestaurant };
