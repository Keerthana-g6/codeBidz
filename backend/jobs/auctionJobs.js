const cron = require('node-cron');
const { Queue, Worker } = require('bullmq');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const logger = require('../utils/logger');
const { activeAuctions } = require('../utils/metrics');

let auctionQueue = null;

const initQueues = (redisClient) => {
  if (!redisClient) return null;

  try {
    const connection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    };

    auctionQueue = new Queue('auction-end', { connection });

    // Worker to process auction end jobs
    const worker = new Worker('auction-end', async (job) => {
      const { auctionId } = job.data;
      logger.info({ auctionId }, 'Processing auction end job');

      const auction = await Auction.findById(auctionId);
      if (!auction || auction.status !== 'active') return;

      auction.status = 'ended';
      await auction.save();

      logger.info({ auctionId, winner: auction.currentBidder }, 'Auction ended via job queue');
    }, { connection });

    worker.on('completed', job => logger.info({ jobId: job.id }, 'Auction end job completed'));
    worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Auction end job failed'));

    logger.info('BullMQ auction queue initialized');
    return auctionQueue;
  } catch (err) {
    logger.warn('BullMQ not available - using cron fallback');
    return null;
  }
};

const scheduleAuctionEnd = async (auctionId, endTime) => {
  if (!auctionQueue) return;
  const delay = new Date(endTime) - new Date();
  if (delay <= 0) return;
  await auctionQueue.add('end-auction', { auctionId }, { delay });
  logger.info({ auctionId, delay }, 'Auction end job scheduled');
};

const startCronJobs = (io) => {
  // Fallback cron - runs every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const now = new Date();

      const activated = await Auction.updateMany(
        { status: 'upcoming', startTime: { $lte: now } },
        { $set: { status: 'active' } }
      );

      const endedAuctions = await Auction.find({
        status: 'active',
        endTime: { $lte: now }
      });

      for (const auction of endedAuctions) {
        auction.status = 'ended';
        await auction.save();

        io.to('auction:' + auction._id).emit('auction:ended', {
          auctionId: auction._id,
          winner: auction.currentBidder,
          amount: auction.currentBid,
        });

        io.to('admin:monitor').emit('auction:ended', {
          auctionId: auction._id,
          title: auction.title,
          winner: auction.currentBidder,
          amount: auction.currentBid,
        });

        logger.info({ auctionId: auction._id }, 'Auction ended via cron');
      }

      if (activated.modifiedCount > 0) {
        io.emit('auctions:statusUpdate');
        logger.info({ count: activated.modifiedCount }, 'Auctions activated');
      }
      const Auction = require('../models/Auction');
const count = await Auction.countDocuments({ status: 'active' });
activeAuctions.set(count);
    } catch (err) {
      logger.error({ err }, 'Cron job error');
    }
  });

  logger.info('Cron jobs started');
};

module.exports = (io, redisClient) => {
  initQueues(redisClient);
  startCronJobs(io);
  logger.info('Auction jobs initialized');
};

module.exports.scheduleAuctionEnd = scheduleAuctionEnd;