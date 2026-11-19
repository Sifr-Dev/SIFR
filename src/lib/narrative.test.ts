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
import { parseMarkdownBlocks } from './markdown';

test('canonical chronological track includes all 20 unique repositories across 4 parts without em dashes', () => {
  assert.equal(CANONICAL_ACTS.length, 4);
  assert.equal(CANONICAL_TRACK_ORDER.length, 20);
  assert.equal(new Set(CANONICAL_TRACK_ORDER).size, 20);

  for (const id of CANONICAL_TRACK_ORDER) {
    const repo = REPOSITORIES.find((r) => r.id === id);
    assert.ok(repo, `Missing repository in REPOSITORIES: ${id}`);
    assert.ok(!repo.subtitle.includes('—'), `Em dash found in subtitle of ${id}`);
    assert.ok(!repo.summary.includes('—'), `Em dash found in summary of ${id}`);

    const story = REPO_STORIES[id];
    assert.ok(story, `Missing story for ${id}`);
    assert.ok(story.beatLine.length > 10, `Missing beatLine for ${id}`);
    assert.ok(!story.beatLine.includes('—'), `Em dash found in beatLine of ${id}`);
    assert.ok(!story.openingHook.includes('—'), `Em dash found in openingHook of ${id}`);
    assert.ok(story.readmeMarkdown.includes('# '), `Missing README heading for ${id}`);
    assert.ok(story.bridgeToNext.length > 10, `Missing bridge narrative for ${id}`);
  }

  const ordered = getOrderedTrack(REPOSITORIES);
  assert.equal(ordered.length, 20);
  assert.equal(ordered[0].id, 'mizan');
  assert.equal(ordered[19].id, 'SIFR');
});

test('flagship repositories define parsed engineeringDepthMarkdown covering architecture, details, benchmarks, and trade-offs', () => {
  for (const id of ['Cipher', 'CipherDesk', 'subtorch', 'verrev']) {
    const repo = REPOSITORIES.find((r) => r.id === id);
    assert.ok(repo, `Missing flagship repo ${id}`);
    assert.ok(
      typeof repo.engineeringDepthMarkdown === 'string' && repo.engineeringDepthMarkdown.length > 200,
      `Missing engineeringDepthMarkdown for ${id}`
    );
    assert.ok(!repo.engineeringDepthMarkdown.includes('—'), `Em dash found in depth markdown for ${id}`);

    const blocks = parseMarkdownBlocks(repo.engineeringDepthMarkdown);
    const headings = blocks
      .filter((b): b is Extract<typeof b, { kind: 'heading' }> => b.kind === 'heading')
      .map((b) => b.text.toLowerCase());

    assert.ok(headings.some((h) => h.includes('architecture')), `${id} missing Architecture heading`);
    assert.ok(headings.some((h) => h.includes('implementation')), `${id} missing Implementation heading`);
    assert.ok(headings.some((h) => h.includes('benchmark')), `${id} missing Benchmarks heading`);
    assert.ok(headings.some((h) => h.includes('trade-off')), `${id} missing Trade-Offs heading`);
  }
});

test('ride starts at Entrance and enforces sequential progression across all 20 stops until Ending', () => {
  let state = createInitialRideState();
  assert.equal(state.hasEntered, false);
  assert.equal(state.hasExited, false);
  assert.equal(getRideProgressPercent(state), 0);

  assert.equal(canAccessStation(state, 0), true);
  assert.equal(canAccessStation(state, 4), false);

  state = enterRide(state);
  assert.equal(state.hasEntered, true);
  assert.equal(state.currentIndex, 0);
  assert.equal(getStationCode(state.currentIndex), '01');
  assert.equal(getActForRepoId(CANONICAL_TRACK_ORDER[0]).roman, 'Part I');

  for (let i = 0; i < 19; i++) {
    state = advanceRide(state);
    assert.equal(state.currentIndex, i + 1);
    assert.equal(state.maxUnlockedIndex, i + 1);
    assert.equal(state.hasExited, false);
  }

  assert.equal(CANONICAL_TRACK_ORDER[state.currentIndex], 'SIFR');
  state = advanceRide(state);
  assert.equal(state.hasExited, true);
  assert.equal(getRideProgressPercent(state), 100);

  const backed = stepBackRide(state);
  assert.equal(backed.currentIndex, 18);
  assert.equal(canAccessStation(backed, 19), true);

  const jumped = jumpToUnlockedStation(backed, 0);
  assert.equal(jumped.currentIndex, 0);
  const reset = restartRide();
  assert.equal(reset.hasEntered, false);
  assert.equal(reset.hasExited, false);
  assert.equal(reset.maxUnlockedIndex, 0);
});

test('parseRideState restores persisted progress cleanly and resolveSceneParam resolves canonical and alias scenes', () => {
  const ordered = getOrderedTrack(REPOSITORIES);
  const fresh = createInitialRideState();

  const blocked = resolveSceneParam('?scene=verrev', fresh, ordered);
  assert.equal(blocked.hasEntered, false);
  assert.equal(blocked.currentIndex, 0);

  const mid = { hasEntered: true, currentIndex: 4, maxUnlockedIndex: 7, hasExited: false };
  const parsed = parseRideState(serializeRideState(mid), ordered.length);
  assert.deepEqual(parsed, mid);
  assert.equal(parseRideState('invalid-json', ordered.length), null);

  const jumpedAlias = resolveSceneParam('?scene=GO_DB', mid, ordered);
  assert.equal(jumpedAlias.hasEntered, true);
  assert.equal(ordered[jumpedAlias.currentIndex].id, 'mizan');

  const jumpedCanonical = resolveSceneParam('?scene=mizan', mid, ordered);
  assert.equal(jumpedCanonical.hasEntered, true);
  assert.equal(ordered[jumpedCanonical.currentIndex].id, 'mizan');

  assert.equal(buildSceneSharePath('SIFR'), '?scene=SIFR');
});
