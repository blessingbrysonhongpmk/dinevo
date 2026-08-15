const mongoose = require('mongoose');
const uri = 'mongodb+srv://blessing28022006_db_user:admin123@cluster0.lmsmrdh.mongodb.net/dinevo?retryWrites=true&w=majority';

async function testConnection() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connection successful!');
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

testConnection();
