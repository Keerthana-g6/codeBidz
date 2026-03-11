const { z } = require('zod');

const placeBidSchema = z.object({
  auctionId: z.string().min(1, 'Auction ID required'),
  amount: z.number().int().positive('Bid amount must be a positive number'),
});

module.exports = { placeBidSchema };