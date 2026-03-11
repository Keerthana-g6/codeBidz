const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, bidderOnly } = require('../middleware/auth');

const PACKAGES = [
  { id: 'starter',  credits: 500,  amount: 49,  label: 'Starter Pack' },
  { id: 'popular',  credits: 1200, amount: 99,  label: 'Popular Pack' },
  { id: 'pro',      credits: 2500, amount: 199, label: 'Pro Pack' },
  { id: 'ultimate', credits: 6000, amount: 449, label: 'Ultimate Pack' },
];

router.get('/packages', protect, (req, res) => {
  res.json(PACKAGES);
});

router.post('/demo-purchase', protect, bidderOnly, async (req, res) => {
  try {
    const { packageId } = req.body;
    const pkg = PACKAGES.find(function(p) { return p.id === packageId; });
    if (!pkg) return res.status(400).json({ message: 'Invalid package' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { credits: pkg.credits } },
      { new: true }
    );

    const io = req.app.get('io');
    io.to('user:' + req.user._id).emit('credits:updated', { credits: user.credits });

    res.json({
      message: pkg.credits + ' credits added successfully!',
      credits: user.credits,
      added: pkg.credits,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;