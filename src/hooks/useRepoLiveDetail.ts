import { useEffect, useState } from 'react';

export interface LiveRepoCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export interface LiveRepoDetail {
  commit: LiveRepoCommit | null;
  rawReadme: string | null;
  status: 'idle' | 'loading' | 'ready';
}

const detailCache = new Map<string, LiveRepoDetail>();

export function useRepoLiveDetail(repoName: string, owner = 'mohamedsalahi'): LiveRepoDetail {
  const cacheKey = `${owner}/${repoName}`.toLowerCase();
  const [detail, setDetail] = useState<LiveRepoDetail>(
    () =>
      detailCache.get(cacheKey) ?? {
        commit: null,
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

    setDetail({ commit: null, rawReadme: null, status: 'loading' });

    async function fetchDetail() {
      let commit: LiveRepoCommit | null = null;
      let rawReadme: string | null = null;

      try {
        const res = await fetch(`/api/github/repo/${encodeURIComponent(repoName)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as {
            commit?: LiveRepoCommit | null;
            rawReadme?: string | null;
          };
          commit = data.commit ?? null;
          rawReadme = data.rawReadme ?? null;
        }
      } catch {
        // Offline or server unavailable — retain null cleanly and show curated Editorial Blueprint
      }

      if (cancelled) return;
      const resolved: LiveRepoDetail = {
        commit,
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
