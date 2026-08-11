const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbStore = require('./dbStore');
const { seedData } = require('../seed/seedHelper');

let mongoServer;

const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dinevo';

  // 1. Try to connect to existing local MongoDB instance (3 second timeout)
  try {
    console.log(`[dinevo] Connecting to MongoDB at ${targetUri}...`);
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[dinevo] Successfully connected to MongoDB on ${targetUri}`);
    dbStore.setConnected(true);
    await seedData();
    return;
  } catch (err) {
    console.log(`[dinevo] Standalone MongoDB on 127.0.0.1:27017 not available (${err.message})`);
  }

  // 2. Try MongoMemoryServer with 10-second strict timeout
  try {
    console.log(`[dinevo] Starting managed local MongoDB instance...`);
    const startMemoryServer = MongoMemoryServer.create({
      instance: { port: 27017, dbName: 'dinevo' }
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('MongoMemoryServer initialization timed out after 10s')), 10000)
    );

    mongoServer = await Promise.race([startMemoryServer, timeoutPromise]);
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[dinevo] Managed MongoDB running at ${mongoUri}`);
    dbStore.setConnected(true);
    await seedData();
    return;
  } catch (memErr) {
    console.log(`[dinevo] Managed MongoDB unavailable (${memErr.message})`);
  }

  // 3. Ultra-fast reliable in-memory store fallback
  console.log('[dinevo] Operating in DINEVO High-Speed Data Store mode (In-Memory).');
  dbStore.setConnected(false);
  await seedData();
};

module.exports = connectDB;
