import test from 'node:test';
import assert from 'node:assert/strict';
import { REPOSITORIES } from '../data/repos';
import {
  filterAtlasRepos,
  filterRepositories,
  getActFilterOptions,
  getAvailableLanguages,
  getLineageConnections,
  getLineageForRepo,
  REPO_LINEAGE,
} from './lineage';
import { resolveCanonicalRepoId } from './identity';

test('every canonical repository defines a build command and 4 execution pipeline stages', () => {
  for (const repo of REPOSITORIES) {
    const spec = getLineageForRepo(repo.id);
    assert.ok(spec.buildCommand.includes(repo.name), `Expected buildCommand for ${repo.id}`);
    assert.ok(
      spec.buildCommand.includes('https://github.com/Sifr-Dev/'),
      `Expected Sifr-Dev clone URL for ${repo.id}`
    );
    assert.equal(spec.stages.length, 4, `Expected 4 pipeline stages for ${repo.id}`);
    for (const stage of spec.stages) {
      assert.ok(stage.label.length > 0);
      assert.ok(stage.metric.length > 0);
    }
  }
});

test('lineage graph resolves upstream dependencies and downstream dependents bi-directionally', () => {
  const freelistRel = getLineageConnections('freelist');
  assert.equal(freelistRel.builtUpon.length, 0);
  assert.ok(freelistRel.powers.includes('redwire'));
  assert.ok(freelistRel.powers.includes('verrev'));

  const cipherRel = getLineageConnections('Cipher');
  assert.ok(cipherRel.builtUpon.includes('tachyon-fetch'));
  assert.ok(cipherRel.powers.includes('CipherDesk'));
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

test('filterRepositories filters accurately by query, programming language, and category', () => {
  const langs = getAvailableLanguages(REPOSITORIES);
  assert.ok(langs.includes('Rust'));
  assert.ok(langs.includes('Zig'));
  assert.ok(langs.includes('Go'));

  const zigOnly = filterRepositories(REPOSITORIES, { language: 'Zig' });
  assert.equal(zigOnly.length, 2);
  assert.deepEqual(zigOnly.map((r) => r.id).sort(), ['Cipher', 'CipherDesk']);

  const mlOnly = filterRepositories(REPOSITORIES, { category: 'ml' });
  assert.equal(mlOnly.length, 3);
  assert.deepEqual(
    mlOnly.map((r) => r.id).sort(),
    ['GreenLens', 'logitrisk', 'subtorch']
  );

  const waylandSearch = filterRepositories(REPOSITORIES, { query: 'wayland vulkan' });
  assert.ok(waylandSearch.some((r) => r.id === 'Cipher'));

  const combined = filterRepositories(REPOSITORIES, {
    query: 'flAc',
    language: 'Zig',
    category: 'systems',
  });
  assert.equal(combined.length, 1);
  assert.equal(combined[0].id, 'CipherDesk');
});

test('resolveCanonicalRepoId maps legacy repository IDs to canonical Sifr-Dev names', () => {
  assert.equal(resolveCanonicalRepoId('GO_DB'), 'mizan');
  assert.equal(resolveCanonicalRepoId('sifr-native'), 'Cipher');
  assert.equal(resolveCanonicalRepoId('sifr-apps'), 'CipherDesk');
  assert.equal(resolveCanonicalRepoId('sifr-ml-systems'), 'subtorch');
  assert.equal(resolveCanonicalRepoId('malloc_allocator'), 'freelist');
  assert.equal(resolveCanonicalRepoId('Cipher'), 'Cipher');
});
