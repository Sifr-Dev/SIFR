import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateAllReposContributionSeries,
  computeItemViewportParallax,
  computeParallaxShift,
} from './parallax';
import { REPOSITORIES } from '../data/repos';

test('computeParallaxShift scales scroll displacement accurately and handles invalid numbers', () => {
  assert.equal(computeParallaxShift(1000, 0.15), -150);
  assert.equal(computeParallaxShift(0, 0.4), 0);
  assert.equal(computeParallaxShift(Number.NaN, 0.2), 0);
});

test('computeItemViewportParallax clamps normalized window offsets smoothly', () => {
  assert.equal(computeItemViewportParallax(720, 720, 1440, 24), 0);
  assert.equal(computeItemViewportParallax(1440, 720, 720, 20), 20);
  assert.equal(computeItemViewportParallax(-5000, 720, 720, 20), -20);
  assert.equal(computeItemViewportParallax(100, 100, 0, 20), 0);
});

test('aggregateAllReposContributionSeries sums 12 monthly buckets across all 20 repositories', () => {
  const combined = aggregateAllReposContributionSeries(REPOSITORIES);
  assert.equal(combined.length, 12);
  const total = combined.reduce((sum, pt) => sum + pt.commits, 0);
  assert.ok(total > 100, `Expected combined activity across 20 repos, got ${total}`);
  assert.equal(combined[11].month, 'Nov');
});
