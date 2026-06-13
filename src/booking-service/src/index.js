const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;
const serviceName = process.env.SERVICE_NAME || 'booking-service';

// Enable prometheus default metrics collection
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10]
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);

// State variables for simulations
let simulateErrors = false;
const leakedMemory = [];

app.use(express.json());

// Middleware to track request duration and counts
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    
    if (req.route) {
      const route = req.route.path;
      const status = res.statusCode;
      httpRequestsTotal.labels(req.method, route, status).inc();
      httpRequestDuration.labels(req.method, route, status).observe(duration);
    }
  });
  next();
});

// Middleware to simulate failure if error flag is toggled
app.use((req, res, next) => {
  if (simulateErrors && !req.path.startsWith('/simulate') && !req.path.startsWith('/healthz') && !req.path.startsWith('/ready') && !req.path.startsWith('/metrics')) {
    return res.status(500).json({ error: 'Internal Server Error (Simulated)' });
  }
  next();
});

// Basic Info
app.get('/', (req, res) => {
  res.json({ service: serviceName, status: 'Running', timestamp: new Date() });
});

// Business Logic
app.get('/bookings', (req, res) => {
  res.json([
    { id: 'b1', consumerId: 'c1', driverId: 'd1', status: 'completed', price: 25.5 },
    { id: 'b2', consumerId: 'c2', driverId: 'd2', status: 'active', price: 15.0 }
  ]);
});

app.get('/bookings/:id', (req, res) => {
  res.json({ id: req.params.id, consumerId: 'c1', driverId: 'd1', status: 'completed', price: 25.5 });
});

// Health Checks
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/ready', (req, res) => {
  res.status(200).send('OK');
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// SRE Incident Simulations
// 1. Simulate Latency (delay response by query param ms or 3000ms default)
app.get('/simulate/latency', (req, res) => {
  const delay = parseInt(req.query.ms) || 3000;
  setTimeout(() => {
    res.json({ simulated: true, type: 'latency', durationMs: delay });
  }, delay);
});

// 2. Toggle error simulation (makes other business routes return 500)
app.post('/simulate/error', (req, res) => {
  const enable = req.body.enable !== false; // defaults to true
  simulateErrors = enable;
  res.json({ simulated: true, type: 'error_toggle', active: simulateErrors });
});

// 3. Simulate Memory Leak (allocates buffer array and holds reference)
app.post('/simulate/leak', (req, res) => {
  const mb = parseInt(req.body.mb) || 50;
  const buffer = Buffer.alloc(mb * 1024 * 1024, 'x');
  leakedMemory.push(buffer);
  
  const usage = process.memoryUsage();
  res.json({ 
    simulated: true, 
    type: 'memory_leak', 
    addedMb: mb, 
    heapUsedMb: Math.round(usage.heapUsed / 1024 / 1024), 
    rssMb: Math.round(usage.rss / 1024 / 1024) 
  });
});

// 4. Reset Memory Leak (cleans up allocated buffers to recover)
app.post('/simulate/reset-leak', (req, res) => {
  leakedMemory.length = 0;
  if (global.gc) {
    global.gc();
  }
  const usage = process.memoryUsage();
  res.json({ 
    simulated: true, 
    type: 'memory_reset', 
    heapUsedMb: Math.round(usage.heapUsed / 1024 / 1024), 
    rssMb: Math.round(usage.rss / 1024 / 1024) 
  });
});

const server = app.listen(port, () => {
  console.log(`${serviceName} listening on port ${port}`);
});

module.exports = { app, server };
