import type { GitHubActivityItem, RepoSpec } from '../data/repos';

export interface LanguageShare {
  language: string;
  bytes: number;
  percent: number;
}

export interface GitHubAggregateStats {
  totalRepos: number;
  totalBytes: number;
  totalKilobytes: number;
  languageShares: LanguageShare[];
  categoryCounts: Record<'all' | 'systems' | 'ml' | 'infra', number>;
  recentPushCount: number;
}

export function aggregateGitHubStats(
  repos: RepoSpec[],
  activity: GitHubActivityItem[]
): GitHubAggregateStats {
  const langTotals: Record<string, number> = {};
  let totalBytes = 0;

  const categoryCounts = {
    all: repos.length,
    systems: 0,
    ml: 0,
    infra: 0,
  };

  for (const repo of repos) {
    categoryCounts[repo.category] += 1;
    const entries = Object.entries(repo.languages);
    if (entries.length === 0) {
      langTotals[repo.primaryLanguage] = (langTotals[repo.primaryLanguage] ?? 0) + 1024;
      totalBytes += 1024;
    } else {
      for (const [lang, bytes] of entries) {
        langTotals[lang] = (langTotals[lang] ?? 0) + bytes;
        totalBytes += bytes;
      }
    }
  }

  const languageShares: LanguageShare[] = Object.entries(langTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([language, bytes]) => ({
      language,
      bytes,
      percent: totalBytes > 0 ? Math.round((bytes / totalBytes) * 1000) / 10 : 0,
    }));

  const recentPushCount = activity.filter(
    (e) => e.type === 'PushEvent' || e.type === 'PullRequestEvent'
  ).length;

  return {
    totalRepos: repos.length,
    totalBytes,
    totalKilobytes: Math.round(totalBytes / 1024),
    languageShares,
    categoryCounts,
    recentPushCount,
  };
}

export function formatRelativeDate(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '2026';
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
