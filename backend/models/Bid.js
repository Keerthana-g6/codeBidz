const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['active', 'outbid', 'won', 'returned'],
    default: 'active'
  },
  isWinning: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);
