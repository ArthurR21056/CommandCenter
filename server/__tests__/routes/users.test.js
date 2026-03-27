const request = require('supertest');
const app = require('../../index');

describe('GET /api/health', () => {
  it('returns ok: true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('POST /api/users/ensure', () => {
  it('returns 400 when clientKey is missing', async () => {
    const res = await request(app).post('/api/users/ensure').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/clientKey/i);
  });

  it('returns 400 when clientKey is not a string', async () => {
    const res = await request(app).post('/api/users/ensure').send({ clientKey: 123 });
    expect(res.status).toBe(400);
  });

  it('creates a new user on first call (isNew: true)', async () => {
    const res = await request(app)
      .post('/api/users/ensure')
      .send({ clientKey: 'brand-new-key' });
    expect(res.status).toBe(201);
    expect(res.body.isNew).toBe(true);
    expect(res.body.id).toBeDefined();
  });

  it('returns existing user on second call (isNew: false)', async () => {
    await request(app).post('/api/users/ensure').send({ clientKey: 'existing-key' });
    const res = await request(app)
      .post('/api/users/ensure')
      .send({ clientKey: 'existing-key' });
    expect(res.status).toBe(200);
    expect(res.body.isNew).toBe(false);
  });
});

describe('GET /api/users', () => {
  it('returns an array of users', async () => {
    await request(app).post('/api/users/ensure').send({ clientKey: 'list-test-key' });
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
