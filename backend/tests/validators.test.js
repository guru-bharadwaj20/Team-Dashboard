import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  normalizeEmail,
  validatePassword,
  validateText,
  MIN_PASSWORD_LENGTH,
} from '../utils/validators.js';

test('normalizeEmail lowercases and trims', () => {
  assert.equal(normalizeEmail('  Alice@Example.COM '), 'alice@example.com');
  assert.equal(normalizeEmail(undefined), '');
  assert.equal(normalizeEmail(null), '');
});

test('isValidEmail accepts ordinary addresses', () => {
  assert.ok(isValidEmail('a@b.co'));
  assert.ok(isValidEmail('first.last+tag@sub.example.com'));
});

test('isValidEmail rejects malformed addresses', () => {
  for (const bad of ['', 'nope', 'a@b', 'a b@c.com', '@b.com', 'a@.com', 'a@b.']) {
    assert.equal(isValidEmail(bad), false, `expected ${JSON.stringify(bad)} to be invalid`);
  }
});

test('isValidEmail rejects an over-length address', () => {
  assert.equal(isValidEmail(`${'a'.repeat(250)}@b.co`), false);
});

test('validatePassword enforces the minimum length', () => {
  assert.match(validatePassword('a1'), /at least 8/);
  assert.equal(MIN_PASSWORD_LENGTH, 8);
});

test('validatePassword requires a letter and a digit', () => {
  assert.match(validatePassword('abcdefgh'), /letter and one number/);
  assert.match(validatePassword('12345678'), /letter and one number/);
  assert.equal(validatePassword('abcdefg1'), null);
});

test('validatePassword rejects missing or non-string input', () => {
  // Registration previously accepted any non-empty value, so "a" was valid.
  assert.match(validatePassword(''), /required/);
  assert.match(validatePassword(undefined), /required/);
  assert.match(validatePassword(12345678), /required/);
});

test('validatePassword rejects an absurdly long password', () => {
  // Unbounded input would be hashed by bcrypt on every attempt.
  assert.match(validatePassword('a1'.repeat(200)), /at most 200/);
});

test('validateText trims before measuring', () => {
  assert.match(validateText('   ', 'Title'), /required/);
  assert.equal(validateText('  ok  ', 'Title'), null);
});

test('validateText enforces the maximum', () => {
  assert.equal(validateText('a'.repeat(200), 'Title', { max: 200 }), null);
  assert.match(validateText('a'.repeat(201), 'Title', { max: 200 }), /at most 200/);
});

test('validateText rejects non-string input', () => {
  assert.match(validateText({}, 'Title'), /required/);
  assert.match(validateText(null, 'Title'), /required/);
});
