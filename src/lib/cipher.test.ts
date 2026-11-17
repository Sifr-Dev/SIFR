import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SIFR_BITS,
  angleToShift,
  decodeRingAtShift,
  normalizeShift,
  shiftToAngle,
  stepAngularSpring,
} from './cipher';

test('SIFR_BITS has exactly 24 Alberti cells', () => {
  assert.equal(SIFR_BITS.length, 24);
});

test('decodeRingAtShift(0) spells SIFR and marks shift 0 valid', () => {
  const res = decodeRingAtShift(0);
  assert.equal(res.shift, 0);
  assert.equal(res.isZeroShift, true);
  assert.equal(res.word, 'SIFR····');
  assert.deepEqual(res.binaryGroups, ['10011', '01001', '00110', '10010', '0000']);
});

test('non-zero shifts produce deterministic garble matching reference board', () => {
  assert.equal(decodeRingAtShift(1).word, 'FRMD····');
  assert.equal(decodeRingAtShift(1).isZeroShift, false);
  assert.equal(decodeRingAtShift(2).word, 'MDZH····');
  assert.equal(decodeRingAtShift(3).word, 'ZITP····');
});

test('normalizeShift wraps negative and >23 shifts cleanly', () => {
  assert.equal(normalizeShift(-1), 23);
  assert.equal(normalizeShift(24), 0);
  assert.equal(normalizeShift(27), 3);
});

test('angleToShift and shiftToAngle map 15 degree detents bijectively', () => {
  for (let s = 0; s < 24; s++) {
    const angle = shiftToAngle(s);
    assert.equal(angleToShift(angle), s);
  }
});

test('stepAngularSpring converges toward targetAngleDeg', () => {
  let state = {
    angleDeg: -22,
    velocityDeg: 0,
    targetAngleDeg: 0,
    dragging: false,
  };
  for (let i = 0; i < 120; i++) {
    state = stepAngularSpring(state, 1 / 60);
  }
  assert.ok(Math.abs(state.angleDeg) < 0.1);
});
