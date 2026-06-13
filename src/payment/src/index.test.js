const request = require('supertest');
const { app, server } = require('./index');

afterAll(done => {
  server.close(done);
});

describe('Payment Service Endpoint Tests', () => {
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

  it('should create a payment', async () => {
    const res = await request(app)
      .post('/payments')
      .send({ bookingId: 'b1', amount: 25.5, token: 'tok_visa' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('succeeded');
    expect(res.body.amount).toEqual(25.5);
  });
});
