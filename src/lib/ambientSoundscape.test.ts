import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeArpeggioStep,
  computeNoteFrequency,
  computeScrollFilterCutoff,
  getChapterFromLabel,
  getChapterScaleProfile,
  shouldScheduleGenerativeNote,
} from './ambientSoundscape';

test('getChapterFromLabel maps active story labels cleanly to soundscape harmonic chapters', () => {
  assert.equal(getChapterFromLabel('Prologue'), 'prologue');
  assert.equal(getChapterFromLabel('Part I · First Systems'), 'act-1');
  assert.equal(getChapterFromLabel('Part II · Math to Silicon'), 'act-2');
  assert.equal(getChapterFromLabel('Part III · Memory and Trust'), 'act-3');
  assert.equal(getChapterFromLabel('Part IV · Crafted From Zero'), 'act-4');
  assert.equal(getChapterFromLabel('Epilogue'), 'epilogue');
});

test('computeNoteFrequency and computeScrollFilterCutoff span wide acoustic compass cleanly', () => {
  const profile = getChapterScaleProfile('act-2');
  assert.ok(profile.scaleOffsets.length >= 10, 'Expected expanded multi-octave scale palette');
  assert.ok(profile.tempoMs >= 350 && profile.tempoMs <= 460);

  const tenorNote = computeNoteFrequency(profile.rootHz, 0, profile.scaleOffsets, 1);
  const highNote = computeNoteFrequency(profile.rootHz, 10, profile.scaleOffsets, 3);
  assert.ok(tenorNote >= 140 && tenorNote <= 260);
  assert.ok(highNote >= 1000 && highNote <= 2400);

  const idleCutoff = computeScrollFilterCutoff(profile.cutoffHz, 0);
  const motionCutoff = computeScrollFilterCutoff(profile.cutoffHz, 0.9);
  assert.equal(idleCutoff, profile.cutoffHz);
  assert.ok(motionCutoff > idleCutoff + 300);
});

test('computeArpeggioStep spans bass/mid/treble registers with expressive harmonic voicings', () => {
  const step0 = computeArpeggioStep(0, 'act-4');
  const step4 = computeArpeggioStep(4, 'act-4');
  assert.equal(step0.accentBass, true);
  assert.ok(step0.noteHz !== null && step0.noteHz < 300);
  assert.equal(step4.accentBass, false);
  assert.ok(step4.noteHz !== null && step4.noteHz > 900);
  assert.ok(step4.harmonicTopHz !== null && step4.harmonicTopHz > step4.noteHz);
});

test('shouldScheduleGenerativeNote obeys autoplay policy and page visibility', () => {
  assert.equal(shouldScheduleGenerativeNote('suspended', false), false);
  assert.equal(shouldScheduleGenerativeNote('uninitialized', false), false);
  assert.equal(shouldScheduleGenerativeNote('running', true), false);
  assert.equal(shouldScheduleGenerativeNote('running', false), true);
});
