import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLastYearContributionSeries,
  summarizeContributionSeries,
} from './contributionTimeline';

test('buildLastYearContributionSeries returns exactly 12 rolling months ending at reference date', () => {
  const series = buildLastYearContributionSeries({
    repoId: 'sifr-native',
    createdAt: '2026-11-16T02:52:22Z',
    updatedAt: '2026-11-18T10:57:36Z',
    languageBytes: 508490,
    now: new Date('2026-11-18T00:00:00Z'),
  });

  assert.equal(series.length, 12);
  assert.equal(series[0].key, '2025-12');
  assert.equal(series[11].key, '2026-11');
  assert.ok(series[11].commits > 0);
});

test('buildLastYearContributionSeries aggregates real commitDates accurately when provided', () => {
  const series = buildLastYearContributionSeries({
    repoId: 'GO_DB',
    createdAt: '2026-06-21T20:38:29Z',
    updatedAt: '2026-11-17T22:34:08Z',
    languageBytes: 135000,
    commitDates: [
      '2026-06-21T21:00:00Z',
      '2026-06-22T10:00:00Z',
      '2026-08-14T15:00:00Z',
      '2026-11-17T22:00:00Z',
    ],
    now: new Date('2026-11-18T00:00:00Z'),
  });

  const june = series.find((p) => p.key === '2026-06');
  const aug = series.find((p) => p.key === '2026-08');
  const nov = series.find((p) => p.key === '2026-11');
  assert.equal(june?.commits, 2);
  assert.equal(aug?.commits, 1);
  assert.equal(nov?.commits, 1);

  const summary = summarizeContributionSeries(series);
  assert.equal(summary.totalCommits, 4);
  assert.equal(summary.activeMonths, 3);
  assert.equal(summary.peakMonth, 'Jun 2026');
});
