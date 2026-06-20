const request = require("supertest");
const { createApp } = require("../src/app");

describe("payment service", () => {
  const app = createApp();

  test("reports health", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("authorizes a valid payment", async () => {
    const res = await request(app)
      .post("/payments/authorize")
      .send({ bookingId: "bk_123", amount: 24.75 });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("AUTHORIZED");
  });
});
