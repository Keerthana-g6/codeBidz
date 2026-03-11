const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const zodValidate = require('../middleware/zodValidate');
const { createAuctionSchema } = require('../validators/auctionValidator');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, auctionController.getAll);
router.get('/:id', protect, auctionController.getOne);
router.post('/', protect, adminOnly, zodValidate(createAuctionSchema), auctionController.create);
router.put('/:id', protect, adminOnly, auctionController.update);
router.delete('/:id', protect, adminOnly, auctionController.cancel);
router.get('/:id/bids', protect, auctionController.getBids);
router.post('/:id/declare-winner', protect, adminOnly, auctionController.declareWinner);

module.exports = router;