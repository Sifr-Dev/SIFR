import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_ACTIVITY, REPOSITORIES } from '../data/repos';
import { aggregateGitHubStats } from './githubStats';

test('aggregateGitHubStats aggregates all 20 repos accurately', () => {
  const stats = aggregateGitHubStats(REPOSITORIES, INITIAL_ACTIVITY);
  assert.equal(stats.totalRepos, 20);
  assert.equal(stats.categoryCounts.all, 20);
  assert.equal(
    stats.categoryCounts.systems + stats.categoryCounts.ml + stats.categoryCounts.infra,
    20
  );
  assert.ok(stats.totalKilobytes > 1500);
  assert.ok(stats.languageShares.length >= 4);
});
