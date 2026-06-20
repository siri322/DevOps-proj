const express = require("express");
const helmet = require("helmet");
const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const bookingsCreated = new client.Counter({
  name: "bookings_created_total",
  help: "Total bookings created",
  labelNames: ["status"]
});
register.registerMetric(bookingsCreated);

const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["service", "method", "route", "status"]
});
register.registerMetric(httpRequests);

const bookings = new Map();

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json());
  app.use((req, res, next) => {
    res.on("finish", () => {
      httpRequests.inc({
        service: "booking-service",
        method: req.method,
        route: req.route?.path || req.path,
        status: String(res.statusCode)
      });
    });
    next();
  });

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ service: "booking-service", status: "ok" });
  });

  app.get("/readyz", (_req, res) => {
    res.status(200).json({ service: "booking-service", ready: true });
  });

  app.post("/bookings", (req, res) => {
    const { consumerId, pickup, dropoff } = req.body;
    if (!consumerId || !pickup || !dropoff) {
      bookingsCreated.inc({ status: "rejected" });
      return res.status(400).json({ error: "consumerId, pickup, and dropoff are required" });
    }

    const booking = {
      bookingId: `bk_${Date.now()}`,
      consumerId,
      pickup,
      dropoff,
      status: "REQUESTED"
    };
    bookings.set(booking.bookingId, booking);
    bookingsCreated.inc({ status: "requested" });
    return res.status(201).json(booking);
  });

  app.get("/bookings/:bookingId", (req, res) => {
    const booking = bookings.get(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ error: "booking not found" });
    }
    return res.status(200).json(booking);
  });

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  return app;
}

module.exports = { createApp };
