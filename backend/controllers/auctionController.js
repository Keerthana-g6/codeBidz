const auctionRepository = require('../repositories/auctionRepository');
const auctionService = require('../services/auctionService');
const logger = require('../utils/logger');

exports.getAll = async (req, res, next) => {
  try {
    await auctionRepository.updateStatuses();
    const { status, page, limit } = req.query;
    const query = status ? { status } : {};
    const result = await auctionRepository.findAll(query, { page, limit });
    res.json(result);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const auction = await auctionRepository.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, image, startTime, endTime, minimumBid, category, reservePrice, tags, bidIncrement } = req.body;
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    const auction = await auctionRepository.create({
      title, description, image, startTime, endTime,
      minimumBid, category, reservePrice: reservePrice || 0,
      tags: tags || [], bidIncrement: bidIncrement || 1,
      createdBy: req.user._id, currentBid: 0,
    });
    const io = req.app.get('io');
    io.emit('auction:new', auction);
    logger.info({ auctionId: auction._id }, 'Auction created');
    res.status(201).json(auction);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const auction = await auctionRepository.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status === 'active' && auction.totalBids > 0) {
      return res.status(400).json({ message: 'Cannot edit auction with active bids' });
    }
    const updated = await auctionRepository.updateById(req.params.id, req.body);
    const io = req.app.get('io');
    io.to('auction:' + req.params.id).emit('auction:updated', updated);
    res.json(updated);
  } catch (err) { next(err); }
};

exports.cancel = async (req, res, next) => {
  try {
    await auctionService.cancelAuction(req.params.id);
    const io = req.app.get('io');
    io.to('auction:' + req.params.id).emit('auction:cancelled', { auctionId: req.params.id });
    res.json({ message: 'Auction cancelled and credits returned' });
  } catch (err) { next(err); }
};

exports.declareWinner = async (req, res, next) => {
  try {
    const result = await auctionService.declareWinner(req.params.id);
    const io = req.app.get('io');
    io.to('auction:' + req.params.id).emit('auction:winner', {
      auctionId: req.params.id,
      winner: result.winner,
      amount: result.amount,
    });
    res.json({ message: 'Winner declared', ...result });
  } catch (err) { next(err); }
};

exports.getBids = async (req, res, next) => {
  try {
    const bids = await require('../repositories/bidRepository').findByAuction(req.params.id);
    res.json(bids);
  } catch (err) { next(err); }
};