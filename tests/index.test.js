import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from "../index.js";

test('GET / should redirect to /users', async () => {
  const res = await request(app).get('/');
  assert.equal(res.statusCode, 302);
  assert.equal(res.headers.location, '/users');
});

test('GET /users should respond with status 200 or 404 depending on route setup', async () => {
  const res = await request(app).get('/users');
  assert.ok([200, 404].includes(res.statusCode));
});

test('GET /logs should respond with status 200 or 404 depending on route setup', async () => {
  const res = await request(app).get('/logs');
  assert.ok([200, 404].includes(res.statusCode));
});

test('GET /404 should return 404 page', async () => {
  const res = await request(app).get('/404');
  assert.equal(res.statusCode, 404);
  assert.match(res.text, /Oops! The page you're looking for doesn't exist/);
});
