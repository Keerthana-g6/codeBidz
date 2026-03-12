const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
  type: String,
  enum: ['credit', 'debit', 'freeze', 'release', 'refund', 'credit_purchase', 'bid_placed', 'bid_returned', 'auction_won', 'admin_assigned'],
  required: true,
},
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', default: null },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);