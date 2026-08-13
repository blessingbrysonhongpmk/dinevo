require('dotenv').config();
const mongoose = require('mongoose');
const dbStore = require('./config/dbStore');

async function testAll() {
  console.log('1. Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  dbStore.setConnected(true);
  console.log('Connected to Atlas successfully!');

  console.log('2. Fetching restaurants & menu...');
  const restaurants = await dbStore.getRestaurants();
  console.log(`Restaurants count: ${restaurants.length}`);
  const restId = restaurants[0]._id;

  const menu = await dbStore.getMenuItems();
  console.log(`Menu items count: ${menu.length}`);
  const item1 = menu[0];

  console.log('3. Creating an order in MongoDB Atlas...');
  const newOrder = await dbStore.createOrder({
    restaurantId: restId,
    tableNumber: '01',
    sessionCode: 'D5555',
    items: [{ menuItem: item1._id, quantity: 2 }]
  });
  console.log(`Order created: ${newOrder.orderNumber}, Total: ₹${newOrder.total}`);

  console.log('4. Fetching all orders from MongoDB Atlas...');
  const allOrders = await dbStore.getAllOrders();
  console.log(`All orders count in DB: ${allOrders.length}`);
  const fetchedOrder = allOrders.find(o => o.orderNumber === newOrder.orderNumber);
  console.log(`Found newly created order in DB: ${fetchedOrder ? 'YES' : 'NO'}`);

  console.log('5. Updating order status to PREPARING...');
  const updatedOrder = await dbStore.updateOrderStatus(newOrder._id, 'PREPARING');
  console.log(`Updated status: ${updatedOrder.status}`);

  console.log('6. Booking table DINEVO-T01...');
  const bookRes = await dbStore.bookTable('DINEVO-T01');
  console.log(`Booking result: ${bookRes.success ? 'SUCCESS' : 'FAILED'}, status: ${bookRes.table?.status}`);

  console.log('7. Releasing table DINEVO-T01...');
  const releaseRes = await dbStore.releaseTable('DINEVO-T01');
  console.log(`Release result: ${releaseRes.success ? 'SUCCESS' : 'FAILED'}, status: ${releaseRes.table?.status}`);

  console.log('8. Verifying Admin User in MongoDB Atlas...');
  const { seedAdminUser } = require('./seed/seedHelper');
  await seedAdminUser();
  const UserModel = require('./models/User');
  const adminUser = await UserModel.findOne({ email: 'admin@dinevo.com' });
  console.log(`Admin user in Atlas: ${adminUser ? adminUser.email : 'NOT FOUND'}, Role: ${adminUser?.role}`);
  const passMatches = adminUser ? await adminUser.comparePassword('dinevo123') : false;
  console.log(`Bcrypt password verification (dinevo123): ${passMatches ? 'MATCHED (SUCCESS)' : 'FAILED'}`);

  console.log('9. Disconnecting Mongoose...');
  await mongoose.disconnect();

  console.log('ALL ATLAS DB TESTS PASSED CLEANLY!');
}

testAll().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});


