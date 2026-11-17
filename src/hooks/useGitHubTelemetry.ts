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

interface RemoteRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
}

interface RemoteEvent {
  id: string;
  type: string;
  created_at: string;
  repo?: { name?: string };
}

interface RemoteUser {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  blog: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

function describeEvent(type: string, repoShort: string): string {
  switch (type) {
    case 'PushEvent':
      return `Committed & pushed updates to ${repoShort}`;
    case 'PullRequestEvent':
      return `Merged engineering pull request in ${repoShort}`;
    case 'CreateEvent':
      return `Initialized branch or repository ${repoShort}`;
    case 'PublicEvent':
      return `Opened ${repoShort} as public source`;
    case 'WatchEvent':
      return `Starred ${repoShort}`;
    default:
      return `Updated ${repoShort}`;
  }
}

export function useGitHubTelemetry() {
  const [profile, setProfile] = useState<GitHubProfileSnapshot>(INITIAL_PROFILE);
  const [repos, setRepos] = useState<RepoSpec[]>(REPOSITORIES);
  const [activity, setActivity] = useState<GitHubActivityItem[]>(INITIAL_ACTIVITY);
  const [syncSource, setSyncSource] = useState<SyncSource>('snapshot');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('2026-11-16T23:21:00Z');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function syncLive() {
      setSyncSource('syncing');
      try {
        const [userRes, reposRes, eventsRes] = await Promise.all([
          fetch('https://api.github.com/users/mohamedsalahi', { signal: controller.signal }),
          fetch('https://api.github.com/users/mohamedsalahi/repos?per_page=100&sort=updated', {
            signal: controller.signal,
          }),
          fetch('https://api.github.com/users/mohamedsalahi/events/public?per_page=20', {
            signal: controller.signal,
          }),
        ]);

        if (cancelled) return;

        if (userRes.ok) {
          const u = (await userRes.json()) as RemoteUser;
          setProfile((prev) => ({
            ...prev,
            login: u.login || prev.login,
            name: u.name || prev.name,
            bio: u.bio || prev.bio,
            company: u.company || prev.company,
            blog: u.blog || prev.blog,
            htmlUrl: u.html_url || prev.htmlUrl,
            publicRepos: typeof u.public_repos === 'number' ? u.public_repos : prev.publicRepos,
            followers: typeof u.followers === 'number' ? u.followers : prev.followers,
            following: typeof u.following === 'number' ? u.following : prev.following,
          }));
        }

        if (reposRes.ok) {
          const remoteList = (await reposRes.json()) as RemoteRepo[];
          if (Array.isArray(remoteList) && remoteList.length > 0) {
            const byName = new Map(remoteList.map((r) => [r.name, r]));
            setRepos((prev) => {
              const merged = prev.map((local) => {
                const remote = byName.get(local.name);
                if (!remote) return local;
                return {
                  ...local,
                  stars: remote.stargazers_count ?? local.stars,
                  forks: remote.forks_count ?? local.forks,
                  updatedAt: remote.updated_at || local.updatedAt,
                  htmlUrl: remote.html_url || local.htmlUrl,
                };
              });
              // Include any brand-new public repos if added on GitHub
              for (const r of remoteList) {
                if (!prev.some((p) => p.name === r.name)) {
                  merged.push({
                    id: r.name,
                    name: r.name,
                    subtitle: r.description || 'Public GitHub Repository',
                    category: 'systems',
                    categoryLabel: 'Systems & Kernel',
                    featured: false,
                    htmlUrl: r.html_url,
                    primaryLanguage: r.language || 'Rust',
                    languages: { [r.language || 'Rust']: 4096 },
                    updatedAt: r.updated_at,
                    createdAt: r.updated_at,
                    stars: r.stargazers_count,
                    forks: r.forks_count,
                    summary: r.description || 'Synced directly from github.com/mohamedsalahi.',
                    proofMetric: `${r.language || 'Source'} · Live synced`,
                    architectureNote: 'Synced dynamically via GitHub REST API.',
                    stack: [r.language || 'Systems'],
                    schematic: 'verrev-mesh',
                    codeExcerpt: `git clone ${r.html_url}.git`,
                    highlights: [
                      { label: 'Language', value: r.language || 'Multi' },
                      { label: 'Updated', value: r.updated_at.slice(0, 10) },
                    ],
                  });
                }
              }
              return merged;
            });
          }
        }

        if (eventsRes.ok) {
          const evList = (await eventsRes.json()) as RemoteEvent[];
          if (Array.isArray(evList) && evList.length > 0) {
            const mapped: GitHubActivityItem[] = evList.slice(0, 8).map((ev) => {
              const rawRepo = ev.repo?.name ?? 'mohamedsalahi/sifr';
              const shortRepo = rawRepo.includes('/') ? rawRepo.split('/')[1] : rawRepo;
              return {
                id: ev.id,
                type: ev.type,
                repo: shortRepo,
                createdAt: ev.created_at,
                actionLabel: describeEvent(ev.type, shortRepo),
              };
            });
            setActivity(mapped);
          }
        }

        setSyncSource('live');
        setLastSyncedAt(new Date().toISOString());
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
