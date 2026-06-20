const express = require("express");
const helmet = require("helmet");
const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const availabilityUpdates = new client.Counter({
  name: "driver_availability_updates_total",
  help: "Total driver availability updates",
  labelNames: ["status"]
});
register.registerMetric(availabilityUpdates);

const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["service", "method", "route", "status"]
});
register.registerMetric(httpRequests);

const drivers = new Map();

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json());
  app.use((req, res, next) => {
    res.on("finish", () => {
      httpRequests.inc({
        service: "driver-app",
        method: req.method,
        route: req.route?.path || req.path,
        status: String(res.statusCode)
      });
    });
    next();
  });

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ service: "driver-app", status: "ok" });
  });

  app.get("/readyz", (_req, res) => {
    res.status(200).json({ service: "driver-app", ready: true });
  });

  app.put("/drivers/:driverId/availability", (req, res) => {
    const { available } = req.body;
    if (typeof available !== "boolean") {
      availabilityUpdates.inc({ status: "rejected" });
      return res.status(400).json({ error: "available boolean is required" });
    }

    const driver = { driverId: req.params.driverId, available };
    drivers.set(req.params.driverId, driver);
    availabilityUpdates.inc({ status: "updated" });
    return res.status(200).json(driver);
  });

  app.get("/drivers/:driverId", (req, res) => {
    const driver = drivers.get(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ error: "driver not found" });
    }
    return res.status(200).json(driver);
  });

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  return app;
}

module.exports = { createApp };
