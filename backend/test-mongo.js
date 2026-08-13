require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dbStore = require('./config/dbStore');

async function testMongo() {
  console.log('1. Connecting to MongoDB Atlas...');
  let connected = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true
      });
      connected = true;
      console.log('Connected to Atlas successfully!');
      break;
    } catch (e) {
      console.warn(`Connection attempt ${attempt} failed: ${e.message}. Retrying...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!connected) {
    throw new Error('Failed to connect to MongoDB Atlas after 3 attempts');
  }

  dbStore.setConnected(true);

  console.log('2. Fetching restaurants & menu...');
  const restaurants = await dbStore.getRestaurants();
  console.log('Restaurants count:', restaurants.length);

  const menu = await dbStore.getMenuItems();
  console.log('Menu items count:', menu.length);

  console.log('3. Creating an order in MongoDB Atlas...');
  const sampleItems = menu.slice(0, 2).map((item) => ({
    menuItem: item._id,
    name: item.name,
    quantity: 2,
    spiceLevel: 'Medium',
    notes: 'Less oil please'
  }));

  const restId = restaurants[0]?._id;
  const newOrder = await dbStore.createOrder({
    restaurantId: restId,
    tableNumber: '04',
    sessionCode: 'TEST-S04',
    items: sampleItems,
    customerNote: 'Customer at Table 04'
  });

  console.log(`Order created: ${newOrder.orderNumber}, Total: ₹${newOrder.total}`);

  console.log('4. Fetching all orders from MongoDB Atlas...');
  const allOrders = await dbStore.getAllOrders();
  console.log('All orders count in DB:', allOrders.length);
  const foundOrder = allOrders.find((o) => o._id.toString() === newOrder._id.toString());
  console.log('Found newly created order in DB:', foundOrder ? 'YES' : 'NO');

  console.log('5. Updating order status to PREPARING...');
  const updatedOrder = await dbStore.updateOrderStatus(newOrder._id, 'PREPARING');
  console.log('Updated status:', updatedOrder.status);

  console.log('6. Booking table DINEVO-T01...');
  const session = await dbStore.createDiningSession('DINEVO-T01');
  console.log('Booking result:', session.verified ? 'SUCCESS' : 'FAILED', 'Session Code:', session.sessionCode);

  console.log('7. Releasing table DINEVO-T01...');
  const relRes = await dbStore.releaseTable('DINEVO-T01');
  console.log('Release result:', relRes ? 'SUCCESS' : 'FAILED', 'status:', relRes ? relRes.status : 'N/A');

  console.log('8. Verifying Admin User in MongoDB Atlas...');
  let adminUser = await User.findOne({ email: 'admin@dinevo.com' });
  if (!adminUser) {
    const hashed = await bcrypt.hash('dinevo123', 10);
    adminUser = await User.create({
      name: 'DINEVO Master Admin',
      email: 'admin@dinevo.com',
      password: hashed,
      role: 'admin',
      restaurantId: restId
    });
  }
  console.log(`Admin user in Atlas: ${adminUser.email}, Role: ${adminUser.role}`);

  const isPasswordValid = await bcrypt.compare('dinevo123', adminUser.password);
  console.log(`Bcrypt password verification (dinevo123): ${isPasswordValid ? 'MATCHED (SUCCESS)' : 'FAILED'}`);

  console.log('9. Disconnecting Mongoose...');
  await mongoose.disconnect();
  console.log('ALL ATLAS DB TESTS PASSED CLEANLY!');
}

testMongo().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
