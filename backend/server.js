require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const dbStore = require('./config/dbStore');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const menuRoutes = require('./routes/menuRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const tableRoutes = require('./routes/tableRoutes');
const customerRoutes = require('./routes/customerRoutes');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const os = require('os');

function getLocalIpAddress() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
          return iface.address;
        }
      }
    }
  } catch (e) {
    // fallback
  }
  return 'localhost';
}

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  const mongooseConnected = mongoose.connection.readyState === 1;
  const isDbActive = mongooseConnected || dbStore.isDbConnected();
  const lanIp = getLocalIpAddress();
  res.json({
    status: 'ok',
    database: isDbActive ? 'connected' : 'disconnected',
    databaseName: 'dinevo',
    connectionState: mongooseConnected ? 'Mongoose MongoDB Active' : 'Active Store',
    lanIp,
    version: '2.1.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/customers', customerRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => console.log(`[dinevo] Server running on port ${PORT} (0.0.0.0)`));
  } catch (err) {
    console.error('[dinevo] Server failed to start due to database connection error.');
    process.exit(1);
  }
};

startServer();
