const express = require("express");
const helmet = require("helmet");
const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const paymentsCreated = new client.Counter({
  name: "payment_authorizations_total",
  help: "Total payment authorization attempts",
  labelNames: ["status"]
});
register.registerMetric(paymentsCreated);

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
        service: "payment",
        method: req.method,
        route: req.route?.path || req.path,
        status: String(res.statusCode)
      });
    });
    next();
  });

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ service: "payment", status: "ok" });
  });

  app.get("/readyz", (_req, res) => {
    res.status(200).json({ service: "payment", ready: true });
  });

  app.post("/payments/authorize", (req, res) => {
    const { bookingId, amount, currency = "USD" } = req.body;
    if (!bookingId || !amount || amount <= 0) {
      paymentsCreated.inc({ status: "rejected" });
      return res.status(400).json({ error: "bookingId and positive amount are required" });
    }

    paymentsCreated.inc({ status: "authorized" });
    return res.status(201).json({
      paymentId: `pay_${bookingId}`,
      bookingId,
      amount,
      currency,
      status: "AUTHORIZED"
    });
  });

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  return app;
}

module.exports = { createApp };
