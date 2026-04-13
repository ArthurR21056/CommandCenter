const request = require('supertest');
const app = require('../../index');
const db = require('../../db/database');

let userId;

beforeAll(() => {
  const user = db.prepare("INSERT INTO users (client_key, name) VALUES ('test-key', 'Tester') RETURNING id").get();
  userId = user.id;
});

describe('resolveUser middleware', () => {
  it('returns 401 when X-User-Id header is missing', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/missing/i);
  });

  it('returns 401 when X-User-Id does not match any user', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('X-User-Id', 'unknown-key-xyz');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unknown user/i);
  });

  it('passes through and attaches userId for valid X-User-Id', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('X-User-Id', 'test-key');
    expect(res.status).toBe(200);
  });
});
