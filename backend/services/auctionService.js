const auctionRepository = require('../repositories/auctionRepository');
const bidRepository = require('../repositories/bidRepository');
const userRepository = require('../repositories/userRepository');
const walletService = require('./walletService');
const logger = require('../utils/logger');

class AuctionService {
  async declareWinner(auctionId) {
    const auction = await auctionRepository.findById(auctionId);
    if (!auction) throw Object.assign(new Error('Auction not found'), { status: 404 });
    if (auction.winnerDeclared) throw Object.assign(new Error('Winner already declared'), { status: 400 });
    if (!auction.currentBidder) throw Object.assign(new Error('No bids placed'), { status: 400 });

    const winnerId = auction.currentBidder._id || auction.currentBidder;

    // Deduct frozen credits from winner
    await userRepository.updateById(winnerId, {
      $inc: { frozenCredits: -auction.currentBid }
    });
    await walletService.recordTransaction(
      winnerId, 'auction_won', -auction.currentBid,
      'Won auction: ' + auction.title, auctionId
    );

    // Return credits for all other active bids
    const Bid = require('../models/Bid');
    const outbidBids = await Bid.find({
      auction: auctionId,
      bidder: { $ne: winnerId },
      status: 'active'
    });

    for (const bid of outbidBids) {
      await userRepository.releaseCredits(bid.bidder, bid.amount);
      await walletService.recordTransaction(
        bid.bidder, 'bid_returned', bid.amount,
        'Credits returned - auction ended', auctionId
      );
      bid.status = 'returned';
      await bid.save();
    }

    // Mark winning bid
    await Bid.findOneAndUpdate(
      { auction: auctionId, bidder: winnerId, isWinning: true },
      { status: 'won' }
    );

    // Update auction
    await auctionRepository.updateById(auctionId, {
      winner: winnerId,
      winnerDeclared: true,
      status: 'ended'
    });

    logger.info({ auctionId, winnerId, amount: auction.currentBid }, 'Winner declared');
    return { winner: auction.currentBidder, amount: auction.currentBid };
  }

  async cancelAuction(auctionId) {
    const auction = await auctionRepository.findById(auctionId);
    if (!auction) throw Object.assign(new Error('Auction not found'), { status: 404 });

    const Bid = require('../models/Bid');
    const activeBids = await Bid.find({ auction: auctionId, status: 'active' });

    for (const bid of activeBids) {
      await userRepository.releaseCredits(bid.bidder, bid.amount);
      await walletService.recordTransaction(
        bid.bidder, 'refund', bid.amount,
        'Auction cancelled - credits refunded', auctionId
      );
      bid.status = 'returned';
      await bid.save();
    }

    await auctionRepository.updateById(auctionId, { status: 'cancelled' });
    logger.info({ auctionId }, 'Auction cancelled');
  }
}

module.exports = new AuctionService();