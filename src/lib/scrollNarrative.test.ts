import test from 'node:test';
import assert from 'node:assert/strict';
import { computeMotionBlurPx, computeSpreadFocusState } from './scrollNarrative';

test('computeSpreadFocusState holds active center spread at full opacity and scale', () => {
  const res = computeSpreadFocusState({
    itemCenter: 720,
    viewportCenter: 720,
    viewportSize: 1440,
  });
  assert.equal(res.state, 'active');
  assert.equal(res.opacity, 1);
  assert.equal(res.scale, 1);
  assert.equal(res.driftPx, 0);
});

test('computeSpreadFocusState gradually fades out older repository spreads left behind', () => {
  const nearPast = computeSpreadFocusState({
    itemCenter: 350,
    viewportCenter: 720,
    viewportSize: 1440,
  });
  const deepPast = computeSpreadFocusState({
    itemCenter: -120,
    viewportCenter: 720,
    viewportSize: 1440,
  });

  assert.equal(nearPast.state, 'past');
  assert.equal(deepPast.state, 'past');
  assert.ok(nearPast.opacity < 1 && nearPast.opacity > deepPast.opacity);
  assert.equal(deepPast.opacity, 0.12);
  assert.ok(deepPast.driftPx < 0);
  assert.ok(deepPast.scale < 1);
});

test('computeSpreadFocusState brings upcoming spreads smoothly into focus and pins start/end edges', () => {
  const entering = computeSpreadFocusState({
    itemCenter: 1380,
    viewportCenter: 720,
    viewportSize: 1440,
  });
  assert.equal(entering.state, 'upcoming');
  assert.ok(entering.opacity >= 0.35 && entering.opacity < 1);
  assert.ok(entering.driftPx > 0);

  const pinnedStart = computeSpreadFocusState({
    itemCenter: 120,
    viewportCenter: 720,
    viewportSize: 1440,
    scrollProgress: 0,
    pinEdge: 'start',
  });
  assert.equal(pinnedStart.state, 'active');
  assert.equal(pinnedStart.opacity, 1);

  const pinnedEnd = computeSpreadFocusState({
    itemCenter: 1180,
    viewportCenter: 720,
    viewportSize: 1440,
    scrollProgress: 0.98,
    pinEdge: 'end',
  });
  assert.equal(pinnedEnd.state, 'active');
  assert.equal(pinnedEnd.opacity, 1);
});

test('computeSpreadFocusState preserves full opacity under reduced motion', () => {
  const res = computeSpreadFocusState({
    itemCenter: -150,
    viewportCenter: 720,
    viewportSize: 1440,
    reducedMotion: true,
  });
  assert.equal(res.state, 'past');
  assert.equal(res.opacity, 1);
  assert.equal(res.scale, 1);
  assert.equal(res.driftPx, 0);
});

test('computeMotionBlurPx stays zero at rest or under reduced motion and ramps smoothly with speed', () => {
  assert.equal(computeMotionBlurPx(0), 0);
  assert.equal(computeMotionBlurPx(110), 0);
  assert.equal(computeMotionBlurPx(2400, 2.5, true), 0);

  const mid = computeMotionBlurPx(950, 2.5);
  const high = computeMotionBlurPx(3200, 2.5);
  assert.ok(mid > 0 && mid < high);
  assert.equal(high, 2.5);
});
