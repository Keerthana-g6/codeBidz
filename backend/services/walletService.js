const Transaction = require('../models/Transaction');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

class WalletService {
  async recordTransaction(userId, type, amount, description, auctionId = null) {
    try {
      const user = await userRepository.findById(userId);
      const balanceBefore = user.credits;
      const balanceAfter = balanceBefore + amount;

      await Transaction.create({
        user: userId,
        type,
        amount,
        description,
        auction: auctionId,
        balanceBefore,
        balanceAfter,
      });

      logger.info({ userId, type, amount }, 'Wallet transaction recorded');
    } catch (err) {
      logger.error({ err }, 'Failed to record wallet transaction');
    }
  }

  async assignCredits(userId, credits, action = 'set') {
    const user = await userRepository.findById(userId);
    const prevCredits = user.credits;

    let updatedUser;
    if (action === 'add') {
      updatedUser = await userRepository.incrementCredits(userId, credits);
      await this.recordTransaction(userId, 'admin_assigned', credits, 'Admin added ' + credits + ' credits');
    } else {
      updatedUser = await userRepository.updateById(userId, { credits });
      const diff = credits - prevCredits;
      await this.recordTransaction(userId, 'admin_assigned', diff, 'Admin set credits to ' + credits);
    }
    return updatedUser;
  }

  async purchaseCredits(userId, credits, packageLabel) {
    const updatedUser = await userRepository.incrementCredits(userId, credits);
    await this.recordTransaction(userId, 'credit_purchase', credits, 'Purchased ' + packageLabel + ' (' + credits + ' credits)');
    return updatedUser;
  }
}

module.exports = new WalletService();