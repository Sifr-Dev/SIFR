import { useEffect, useState } from 'react';

export interface LiveRepoCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export interface LiveRepoDetail {
  commit: LiveRepoCommit | null;
  commitDates: string[];
  rawReadme: string | null;
  status: 'idle' | 'loading' | 'ready';
}

const detailCache = new Map<string, LiveRepoDetail>();

export function useRepoLiveDetail(repoName: string, owner = 'sifr-salahy'): LiveRepoDetail {
  const cacheKey = `${owner}/${repoName}`.toLowerCase();
  const [detail, setDetail] = useState<LiveRepoDetail>(
    () =>
      detailCache.get(cacheKey) ?? {
        commit: null,
        commitDates: [],
        rawReadme: null,
        status: 'loading',
      }
  );

  useEffect(() => {
    const existing = detailCache.get(cacheKey);
    if (existing && existing.status === 'ready') {
      setDetail(existing);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setDetail({ commit: null, commitDates: [], rawReadme: null, status: 'loading' });

    async function fetchDetail() {
      let commit: LiveRepoCommit | null = null;
      let commitDates: string[] = [];
      let rawReadme: string | null = null;

      try {
        const res = await fetch(`/api/github/repo/${encodeURIComponent(repoName)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as {
            commit?: LiveRepoCommit | null;
            commitDates?: string[];
            rawReadme?: string | null;
          };
          commit = data.commit ?? null;
          commitDates = Array.isArray(data.commitDates) ? data.commitDates : [];
          rawReadme = data.rawReadme ?? null;
        }
      } catch {
        // Offline or server unavailable: keep empty commitDates and show curated blueprint
      }

      if (cancelled) return;
      const resolved: LiveRepoDetail = {
        commit,
        commitDates,
        rawReadme,
        status: 'ready',
      };
      detailCache.set(cacheKey, resolved);
      setDetail(resolved);
    }

    void fetchDetail();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cacheKey, repoName]);

  return detail;
}
