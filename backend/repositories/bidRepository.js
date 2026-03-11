const Bid = require('../models/Bid');

class BidRepository {
  async create(data) { return Bid.create(data); }
  async findByAuction(auctionId) {
    return Bid.find({ auction: auctionId })
      .populate('bidder', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
  }
  async findByBidder(bidderId) {
    return Bid.find({ bidder: bidderId })
      .populate('auction', 'title image status endTime currentBid')
      .sort({ createdAt: -1 });
  }
  async findWinningBid(auctionId, bidderId) {
    return Bid.findOne({ auction: auctionId, bidder: bidderId, isWinning: true, status: 'active' });
  }
  async markOutbid(auctionId, bidderId) {
    return Bid.findOneAndUpdate(
      { auction: auctionId, bidder: bidderId, isWinning: true },
      { status: 'outbid', isWinning: false }
    );
  }
}

module.exports = new BidRepository();