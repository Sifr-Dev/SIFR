import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  GitCommitHorizontal,
  Keyboard,
  Link2,
  Maximize2,
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
  buildSceneSharePath,
  getActForRepoId,
  getOrderedTrack,
  getStationCode,
  type RideState,
} from '../lib/narrative';
import { getTablistTargetIndex, resolveKeyboardAction } from '../lib/keyboard';
import type { SyncSource } from '../hooks/useGitHubTelemetry';
import { useRepoLiveDetail } from '../hooks/useRepoLiveDetail';
import { haptics } from '../lib/haptics';
import { SifrMark } from './SifrMark';
import { CinematicEntrance } from './CinematicEntrance';
import { AmbientRideCanvas } from './AmbientRideCanvas';
import { ProjectPhysicsIllustration } from './ProjectPhysicsIllustration';
import { InteractiveRepoDemo } from './InteractiveDemos';
import { ReadmeShowcase } from './ReadmeShowcase';
import { ArchitectureBenchShowcase } from './ArchitectureBenchShowcase';
import { GitHubTelemetrySection } from './GitHubTelemetrySection';
import { SignalDispatchSection } from './SignalDispatchSection';
import { KeyboardHelpModal } from './KeyboardHelpModal';

type StationViewTab = 'simulation' | 'story-readme' | 'architecture';

interface DesktopGalleryProps {
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
  onOpenRepoModal: (repo: RepoSpec) => void;
  onOpenShowreel: () => void;
  paused?: boolean;
}

export function DesktopGallery({
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
  onOpenRepoModal,
  onOpenShowreel,
  paused = false,
}: DesktopGalleryProps) {
  const [stationTab, setStationTab] = useState<StationViewTab>('simulation');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [actCurtain, setActCurtain] = useState<{ roman: string; title: string; subtitle: string } | null>(
    null
  );
  const prevActIdRef = useRef<string | null>(null);
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const orderedRepos = useMemo(() => getOrderedTrack(repos), [repos]);

  const currentRepo = orderedRepos[rideState.currentIndex] ?? orderedRepos[0];
  const liveDetail = useRepoLiveDetail(currentRepo.name);
  const currentStory = useMemo(() => getStoryForRepo(currentRepo.id), [currentRepo.id]);
  const currentAct = useMemo(() => getActForRepoId(currentRepo.id), [currentRepo.id]);
  const nextRepo =
    rideState.currentIndex < orderedRepos.length - 1
      ? orderedRepos[rideState.currentIndex + 1]
      : null;
  const prevRepo =
    rideState.currentIndex > 0 ? orderedRepos[rideState.currentIndex - 1] : null;

  // Brief atmospheric Act Intertitle whenever entering a new Act forward
  useEffect(() => {
    if (!rideState.hasEntered || rideState.hasExited) {
      prevActIdRef.current = null;
      return;
    }
    const prevActId = prevActIdRef.current;
    prevActIdRef.current = currentAct.id;

    if (prevActId && prevActId !== currentAct.id && direction === 1) {
      setActCurtain({
        roman: currentAct.roman,
        title: currentAct.title,
        subtitle: currentAct.subtitle,
      });
      const timer = window.setTimeout(() => setActCurtain(null), 1150);
      return () => window.clearTimeout(timer);
    }
  }, [currentAct.id, currentAct.roman, currentAct.subtitle, currentAct.title, direction, rideState.hasEntered, rideState.hasExited]);

  // Reset tab cleanly on chapter transition
  useEffect(() => {
    setStationTab('simulation');
    window.scrollTo(0, 0);
  }, [rideState.currentIndex, rideState.hasExited]);

  // Global keyboard navigation across Entrance, Active Ride, and Grand Exit
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputTarget = Boolean(
        target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
      );

      const resolution = resolveKeyboardAction({
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        isInputTarget,
        hasEntered: rideState.hasEntered,
        hasExited: rideState.hasExited,
        paused,
        helpOpen,
        currentIndex: rideState.currentIndex,
      });

      if (!resolution.action) return;
      if (resolution.preventDefault) e.preventDefault();

      switch (resolution.action) {
        case 'advance':
          handleAdvance();
          break;
        case 'back':
          handleStepBack();
          break;
        case 'tab-1':
          haptics.trigger('detent');
          setStationTab('simulation');
          break;
        case 'tab-2':
          haptics.trigger('detent');
          setStationTab('story-readme');
          break;
        case 'tab-3':
          haptics.trigger('detent');
          setStationTab('architecture');
          break;
        case 'open-lab':
          haptics.trigger('tap');
          onOpenRepoModal(currentRepo);
          break;
        case 'open-reel':
          haptics.trigger('tap');
          onOpenShowreel();
          break;
        case 'toggle-audio':
          onToggleAudio();
          break;
        case 'toggle-help':
          haptics.trigger('tap');
          setHelpOpen(true);
          break;
        case 'close-help':
          haptics.trigger('tap');
          setHelpOpen(false);
          break;
        case 'jump-dispatch': {
          haptics.trigger('detent');
          const el = document.getElementById('dispatch');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const firstInput = el?.querySelector('input');
          if (firstInput instanceof HTMLInputElement) {
            window.setTimeout(() => firstInput.focus({ preventScroll: true }), 260);
          }
          break;
        }
        case 'jump-top':
          haptics.trigger('tap');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rideState.hasEntered,
    rideState.hasExited,
    rideState.currentIndex,
    paused,
    helpOpen,
    currentRepo,
    audioEnabled,
  ]);

  const handleAdvance = () => {
    haptics.trigger('confirm');
    setDirection(1);
    onAdvanceRide();
  };

  const handleStepBack = () => {
    if (rideState.currentIndex === 0) return;
    haptics.trigger('tap');
    setDirection(-1);
    onStepBackRide();
  };

  // =========================================================================
  // STAGE 1 · THE MAGNIFICENT GRAND ENTRY (Prologue)
  // =========================================================================
  if (!rideState.hasEntered) {
    return (
      <>
        <CinematicEntrance
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
          paused={paused || helpOpen}
        />
        <KeyboardHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </>
    );
  }

  // =========================================================================
  // STAGE 3 · THE GRAND EXIT (Unlocked only after finishing Chapter 11)
  // =========================================================================
  if (rideState.hasExited) {
    return (
      <div className="min-h-screen bg-[#04060b] text-[#f3f7fe] relative">
        <AmbientRideCanvas schematic="verrev-mesh" paused={paused} />

      <header className="sticky top-0 z-30 bg-[#04060b]/92 backdrop-blur-md border-b border-[#2d3038]">
          <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between gap-8">
            <div className="inline-flex items-center gap-3 whitespace-nowrap shrink-0">
              <SifrMark size={24} shift={shift} />
              <span className="text-[15px] font-bold tracking-[0.06em] text-[#f3f7fe]">SIFR</span>
            </div>

            <nav aria-label="Grand Exit navigation" className="flex items-center gap-7">
              <a
                href="#finale"
                onClick={() => haptics.trigger('tap')}
                className="text-[13px] font-medium text-[#9ca2af] hover:text-[#f3f7fe] whitespace-nowrap shrink-0"
              >
                Finale
              </a>
              <a
                href="#atlas"
                onClick={() => haptics.trigger('tap')}
                className="text-[13px] font-medium text-[#9ca2af] hover:text-[#f3f7fe] whitespace-nowrap shrink-0"
              >
                Full Atlas
              </a>
              <a
                href="#activity"
                onClick={() => haptics.trigger('tap')}
                className="text-[13px] font-medium text-[#9ca2af] hover:text-[#f3f7fe] whitespace-nowrap shrink-0"
              >
                GitHub Telemetry
              </a>
              <a
                href="#doctrine"
                onClick={() => haptics.trigger('tap')}
                className="text-[13px] font-medium text-[#a6acb9] hover:text-[#f3f7fe] whitespace-nowrap shrink-0"
              >
                Doctrines
              </a>
              <a
                href="#dispatch"
                onClick={() => haptics.trigger('tap')}
                className="text-[13px] font-semibold text-[#eab444] hover:text-[#f2c15c] whitespace-nowrap shrink-0"
              >
                Signal
              </a>
            </nav>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  setHelpOpen(true);
                }}
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts (?)"
                className="min-h-[40px] min-w-[40px] px-2.5 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[#d2d7e2] hover:text-[#eab444] flex items-center justify-center cursor-pointer"
              >
                <Keyboard className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.trigger('snapZero');
                  onRestartRide();
                }}
                className="min-h-[40px] px-4 py-2 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-[13px] font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Ride Again
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-[1200px] mx-auto px-8 py-12 space-y-16">
          {/* Finale Hero */}
          <motion.section
            id="finale"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="border border-[#eab444] ethereal-surface chamfer p-8 sm:p-10 flex flex-wrap items-center justify-between gap-8"
          >
            <div className="space-y-3 max-w-2xl">
              <p className="text-sm font-semibold text-[#eab444]">
                Finale · Chronicle Complete ({orderedRepos.length} / {orderedRepos.length} Chapters)
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-[#f3f7fe] leading-[1.08] text-balance">
                From a 24-byte heap header to a living zero-origin studio.
              </h1>
              <p className="text-[16px] font-medium text-[#e4e8f1] leading-[1.65]">
                Every system across all four acts has been inspected from zero. You may now revisit any
                chapter directly below, run fullscreen simulations, inspect live GitHub telemetry, or
                experience the opening gate again.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  onOpenShowreel();
                }}
                className="min-h-[44px] px-5 py-2.5 border border-[#2d3038] bg-[#04060b] hover:border-[#eab444] text-[14px] font-semibold text-[#f3f7fe] inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                Motion Film
              </button>
              <a
                href="/brand/sifr-cv.pdf"
                target="_blank"
                rel="noreferrer"
                onClick={() => haptics.trigger('tap')}
                className="min-h-[44px] px-5 py-2.5 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-[14px] font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                Curriculum Vitae (PDF)
              </a>
            </div>
          </motion.section>

          {/* Complete Unlocked Exhibition Atlas */}
          <section id="atlas" className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#eab444]">Complete Exhibition Atlas</p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-[#f3f7fe]">
                Revisit any of the {orderedRepos.length} systems.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {orderedRepos.map((repo, idx) => {
                const story = getStoryForRepo(repo.id);
                const act = getActForRepoId(repo.id);
                return (
                  <div
                    key={repo.id}
                    className="border border-[#2d3038] bg-[#0a0d13]/95 p-5 flex flex-col justify-between gap-4 hover:border-[#eab444] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="text-xs text-[#9ca2af] flex items-center justify-between gap-2">
                        <span className="text-[#eab444] font-medium">
                          {getStationCode(idx)} · {act.roman}
                        </span>
                        <span>{repo.primaryLanguage}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#f3f7fe]">{story.chapterTitle}</h3>
                      <p className="text-sm text-[#d2d7e2] leading-relaxed line-clamp-2">
                        {repo.name} — {repo.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#2d3038]">
                      <button
                        type="button"
                        onClick={() => {
                          haptics.trigger('detent');
                          onJumpToStation(idx);
                        }}
                        className="text-[13px] font-bold text-[#eab444] hover:underline cursor-pointer"
                      >
                        Re-enter Scene
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            haptics.trigger('confirm');
                            const url = `${window.location.origin}${window.location.pathname}${buildSceneSharePath(repo.id)}`;
                            try {
                              await navigator.clipboard.writeText(url);
                              setCopiedSceneId(repo.id);
                              window.setTimeout(() => setCopiedSceneId(null), 1600);
                            } catch {
                              // Ignore clipboard failure
                            }
                          }}
                          title="Copy unlocked scene link"
                          className="text-xs font-medium text-[#a6acb9] hover:text-[#eab444] inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSceneId === repo.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#40e080]" aria-hidden="true" />
                              <span className="text-[#40e080]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="w-3 h-3" aria-hidden="true" />
                              <span>Link</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            haptics.trigger('tap');
                            onOpenRepoModal(repo);
                          }}
                          className="text-[13px] font-medium text-[#a6acb9] hover:text-[#f3f7fe] cursor-pointer"
                        >
                          Open Lab
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <GitHubTelemetrySection
            profile={profile}
            stats={stats}
            activity={activity}
            syncSource={syncSource}
            onSelectRepoByName={(name) => {
              const found = orderedRepos.find((r) => r.name.toLowerCase() === name.toLowerCase());
              if (found) onOpenRepoModal(found);
            }}
          />

          {/* Five Zero Doctrines */}
          <section id="doctrine" className="py-6 border-t border-[#2d3038] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#eab444]">Engineering Manifesto</p>
                <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-[#f3f7fe]">
                  The Zero Doctrine
                </h2>
              </div>

              <button
                type="button"
                onClick={onToggleAudio}
                className={`min-h-[42px] px-4 py-2 border text-[13px] font-medium inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  audioEnabled
                    ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                    : 'border-[#2d3038] bg-[#0a0d13] text-[#f3f7fe]'
                }`}
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#eab444]" aria-hidden="true" />
                )}
                {audioEnabled ? 'Sound Feedback Active' : 'Enable Sound Feedback'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 border border-[#2d3038] bg-[#0a0d13] divide-y lg:divide-y-0 lg:divide-x divide-[#2d3038]">
              {ZERO_DOCTRINES.map((item) => (
                <div key={item.index} className="p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="font-mobilis text-xs font-bold text-[#eab444]">{item.index}</div>
                    <h3 className="text-base font-bold text-[#f3f7fe] mt-2">{item.title}</h3>
                    <p className="text-[14px] text-[#e4e8f1] font-medium mt-2 leading-[1.6]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <SignalDispatchSection />
        </main>
        <KeyboardHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    );
  }

  // =========================================================================
  // STAGE 2 · THE MOVIE-LIKE DISNEYLAND RIDE (Scenes 01 -> 11)
  // ZERO locked buttons, ZERO future spoilers, pure cinematic scene flow
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#04060b] text-[#f3f7fe] relative flex flex-col justify-between overflow-x-clip">
      <AmbientRideCanvas schematic={currentRepo.schematic} paused={paused} />

      {/* Minimalist Whisper Cinema Header — 3 clean zones, zero unclickable future items */}
      <header className="sticky top-0 z-30 bg-[#04060b]/92 backdrop-blur-md border-b border-[#2d3038]/80">
        <div className="max-w-[1220px] mx-auto px-8 h-16 flex items-center justify-between gap-8">
          <div className="inline-flex items-center gap-3 whitespace-nowrap shrink-0">
            <SifrMark size={22} shift={shift} />
            <span className="text-[15px] font-bold tracking-[0.06em] text-[#f3f7fe]">SIFR</span>
          </div>

          <div className="flex items-center gap-3 text-[13px] font-medium text-[#a6acb9] whitespace-nowrap">
            <span className="text-[#eab444] font-semibold">
              {currentAct.roman} · {currentAct.title}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mobilis font-semibold text-[#f3f7fe]">
              Chapter {currentStory.stationNumber} of {orderedRepos.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                haptics.trigger('tap');
                onOpenShowreel();
              }}
              className="min-h-[38px] px-3.5 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-medium text-[#d2d7e2] inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
              Film
            </button>

            <button
              type="button"
              onClick={() => {
                haptics.trigger('tap');
                setHelpOpen(true);
              }}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
              className="min-h-[38px] min-w-[38px] px-2.5 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[#d2d7e2] hover:text-[#eab444] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Keyboard className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={audioEnabled ? 'Mute haptic audio' : 'Enable haptic audio'}
              className={`min-h-[38px] min-w-[38px] px-3 border flex items-center justify-center transition-colors cursor-pointer ${
                audioEnabled
                  ? 'border-[#eab444] text-[#eab444] bg-[#171b21]'
                  : 'border-[#2d3038] text-[#9ca2af] bg-[#0a0d13] hover:text-[#f3f7fe]'
              }`}
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Segmented 12-Chapter Celestial Track Filament */}
        <div className="h-[2px] w-full bg-[#0a0d13] grid grid-cols-12 gap-[2px]">
          {orderedRepos.map((item, idx) => {
            const isActive = idx === rideState.currentIndex;
            const isPast = idx < rideState.currentIndex;
            return (
              <div
                key={item.id}
                className={`h-full transition-colors duration-500 ${
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

      {/* Monumental Act Intertitle Curtain with Concentric SVG Meridian */}
      <AnimatePresence>
        {actCurtain && (
          <motion.div
            key={actCurtain.roman}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-40 bg-[#04060b]/96 flex items-center justify-center pointer-events-none px-6 overflow-hidden"
          >
            <motion.svg
              width="380"
              height="380"
              viewBox="0 0 380 380"
              initial={{ scale: 0.72, opacity: 0, rotate: -18 }}
              animate={{ scale: 1.04, opacity: 0.28, rotate: 0 }}
              exit={{ scale: 1.24, opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="absolute pointer-events-none"
              aria-hidden="true"
            >
              <circle cx="190" cy="190" r="168" fill="none" stroke="#eab444" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="190" cy="190" r="118" fill="none" stroke="#f3f7fe" strokeWidth="0.75" opacity="0.45" />
              <circle cx="190" cy="190" r="64" fill="none" stroke="#eab444" strokeWidth="0.75" />
            </motion.svg>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative text-center space-y-3 max-w-xl"
            >
              <p className="font-mobilis text-xs font-semibold tracking-[0.18em] uppercase text-[#eab444]">
                {actCurtain.roman} · {actCurtain.title}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#f3f7fe] text-balance">
                {actCurtain.subtitle}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Full-Stage Scene Viewport */}
      <main className="relative z-10 flex-1 w-full max-w-[1220px] mx-auto px-8 py-8 lg:py-10 flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={currentRepo.id}
            custom={direction}
            initial={{
              opacity: 0,
              y: direction * 18,
              scale: 0.992,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{
              opacity: 0,
              y: direction * -8,
              scale: 0.995,
              transition: { duration: 0.09, ease: [0.16, 1, 0.3, 1] },
            }}
            aria-label={`Chapter ${currentStory.stationNumber}: ${currentRepo.name}`}
            className="space-y-8"
          >
            {/* Primary Cinematic Two-Column Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start">
              {/* Left Column: Narrative Direction & Story Prose */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="text-[13px] font-semibold text-[#a6acb9] flex flex-wrap items-center gap-2.5">
                    <span className="text-[#eab444]">Chapter {currentStory.stationNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentRepo.primaryLanguage}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatRelativeDate(currentRepo.updatedAt)}</span>
                    {liveDetail.commit && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span
                          title={liveDetail.commit.message}
                          className="font-mobilis text-xs text-[#e4e8f1] inline-flex items-center gap-1"
                        >
                          <GitCommitHorizontal className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                          {liveDetail.commit.sha}
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-[42px] font-bold text-[#f3f7fe] leading-[1.08] tracking-[-0.025em] text-balance">
                    {currentStory.chapterTitle}
                  </h1>

                  <p className="text-[15px] font-semibold text-[#eab444]">
                    {currentRepo.name} — {currentRepo.subtitle}
                  </p>
                </div>

                {/* High-Legibility Narrative Copy */}
                <div className="space-y-4">
                  <p className="text-[16px] sm:text-[17px] font-medium text-[#f3f7fe] leading-[1.65]">
                    {currentStory.openingHook}
                  </p>
                  <p className="text-[15px] font-medium text-[#e4e8f1] leading-[1.7]">
                    {currentStory.engineeringNarrative}
                  </p>
                </div>

                {/* Breakthrough Callout (Clean All-Around Hairline Border) */}
                <div className="border border-[#2d3038] bg-[#0a0d13]/92 p-5 space-y-1.5">
                  <div className="text-xs font-bold text-[#eab444]">The Breakthrough</div>
                  <p className="text-[14px] font-medium text-[#f3f7fe] leading-[1.65]">
                    {currentStory.turningPoint}
                  </p>
                </div>

                {/* Quiet External Source, Share & Fullscreen Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.trigger('tap');
                      onOpenRepoModal(currentRepo);
                    }}
                    className="min-h-[42px] px-4 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-semibold text-[#f3f7fe] inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                    Inspect Fullscreen
                  </button>

                  <a
                    href={currentRepo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => haptics.trigger('tap')}
                    className="min-h-[42px] px-4 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-semibold text-[#e4e8f1] hover:text-[#eab444] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    Repository <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={async () => {
                      haptics.trigger('confirm');
                      const url = `${window.location.origin}${window.location.pathname}${buildSceneSharePath(currentRepo.id)}`;
                      try {
                        await navigator.clipboard.writeText(url);
                        setCopiedSceneId(currentRepo.id);
                        window.setTimeout(() => setCopiedSceneId(null), 1800);
                      } catch {
                        // Ignore clipboard failures
                      }
                    }}
                    title="Copy direct chapter permalink"
                    className="min-h-[42px] px-3.5 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-medium text-[#b9bec7] hover:text-[#eab444] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedSceneId === currentRepo.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#40e080]" aria-hidden="true" />
                        <span className="text-[#40e080]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Reactive Physics Schematic + Live Instrument Theater */}
              <div className="border border-[#2d3038] ethereal-surface chamfer overflow-hidden flex flex-col">
                <div>
                  <ProjectPhysicsIllustration schematic={currentRepo.schematic} heightClass="h-44" />
                  <div className="px-5 py-3 border-b border-[#2d3038] bg-[#04060b] flex items-center justify-between gap-4 text-[13px]">
                    <span className="text-[#9ca2af] shrink-0 whitespace-nowrap">Verified Proof</span>
                    <span className="font-mobilis text-xs font-bold text-[#eab444] text-right">
                      {currentRepo.proofMetric}
                    </span>
                  </div>
                </div>

                {/* Scene Lens Switcher */}
                <div className="px-5 pt-4 flex items-center gap-2 border-b border-[#2d3038] pb-3" role="tablist" aria-label="Chapter inspection lens">
                  {(
                    [
                      { key: 'simulation', label: 'Live Simulation' },
                      { key: 'story-readme', label: 'Repo README.md' },
                      { key: 'architecture', label: 'Architecture & Code' },
                    ] as const
                  ).map((item, idx, arr) => (
                    <button
                      key={item.key}
                      ref={(el) => {
                        tabButtonRefs.current[idx] = el;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={stationTab === item.key}
                      tabIndex={stationTab === item.key ? 0 : -1}
                      onClick={() => {
                        haptics.trigger('detent');
                        setStationTab(item.key);
                      }}
                      onKeyDown={(e) => {
                        const nextIdx = getTablistTargetIndex(e.key, idx, arr.length);
                        if (nextIdx === null) return;
                        e.preventDefault();
                        e.stopPropagation();
                        haptics.trigger('detent');
                        setStationTab(arr[nextIdx].key);
                        tabButtonRefs.current[nextIdx]?.focus();
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 text-[13px] font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        stationTab === item.key
                          ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                          : 'border-[#2d3038] bg-[#04060b] text-[#e4e8f1] hover:border-[#eab444]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Active Lens Stage */}
                <div className="p-5">
                  {stationTab === 'simulation' && <InteractiveRepoDemo repo={currentRepo} />}

                  {stationTab === 'story-readme' && (
                    <ReadmeShowcase repoName={currentRepo.name} story={currentStory} />
                  )}

                  {stationTab === 'architecture' && (
                    <ArchitectureBenchShowcase repo={currentRepo} />
                  )}
                </div>
              </div>
            </div>

            {/* Flow-Driven Story Bridge Footer */}
            <div className="border-t border-[#2d3038] pt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4 shrink-0">
                {prevRepo ? (
                  <button
                    type="button"
                    onClick={handleStepBack}
                    className="min-h-[44px] px-4 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-semibold text-[#e4e8f1] hover:text-[#f3f7fe] inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>{prevRepo.name}</span>
                  </button>
                ) : (
                  <span className="text-[13px] font-medium text-[#a6acb9] whitespace-nowrap">
                    Opening Chapter · Use Arrow keys or Continue
                  </span>
                )}
              </div>

              <p className="text-[14px] font-medium text-[#b9bec7] leading-relaxed max-w-xl lg:text-center">
                {currentStory.bridgeToNext}
              </p>

              <button
                type="button"
                onClick={handleAdvance}
                className="group min-h-[48px] px-7 py-3 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-[14px] font-bold inline-flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 transition-all cursor-pointer chamfer-sm"
              >
                <span>
                  {nextRepo ? `Continue · ${nextRepo.name}` : 'Enter the Grand Exit'}
                </span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </div>
          </motion.article>
        </AnimatePresence>
      </main>
      <KeyboardHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
