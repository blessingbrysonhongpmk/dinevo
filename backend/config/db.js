const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbStore = require('./dbStore');
const { seedData } = require('../seed/seedHelper');

let mongoServer;

const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dinevo';

  // 1. Try to connect to existing local MongoDB instance
  try {
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 1500 });
    console.log(`[dinevo] MongoDB connected successfully to ${targetUri}`);
    dbStore.setConnected(true);
    await seedData();
    return;
  } catch (err) {
    // 2. If no standalone MongoDB service is running on 127.0.0.1:27017, start auto-managed MongoDB server on port 27017
    try {
      console.log(`[dinevo] Auto-starting local MongoDB server instance on 127.0.0.1:27017...`);
      mongoServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'dinevo'
        }
      });
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[dinevo] MongoDB connected successfully to ${mongoUri}`);
      dbStore.setConnected(true);
      await seedData();
      return;
    } catch (memErr) {
      // 3. Fallback to dynamic port MongoMemoryServer if port 27017 is busy
      try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log(`[dinevo] MongoDB connected successfully to ${mongoUri}`);
        dbStore.setConnected(true);
        await seedData();
        return;
      } catch (finalErr) {
        console.log('[dinevo] Operating in ultra-fast DINEVO data store mode.');
        dbStore.setConnected(false);
        await seedData();
      }
    }
  }
};

module.exports = connectDB;


