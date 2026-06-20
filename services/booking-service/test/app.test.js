const request = require("supertest");
const { createApp } = require("../src/app");

describe("booking service", () => {
  const app = createApp();

  test("reports health", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("creates a booking", async () => {
    const res = await request(app)
      .post("/bookings")
      .send({ consumerId: "con_1", pickup: "A", dropoff: "B" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("REQUESTED");
  });
});
