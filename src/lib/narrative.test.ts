import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_ACTS,
  CANONICAL_TRACK_ORDER,
  advanceRide,
  buildSceneSharePath,
  canAccessStation,
  createInitialRideState,
  enterRide,
  getActForRepoId,
  getOrderedTrack,
  getRideProgressPercent,
  getStationCode,
  jumpToUnlockedStation,
  parseRideState,
  resolveSceneParam,
  restartRide,
  serializeRideState,
  stepBackRide,
} from './narrative';
import { REPOSITORIES } from '../data/repos';
import { REPO_STORIES } from '../data/stories';

test('canonical track includes all 12 unique repositories across 4 sequential acts', () => {
  assert.equal(CANONICAL_ACTS.length, 4);
  assert.equal(CANONICAL_TRACK_ORDER.length, 12);
  assert.equal(new Set(CANONICAL_TRACK_ORDER).size, 12);

  for (const id of CANONICAL_TRACK_ORDER) {
    assert.ok(
      REPOSITORIES.some((r) => r.id === id),
      `Missing repository in REPOSITORIES: ${id}`
    );
    const story = REPO_STORIES[id];
    assert.ok(story, `Missing story for ${id}`);
    assert.ok(story.readmeMarkdown.includes('# '), `Missing README heading for ${id}`);
    assert.ok(story.bridgeToNext.length > 20, `Missing bridge narrative for ${id}`);
  }

  const ordered = getOrderedTrack(REPOSITORIES);
  assert.equal(ordered.length, 12);
  assert.equal(ordered[11].id, 'SIFR');
});

test('ride starts at Entrance and enforces unbroken forward unlocking across all 12 stops until Exit', () => {
  let state = createInitialRideState();
  assert.equal(state.hasEntered, false);
  assert.equal(state.hasExited, false);
  assert.equal(getRideProgressPercent(state), 0);

  // Cannot skip straight to Station 05 before advancing
  assert.equal(canAccessStation(state, 0), true);
  assert.equal(canAccessStation(state, 4), false);

  state = enterRide(state);
  assert.equal(state.hasEntered, true);
  assert.equal(state.currentIndex, 0);
  assert.equal(getStationCode(state.currentIndex), '01');
  assert.equal(getActForRepoId(CANONICAL_TRACK_ORDER[0]).roman, 'Act I');

  // Step sequentially through Stations 01 -> 12
  for (let i = 0; i < 11; i++) {
    state = advanceRide(state);
    assert.equal(state.currentIndex, i + 1);
    assert.equal(state.maxUnlockedIndex, i + 1);
    assert.equal(state.hasExited, false);
  }

  // Final station is SIFR (index 11) before Grand Exit
  assert.equal(CANONICAL_TRACK_ORDER[state.currentIndex], 'SIFR');
  state = advanceRide(state);
  assert.equal(state.hasExited, true);
  assert.equal(getRideProgressPercent(state), 100);

  // Stepping back revisits unlocked stations without losing Exit completion
  const backed = stepBackRide(state);
  assert.equal(backed.currentIndex, 10);
  assert.equal(canAccessStation(backed, 11), true);

  // Jumping to an unlocked station works, restarting resets to Gate
  const jumped = jumpToUnlockedStation(backed, 0);
  assert.equal(jumped.currentIndex, 0);
  const reset = restartRide();
  assert.equal(reset.hasEntered, false);
  assert.equal(reset.hasExited, false);
  assert.equal(reset.maxUnlockedIndex, 0);
});

test('parseRideState restores persisted progress cleanly and resolveSceneParam respects canonical unlock rules', () => {
  const ordered = getOrderedTrack(REPOSITORIES);
  const fresh = createInitialRideState();

  // Unvisited deep link does NOT bypass canonical track
  const blocked = resolveSceneParam('?scene=verrev', fresh, ordered);
  assert.equal(blocked.hasEntered, false);
  assert.equal(blocked.currentIndex, 0);

  // Round-trip serialization clamps bounds safely
  const mid = { hasEntered: true, currentIndex: 4, maxUnlockedIndex: 7, hasExited: false };
  const parsed = parseRideState(serializeRideState(mid), ordered.length);
  assert.deepEqual(parsed, mid);
  assert.equal(parseRideState('invalid-json', ordered.length), null);

  // Unlocked deep link resolves straight to unlocked chapter
  const jumped = resolveSceneParam('?scene=GO_DB', mid, ordered);
  assert.equal(jumped.hasEntered, true);
  assert.equal(ordered[jumped.currentIndex].id, 'GO_DB');

  assert.equal(buildSceneSharePath('SIFR'), '?scene=SIFR');
});
