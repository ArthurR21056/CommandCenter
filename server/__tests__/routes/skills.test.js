const request = require('supertest');
const app = require('../../index');
const db = require('../../db/database');

const CLIENT_KEY = 'skills-test-user';
let userId;

beforeAll(() => {
  const user = db
    .prepare("INSERT INTO users (client_key, name) VALUES (?, 'SkillTester') RETURNING id")
    .get(CLIENT_KEY);
  userId = user.id;
});

function authed(req) {
  return req.set('X-User-Id', CLIENT_KEY);
}

describe('GET /api/skills', () => {
  it('returns empty array initially', async () => {
    const res = await authed(request(app).get('/api/skills'));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/skills', () => {
  it('returns 400 when name is missing', async () => {
    const res = await authed(
      request(app).post('/api/skills').send({ url: 'https://example.com' })
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name and url/i);
  });

  it('returns 400 when url is missing', async () => {
    const res = await authed(request(app).post('/api/skills').send({ name: 'My Skill' }));
    expect(res.status).toBe(400);
  });

  it('creates a skill and returns 201', async () => {
    const res = await authed(
      request(app).post('/api/skills').send({
        name: 'Health Check',
        description: 'Pings server',
        method: 'GET',
        url: 'https://example.com/health',
      })
    );
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Health Check');
    expect(res.body.method).toBe('GET');
    expect(res.body.id).toBeDefined();
  });
});

describe('DELETE /api/skills/:id', () => {
  it('returns 404 for non-existent skill', async () => {
    const res = await authed(request(app).delete('/api/skills/99999'));
    expect(res.status).toBe(404);
  });

  it('deletes skill and returns ok', async () => {
    const { body: skill } = await authed(
      request(app).post('/api/skills').send({ name: 'Del Skill', url: 'https://x.com' })
    );
    const res = await authed(request(app).delete(`/api/skills/${skill.id}`));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('POST /api/skills/:id/run', () => {
  let skillId;

  beforeAll(async () => {
    const { body } = await authed(
      request(app).post('/api/skills').send({
        name: 'Run Skill',
        method: 'GET',
        url: 'https://httpbin.org/get',
      })
    );
    skillId = body.id;
  });

  it('returns 404 for non-existent skill', async () => {
    const res = await authed(request(app).post('/api/skills/99999/run'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with JSON preview when outbound fetch succeeds', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '{"status":"ok"}',
    });
    const res = await authed(request(app).post(`/api/skills/${skillId}/run`));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.httpStatus).toBe(200);
    expect(res.body.preview).toContain('"status"');
  });

  it('returns plain text preview for non-JSON response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => 'plain response',
    });
    const res = await authed(request(app).post(`/api/skills/${skillId}/run`));
    expect(res.body.preview).toBe('plain response');
  });

  it('includes body in outbound request for POST skill with body', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      text: async () => '{}',
    });
    const { body: postSkill } = await authed(
      request(app).post('/api/skills').send({
        name: 'POST Skill',
        method: 'POST',
        url: 'https://example.com/data',
        body: '{"key":"value"}',
      })
    );
    await authed(request(app).post(`/api/skills/${postSkill.id}/run`));
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/data',
      expect.objectContaining({ body: '{"key":"value"}' })
    );
  });

  it('returns 502 when outbound fetch fails', async () => {
    // Use an invalid URL that will fail to connect
    const { body: skill } = await authed(
      request(app).post('/api/skills').send({
        name: 'Failing Skill',
        method: 'GET',
        url: 'http://localhost:19999/does-not-exist',
      })
    );
    // Restore real fetch for this test
    if (global.fetch && global.fetch.mockRestore) global.fetch.mockRestore();
    delete global.fetch;
    const res = await authed(request(app).post(`/api/skills/${skill.id}/run`));
    expect(res.status).toBe(502);
    expect(res.body.ok).toBe(false);
  }, 10000);
});

describe('GET /api/skills/:id/runs', () => {
  it('returns 404 for non-existent skill', async () => {
    const res = await authed(request(app).get('/api/skills/99999/runs'));
    expect(res.status).toBe(404);
  });

  it('returns run history for a skill', async () => {
    const { body: skill } = await authed(
      request(app).post('/api/skills').send({ name: 'History Skill', url: 'https://x.com' })
    );
    const res = await authed(request(app).get(`/api/skills/${skill.id}/runs`));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
