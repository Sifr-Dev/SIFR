import test from 'node:test';
import assert from 'node:assert/strict';
import { REPOSITORIES } from '../data/repos';
import {
  filterAtlasRepos,
  getActFilterOptions,
  getLineageConnections,
  getLineageForRepo,
  REPO_LINEAGE,
} from './lineage';

test('every canonical repository defines a build command and 4 execution pipeline stages', () => {
  for (const repo of REPOSITORIES) {
    const spec = getLineageForRepo(repo.id);
    assert.ok(spec.buildCommand.includes(repo.name), `Expected buildCommand for ${repo.id}`);
    assert.equal(spec.stages.length, 4, `Expected 4 pipeline stages for ${repo.id}`);
    for (const stage of spec.stages) {
      assert.ok(stage.label.length > 0);
      assert.ok(stage.metric.length > 0);
    }
  }
});

test('lineage graph resolves upstream dependencies and downstream dependents bi-directionally', () => {
  const mallocRel = getLineageConnections('malloc_allocator');
  assert.equal(mallocRel.builtUpon.length, 0);
  assert.ok(mallocRel.powers.includes('redis_clone'));
  assert.ok(mallocRel.powers.includes('verrev'));

  const cipherRel = getLineageConnections('sifr-native');
  assert.ok(cipherRel.builtUpon.includes('tachyon-fetch'));
  assert.ok(cipherRel.powers.includes('sifr-apps'));
});

test('filterAtlasRepos filters cleanly across all 4 chronological parts (20 repos total)', () => {
  const options = getActFilterOptions();
  assert.equal(options.length, 5);
  assert.equal(filterAtlasRepos(REPOSITORIES, 'all').length, 20);
  assert.equal(filterAtlasRepos(REPOSITORIES, 'act-1').length, 5);
  assert.equal(filterAtlasRepos(REPOSITORIES, 'act-2').length, 3);
  assert.equal(filterAtlasRepos(REPOSITORIES, 'act-3').length, 5);
  assert.equal(filterAtlasRepos(REPOSITORIES, 'act-4').length, 7);
  assert.equal(Object.keys(REPO_LINEAGE).length, 20);
});
