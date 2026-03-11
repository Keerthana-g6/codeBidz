const Auction = require('../models/Auction');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join auction room for live updates
    socket.on('join:auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`Socket ${socket.id} joined auction:${auctionId}`);
    });

    socket.on('leave:auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });

    // Join personal notification room
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user:${userId}`);
    });

    // Admin monitoring all auctions
    socket.on('join:admin', () => {
      socket.join('admin:monitor');
      console.log(`Admin socket ${socket.id} joined monitor`);
    });

    // Ping/pong for connection health
    socket.on('ping', () => socket.emit('pong'));

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // Auto-update auction statuses every 30 seconds
  setInterval(async () => {
    try {
      const now = new Date();
      const activated = await Auction.updateMany(
        { status: 'upcoming', startTime: { $lte: now } },
        { status: 'active' }
      );
      const ended = await Auction.updateMany(
        { status: 'active', endTime: { $lte: now } },
        { status: 'ended' }
      );

      if (activated.modifiedCount > 0 || ended.modifiedCount > 0) {
        io.emit('auctions:statusUpdate', { timestamp: now });
      }
    } catch (err) {
      console.error('Auto status update error:', err);
    }
  }, 30000);
};
