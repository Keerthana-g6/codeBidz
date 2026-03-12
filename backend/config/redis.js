const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient = null;
let isRedisAvailable = false;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      logger.warn('Redis error: ' + err.message);
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      logger.info('Redis connected');
    });

    await redisClient.connect();
  } catch (err) {
    logger.warn('Redis not available - running without Redis');
    isRedisAvailable = false;
  }
};

const getRedisClient = () => redisClient;
const isRedisReady = () => isRedisAvailable;

module.exports = { connectRedis, getRedisClient, isRedisReady };