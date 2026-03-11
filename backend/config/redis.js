const logger = require('../utils/logger');

let isRedisAvailable = false;

const connectRedis = async () => {
  logger.warn('Redis not configured - running without Redis');
  isRedisAvailable = false;
};

const getRedisClient = () => null;
const isRedisReady = () => false;

module.exports = { connectRedis, getRedisClient, isRedisReady };