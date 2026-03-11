const User = require('../models/User');

class UserRepository {
  async findById(id) { return User.findById(id); }
  async findByEmail(email) { return User.findOne({ email }); }
  async create(data) { return User.create(data); }
  async updateById(id, data) { return User.findByIdAndUpdate(id, data, { new: true }); }
  async findAllBidders() { return User.find({ role: 'bidder' }).sort({ createdAt: -1 }); }
  async incrementCredits(id, amount) {
    return User.findByIdAndUpdate(id, { $inc: { credits: amount } }, { new: true });
  }
  async freezeCredits(id, amount) {
    return User.findByIdAndUpdate(id, { $inc: { credits: -amount, frozenCredits: amount } }, { new: true });
  }
  async releaseCredits(id, amount) {
    return User.findByIdAndUpdate(id, { $inc: { credits: amount, frozenCredits: -amount } }, { new: true });
  }
}

module.exports = new UserRepository();