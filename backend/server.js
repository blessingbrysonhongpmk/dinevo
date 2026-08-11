require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const dbStore = require('./config/dbStore');

const restaurantRoutes = require('./routes/restaurantRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const menuRoutes = require('./routes/menuRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const tableRoutes = require('./routes/tableRoutes');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {

  const mongooseConnected = mongoose.connection.readyState === 1;
  const isDbActive = mongooseConnected || dbStore.isDbConnected();
  res.json({
    status: 'ok',
    database: isDbActive ? 'connected' : 'disconnected',
    databaseName: 'dinevo',
    connectionState: mongooseConnected ? 'Mongoose MongoDB Active' : 'Active Store',
    version: '2.0.0'
  });
});


app.use('/api/restaurants', restaurantRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tables', tableRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[dinevo] Server running on port ${PORT}`));
