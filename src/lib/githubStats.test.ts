import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_ACTIVITY, REPOSITORIES } from '../data/repos';
import { aggregateGitHubStats } from './githubStats';

test('aggregateGitHubStats aggregates all 11 repos accurately', () => {
  const stats = aggregateGitHubStats(REPOSITORIES, INITIAL_ACTIVITY);
  assert.equal(stats.totalRepos, 11);
  assert.equal(stats.categoryCounts.all, 11);
  assert.equal(
    stats.categoryCounts.systems + stats.categoryCounts.ml + stats.categoryCounts.infra,
    11
  );
  assert.ok(stats.totalKilobytes > 900);
  assert.equal(stats.languageShares[0].language, 'Rust');
  assert.ok(stats.languageShares[0].percent > 40);
});
