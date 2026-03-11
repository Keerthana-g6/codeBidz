const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  minimumBid: { type: Number, required: true, min: 1 },
  currentBid: { type: Number, default: 0 },
  currentBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'ended', 'cancelled'],
    default: 'upcoming'
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  winnerDeclared: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, default: 'General' },
  totalBids: { type: Number, default: 0 },
  reservePrice: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

// Auto-update status based on time
auctionSchema.methods.updateStatus = function () {
  const now = new Date();
  if (now < this.startTime) this.status = 'upcoming';
  else if (now >= this.startTime && now <= this.endTime) this.status = 'active';
  else if (now > this.endTime && this.status !== 'cancelled') this.status = 'ended';
};

module.exports = mongoose.model('Auction', auctionSchema);
