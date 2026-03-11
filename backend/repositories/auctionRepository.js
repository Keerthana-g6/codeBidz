const Auction = require('../models/Auction');

class AuctionRepository {
  async findById(id) {
    return Auction.findById(id)
      .populate('currentBidder', 'name email')
      .populate('winner', 'name email')
      .populate('createdBy', 'name');
  }

  async findAll(query = {}, options = {}) {
    const { page = 1, limit = 12, sort = { createdAt: -1 } } = options;
    const auctions = await Auction.find(query)
      .populate('currentBidder', 'name email')
      .populate('winner', 'name email')
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Auction.countDocuments(query);
    return { auctions, total, pages: Math.ceil(total / limit) };
  }

  async create(data) {
    return Auction.create(data);
  }

  async updateById(id, data) {
    return Auction.findByIdAndUpdate(id, data, { new: true });
  }

  async atomicBidUpdate(auctionId, amount, userId) {
    return Auction.findOneAndUpdate(
      {
        _id: auctionId,
        status: 'active',
        $or: [{ currentBid: { $lt: amount } }, { currentBid: 0 }]
      },
      {
        $set: { currentBid: amount, currentBidder: userId },
        $inc: { totalBids: 1 }
      },
      { new: true }
    );
  }

  async updateStatuses() {
    const now = new Date();
    await Auction.updateMany({ status: 'upcoming', startTime: { $lte: now } }, { status: 'active' });
    const ended = await Auction.find({ status: 'active', endTime: { $lte: now } });
    await Auction.updateMany({ status: 'active', endTime: { $lte: now } }, { status: 'ended' });
    return ended;
  }
}

module.exports = new AuctionRepository();