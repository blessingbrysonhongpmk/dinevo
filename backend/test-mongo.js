const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Connecting...');
    await mongoose.connect('mongodb://127.0.0.1:27017/dinevo', { serverSelectionTimeoutMS: 2000 });
    console.log('Connected!');
    
    console.log('Querying...');
    const result = await mongoose.connection.db.collection('restaurants').find({}).toArray();
    console.log('Result:', result.length);
    process.exit(0);
  } catch(e) {
    console.error('Failed!', e.message);
    process.exit(1);
  }
}
test();
