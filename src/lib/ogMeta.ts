import { REPOSITORIES } from '../data/repos.ts';
import { REPO_STORIES } from '../data/stories.ts';

export interface SceneMetadata {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  matchedRepoId: string | null;
}

const DEFAULT_META: SceneMetadata = {
  title: 'SIFR — Built From Zero | Mohamed Salahi',
  description:
    'Systems, machine learning, and native graphics portfolio of Mohamed Salahi (SIFR). 12 public repositories, live interactive engineering labs, and 2D polar cipher physics.',
  ogTitle: 'SIFR — Built From Zero | Mohamed Salahi',
  ogDescription: 'Systems, machine learning, and native graphics portfolio of Mohamed Salahi (SIFR).',
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
  const clean = sceneParam?.trim().toLowerCase();
  if (!clean) return DEFAULT_META;

  const repo = REPOSITORIES.find((r) => r.id.toLowerCase() === clean || r.name.toLowerCase() === clean);
  if (!repo) return DEFAULT_META;

  const story = REPO_STORIES[repo.id];
  const chapterPrefix = story ? `Chapter ${story.stationNumber}` : repo.categoryLabel;
  const title = `${repo.name} · ${chapterPrefix} | SIFR — Mohamed Salahi`;
  const description = story
    ? `${story.chapterTitle} — ${repo.proofMetric}. ${story.openingHook}`
    : `${repo.subtitle} — ${repo.summary}`;

  return {
    title,
    description,
    ogTitle: `${repo.name} — ${story ? story.chapterTitle : repo.subtitle}`,
    ogDescription: description,
    matchedRepoId: repo.id,
  };
}

export function injectOgMetaIntoHtml(html: string, meta: SceneMetadata): string {
  if (!meta.matchedRepoId) return html;
  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeOgTitle = escapeHtmlAttr(meta.ogTitle);
  const safeOgDesc = escapeHtmlAttr(meta.ogDescription);

  return html
    .replace(/<title>[^<]*<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${safeOgTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${safeOgDesc}" />`
    );
}
