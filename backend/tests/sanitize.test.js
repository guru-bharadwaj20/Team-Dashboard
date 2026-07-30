import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeRequest } from '../middleware/sanitize.js';

/** Runs the middleware over a fake request and returns it. */
const run = (req) => {
  let called = false;
  sanitizeRequest({ body: {}, query: {}, params: {}, ...req }, {}, () => {
    called = true;
  });
  assert.ok(called, 'next() should always be called');
  return req;
};

test('strips top-level Mongo operators', () => {
  // {"email": {"$gt": ""}} turned an equality lookup into a scan matching an
  // arbitrary user, which is the account-takeover shape this guards against.
  const req = { body: { email: { $gt: '' } }, query: {}, params: {} };
  run(req);
  assert.deepEqual(req.body, { email: {} });
});

test('strips operators nested inside objects', () => {
  const req = { body: { filter: { name: { $ne: null }, ok: 1 } }, query: {}, params: {} };
  run(req);
  assert.deepEqual(req.body, { filter: { name: {}, ok: 1 } });
});

test('strips operators inside arrays', () => {
  const req = { body: { list: [{ $where: 'x' }, { safe: 2 }] }, query: {}, params: {} };
  run(req);
  assert.deepEqual(req.body, { list: [{}, { safe: 2 }] });
});

test('strips dotted keys that would address nested fields', () => {
  const req = { body: { 'a.b': 1, plain: 2 }, query: {}, params: {} };
  run(req);
  assert.deepEqual(req.body, { plain: 2 });
});

test('leaves ordinary values untouched', () => {
  const body = { name: 'Alice', age: 30, tags: ['a', 'b'], nested: { ok: true }, nil: null };
  const req = { body: structuredClone(body), query: {}, params: {} };
  run(req);
  assert.deepEqual(req.body, body);
});

test('sanitises query and params as well as body', () => {
  const req = { body: {}, query: { $where: '1' }, params: { id: { $ne: 1 } } };
  run(req);
  assert.deepEqual(req.query, {});
  assert.deepEqual(req.params, { id: {} });
});

test('a dollar sign inside a value is not stripped', () => {
  // Only keys are operators; "$5.00" is legitimate user text.
  const req = { body: { price: '$5.00' }, query: {}, params: {} };
  run(req);
  assert.deepEqual(req.body, { price: '$5.00' });
});

test('survives deeply nested input without recursing without bound', () => {
  let deep = { $bad: 1 };
  for (let i = 0; i < 50; i++) deep = { nested: deep };
  const req = { body: deep, query: {}, params: {} };
  assert.doesNotThrow(() => run(req));
});

test('tolerates a missing body', () => {
  assert.doesNotThrow(() => {
    let called = false;
    sanitizeRequest({ query: {}, params: {} }, {}, () => { called = true; });
    assert.ok(called);
  });
});
