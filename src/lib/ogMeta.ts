import { findRepoByIdOrAlias, REPOSITORIES } from '../data/repos.ts';
import { REPO_STORIES } from '../data/stories.ts';

export interface SceneMetadata {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  matchedRepoId: string | null;
}

const DEFAULT_META: SceneMetadata = {
  title: 'SIFR | Built From Zero | Mohamed Salahy',
  description:
    'Systems, machine learning GPU kernel, and native Linux graphics portfolio of Mohamed Salahy (Sifr-Dev). Twenty public repositories built from first principles.',
  ogTitle: 'SIFR | Built From Zero | Mohamed Salahy',
  ogDescription:
    'Systems, machine learning GPU kernels, and native Linux graphics portfolio of Mohamed Salahy (Sifr-Dev).',
  canonicalUrl: 'https://sifr-dev.vercel.app/',
  matchedRepoId: null,
};

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function resolveSceneMetadata(sceneParam: string | null | undefined): SceneMetadata {
  const clean = sceneParam?.trim();
  if (!clean) return DEFAULT_META;

  const repo =
    findRepoByIdOrAlias(clean) ??
    REPOSITORIES.find(
      (r) =>
        r.id.toLowerCase() === clean.toLowerCase() || r.name.toLowerCase() === clean.toLowerCase()
    );
  if (!repo) return DEFAULT_META;

  const story = REPO_STORIES[repo.id];
  const chapterPrefix = story ? `Part ${story.stationNumber}` : repo.categoryLabel;
  const title = `${repo.name} · ${chapterPrefix} | SIFR · Mohamed Salahy`;
  const description = story
    ? `${story.chapterTitle}: ${repo.proofMetric}. ${story.openingHook}`
    : `${repo.subtitle}: ${repo.summary}`;

  const rawHeading = story ? story.chapterTitle : repo.subtitle;
  const ogTitle = rawHeading.toLowerCase().startsWith(repo.name.toLowerCase())
    ? rawHeading
    : `${repo.name}: ${rawHeading}`;

  return {
    title,
    description,
    ogTitle,
    ogDescription: description,
    canonicalUrl: `https://sifr-dev.vercel.app/?scene=${encodeURIComponent(repo.id)}`,
    matchedRepoId: repo.id,
  };
}

export function injectOgMetaIntoHtml(html: string, meta: SceneMetadata): string {
  if (!meta.matchedRepoId) return html;
  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeOgTitle = escapeHtmlAttr(meta.ogTitle);
  const safeOgDesc = escapeHtmlAttr(meta.ogDescription);
  const safeUrl = escapeHtmlAttr(meta.canonicalUrl);

  return html
    .replace(/<title>[^<]*<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${safeUrl}" />`
    )
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${safeUrl}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${safeOgTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${safeOgDesc}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${safeOgTitle}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${safeOgDesc}" />`
    );
}
