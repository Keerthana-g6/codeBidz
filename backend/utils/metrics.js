const client = require('prom-client');

// Enable default metrics (CPU, memory, event loop etc.)
client.collectDefaultMetrics({ prefix: 'codebidz_' });

// Custom metrics
const activeAuctions = new client.Gauge({
  name: 'codebidz_active_auctions',
  help: 'Number of currently active auctions',
});

const bidsTotal = new client.Counter({
  name: 'codebidz_bids_total',
  help: 'Total number of bids placed',
});

const apiLatency = new client.Histogram({
  name: 'codebidz_api_latency_seconds',
  help: 'API request latency in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const errorCount = new client.Counter({
  name: 'codebidz_errors_total',
  help: 'Total number of errors',
  labelNames: ['type'],
});

const activeConnections = new client.Gauge({
  name: 'codebidz_socket_connections',
  help: 'Number of active socket connections',
});

module.exports = {
  client,
  activeAuctions,
  bidsTotal,
  apiLatency,
  errorCount,
  activeConnections,
};