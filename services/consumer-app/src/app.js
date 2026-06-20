const express = require("express");
const helmet = require("helmet");
const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const rideRequests = new client.Counter({
  name: "consumer_ride_requests_total",
  help: "Total ride requests submitted from consumer app",
  labelNames: ["status"]
});
register.registerMetric(rideRequests);

const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["service", "method", "route", "status"]
});
register.registerMetric(httpRequests);

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json());
  app.use((req, res, next) => {
    res.on("finish", () => {
      httpRequests.inc({
        service: "consumer-app",
        method: req.method,
        route: req.route?.path || req.path,
        status: String(res.statusCode)
      });
    });
    next();
  });

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ service: "consumer-app", status: "ok" });
  });

  app.get("/readyz", (_req, res) => {
    res.status(200).json({ service: "consumer-app", ready: true });
  });

  app.post("/rides/request", (req, res) => {
    const { consumerId, pickup, dropoff } = req.body;
    if (!consumerId || !pickup || !dropoff) {
      rideRequests.inc({ status: "rejected" });
      return res.status(400).json({ error: "consumerId, pickup, and dropoff are required" });
    }

    rideRequests.inc({ status: "accepted" });
    return res.status(202).json({
      requestId: `req_${Date.now()}`,
      consumerId,
      pickup,
      dropoff,
      status: "PENDING_BOOKING"
    });
  });

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  return app;
}

module.exports = { createApp };
