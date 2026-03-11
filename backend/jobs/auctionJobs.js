const cron = require('node-cron');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

module.exports = (io) => {
  // Run every 30 seconds - check auction statuses
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const now = new Date();

      // Activate upcoming auctions
      const activated = await Auction.updateMany(
        { status: 'upcoming', startTime: { $lte: now } },
        { $set: { status: 'active' } }
      );

      // End active auctions
      const endedAuctions = await Auction.find({
        status: 'active',
        endTime: { $lte: now }
      });

      for (const auction of endedAuctions) {
        auction.status = 'ended';
        await auction.save();

        // Notify all users in this auction room
        io.to('auction:' + auction._id).emit('auction:ended', {
          auctionId: auction._id,
          winner: auction.currentBidder,
          amount: auction.currentBid,
        });

        // Notify admin
        io.to('admin:monitor').emit('auction:ended', {
          auctionId: auction._id,
          title: auction.title,
          winner: auction.currentBidder,
          amount: auction.currentBid,
        });

        console.log('⏰ Auction ended:', auction.title);
      }

      if (activated.modifiedCount > 0) {
        io.emit('auctions:statusUpdate');
        console.log('✅ Activated', activated.modifiedCount, 'auctions');
      }

    } catch (err) {
      console.error('❌ Auction job error:', err.message);
    }
  });

  console.log('⏰ Auction background jobs started');
};