const mongoose = require('mongoose');
const dbStore = require('./dbStore');
const { seedData } = require('../seed/seedHelper');

const connectDB = async () => {
  const targetUri = process.env.MONGO_URI;

  if (!targetUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    console.log('DINEVO SERVER STARTING...');
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true
    });

    console.log('MongoDB Atlas connected');
    console.log('Database: dinevo');
    dbStore.setConnected(true);

    try {
      await seedData();
    } catch (seedErr) {
      console.warn('[dinevo] Seed warning:', seedErr.message);
    }
  } catch (err) {
    console.error('MongoDB Atlas connection failed:');
    console.error(err.message);
    dbStore.setConnected(false);
    throw err;
  }
};

module.exports = connectDB;

