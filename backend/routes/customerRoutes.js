const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const dbStore = require('../config/dbStore');

// Lookup or create customer by phone
router.post('/lookup', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    if (dbStore.isDbConnected()) {
      try {
        let customer = await Customer.findOne({ phoneNumber: phone });
        if (!customer) {
          customer = new Customer({ phoneNumber: phone });
          await customer.save();
        }
        return res.json(customer);
      } catch (dbErr) {
        console.warn('Customer lookup falling back to in-memory:', dbErr.message);
      }
    }

    // In-memory fallback
    const memCust = dbStore.lookupMemoryCustomer ? dbStore.lookupMemoryCustomer(phone) : { phoneNumber: phone, loyaltyPoints: 0 };
    res.json(memCust);
  } catch (error) {
    console.error('Customer lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup customer' });
  }
});

// Add points to customer
router.post('/add-points', async (req, res) => {
  try {
    const { phone, pointsToAdd } = req.body;
    if (!phone || !pointsToAdd) return res.status(400).json({ error: 'Phone and pointsToAdd are required' });

    const pointsNum = parseInt(pointsToAdd, 10) || 0;

    if (dbStore.isDbConnected()) {
      try {
        const customer = await Customer.findOne({ phoneNumber: phone });
        if (customer) {
          customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsNum;
          await customer.save();
          return res.json(customer);
        }
      } catch (dbErr) {
        console.warn('Customer add points falling back to in-memory:', dbErr.message);
      }
    }

    // In-memory fallback
    const updated = dbStore.addMemoryCustomerPoints ? dbStore.addMemoryCustomerPoints(phone, pointsNum) : { phoneNumber: phone, loyaltyPoints: pointsNum };
    res.json(updated);
  } catch (error) {
    console.error('Customer add points error:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

module.exports = router;
