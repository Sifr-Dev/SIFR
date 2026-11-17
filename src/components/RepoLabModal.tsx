import { useEffect, useState } from 'react';
import { X, ArrowUpRight, Terminal, BookOpen } from 'lucide-react';
import type { RepoSpec } from '../data/repos';
import { getStoryForRepo } from '../data/stories';
import { getActForRepoId } from '../lib/narrative';
import { ProjectPhysicsIllustration } from './ProjectPhysicsIllustration';
import { InteractiveRepoDemo } from './InteractiveDemos';
import { ReadmeShowcase } from './ReadmeShowcase';
import { haptics } from '../lib/haptics';
import { formatRelativeDate } from '../lib/githubStats';

interface RepoLabModalProps {
  repo: RepoSpec | null;
  onClose: () => void;
  onSelectRepo: (repo: RepoSpec) => void;
  allRepos: RepoSpec[];
  maxUnlockedIndex?: number;
  hasExited?: boolean;
}

export function RepoLabModal({
  repo,
  onClose,
  onSelectRepo,
  allRepos,
  maxUnlockedIndex = 10,
  hasExited = true,
}: RepoLabModalProps) {
  const [viewMode, setViewMode] = useState<'demo' | 'readme'>('demo');

  useEffect(() => {
    setViewMode('demo');
  }, [repo?.id]);

  useEffect(() => {
    if (!repo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        haptics.trigger('tap');
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [repo, onClose]);

  if (!repo) return null;

  const story = getStoryForRepo(repo.id);
  const act = getActForRepoId(repo.id);
  const visitedRepos = allRepos.filter((_, idx) => hasExited || idx <= maxUnlockedIndex);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#04060b]/94 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repo-lab-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptics.trigger('tap');
          onClose();
        }
      }}
    >
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#0a0d13] border border-[#2d3038] chamfer flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[#2d3038] bg-[#04060b]">
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#9ca2af] flex items-center gap-2">
              <span className="text-[#eab444]">
                Chapter {story.stationNumber} · {act.roman}
              </span>
              <span aria-hidden="true">·</span>
              <span>{repo.primaryLanguage}</span>
              <span aria-hidden="true">·</span>
              <span>Updated {formatRelativeDate(repo.updatedAt)}</span>
            </div>
            <h2 id="repo-lab-title" className="text-xl sm:text-2xl font-bold text-[#f3f7fe] mt-1 truncate">
              {repo.name} — {story.chapterTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => haptics.trigger('tap')}
              className="min-h-[40px] px-4 py-2 bg-[#eab444] text-[#04060b] text-[13px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              Source <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => {
                haptics.trigger('tap');
                onClose();
              }}
              aria-label="Close engineering lab"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[#f3f7fe] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="border border-[#2d3038] bg-[#0a0d13] p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    haptics.trigger('detent');
                    setViewMode('demo');
                  }}
                  className={`min-h-[38px] px-3.5 py-1.5 text-[13px] font-medium border inline-flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'demo'
                      ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                      : 'border-[#2d3038] bg-[#04060b] text-[#d2d7e2]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                  Live Simulation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptics.trigger('detent');
                    setViewMode('readme');
                  }}
                  className={`min-h-[38px] px-3.5 py-1.5 text-[13px] font-medium border inline-flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'readme'
                      ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                      : 'border-[#2d3038] bg-[#04060b] text-[#d2d7e2]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  Story &amp; README.md
                </button>
              </div>
              <span className="font-mobilis text-xs text-[#9ca2af]">{repo.proofMetric}</span>
            </div>

            {viewMode === 'demo' ? (
              <InteractiveRepoDemo repo={repo} />
            ) : (
              <ReadmeShowcase repoName={repo.name} story={story} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 items-stretch">
            <div className="border border-[#2d3038] bg-[#04060b] flex flex-col">
              <ProjectPhysicsIllustration schematic={repo.schematic} heightClass="h-40" />
              <div className="p-5 space-y-3 flex-1">
                <p className="text-[15px] text-[#f3f7fe] leading-[1.6]">{story.openingHook}</p>
                <p className="text-[14px] text-[#d2d7e2] leading-[1.6]">{story.turningPoint}</p>
              </div>
            </div>

            <div className="border border-[#2d3038] bg-[#04060b] p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold text-[#9ca2af] mb-3">
                  Architecture Highlights
                </div>
                <div className="divide-y divide-[#2d3038]">
                  {repo.highlights.map((h) => (
                    <div key={h.label} className="py-2 flex items-baseline justify-between gap-3">
                      <span className="text-[13px] text-[#9ca2af]">{h.label}</span>
                      <span className="font-mobilis text-xs text-[#f3f7fe] text-right">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#9ca2af] mb-2">Stack</div>
                <div className="text-[13px] text-[#d2d7e2]">{repo.stack.join(' · ')}</div>
              </div>

              <pre className="p-3 border border-[#2d3038] bg-[#171b21] font-mobilis text-xs text-[#d2d7e2] overflow-x-auto">
                {repo.codeExcerpt}
              </pre>
            </div>
          </div>
        </div>

        {/* Bottom Switcher Bar (shows only chapters already visited — never locked buttons) */}
        {visitedRepos.length > 1 && (
          <div className="px-5 sm:px-6 py-3 border-t border-[#2d3038] bg-[#04060b] flex items-center gap-1.5 overflow-x-auto sm:overflow-visible sm:flex-wrap no-scrollbar">
            <span className="text-xs text-[#9ca2af] whitespace-nowrap shrink-0 mr-2">
              {hasExited ? 'All Chapters:' : 'Visited Chapters:'}
            </span>
            {visitedRepos.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  haptics.trigger('detent');
                  onSelectRepo(item);
                }}
                className={`min-h-[32px] px-2.5 py-1 text-xs font-medium border whitespace-nowrap shrink-0 cursor-pointer ${
                  item.id === repo.id
                    ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                    : 'border-[#2d3038] bg-[#0a0d13] text-[#d2d7e2] hover:border-[#eab444]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
