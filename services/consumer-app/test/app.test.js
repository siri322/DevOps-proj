const request = require("supertest");
const { createApp } = require("../src/app");

describe("consumer app", () => {
  const app = createApp();

  test("reports health", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("accepts a ride request", async () => {
    const res = await request(app)
      .post("/rides/request")
      .send({ consumerId: "con_1", pickup: "A", dropoff: "B" });

    expect(res.status).toBe(202);
    expect(res.body.status).toBe("PENDING_BOOKING");
  });
});
