const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { connectRedis } = require('./config/redis');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const metrics = require('./utils/metrics');
require('dotenv').config();
if (process.argv[1] && process.argv[1].includes('jest')) {
  process.env.NODE_ENV = 'test';
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(express.json());
app.use(mongoSanitize());
// Track API latency
app.use((req, res, next) => {
  const end = metrics.apiLatency.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later' }
});

const bidLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { message: 'Too many bids placed, slow down!' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/bids', bidLimiter);

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auctions', require('./routes/auctions'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/transactions', require('./routes/transactions'));


// Socket.io
require('./socket/socketHandlers')(io);

// Background jobs
require('./jobs/auctionJobs')(io);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));
// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.client.register.contentType);
    res.end(await metrics.client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// API Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Centralized error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  await connectRedis();

  server.listen(process.env.PORT || 5000, () => {
    logger.info('Server running on port ' + (process.env.PORT || 5000));
    logger.info('API Docs: http://localhost:' + (process.env.PORT || 5000) + '/api/docs');
  });
};

startServer().catch(err => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});

module.exports = { app, io };