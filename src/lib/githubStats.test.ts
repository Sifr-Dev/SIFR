import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_ACTIVITY, REPOSITORIES } from '../data/repos';
import { aggregateGitHubStats } from './githubStats';

test('aggregateGitHubStats aggregates all 12 repos accurately', () => {
  const stats = aggregateGitHubStats(REPOSITORIES, INITIAL_ACTIVITY);
  assert.equal(stats.totalRepos, 12);
  assert.equal(stats.categoryCounts.all, 12);
  assert.equal(
    stats.categoryCounts.systems + stats.categoryCounts.ml + stats.categoryCounts.infra,
    12
  );
  assert.ok(stats.totalKilobytes > 1100);
  assert.equal(stats.languageShares[0].language, 'Rust');
  assert.ok(stats.languageShares[0].percent > 35);
});
