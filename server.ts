import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_ACTIVITY,
  INITIAL_PROFILE,
  REPOSITORIES,
  findRepoByIdOrAlias,
  type GitHubActivityItem,
  type GitHubProfileSnapshot,
  type RepoSpec,
} from './src/data/repos.ts';
import { SIFR_GITHUB_OWNER, resolveCanonicalRepoId } from './src/lib/identity.ts';
import { injectOgMetaIntoHtml, resolveSceneMetadata } from './src/lib/ogMeta.ts';
import {
  generateDispatchReceiptId,
  SIFR_DIRECT_EMAIL,
  validateSignalPayload,
  type SignalPayload,
  type SignalTopic,
} from './src/lib/signal.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const CACHE_TTL_MS = 15 * 60 * 1000;
const COOLDOWN_MS = 10 * 60 * 1000;

interface OverviewCacheEntry {
  expiresAt: number;
  source: 'live' | 'snapshot';
  profile: GitHubProfileSnapshot;
  repos: RepoSpec[];
  activity: GitHubActivityItem[];
  lastSyncedAt: string;
}

interface RepoDetailCacheEntry {
  expiresAt: number;
  commit: { sha: string; message: string; date: string; author: string } | null;
  commitDates: string[];
  rawReadme: string | null;
}

let overviewCache: OverviewCacheEntry | null = null;
const repoDetailCache = new Map<string, RepoDetailCacheEntry>();
let githubRateLimitUntil = 0;

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'SIFR-Portfolio-Showcase',
  };
  if (process.env.GITHUB_TOKEN?.trim()) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
  }
  return headers;
}

function describeEvent(type: string, repoShort: string): string {
  switch (type) {
    case 'PushEvent':
      return `Committed & pushed updates to ${repoShort}`;
    case 'PullRequestEvent':
      return `Merged pull request in ${repoShort}`;
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

async function fetchOverviewPayload(): Promise<OverviewCacheEntry> {
  const now = Date.now();
  if (overviewCache && overviewCache.expiresAt > now) {
    return overviewCache;
  }

  const fallback: OverviewCacheEntry = {
    expiresAt: now + CACHE_TTL_MS,
    source: 'snapshot',
    profile: INITIAL_PROFILE,
    repos: REPOSITORIES,
    activity: INITIAL_ACTIVITY,
    lastSyncedAt: new Date().toISOString(),
  };

  if (githubRateLimitUntil > now) {
    overviewCache = { ...fallback, expiresAt: githubRateLimitUntil };
    return overviewCache;
  }

  try {
    const headers = githubHeaders();
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${SIFR_GITHUB_OWNER}`, { headers }),
      fetch(`https://api.github.com/users/${SIFR_GITHUB_OWNER}/repos?per_page=100&sort=pushed`, { headers }),
      fetch(`https://api.github.com/users/${SIFR_GITHUB_OWNER}/events/public?per_page=20`, { headers }),
    ]);

    if (
      userRes.status === 403 ||
      userRes.status === 429 ||
      reposRes.status === 403 ||
      reposRes.status === 429
    ) {
      githubRateLimitUntil = now + COOLDOWN_MS;
      overviewCache = { ...fallback, expiresAt: githubRateLimitUntil };
      return overviewCache;
    }

    let profile = INITIAL_PROFILE;
    let repos = [...REPOSITORIES];
    let activity = [...INITIAL_ACTIVITY];
    let gotLive = false;

    if (userRes.ok) {
      gotLive = true;
      const u = (await userRes.json()) as Record<string, unknown>;
      profile = {
        ...INITIAL_PROFILE,
        login: typeof u.login === 'string' && u.login ? u.login : INITIAL_PROFILE.login,
        name: typeof u.name === 'string' && u.name ? u.name : INITIAL_PROFILE.name,
        bio: typeof u.bio === 'string' && u.bio ? u.bio : INITIAL_PROFILE.bio,
        company: typeof u.company === 'string' && u.company ? u.company : INITIAL_PROFILE.company,
        blog: typeof u.blog === 'string' && u.blog ? u.blog : INITIAL_PROFILE.blog,
        htmlUrl: typeof u.html_url === 'string' && u.html_url ? u.html_url : INITIAL_PROFILE.htmlUrl,
        publicRepos: typeof u.public_repos === 'number' ? u.public_repos : INITIAL_PROFILE.publicRepos,
        followers: typeof u.followers === 'number' ? u.followers : INITIAL_PROFILE.followers,
        following: typeof u.following === 'number' ? u.following : INITIAL_PROFILE.following,
      };
    }

    if (reposRes.ok) {
      gotLive = true;
      const remoteList = (await reposRes.json()) as Array<{
        name: string;
        description: string | null;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        updated_at: string;
        pushed_at?: string | null;
        created_at?: string | null;
        html_url: string;
      }>;
      if (Array.isArray(remoteList) && remoteList.length > 0) {
        const byName = new Map(remoteList.map((r) => [r.name.toLowerCase(), r]));
        repos = REPOSITORIES.map((local) => {
          const remote = byName.get(local.name.toLowerCase());
          if (!remote) return local;
          const latestTs =
            remote.pushed_at && remote.pushed_at > remote.updated_at
              ? remote.pushed_at
              : remote.updated_at;
          return {
            ...local,
            stars: remote.stargazers_count ?? local.stars,
            forks: remote.forks_count ?? local.forks,
            primaryLanguage: remote.language || local.primaryLanguage,
            updatedAt: latestTs || local.updatedAt,
            createdAt: remote.created_at || local.createdAt,
            htmlUrl: remote.html_url || local.htmlUrl,
          };
        });
      }
    }

    if (eventsRes.ok) {
      gotLive = true;
      const evList = (await eventsRes.json()) as Array<{
        id: string;
        type: string;
        created_at: string;
        repo?: { name?: string };
      }>;
      if (Array.isArray(evList) && evList.length > 0) {
        activity = evList.slice(0, 8).map((ev) => {
          const rawRepo = ev.repo?.name ?? `${SIFR_GITHUB_OWNER}/SIFR`;
          const shortRepo = rawRepo.includes('/') ? rawRepo.split('/')[1] : rawRepo;
          return {
            id: ev.id,
            type: ev.type,
            repo: shortRepo,
            createdAt: ev.created_at,
            actionLabel: describeEvent(ev.type, shortRepo),
          };
        });
      }
    }

    overviewCache = {
      expiresAt: now + CACHE_TTL_MS,
      source: gotLive ? 'live' : 'snapshot',
      profile,
      repos,
      activity,
      lastSyncedAt: new Date().toISOString(),
    };
    return overviewCache;
  } catch {
    overviewCache = { ...fallback, expiresAt: now + COOLDOWN_MS };
    return overviewCache;
  }
}

async function fetchRawReadmeFallback(canonicalName: string, preferredBranch?: 'main' | 'master'): Promise<string | null> {
  const branches: Array<'main' | 'master'> =
    preferredBranch === 'master' ? ['master', 'main'] : ['main', 'master'];
  for (const branch of branches) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${SIFR_GITHUB_OWNER}/${encodeURIComponent(canonicalName)}/${branch}/README.md`,
        { headers: { 'User-Agent': 'SIFR-Portfolio-Showcase' } }
      );
      if (res.ok) {
        const text = await res.text();
        if (text.trim().length > 0) return text;
      }
    } catch {
      // Try next branch
    }
  }
  return null;
}

async function fetchRepoDetailPayload(repoName: string): Promise<RepoDetailCacheEntry> {
  const cleanRaw = repoName.replace(/[^A-Za-z0-9._-]/g, '');
  const matchedRepo = findRepoByIdOrAlias(cleanRaw);
  const canonicalName = matchedRepo?.name ?? resolveCanonicalRepoId(cleanRaw);
  const key = canonicalName.toLowerCase();
  const now = Date.now();
  const existing = repoDetailCache.get(key);
  if (existing && existing.expiresAt > now) {
    return existing;
  }

  const emptyEntry: RepoDetailCacheEntry = {
    expiresAt: now + CACHE_TTL_MS,
    commit: null,
    commitDates: [],
    rawReadme: null,
  };

  if (!canonicalName) {
    repoDetailCache.set(key, { ...emptyEntry, expiresAt: now + 60_000 });
    return emptyEntry;
  }

  if (githubRateLimitUntil > now) {
    const rawReadme = await fetchRawReadmeFallback(canonicalName, matchedRepo?.defaultBranch);
    const fallbackEntry: RepoDetailCacheEntry = {
      ...emptyEntry,
      rawReadme,
      expiresAt: Math.max(now + 120_000, githubRateLimitUntil),
    };
    repoDetailCache.set(key, fallbackEntry);
    return fallbackEntry;
  }

  try {
    const headers = githubHeaders();
    const [commitRes, contentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${SIFR_GITHUB_OWNER}/${encodeURIComponent(canonicalName)}/commits?per_page=100`, { headers }),
      fetch(`https://api.github.com/repos/${SIFR_GITHUB_OWNER}/${encodeURIComponent(canonicalName)}/contents`, { headers }),
    ]);

    if (
      commitRes.status === 403 ||
      commitRes.status === 429 ||
      contentsRes.status === 403 ||
      contentsRes.status === 429
    ) {
      githubRateLimitUntil = now + COOLDOWN_MS;
      const rawReadme = await fetchRawReadmeFallback(canonicalName, matchedRepo?.defaultBranch);
      const cooled: RepoDetailCacheEntry = { ...emptyEntry, rawReadme, expiresAt: githubRateLimitUntil };
      repoDetailCache.set(key, cooled);
      return cooled;
    }

    let commit: RepoDetailCacheEntry['commit'] = null;
    const commitDates: string[] = [];
    let rawReadme: string | null = null;

    if (commitRes.ok) {
      const commits = (await commitRes.json()) as Array<{
        sha?: string;
        commit?: {
          message?: string;
          author?: { name?: string; date?: string };
          committer?: { date?: string };
        };
      }>;
      if (Array.isArray(commits)) {
        for (const item of commits) {
          const dt = item.commit?.author?.date ?? item.commit?.committer?.date;
          if (dt) commitDates.push(dt);
        }
        const top = commits[0];
        if (top?.sha) {
          commit = {
            sha: top.sha.slice(0, 7),
            message: (top.commit?.message ?? 'Updated repository').split('\n')[0].trim(),
            date: top.commit?.author?.date ?? '',
            author: top.commit?.author?.name ?? SIFR_GITHUB_OWNER,
          };
        }
      }
    }

    if (contentsRes.ok) {
      const items = (await contentsRes.json()) as Array<{
        name?: string;
        download_url?: string | null;
      }>;
      const readmeEntry = Array.isArray(items)
        ? items.find((item) => /^readme(\.md)?$/i.test(item.name ?? '') && item.download_url)
        : undefined;
      if (readmeEntry?.download_url) {
        const rawRes = await fetch(readmeEntry.download_url, { headers: { 'User-Agent': 'SIFR-Portfolio-Showcase' } });
        if (rawRes.ok) {
          const text = await rawRes.text();
          if (text.trim().length > 0) {
            rawReadme = text;
          }
        }
      }
    }

    if (!rawReadme) {
      rawReadme = await fetchRawReadmeFallback(canonicalName, matchedRepo?.defaultBranch);
    }

    const entry: RepoDetailCacheEntry = {
      expiresAt: now + CACHE_TTL_MS,
      commit,
      commitDates,
      rawReadme,
    };
    repoDetailCache.set(key, entry);
    return entry;
  } catch {
    const rawReadme = await fetchRawReadmeFallback(canonicalName, matchedRepo?.defaultBranch).catch(() => null);
    const cooled: RepoDetailCacheEntry = { ...emptyEntry, rawReadme, expiresAt: now + 60_000 };
    repoDetailCache.set(key, cooled);
    return cooled;
  }
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/github/overview', async (_req, res) => {
    const data = await fetchOverviewPayload();
    res.json({
      source: data.source,
      profile: data.profile,
      repos: data.repos,
      activity: data.activity,
      lastSyncedAt: data.lastSyncedAt,
    });
  });

  app.get('/api/github/repo/:name', async (req, res) => {
    const detail = await fetchRepoDetailPayload(req.params.name);
    res.json({
      commit: detail.commit,
      commitDates: detail.commitDates,
      rawReadme: detail.rawReadme,
      cached: true,
    });
  });

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  app.get('/api/signal/status', (_req, res) => {
    res.json({
      resendConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    });
  });

  app.post('/api/signal', async (req, res) => {
    const body = (req.body ?? {}) as Partial<SignalPayload>;
    const payload: SignalPayload = {
      senderName: typeof body.senderName === 'string' ? body.senderName : '',
      senderEmail: typeof body.senderEmail === 'string' ? body.senderEmail : '',
      topic: (typeof body.topic === 'string'
        ? body.topic
        : 'Systems & Kernel Architecture') as SignalTopic,
      message: typeof body.message === 'string' ? body.message : '',
    };

    const validation = validateSignalPayload(payload);
    if (!validation.valid) {
      res.status(400).json({ ok: false, error: validation.error });
      return;
    }

    const id = generateDispatchReceiptId(payload);
    const timestamp = new Date().toISOString().slice(11, 19) + ' UTC';
    let deliveredVia: 'resend' | 'ledger' = 'ledger';

    const cleanName = payload.senderName.trim();
    const cleanEmail = payload.senderEmail.trim();
    const cleanTopic = payload.topic.trim();
    const cleanMessage = payload.message.trim();

    try {
      const resendKey = process.env.RESEND_API_KEY?.trim();
      if (resendKey) {
        const htmlBody = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px;background:#04060b;color:#f3f7fe;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:600px;margin:0 auto;border:1px solid #2d3038;background:#0a0d13;padding:28px;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.14em;color:#eab444;text-transform:uppercase;margin-bottom:8px;">
        SIFR · DIRECT SIGNAL DISPATCH
      </div>
      <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#f3f7fe;">
        ${escapeHtml(cleanTopic)}
      </h1>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #2d3038;color:#a6acb9;width:120px;">Receipt</td>
          <td style="padding:8px 0;border-bottom:1px solid #2d3038;color:#eab444;font-family:monospace;">${escapeHtml(id)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #2d3038;color:#a6acb9;">Sender</td>
          <td style="padding:8px 0;border-bottom:1px solid #2d3038;color:#f3f7fe;">${escapeHtml(cleanName)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #2d3038;color:#a6acb9;">Return Email</td>
          <td style="padding:8px 0;border-bottom:1px solid #2d3038;color:#f3f7fe;">${escapeHtml(cleanEmail)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #2d3038;color:#a6acb9;">Timestamp</td>
          <td style="padding:8px 0;border-bottom:1px solid #2d3038;color:#e4e8f1;font-family:monospace;">${escapeHtml(timestamp)}</td>
        </tr>
      </table>
      <div style="padding:16px;background:#04060b;border:1px solid #2d3038;font-size:14px;line-height:1.65;color:#e4e8f1;white-space:pre-wrap;">${escapeHtml(cleanMessage)}</div>
    </div>
  </body>
</html>`.trim();

        const mailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'SIFR Signal <onboarding@resend.dev>',
            to: [process.env.SIGNAL_TO_EMAIL?.trim() || SIFR_DIRECT_EMAIL],
            reply_to: cleanEmail,
            subject: `[SIFR Signal ${id}] ${cleanTopic} - ${cleanName}`,
            text: `Receipt: ${id}\nTimestamp: ${timestamp}\nFrom: ${cleanName} <${cleanEmail}>\nScope: ${cleanTopic}\n\n${cleanMessage}`,
            html: htmlBody,
          }),
        });
        if (mailRes.ok) deliveredVia = 'resend';
      }
    } catch {
      // Fallback to verified server ledger recording
    }

    try {
      const ledgerDir = path.join(__dirname, '.data');
      fs.mkdirSync(ledgerDir, { recursive: true });
      fs.appendFileSync(
        path.join(ledgerDir, 'signals.jsonl'),
        JSON.stringify({ id, timestamp, deliveredVia, ...payload }) + '\n',
        'utf8'
      );
    } catch {
      // Ignore read-only filesystem containers
    }

    res.json({ ok: true, id, timestamp, deliveredVia });
  });

  if (!IS_PROD) {
    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: hmrDisabled ? false : { server: httpServer },
        ws: { server: httpServer },
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const templatePath = path.resolve(__dirname, 'index.html');
        let html = fs.readFileSync(templatePath, 'utf-8');
        const sceneParam = typeof req.query.scene === 'string' ? req.query.scene : undefined;
        html = injectOgMetaIntoHtml(html, resolveSceneMetadata(sceneParam));
        const transformed = await vite.transformIndexHtml(url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const distHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    app.use(express.static(distDir, { index: false }));

    app.use('*', (req, res) => {
      const sceneParam = typeof req.query.scene === 'string' ? req.query.scene : undefined;
      const html = injectOgMetaIntoHtml(distHtml, resolveSceneMetadata(sceneParam));
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`SIFR exhibition server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
