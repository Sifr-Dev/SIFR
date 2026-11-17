import { useEffect, useMemo, useState } from 'react';
import {
  INITIAL_ACTIVITY,
  INITIAL_PROFILE,
  REPOSITORIES,
  type GitHubActivityItem,
  type GitHubProfileSnapshot,
  type RepoSpec,
} from '../data/repos';
import { aggregateGitHubStats } from '../lib/githubStats';

export type SyncSource = 'snapshot' | 'live' | 'syncing';

interface OverviewResponse {
  source?: 'live' | 'snapshot';
  profile?: GitHubProfileSnapshot;
  repos?: RepoSpec[];
  activity?: GitHubActivityItem[];
  lastSyncedAt?: string;
}

export function useGitHubTelemetry() {
  const [profile, setProfile] = useState<GitHubProfileSnapshot>(INITIAL_PROFILE);
  const [repos, setRepos] = useState<RepoSpec[]>(REPOSITORIES);
  const [activity, setActivity] = useState<GitHubActivityItem[]>(INITIAL_ACTIVITY);
  const [syncSource, setSyncSource] = useState<SyncSource>('snapshot');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('2026-11-17T15:10:22Z');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function syncLive() {
      setSyncSource('syncing');
      try {
        const res = await fetch('/api/github/overview', { signal: controller.signal });
        if (!res.ok || cancelled) {
          if (!cancelled) setSyncSource('snapshot');
          return;
        }
        const data = (await res.json()) as OverviewResponse;
        if (cancelled) return;

        if (data.profile) setProfile(data.profile);
        if (Array.isArray(data.repos) && data.repos.length > 0) setRepos(data.repos);
        if (Array.isArray(data.activity) && data.activity.length > 0) setActivity(data.activity);
        setSyncSource(data.source === 'live' ? 'live' : 'snapshot');
        if (data.lastSyncedAt) setLastSyncedAt(data.lastSyncedAt);
      } catch {
        if (!cancelled) {
          setSyncSource('snapshot');
        }
      }
    }

    void syncLive();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const stats = useMemo(() => aggregateGitHubStats(repos, activity), [repos, activity]);

  return {
    profile,
    repos,
    activity,
    stats,
    syncSource,
    lastSyncedAt,
  };
}
