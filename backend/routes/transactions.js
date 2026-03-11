const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// GET /api/transactions/my - get current user's transaction history
router.get('/my', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('auction', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;