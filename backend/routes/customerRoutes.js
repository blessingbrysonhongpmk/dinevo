const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Lookup or create customer by phone
router.post('/lookup', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    let customer = await Customer.findOne({ phoneNumber: phone });
    
    if (!customer) {
      customer = new Customer({ phoneNumber: phone });
      await customer.save();
    }
    
    res.json(customer);
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

    const customer = await Customer.findOne({ phoneNumber: phone });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    customer.loyaltyPoints += parseInt(pointsToAdd);
    await customer.save();
    
    res.json(customer);
  } catch (error) {
    console.error('Customer add points error:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

module.exports = router;
