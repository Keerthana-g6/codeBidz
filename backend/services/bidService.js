const auctionRepository = require('../repositories/auctionRepository');
const bidRepository = require('../repositories/bidRepository');
const userRepository = require('../repositories/userRepository');
const walletService = require('./walletService');
const logger = require('../utils/logger');

class BidService {
  async placeBid(auctionId, userId, amount) {
    // Validate auction
    const auction = await auctionRepository.findById(auctionId);
    if (!auction) throw Object.assign(new Error('Auction not found'), { status: 404 });
    if (auction.status !== 'active') throw Object.assign(new Error('Auction is not active'), { status: 400 });
    if (new Date() > auction.endTime) throw Object.assign(new Error('Auction has ended'), { status: 400 });

    // Validate bid amount
    const minRequired = auction.currentBid > 0
      ? auction.currentBid + (auction.bidIncrement || 1)
      : auction.minimumBid;
    if (amount < minRequired) {
      throw Object.assign(new Error('Bid must be at least ' + minRequired + ' credits'), { status: 400 });
    }

    // Validate credits
    const bidder = await userRepository.findById(userId);
    if (bidder.credits < amount) {
      throw Object.assign(new Error('Insufficient credits. Available: ' + bidder.credits), { status: 400 });
    }

    // Prevent self-bidding
    if (auction.currentBidder && auction.currentBidder._id.toString() === userId.toString()) {
      throw Object.assign(new Error('You are already the highest bidder'), { status: 400 });
    }

    const prevBidderId = auction.currentBidder?._id || auction.currentBidder;

    // Return credits to previous bidder
    if (prevBidderId) {
      const prevBid = await bidRepository.findWinningBid(auctionId, prevBidderId);
      if (prevBid) {
        await userRepository.releaseCredits(prevBidderId, prevBid.amount);
        await bidRepository.markOutbid(auctionId, prevBidderId);
        await walletService.recordTransaction(
          prevBidderId, 'bid_returned', prevBid.amount,
          'Outbid on auction - credits returned', auctionId
        );
      }
    }

    // Freeze new bidder credits
    await userRepository.freezeCredits(userId, amount);
    await walletService.recordTransaction(userId, 'bid_placed', -amount, 'Bid placed on auction', auctionId);

    // Atomic auction update
    const updatedAuction = await auctionRepository.atomicBidUpdate(auctionId, amount, userId);
    if (!updatedAuction) {
      await userRepository.releaseCredits(userId, amount);
      throw Object.assign(new Error('Someone placed a higher bid simultaneously. Please try again.'), { status: 400 });
    }

    // Anti-sniping: extend auction if bid in last 30 seconds
    const timeLeft = new Date(updatedAuction.endTime) - new Date();
    if (timeLeft < 30000) {
      await auctionRepository.updateById(auctionId, {
        endTime: new Date(Date.now() + 60000)
      });
      logger.info({ auctionId }, 'Anti-sniping triggered - auction extended by 60 seconds');
    }

    // Create bid record
    const bid = await bidRepository.create({
      auction: auctionId,
      bidder: userId,
      amount,
      status: 'active',
      isWinning: true,
    });

    const populatedBid = await bid.populate('bidder', 'name email');
    const finalAuction = await auctionRepository.findById(auctionId);
    const updatedBidder = await userRepository.findById(userId);

    return { bid: populatedBid, auction: finalAuction, updatedCredits: updatedBidder.credits, prevBidderId };
  }
}

module.exports = new BidService();