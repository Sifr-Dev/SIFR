import type { RepoSpec } from '../data/repos';
import {
  buildLastYearContributionSeries,
  type MonthlyContributionPoint,
} from './contributionTimeline';

export function computeParallaxShift(scrollPx: number, speed: number): number {
  if (!Number.isFinite(scrollPx) || !Number.isFinite(speed)) return 0;
  const val = Math.round(-scrollPx * speed * 100) / 100;
  return val === 0 ? 0 : val;
}

export function computeItemViewportParallax(
  itemCenterPx: number,
  viewportCenterPx: number,
  viewportSpanPx: number,
  maxOffsetPx: number
): number {
  if (
    !Number.isFinite(itemCenterPx) ||
    !Number.isFinite(viewportCenterPx) ||
    !Number.isFinite(viewportSpanPx) ||
    !Number.isFinite(maxOffsetPx) ||
    viewportSpanPx <= 0
  ) {
    return 0;
  }
  const normalized = Math.max(-1, Math.min(1, (itemCenterPx - viewportCenterPx) / viewportSpanPx));
  return Math.round(normalized * maxOffsetPx * 100) / 100;
}

export function aggregateAllReposContributionSeries(
  repos: readonly RepoSpec[],
  now: Date = new Date('2026-11-18T12:00:00Z')
): MonthlyContributionPoint[] {
  const combined: MonthlyContributionPoint[] = [];

  for (const repo of repos) {
    const languageBytes = Object.values(repo.languages).reduce((sum, n) => sum + n, 0);
    const series = buildLastYearContributionSeries({
      repoId: repo.id,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      languageBytes,
      now,
    });

    if (combined.length === 0) {
      for (const pt of series) {
        combined.push({ ...pt });
      }
    } else {
      for (let i = 0; i < series.length; i++) {
        combined[i].commits += series[i].commits;
      }
    }
  }

  return combined;
}
