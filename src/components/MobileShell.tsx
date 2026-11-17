import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  FileText,
  GitCommitHorizontal,
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
  getActForRepoId,
  getOrderedTrack,
  getStationCode,
  type RideState,
} from '../lib/narrative';
import { getTablistTargetIndex } from '../lib/keyboard';
import type { SyncSource } from '../hooks/useGitHubTelemetry';
import { useRepoLiveDetail } from '../hooks/useRepoLiveDetail';
import { haptics } from '../lib/haptics';
import { SifrMark } from './SifrMark';
import { CinematicEntrance } from './CinematicEntrance';
import { ProjectPhysicsIllustration } from './ProjectPhysicsIllustration';
import { InteractiveRepoDemo } from './InteractiveDemos';
import { ReadmeShowcase } from './ReadmeShowcase';
import { ArchitectureBenchShowcase } from './ArchitectureBenchShowcase';
import { SignalDispatchSection } from './SignalDispatchSection';

type MobileLens = 'story' | 'lab' | 'bench' | 'readme';

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
  const [dragX, setDragX] = useState(0);
  const swipeStartRef = useRef<{ x: number; y: number; ignore: boolean; lockedHorizontal: boolean } | null>(null);
  const thresholdCrossedRef = useRef(false);
  const lensTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const orderedRepos = useMemo(() => getOrderedTrack(repos), [repos]);

  const currentRepo = orderedRepos[rideState.currentIndex] ?? orderedRepos[0];
  const liveDetail = useRepoLiveDetail(currentRepo.name);
  const currentStory = useMemo(() => getStoryForRepo(currentRepo.id), [currentRepo.id]);
  const currentAct = useMemo(() => getActForRepoId(currentRepo.id), [currentRepo.id]);
  const prevRepo = rideState.currentIndex > 0 ? orderedRepos[rideState.currentIndex - 1] : null;
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
        totalChapters={orderedRepos.length}
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
            <span className="text-sm font-bold text-[#f3f7fe] truncate">
              Grand Exit · {orderedRepos.length}/{orderedRepos.length}
            </span>
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
            <p className="text-xs font-semibold text-[#eab444]">
              Chronicle Complete · {orderedRepos.length} / {orderedRepos.length}
            </p>
            <h1 className="text-2xl font-bold text-[#f3f7fe]">
              Built from zero. Verified end to end.
            </h1>
            <p className="text-[14px] font-medium text-[#e4e8f1] leading-relaxed">
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

          <SignalDispatchSection compact />

          <div className="grid grid-cols-2 gap-3 pb-4">
            <a
              href="/brand/sifr-cv.pdf"
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] border border-[#2d3038] bg-[#0a0d13] text-xs font-semibold text-[#f3f7fe] inline-flex items-center justify-center gap-2"
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
              {currentAct.roman} · Chapter {getStationCode(rideState.currentIndex)}/{orderedRepos.length}
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
        <div className="h-[2px] w-full bg-[#0a0d13] grid grid-cols-12 gap-[2px]">
          {orderedRepos.map((item, idx) => {
            const isActive = idx === rideState.currentIndex;
            const isPast = idx < rideState.currentIndex;
            return (
              <div
                key={item.id}
                className={`h-full transition-colors duration-300 ${
                  isActive
                    ? 'bg-[#eab444]'
                    : isPast
                    ? 'bg-[#eab444]/45'
                    : 'bg-[#171b21]'
                }`}
              />
            );
          })}
        </div>
      </header>

      {/* Main Scrollable Scene Stage with Continuous Rubber-Band Touch Swipe Navigation */}
      <main
        className="flex-1 px-4 pt-4 pb-20 overflow-x-clip"
        onTouchStart={(e) => {
          const target = e.target as HTMLElement | null;
          const ignore = Boolean(
            target?.closest('canvas, pre, input, textarea, select, button, a')
          );
          const touch = e.touches[0];
          if (!touch) return;
          thresholdCrossedRef.current = false;
          setDragX(0);
          swipeStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            ignore,
            lockedHorizontal: false,
          };
        }}
        onTouchMove={(e) => {
          const start = swipeStartRef.current;
          if (!start || start.ignore) return;
          const touch = e.touches[0];
          if (!touch) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;

          if (!start.lockedHorizontal) {
            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
              swipeStartRef.current = null;
              setDragX(0);
              return;
            }
            if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) {
              start.lockedHorizontal = true;
            } else {
              return;
            }
          }

          // Edge resistance if dragging right on chapter 01
          const resisted = dx > 0 && !prevRepo ? dx * 0.28 : dx * 0.65;
          const clamped = Math.max(-96, Math.min(96, resisted));
          setDragX(clamped);

          const crossed = Math.abs(dx) >= 64 && !(dx > 0 && !prevRepo);
          if (crossed && !thresholdCrossedRef.current) {
            thresholdCrossedRef.current = true;
            haptics.trigger('detent');
          } else if (!crossed) {
            thresholdCrossedRef.current = false;
          }
        }}
        onTouchCancel={() => {
          swipeStartRef.current = null;
          thresholdCrossedRef.current = false;
          setDragX(0);
        }}
        onTouchEnd={(e) => {
          const start = swipeStartRef.current;
          swipeStartRef.current = null;
          thresholdCrossedRef.current = false;
          setDragX(0);
          if (!start || start.ignore) return;
          const touch = e.changedTouches[0];
          if (!touch) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
          if (dx < 0) {
            haptics.trigger('confirm');
            setDirection(1);
            onAdvanceRide();
          } else if (dx > 0 && prevRepo) {
            haptics.trigger('tap');
            setDirection(-1);
            onStepBackRide();
          }
        }}
      >
        {Math.abs(dragX) > 14 && (
          <div className="mb-2 px-3 py-1.5 border border-[#2d3038] bg-[#0a0d13] font-mobilis text-[11px] font-semibold flex items-center justify-between text-[#eab444]">
            <span>
              {dragX < 0
                ? nextRepo
                  ? `Release to enter ${nextRepo.name} ->`
                  : 'Release to enter Grand Exit ->'
                : prevRepo
                ? `<- Release to revisit ${prevRepo.name}`
                : 'Opening Chapter'}
            </span>
            <span>{Math.abs(dragX) >= 42 ? 'LOCKED' : 'SWIPE'}</span>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={currentRepo.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: dragX }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={
              dragX !== 0 ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
            }
            className="space-y-4"
          >
            <div className="border border-[#2d3038] bg-[#0a0d13] chamfer overflow-hidden">
              <ProjectPhysicsIllustration schematic={currentRepo.schematic} heightClass="h-32" />

              <div className="p-4 space-y-3">
                <div className="text-xs font-semibold text-[#eab444] flex flex-wrap items-center gap-2">
                  <span>{currentRepo.name}</span>
                  <span aria-hidden="true" className="text-[#a6acb9]">·</span>
                  <span className="text-[#a6acb9]">{currentRepo.primaryLanguage}</span>
                  <span aria-hidden="true" className="text-[#a6acb9]">·</span>
                  <span className="text-[#a6acb9]">{formatRelativeDate(currentRepo.updatedAt)}</span>
                  {liveDetail.commit && (
                    <>
                      <span aria-hidden="true" className="text-[#a6acb9]">·</span>
                      <span className="font-mobilis text-[11px] text-[#e4e8f1] inline-flex items-center gap-1">
                        <GitCommitHorizontal className="w-3 h-3 text-[#eab444]" aria-hidden="true" />
                        {liveDetail.commit.sha}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-[#f3f7fe] leading-[1.15]">
                  {currentStory.chapterTitle}
                </h1>
                <p className="text-[13px] font-medium text-[#a6acb9]">{currentRepo.subtitle}</p>

                {/* In-Scene Lens Switcher */}
                <div
                  role="tablist"
                  aria-label="Mobile chapter lens"
                  className="grid grid-cols-4 border border-[#2d3038] bg-[#04060b] p-1 gap-1"
                >
                  {(
                    [
                      { key: 'story', label: 'Story' },
                      { key: 'lab', label: 'Lab' },
                      { key: 'bench', label: 'Bench' },
                      { key: 'readme', label: 'README' },
                    ] as const
                  ).map((item, idx, arr) => (
                    <button
                      key={item.key}
                      ref={(el) => {
                        lensTabRefs.current[idx] = el;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={lens === item.key}
                      tabIndex={lens === item.key ? 0 : -1}
                      onClick={() => {
                        haptics.trigger('detent');
                        setLens(item.key);
                      }}
                      onKeyDown={(e) => {
                        const nextIdx = getTablistTargetIndex(e.key, idx, arr.length);
                        if (nextIdx === null) return;
                        e.preventDefault();
                        haptics.trigger('detent');
                        setLens(arr[nextIdx].key);
                        lensTabRefs.current[nextIdx]?.focus();
                      }}
                      className={`min-h-[40px] text-xs font-semibold transition-colors cursor-pointer ${
                        lens === item.key
                          ? 'bg-[#eab444] text-[#04060b] font-bold'
                          : 'text-[#e4e8f1]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {lens === 'story' && (
                  <div className="space-y-3.5 pt-1">
                    <p className="text-[15px] font-medium text-[#f3f7fe] leading-[1.6]">
                      {currentStory.openingHook}
                    </p>
                    <p className="text-[14px] font-medium text-[#e4e8f1] leading-[1.65]">
                      {currentStory.engineeringNarrative}
                    </p>

                    <div className="border border-[#2d3038] bg-[#04060b] p-3.5 space-y-1">
                      <div className="text-xs font-bold text-[#eab444]">The Breakthrough</div>
                      <p className="text-[14px] font-medium text-[#f3f7fe] leading-relaxed">
                        {currentStory.turningPoint}
                      </p>
                    </div>

                    <div className="border border-[#2d3038] bg-[#04060b] p-3.5 space-y-1">
                      <div className="text-xs font-semibold text-[#a6acb9]">
                        {nextRepo ? `Up Next · ${nextRepo.name}` : 'Up Next · Grand Exit'}
                      </div>
                      <p className="text-[13px] font-medium text-[#e4e8f1] leading-relaxed">
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

                {lens === 'bench' && (
                  <div className="pt-1">
                    <ArchitectureBenchShowcase repo={currentRepo} compact />
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
