import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateConsensus, CONSENSUS_THRESHOLDS } from '../services/consensusService.js';

const votes = (agree = 0, disagree = 0, neutral = 0) => [
  ...Array.from({ length: agree }, () => ({ vote: 'agree' })),
  ...Array.from({ length: disagree }, () => ({ vote: 'disagree' })),
  ...Array.from({ length: neutral }, () => ({ vote: 'neutral' })),
];

test('no votes never reaches consensus', () => {
  const r = evaluateConsensus([], 5);
  assert.equal(r.reached, false);
  assert.equal(r.totalVotes, 0);
  assert.equal(r.agreePercentage, 0);
});

test('a single agree vote cannot resolve a two-person team', () => {
  // Regression: 1/2 satisfies both percentage thresholds (100% agree, 50%
  // participation) and used to resolve the proposal before the second member
  // had seen it. The MIN_VOTES floor exists for this case.
  assert.equal(evaluateConsensus(votes(1), 2).reached, false);
});

test('an unknown member count is not treated as a team of one', () => {
  // The caller used to pass `team?.members?.length || 1`, so a failed team
  // lookup made any single vote sufficient.
  assert.equal(evaluateConsensus(votes(1), 0).reached, false);
});

test('unanimous two-person team reaches consensus', () => {
  const r = evaluateConsensus(votes(2), 2);
  assert.equal(r.reached, true);
  assert.equal(r.agreePercentage, 100);
  assert.equal(r.participationRate, 100);
});

test('meets the agreement threshold exactly', () => {
  // 7 agree of 10 votes = 70%, with 10 of 10 members participating.
  const r = evaluateConsensus(votes(7, 3), 10);
  assert.equal(r.agreePercentage, 70);
  assert.equal(r.reached, true);
});

test('falls one vote short of the agreement threshold', () => {
  // 6 agree of 10 = 60%.
  assert.equal(evaluateConsensus(votes(6, 4), 10).reached, false);
});

test('high agreement still fails without enough participation', () => {
  // 3 of 3 votes agree, but only 3 of 10 members voted (30% < 50%).
  const r = evaluateConsensus(votes(3), 10);
  assert.equal(r.agreePercentage, 100);
  assert.equal(r.participationRate, 30);
  assert.equal(r.reached, false);
});

test('neutral votes count against the agreement share', () => {
  // 2 agree, 2 neutral = 50% agreement, below the 70% threshold.
  const r = evaluateConsensus(votes(2, 0, 2), 4);
  assert.equal(r.agreePercentage, 50);
  assert.equal(r.reached, false);
});

test('is a pure function and does not mutate its input', () => {
  const input = votes(3, 1);
  const snapshot = JSON.stringify(input);
  evaluateConsensus(input, 4);
  assert.equal(JSON.stringify(input), snapshot);
});

test('thresholds are exported for callers that display them', () => {
  assert.equal(CONSENSUS_THRESHOLDS.AGREE_THRESHOLD, 0.7);
  assert.equal(CONSENSUS_THRESHOLDS.PARTICIPATION_THRESHOLD, 0.5);
  assert.equal(CONSENSUS_THRESHOLDS.MIN_VOTES, 2);
});
