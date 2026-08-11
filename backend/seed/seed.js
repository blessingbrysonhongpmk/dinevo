require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { seedData } = require('./seedHelper');

const run = async () => {
  await connectDB();
  await seedData(true);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[dinevo] Seed error:', err);
  process.exit(1);
});
