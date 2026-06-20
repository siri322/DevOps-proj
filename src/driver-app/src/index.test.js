const request = require('supertest');
const { app, server } = require('./index');

afterAll(done => {
  server.close(done);
});

describe('Driver Service Endpoint Tests', () => {
  it('should respond to /healthz', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('OK');
  });

  it('should respond to /ready', async () => {
    const res = await request(app).get('/ready');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('OK');
  });

  it('should return list of drivers', async () => {
    const res = await request(app).get('/drivers');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
