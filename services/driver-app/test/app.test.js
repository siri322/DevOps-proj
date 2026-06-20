const request = require("supertest");
const { createApp } = require("../src/app");

describe("driver app", () => {
  const app = createApp();

  test("reports health", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("updates availability", async () => {
    const res = await request(app)
      .put("/drivers/drv_1/availability")
      .send({ available: true });

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
  });
});
