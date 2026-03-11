const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/admin/bidders - list all bidders
router.get('/bidders', protect, adminOnly, async (req, res) => {
  try {
    const bidders = await User.find({ role: 'bidder' }).sort({ createdAt: -1 });
    res.json(bidders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/assign-credits - assign credits to a bidder
router.post('/assign-credits', protect, adminOnly, async (req, res) => {
  try {
    const { userId, credits, action } = req.body; // action: 'set' | 'add'
    if (!userId || credits === undefined) return res.status(400).json({ message: 'userId and credits required' });
    if (credits < 0) return res.status(400).json({ message: 'Credits cannot be negative' });

    const updateQuery = action === 'add'
      ? { $inc: { credits } }
      : { credits };

    const user = await User.findByIdAndUpdate(userId, updateQuery, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('credits:updated', { credits: user.credits });

    res.json({ message: 'Credits updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/bulk-assign-credits
router.post('/bulk-assign-credits', protect, adminOnly, async (req, res) => {
  try {
    const { credits } = req.body;
    await User.updateMany({ role: 'bidder' }, { credits });
    res.json({ message: `All bidders assigned ${credits} credits` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats - dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalBidders, totalAuctions, activeBidders, activeAuctions, totalBids] = await Promise.all([
      User.countDocuments({ role: 'bidder' }),
      Auction.countDocuments(),
      User.countDocuments({ role: 'bidder', isActive: true }),
      Auction.countDocuments({ status: 'active' }),
      Bid.countDocuments(),
    ]);

    const recentBids = await Bid.find()
      .populate('bidder', 'name')
      .populate('auction', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const auctionsByStatus = await Auction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topBidders = await Bid.aggregate([
      { $group: { _id: '$bidder', totalBids: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { totalBids: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.name': 1, 'user.email': 1, totalBids: 1, totalAmount: 1 } }
    ]);

    res.json({
      totalBidders, totalAuctions, activeBidders, activeAuctions, totalBids,
      recentBids, auctionsByStatus, topBidders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/reports - bid reports
router.get('/reports', protect, adminOnly, async (req, res) => {
  try {
    const { auctionId } = req.query;
    const query = auctionId ? { auction: auctionId } : {};

    const bids = await Bid.find(query)
      .populate('bidder', 'name email')
      .populate('auction', 'title status')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/bidders/:id/toggle - activate/deactivate bidder
router.put('/bidders/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
