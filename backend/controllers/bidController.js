const bidService = require('../services/bidService');
const bidRepository = require('../repositories/bidRepository');
const auctionRepository = require('../repositories/auctionRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

exports.placeBid = async (req, res, next) => {
  try {
    const { auctionId, amount } = req.body;
    const result = await bidService.placeBid(auctionId, req.user._id, amount);

    const io = req.app.get('io');
    io.to('auction:' + auctionId).emit('bid:new', {
      bid: result.bid,
      auction: result.auction,
    });
    if (result.prevBidderId) {
      io.to('user:' + result.prevBidderId).emit('bid:outbid', {
        auctionId,
        auctionTitle: result.auction.title,
        newAmount: amount,
      });
    }

    logger.info({ auctionId, userId: req.user._id, amount }, 'Bid placed');
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.getMyBids = async (req, res, next) => {
  try {
    const bids = await bidRepository.findByBidder(req.user._id);
    res.json(bids);
  } catch (err) { next(err); }
};

exports.getSmartSuggestion = async (req, res, next) => {
  try {
    const auction = await auctionRepository.findById(req.params.auctionId);
    const user = await userRepository.findById(req.user._id);
    const recentBids = await require('../models/Bid').find({ auction: req.params.auctionId })
      .sort({ createdAt: -1 }).limit(10);

    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const currentBid = auction.currentBid || auction.minimumBid;
    const minNext = currentBid + 1;
    const available = user.credits;

    if (available < minNext) {
      return res.json({ suggested: null, reason: 'Insufficient credits', canBid: false });
    }

    let increment = Math.max(1, Math.ceil(currentBid * 0.05));
    if (recentBids.length >= 5) {
      const avgIncrement = (recentBids[0].amount - recentBids[4].amount) / 4;
      increment = Math.max(increment, Math.ceil(avgIncrement));
    }

    res.json({
      canBid: true,
      strategies: {
        conservative: { amount: minNext, label: 'Conservative', description: 'Minimum valid bid' },
        balanced: { amount: Math.min(currentBid + increment, available), label: 'Balanced', description: 'Smart increment bid' },
        aggressive: { amount: Math.min(currentBid + increment * 3, available), label: 'Aggressive', description: 'High-confidence bid' },
      },
      availableCredits: available,
      currentBid,
      minNext,
    });
  } catch (err) { next(err); }
};