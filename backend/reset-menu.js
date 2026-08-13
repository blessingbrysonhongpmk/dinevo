require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Restaurant = require('./models/Restaurant');
const { defaultItems, defaultRestaurant } = require('./seed/seedHelper');

async function resetMenu() {
  console.log('1. Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);

  console.log('2. Clearing old menu items from MongoDB Atlas...');
  await MenuItem.deleteMany({});

  console.log('3. Fetching or creating main restaurant...');
  let rest = await Restaurant.findOne({});
  if (!rest) {
    rest = await Restaurant.create(defaultRestaurant);
  }

  console.log('4. Inserting 37 clean curated food items across 11 categories...');
  const itemsToInsert = defaultItems.map((item) => ({
    ...item,
    restaurant: rest._id
  }));

  await MenuItem.insertMany(itemsToInsert);

  const count = await MenuItem.countDocuments({});
  console.log(`SUCCESS: Seeded ${count} clean food items into MongoDB Atlas!`);

  await mongoose.disconnect();
}

resetMenu().catch((err) => {
  console.error('Reset error:', err);
  process.exit(1);
});
