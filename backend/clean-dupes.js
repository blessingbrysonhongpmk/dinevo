require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

async function cleanDuplicates() {
  console.log('1. Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  
  const allItems = await MenuItem.find({});
  console.log('Total items in MongoDB Atlas before cleanup:', allItems.length);

  const seen = new Set();
  const idsToDelete = [];

  for (const item of allItems) {
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) {
      idsToDelete.push(item._id);
    } else {
      seen.add(key);
    }
  }

  console.log('Duplicate food records identified:', idsToDelete.length);

  if (idsToDelete.length > 0) {
    const res = await MenuItem.deleteMany({ _id: { $in: idsToDelete } });
    console.log('Deleted duplicate records count:', res.deletedCount);
  }

  const remaining = await MenuItem.find({});
  console.log('Clean unique food items remaining in MongoDB Atlas:', remaining.length);
  await mongoose.disconnect();
}

cleanDuplicates().catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
