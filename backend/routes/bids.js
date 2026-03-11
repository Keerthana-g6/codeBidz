const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const zodValidate = require('../middleware/zodValidate');
const { placeBidSchema } = require('../validators/bidValidator');
const { protect, bidderOnly } = require('../middleware/auth');

router.post('/', protect, bidderOnly, zodValidate(placeBidSchema), bidController.placeBid);
router.get('/my', protect, bidController.getMyBids);
router.get('/smart-suggest/:auctionId', protect, bidderOnly, bidController.getSmartSuggestion);

module.exports = router;