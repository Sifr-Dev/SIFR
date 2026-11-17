import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  FileText,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ZERO_DOCTRINES,
  type GitHubActivityItem,
  type GitHubProfileSnapshot,
  type RepoSpec,
} from '../data/repos';
import { getStoryForRepo } from '../data/stories';
import type { GitHubAggregateStats } from '../lib/githubStats';
import { formatRelativeDate } from '../lib/githubStats';
import {
  CANONICAL_TRACK_ORDER,
  getActForRepoId,
  getStationCode,
  type RideState,
} from '../lib/narrative';
import type { SyncSource } from '../hooks/useGitHubTelemetry';
import { haptics } from '../lib/haptics';
import { SifrMark } from './SifrMark';
import { CinematicEntrance } from './CinematicEntrance';
import { ProjectPhysicsIllustration } from './ProjectPhysicsIllustration';
import { InteractiveRepoDemo } from './InteractiveDemos';
import { ReadmeShowcase } from './ReadmeShowcase';

type MobileLens = 'story' | 'lab' | 'readme';

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
  rideState: RideState;
  onEnterRide: () => void;
  onAdvanceRide: () => void;
  onStepBackRide: () => void;
  onJumpToStation: (index: number) => void;
  onRestartRide: () => void;
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
  rideState,
  onEnterRide,
  onAdvanceRide,
  onStepBackRide,
  onJumpToStation,
  onRestartRide,
  onOpenShowreel,
}: MobileShellProps) {
  const [lens, setLens] = useState<MobileLens>('story');
  const [direction, setDirection] = useState<1 | -1>(1);

  const orderedRepos = useMemo(() => {
    const byId = new Map(repos.map((r) => [r.id, r]));
    return CANONICAL_TRACK_ORDER.map((id) => byId.get(id)).filter((r): r is RepoSpec => Boolean(r));
  }, [repos]);

  const currentRepo = orderedRepos[rideState.currentIndex] ?? orderedRepos[0];
  const currentStory = useMemo(() => getStoryForRepo(currentRepo.id), [currentRepo.id]);
  const currentAct = useMemo(() => getActForRepoId(currentRepo.id), [currentRepo.id]);
  const nextRepo =
    rideState.currentIndex < orderedRepos.length - 1
      ? orderedRepos[rideState.currentIndex + 1]
      : null;

  useEffect(() => {
    setLens('story');
    window.scrollTo(0, 0);
  }, [rideState.currentIndex, rideState.hasExited]);

  // =========================================================================
  // STAGE 1 · MOBILE GRAND ENTRANCE
  // =========================================================================
  if (!rideState.hasEntered) {
    return (
      <CinematicEntrance
        compact
        shift={shift}
        onShiftChange={onShiftChange}
        audioEnabled={audioEnabled}
        onToggleAudio={onToggleAudio}
        onEnter={() => {
          setDirection(1);
          onEnterRide();
        }}
        onOpenShowreel={onOpenShowreel}
      />
    );
  }

  // =========================================================================
  // STAGE 3 · MOBILE GRAND EXIT
  // =========================================================================
  if (rideState.hasExited) {
    return (
      <div className="min-h-screen bg-[#04060b] text-[#f3f7fe] flex flex-col">
        <header className="sticky top-0 z-30 h-[50px] px-4 bg-[#04060b]/96 border-b border-[#2d3038] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <SifrMark size={20} shift={shift} />
            <span className="text-sm font-bold text-[#f3f7fe] truncate">Grand Exit · 11/11</span>
          </div>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('snapZero');
              onRestartRide();
            }}
            className="min-h-[38px] px-3 bg-[#eab444] text-[#04060b] text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Ride Again
          </button>
        </header>

        <main className="flex-1 px-4 py-6 space-y-6">
          <div className="border border-[#eab444] bg-[#0a0d13] chamfer p-5 space-y-3">
            <p className="text-xs font-medium text-[#eab444]">Chronicle Complete · 11 / 11</p>
            <h1 className="text-2xl font-bold text-[#f3f7fe]">
              Built from zero. Verified end to end.
            </h1>
            <p className="text-[14px] text-[#d2d7e2] leading-relaxed">
              Every chapter is now unlocked for free revisit below alongside live GitHub footprint
              and manifesto synthesis.
            </p>
          </div>

          {/* Unlocked Chapter Switcher */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#f3f7fe]">Revisit Any Chapter</h2>
            <div className="border border-[#2d3038] bg-[#0a0d13] divide-y divide-[#2d3038]">
              {orderedRepos.map((repo, idx) => {
                const story = getStoryForRepo(repo.id);
                return (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => {
                      haptics.trigger('detent');
                      onJumpToStation(idx);
                    }}
                    className="w-full min-h-[54px] px-4 py-3 text-left flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#eab444] truncate">
                        {getStationCode(idx)} · {repo.name}
                      </div>
                      <div className="text-[13px] text-[#d2d7e2] truncate">
                        {story.chapterTitle}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9ca2af] shrink-0" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-[#2d3038] bg-[#0a0d13] p-4">
              <div className="text-xs text-[#9ca2af]">Public Repos</div>
              <div className="font-mobilis text-2xl font-bold text-[#f3f7fe] mt-1">
                {profile.publicRepos}
              </div>
            </div>
            <div className="border border-[#2d3038] bg-[#0a0d13] p-4">
              <div className="text-xs text-[#9ca2af]">Code Volume</div>
              <div className="font-mobilis text-2xl font-bold text-[#eab444] mt-1">
                {stats.totalKilobytes} KB
              </div>
            </div>
          </div>

          <div className="border border-[#2d3038] bg-[#0a0d13] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#9ca2af]">
              <span className="font-medium text-[#f3f7fe]">Language Footprint</span>
              <span>{syncSource === 'live' ? 'Live REST' : 'Verified'}</span>
            </div>
            {stats.languageShares.slice(0, 5).map((l, idx) => (
              <div key={l.language} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={idx === 0 ? 'text-[#eab444] font-bold' : 'text-[#f3f7fe]'}>
                    {l.language}
                  </span>
                  <span className="font-mobilis text-[#9ca2af]">{l.percent.toFixed(1)}%</span>
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
            {ZERO_DOCTRINES.map((d) => (
              <div key={d.index} className="p-4 space-y-1">
                <div className="text-sm font-bold text-[#eab444]">
                  {d.index}. {d.title}
                </div>
                <p className="text-[13px] text-[#d2d7e2] leading-relaxed">{d.body}</p>
              </div>
            ))}
          </div>

          {activity.length > 0 && (
            <div className="border border-[#2d3038] bg-[#0a0d13] divide-y divide-[#2d3038]">
              {activity.slice(0, 4).map((ev) => (
                <div key={ev.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#eab444] truncate">{ev.repo}</div>
                    <div className="text-xs text-[#d2d7e2] truncate">{ev.actionLabel}</div>
                  </div>
                  <span className="font-mobilis text-[11px] text-[#9ca2af] shrink-0">
                    {formatRelativeDate(ev.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pb-4">
            <a
              href="/brand/sifr-cv.pdf"
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] border border-[#2d3038] bg-[#0a0d13] text-xs font-medium text-[#f3f7fe] inline-flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#eab444]" aria-hidden="true" />
              CV PDF
            </a>
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] bg-[#eab444] text-[#04060b] text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              GitHub <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2 · MOBILE CINEMA RIDE (Scenes 01 -> 11)
  // Header (48px) + Bottom Cinema Deck (56px) = 104px (12.3% <= 15% cap)
  // Zero locked tabs or disabled navigation items
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#04060b] text-[#f3f7fe] flex flex-col">
      {/* Compact Sticky Mobile Cinema Header (48px) */}
      <header className="sticky top-0 z-30 bg-[#04060b]/96 border-b border-[#2d3038]">
        <div className="h-[46px] px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <SifrMark size={20} shift={shift} />
            <span className="text-[13px] font-bold text-[#f3f7fe] truncate">
              {currentAct.roman} · Chapter {getStationCode(rideState.currentIndex)}/11
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                haptics.trigger('tap');
                onOpenShowreel();
              }}
              aria-label="Open motion reel"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center border border-[#2d3038] bg-[#0a0d13] text-[#eab444]"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={audioEnabled ? 'Mute haptic audio' : 'Enable haptic audio'}
              className={`min-h-[38px] min-w-[38px] flex items-center justify-center border ${
                audioEnabled
                  ? 'border-[#eab444] text-[#eab444] bg-[#171b21]'
                  : 'border-[#2d3038] text-[#9ca2af] bg-[#0a0d13]'
              }`}
            >
              {audioEnabled ? (
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <div className="h-[2px] w-full bg-[#171b21]">
          <div
            className="h-full bg-[#eab444] transition-all duration-300"
            style={{ width: `${Math.max(9, ((rideState.currentIndex + 1) / orderedRepos.length) * 100)}%` }}
          />
        </div>
      </header>

      {/* Main Scrollable Scene Stage */}
      <main className="flex-1 px-4 pt-4 pb-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={currentRepo.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="border border-[#2d3038] bg-[#0a0d13] chamfer overflow-hidden">
              <ProjectPhysicsIllustration schematic={currentRepo.schematic} heightClass="h-32" />

              <div className="p-4 space-y-3">
                <div className="text-xs font-medium text-[#eab444] flex flex-wrap items-center gap-2">
                  <span>{currentRepo.name}</span>
                  <span aria-hidden="true" className="text-[#9ca2af]">·</span>
                  <span className="text-[#9ca2af]">{currentRepo.primaryLanguage}</span>
                  <span aria-hidden="true" className="text-[#9ca2af]">·</span>
                  <span className="text-[#9ca2af]">{formatRelativeDate(currentRepo.updatedAt)}</span>
                </div>

                <h1 className="text-2xl font-bold text-[#f3f7fe] leading-[1.15]">
                  {currentStory.chapterTitle}
                </h1>
                <p className="text-[13px] text-[#9ca2af]">{currentRepo.subtitle}</p>

                {/* In-Scene Lens Switcher */}
                <div className="grid grid-cols-3 border border-[#2d3038] bg-[#04060b] p-1 gap-1">
                  {(
                    [
                      { key: 'story', label: 'Story' },
                      { key: 'lab', label: 'Live Lab' },
                      { key: 'readme', label: 'README' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        haptics.trigger('detent');
                        setLens(item.key);
                      }}
                      className={`min-h-[40px] text-xs font-medium transition-colors ${
                        lens === item.key
                          ? 'bg-[#eab444] text-[#04060b] font-bold'
                          : 'text-[#d2d7e2]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {lens === 'story' && (
                  <div className="space-y-3.5 pt-1">
                    <p className="text-[15px] text-[#f3f7fe] leading-[1.6]">
                      {currentStory.openingHook}
                    </p>
                    <p className="text-[14px] text-[#d2d7e2] leading-[1.65]">
                      {currentStory.engineeringNarrative}
                    </p>

                    <div className="border border-[#2d3038] bg-[#04060b] p-3.5 space-y-1">
                      <div className="text-xs font-bold text-[#eab444]">The Breakthrough</div>
                      <p className="text-[14px] text-[#f3f7fe] leading-relaxed">
                        {currentStory.turningPoint}
                      </p>
                    </div>

                    <div className="border border-[#2d3038] bg-[#04060b] p-3.5 space-y-1">
                      <div className="text-xs font-medium text-[#9ca2af]">
                        {nextRepo ? `Up Next · ${nextRepo.name}` : 'Up Next · Grand Exit'}
                      </div>
                      <p className="text-[13px] text-[#d2d7e2] leading-relaxed">
                        {currentStory.bridgeToNext}
                      </p>
                    </div>
                  </div>
                )}

                {lens === 'lab' && (
                  <div className="pt-1 space-y-3">
                    <div className="font-mobilis text-xs text-[#eab444]">{currentRepo.proofMetric}</div>
                    <InteractiveRepoDemo repo={currentRepo} />
                  </div>
                )}

                {lens === 'readme' && (
                  <div className="pt-1">
                    <ReadmeShowcase repoName={currentRepo.name} story={currentStory} compact />
                  </div>
                )}
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Cinema Thumb Deck (56px -> 48+56=104px = 12.3% <= 15% cap) */}
      <nav
        aria-label="Mobile chapter flow navigation"
        className={`fixed bottom-0 left-0 right-0 z-40 h-[56px] px-3 bg-[#04060b]/96 border-t border-[#2d3038] grid items-center gap-2.5 ${
          rideState.currentIndex > 0 ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'
        }`}
      >
        {rideState.currentIndex > 0 && (
          <button
            type="button"
            onClick={() => {
              haptics.trigger('tap');
              setDirection(-1);
              onStepBackRide();
            }}
            aria-label="Previous chapter"
            className="min-h-[42px] px-3.5 border border-[#2d3038] bg-[#0a0d13] text-[#f3f7fe] text-xs font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Back
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            haptics.trigger('confirm');
            setDirection(1);
            onAdvanceRide();
          }}
          className="min-w-0 min-h-[42px] px-4 bg-[#eab444] text-[#04060b] text-[13px] font-bold inline-flex items-center justify-center gap-2"
        >
          <span className="truncate">
            {nextRepo ? `Continue · ${nextRepo.name}` : 'Enter Grand Exit'}
          </span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
