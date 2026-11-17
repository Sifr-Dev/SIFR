import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Compass,
  FileText,
  Layers,
  Play,
  Terminal,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  GitHubActivityItem,
  GitHubProfileSnapshot,
  RepoCategory,
  RepoSpec,
} from '../data/repos';
import type { GitHubAggregateStats } from '../lib/githubStats';
import { formatRelativeDate } from '../lib/githubStats';
import type { SyncSource } from '../hooks/useGitHubTelemetry';
import { haptics } from '../lib/haptics';
import { SifrMark } from './SifrMark';
import { PhysicsCipherCanvas } from './PhysicsCipherCanvas';
import { ProjectPhysicsIllustration } from './ProjectPhysicsIllustration';
import { InteractiveRepoDemo } from './InteractiveDemos';

type MobileTab = 'disk' | 'works' | 'lab' | 'dossier';

interface MobileShellProps {
  profile: GitHubProfileSnapshot;
  repos: RepoSpec[];
  activity: GitHubActivityItem[];
  stats: GitHubAggregateStats;
  syncSource: SyncSource;
  shift: number;
  onShiftChange: (s: number) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenShowreel: () => void;
}

export function MobileShell({
  profile,
  repos,
  activity,
  stats,
  syncSource,
  shift,
  onShiftChange,
  audioEnabled,
  onToggleAudio,
  onOpenShowreel,
}: MobileShellProps) {
  const [tab, setTab] = useState<MobileTab>('disk');
  const [filter, setFilter] = useState<'all' | RepoCategory>('all');
  const [labRepoId, setLabRepoId] = useState<string>('tachyon-fetch');
  const [sheetRepo, setSheetRepo] = useState<RepoSpec | null>(null);

  const filteredRepos =
    filter === 'all' ? repos : repos.filter((r) => r.category === filter);

  const activeLabRepo = repos.find((r) => r.id === labRepoId) ?? repos[0];

  useEffect(() => {
    if (!sheetRepo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetRepo(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetRepo]);

  const tabTitles: Record<MobileTab, string> = {
    disk: 'SIFR · Cipher',
    works: `Works (${filteredRepos.length})`,
    lab: `Lab · ${activeLabRepo.name}`,
    dossier: 'Dossier',
  };

  return (
    <div className="min-h-screen bg-[#04060b] text-[#f3f7fe] flex flex-col">
      {/* Compact Sticky Mobile App Bar (52px) */}
      <header className="sticky top-0 z-30 h-[52px] px-4 bg-[#04060b]/95 backdrop-blur-xs border-b border-[#2d3038] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <SifrMark size={22} shift={shift} />
          <span className="font-mobilis text-xs font-bold tracking-[0.08em] uppercase text-[#f3f7fe] truncate">
            {tabTitles[tab]}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleAudio}
          aria-label={audioEnabled ? 'Mute haptic audio' : 'Enable haptic audio'}
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center border transition-colors ${
            audioEnabled
              ? 'border-[#eab444] text-[#eab444] bg-[#171b21]'
              : 'border-[#2d3038] text-[#9498a1] bg-[#0a0d13]'
          }`}
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4" aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </header>

      {/* Main Scrollable Thumb-Ergonomic Viewport */}
      <main className="flex-1 px-4 pt-4 pb-20">
        {tab === 'disk' && (
          <section className="space-y-4">
            <div className="space-y-1.5">
              <div className="font-mobilis text-[11px] uppercase tracking-[0.14em] text-[#9498a1]">
                SIFR · صفر · Mohamed Salahi
              </div>
              <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#f3f7fe]">
                built from <span className="text-[#eab444]">zero.</span>
              </h1>
              <p className="text-sm text-[#b9bec7] leading-snug">
                Touch &amp; spin the 24-cell cipher dial. Feel each 15° detent.
              </p>
            </div>

            <PhysicsCipherCanvas
              shift={shift}
              onShiftChange={onShiftChange}
              compact
            />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('confirm');
                  setTab('works');
                }}
                className="min-h-[48px] bg-[#eab444] text-[#04060b] font-mobilis text-xs font-bold uppercase tracking-wider px-4"
              >
                Swipe 11 Works
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  onOpenShowreel();
                }}
                className="min-h-[48px] border border-[#2d3038] bg-[#0a0d13] text-[#f3f7fe] font-mobilis text-xs uppercase tracking-wider px-4 inline-flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                Motion Reel
              </button>
            </div>
          </section>
        )}

        {tab === 'works' && (
          <section className="space-y-4">
            {/* Horizontal Thumb Filter Strip */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {(
                [
                  { key: 'all', label: `All ${stats.categoryCounts.all}` },
                  { key: 'systems', label: `Systems ${stats.categoryCounts.systems}` },
                  { key: 'ml', label: `ML ${stats.categoryCounts.ml}` },
                  { key: 'infra', label: `Infra ${stats.categoryCounts.infra}` },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    haptics.trigger('detent');
                    setFilter(item.key);
                  }}
                  className={`min-h-[44px] px-3.5 font-mobilis text-xs border whitespace-nowrap shrink-0 ${
                    filter === item.key
                      ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                      : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Horizontal Swipeable Native Project Deck */}
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2">
              {filteredRepos.map((repo) => (
                <article
                  key={repo.id}
                  className="w-[86vw] max-w-[340px] shrink-0 snap-center border border-[#2d3038] bg-[#0a0d13] chamfer flex flex-col justify-between"
                >
                  <div>
                    <ProjectPhysicsIllustration schematic={repo.schematic} heightClass="h-36" />
                    <div className="p-4 space-y-2">
                      <div className="font-mobilis text-[11px] text-[#9498a1] flex items-center gap-2">
                        <span className="text-[#eab444]">{repo.primaryLanguage}</span>
                        <span aria-hidden="true">·</span>
                        <span>{repo.categoryLabel}</span>
                      </div>
                      <h2 className="text-lg font-bold text-[#f3f7fe]">{repo.name}</h2>
                      <p className="text-xs text-[#b9bec7] leading-relaxed line-clamp-3">
                        {repo.summary}
                      </p>
                      <div className="font-mobilis text-[11px] text-[#eab444]">
                        {repo.proofMetric}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        haptics.trigger('confirm');
                        setSheetRepo(repo);
                      }}
                      className="w-full min-h-[44px] bg-[#171b21] border border-[#2d3038] active:border-[#eab444] font-mobilis text-xs font-bold uppercase tracking-wider text-[#f3f7fe]"
                    >
                      Inspect &amp; Run Demo
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Rapid Tap List for All Filtered Repos */}
            <div className="border border-[#2d3038] bg-[#0a0d13] divide-y divide-[#2d3038]">
              {filteredRepos.map((repo) => (
                <button
                  key={`row-${repo.id}`}
                  type="button"
                  onClick={() => {
                    haptics.trigger('tap');
                    setSheetRepo(repo);
                  }}
                  className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-[#171b21]"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#f3f7fe] truncate">{repo.name}</div>
                    <div className="font-mobilis text-[11px] text-[#9498a1] truncate">
                      {repo.primaryLanguage} · {repo.proofMetric}
                    </div>
                  </div>
                  <span className="font-mobilis text-xs text-[#eab444] shrink-0">Open</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === 'lab' && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {repos.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    haptics.trigger('detent');
                    setLabRepoId(r.id);
                  }}
                  className={`min-h-[44px] px-3 font-mobilis text-xs border whitespace-nowrap shrink-0 ${
                    r.id === activeLabRepo.id
                      ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                      : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            <div className="border border-[#2d3038] bg-[#0a0d13] p-4 space-y-4">
              <div>
                <div className="font-mobilis text-[11px] text-[#eab444]">
                  {activeLabRepo.primaryLanguage} · {activeLabRepo.proofMetric}
                </div>
                <h2 className="text-lg font-bold text-[#f3f7fe] mt-1">
                  {activeLabRepo.subtitle}
                </h2>
              </div>
              <InteractiveRepoDemo repo={activeLabRepo} />
            </div>
          </section>
        )}

        {tab === 'dossier' && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-[#2d3038] bg-[#0a0d13] p-4">
                <div className="font-mobilis text-[11px] uppercase text-[#9498a1]">Repos</div>
                <div className="font-mobilis text-2xl font-bold text-[#f3f7fe] mt-1">
                  {profile.publicRepos}
                </div>
              </div>
              <div className="border border-[#2d3038] bg-[#0a0d13] p-4">
                <div className="font-mobilis text-[11px] uppercase text-[#9498a1]">Codebase</div>
                <div className="font-mobilis text-2xl font-bold text-[#eab444] mt-1">
                  {stats.totalKilobytes} KB
                </div>
              </div>
            </div>

            <div className="border border-[#2d3038] bg-[#0a0d13] p-4 space-y-3">
              <div className="flex items-center justify-between font-mobilis text-xs text-[#9498a1]">
                <span>Language Footprint</span>
                <span>{syncSource === 'live' ? 'Live REST' : 'Verified'}</span>
              </div>
              {stats.languageShares.slice(0, 5).map((l, idx) => (
                <div key={l.language} className="space-y-1">
                  <div className="flex justify-between font-mobilis text-xs">
                    <span className={idx === 0 ? 'text-[#eab444]' : 'text-[#f3f7fe]'}>
                      {l.language}
                    </span>
                    <span className="text-[#9498a1]">{l.percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#171b21]">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.max(4, l.percent)}%`,
                        backgroundColor: idx === 0 ? '#eab444' : '#f3f7fe',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-[#2d3038] bg-[#0a0d13] divide-y divide-[#2d3038]">
              {activity.slice(0, 4).map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    haptics.trigger('tap');
                    const match = repos.find((r) => r.name.toLowerCase() === ev.repo.toLowerCase());
                    if (match) setSheetRepo(match);
                  }}
                  className="w-full min-h-[54px] px-4 py-3 text-left flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-mobilis text-xs font-bold text-[#eab444] truncate">
                      {ev.repo}
                    </div>
                    <div className="text-xs text-[#b9bec7] truncate">{ev.actionLabel}</div>
                  </div>
                  <span className="font-mobilis text-[11px] text-[#9498a1] shrink-0">
                    {formatRelativeDate(ev.createdAt)}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="/brand/sifr-cv.pdf"
                target="_blank"
                rel="noreferrer"
                className="min-h-[48px] border border-[#2d3038] bg-[#0a0d13] font-mobilis text-xs text-[#f3f7fe] inline-flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#eab444]" aria-hidden="true" />
                CV PDF
              </a>
              <a
                href={profile.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="min-h-[48px] bg-[#eab444] text-[#04060b] font-mobilis text-xs font-bold inline-flex items-center justify-center gap-1.5"
              >
                GitHub <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </section>
        )}
      </main>

      {/* Fixed Bottom Thumb-Zone Navigation Dock (60px) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-[#04060b]/95 backdrop-blur-md border-t border-[#2d3038] grid grid-cols-4"
      >
        {(
          [
            { key: 'disk', label: 'Disk', Icon: Compass },
            { key: 'works', label: 'Works', Icon: Layers },
            { key: 'lab', label: 'Lab', Icon: Terminal },
            { key: 'dossier', label: 'Dossier', Icon: FileText },
          ] as const
        ).map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                haptics.trigger('detent');
                setTab(key);
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 relative ${
                active ? 'text-[#eab444]' : 'text-[#9498a1]'
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-4 right-4 h-[2px] bg-[#eab444]"
                />
              )}
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="font-mobilis text-[10px] uppercase tracking-wider">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Native Mobile Bottom Sheet for Inspecting Any Repo */}
      {sheetRepo && (
        <div
          className="fixed inset-0 z-50 bg-[#04060b]/80 backdrop-blur-xs flex items-end"
          role="dialog"
          aria-modal="true"
          aria-label={`${sheetRepo.name} details`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              haptics.trigger('tap');
              setSheetRepo(null);
            }
          }}
        >
          <div className="w-full max-h-[86vh] bg-[#0a0d13] border-t border-[#eab444] flex flex-col overflow-hidden">
            <div className="pt-2.5 pb-3 px-4 border-b border-[#2d3038] flex items-center justify-between">
              <div className="min-w-0">
                <div className="w-10 h-1 bg-[#2d3038] mb-2" aria-hidden="true" />
                <div className="font-mobilis text-[11px] text-[#eab444]">
                  {sheetRepo.primaryLanguage} · {sheetRepo.categoryLabel}
                </div>
                <h2 className="text-lg font-bold text-[#f3f7fe] truncate">{sheetRepo.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  setSheetRepo(null);
                }}
                aria-label="Close project sheet"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#2d3038] bg-[#171b21] text-[#f3f7fe]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              <ProjectPhysicsIllustration schematic={sheetRepo.schematic} heightClass="h-32" />
              <p className="text-xs text-[#b9bec7] leading-relaxed">{sheetRepo.summary}</p>
              <div className="border border-[#2d3038] bg-[#04060b] p-3">
                <InteractiveRepoDemo repo={sheetRepo} />
              </div>
            </div>

            <div className="p-4 border-t border-[#2d3038] bg-[#04060b]">
              <a
                href={sheetRepo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[48px] bg-[#eab444] text-[#04060b] font-mobilis text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                View Source on GitHub <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
