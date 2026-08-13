const mongoose = require('mongoose');
const dbStore = require('./dbStore');
const { seedData } = require('../seed/seedHelper');

const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!targetUri) {
    console.error('[DINEVO] CRITICAL WARNING: Neither MONGO_URI nor MONGODB_URI is defined in environment variables!');
    dbStore.setConnected(false);
    return false;
  }


  try {
    console.log('DINEVO SERVER CONNECTING TO MONGODB...');
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
    return true;
  } catch (err) {
    console.error('MongoDB Atlas connection failed:');
    console.error(err.message);
    dbStore.setConnected(false);
    return false;
  }
};


module.exports = connectDB;

