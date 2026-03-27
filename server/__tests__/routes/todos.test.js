const request = require('supertest');
const app = require('../../index');
const db = require('../../db/database');

const CLIENT_KEY = 'todos-test-user';
let userId;

beforeAll(() => {
  const user = db
    .prepare("INSERT INTO users (client_key, name) VALUES (?, 'TodoTester') RETURNING id")
    .get(CLIENT_KEY);
  userId = user.id;
});

function authed(req) {
  return req.set('X-User-Id', CLIENT_KEY);
}

describe('GET /api/todos', () => {
  it('returns empty array initially', async () => {
    const res = await authed(request(app).get('/api/todos'));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/todos', () => {
  it('returns 400 when name is missing', async () => {
    const res = await authed(request(app).post('/api/todos').send({ description: 'no name' }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('creates a todo and returns 201', async () => {
    const res = await authed(
      request(app).post('/api/todos').send({ name: 'Buy milk', description: 'Whole milk' })
    );
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Buy milk');
    expect(res.body.status).toBe('todo');
  });

  it('creates a todo with assignee', async () => {
    const res = await authed(
      request(app).post('/api/todos').send({ name: 'Assigned task', assignee_id: userId })
    );
    expect(res.status).toBe(201);
    expect(res.body.assignee_id).toBe(userId);
  });
});

describe('PATCH /api/todos/:id', () => {
  let todoId;

  beforeEach(async () => {
    const res = await authed(
      request(app).post('/api/todos').send({ name: 'Patch me' })
    );
    todoId = res.body.id;
  });

  it('returns 404 for non-existent todo', async () => {
    const res = await authed(request(app).patch('/api/todos/99999').send({ status: 'pending' }));
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status', async () => {
    const res = await authed(
      request(app).patch(`/api/todos/${todoId}`).send({ status: 'invalid_status' })
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/i);
  });

  it('updates status successfully', async () => {
    const res = await authed(
      request(app).patch(`/api/todos/${todoId}`).send({ status: 'pending' })
    );
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
  });

  it('updates assignee_id without changing status', async () => {
    const res = await authed(
      request(app).patch(`/api/todos/${todoId}`).send({ assignee_id: userId })
    );
    expect(res.status).toBe(200);
    expect(res.body.assignee_id).toBe(userId);
    expect(res.body.status).toBe('todo');
  });

  it('sets last_used when status is updated', async () => {
    const res = await authed(
      request(app).patch(`/api/todos/${todoId}`).send({ status: 'done' })
    );
    expect(res.body.last_used).not.toBeNull();
  });
});

describe('DELETE /api/todos/:id', () => {
  it('returns 404 for non-existent todo', async () => {
    const res = await authed(request(app).delete('/api/todos/99999'));
    expect(res.status).toBe(404);
  });

  it('deletes todo and returns ok', async () => {
    const { body } = await authed(
      request(app).post('/api/todos').send({ name: 'Delete me' })
    );
    const res = await authed(request(app).delete(`/api/todos/${body.id}`));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('POST /api/todos/reset', () => {
  it('resets all todos to "todo" status', async () => {
    const { body: created } = await authed(
      request(app).post('/api/todos').send({ name: 'Reset me' })
    );
    await authed(request(app).patch(`/api/todos/${created.id}`).send({ status: 'done' }));
    const res = await authed(request(app).post('/api/todos/reset'));
    expect(res.status).toBe(200);
    const found = res.body.find((t) => t.id === created.id);
    expect(found.status).toBe('todo');
  });
});
