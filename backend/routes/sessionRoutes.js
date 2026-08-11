const express = require('express');
const router = express.Router();
const dbStore = require('../config/dbStore');

// POST /api/sessions - create/start a verified dining session for a table
router.post('/', async (req, res) => {
  try {
    const { tableCode } = req.body;
    if (!tableCode) {
      return res.status(400).json({ message: 'Table code is required' });
    }
    const session = await dbStore.createDiningSession(tableCode);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/sessions/:code - validate active dining session
router.get('/:code', async (req, res) => {
  try {
    const session = await dbStore.getSessionByCode(req.params.code);
    if (!session) {
      return res.status(404).json({ message: 'Dining session not found or expired' });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
