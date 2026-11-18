import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { GitHubProfileSnapshot, RepoSpec } from '../data/repos';
import { getStoryForRepo } from '../data/stories';
import type { GitHubAggregateStats } from '../lib/githubStats';
import { CANONICAL_ACTS, getActForRepoId, type ActId } from '../lib/narrative';
import { computeItemViewportParallax, computeParallaxShift } from '../lib/parallax';
import { SIFR_DIRECT_EMAIL } from '../lib/signal';
import {
  ambientSoundscape,
  getChapterFromLabel,
  type SoundscapeStatus,
} from '../lib/ambientSoundscape';
import { useScrollNarrativeFlow } from '../hooks/useScrollNarrativeFlow';
import { SifrMark } from './SifrMark';
import { PhysicsCipherCanvas } from './PhysicsCipherCanvas';
import { ProjectPhysicsIllustration } from './ProjectPhysicsIllustration';
import { LivingScrollCue } from './LivingScrollCue';

interface TimelineCanvasProps {
  isMobile: boolean;
  profile: GitHubProfileSnapshot;
  repos: RepoSpec[];
  stats: GitHubAggregateStats;
  shift: number;
  onShiftChange: (next: number) => void;
}

const ACT_BACKDROP_PLATES: Record<ActId, string> = {
  'act-1': '/chapters/part-1.svg',
  'act-2': '/chapters/part-2.svg',
  'act-3': '/chapters/part-3.svg',
  'act-4': '/chapters/part-4.svg',
};

const DESKTOP_ACT_FRAMES: Record<
  ActId,
  { widthClass: string; visualHeightClass: string }
> = {
  'act-1': {
    widthClass: 'w-[445px] lg:w-[495px]',
    visualHeightClass: 'h-32',
  },
  'act-2': {
    widthClass: 'w-[465px] lg:w-[515px]',
    visualHeightClass: 'h-36',
  },
  'act-3': {
    widthClass: 'w-[465px] lg:w-[515px]',
    visualHeightClass: 'h-36',
  },
  'act-4': {
    widthClass: 'w-[455px] lg:w-[505px]',
    visualHeightClass: 'h-32',
  },
};

const DESKTOP_STAGGER_Y = ['-translate-y-3', 'translate-y-4', '-translate-y-1', 'translate-y-3'];

const PANORAMA_REPOS = new Set([
  'sifr-ml-systems',
  'verrev',
  'sifr-native',
  'sifr-apps',
  'SIFR',
]);

function getDisplayName(repo: RepoSpec): { title: string } {
  return {
    title: repo.displayName || repo.name,
  };
}

export function TimelineCanvas({
  isMobile,
  profile,
  repos,
  stats,
  shift,
  onShiftChange,
}: TimelineCanvasProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const motionBlurContainerRef = useRef<HTMLElement | null>(null);
  const bgGridRef = useRef<HTMLDivElement | null>(null);
  const midAxisRef = useRef<HTMLDivElement | null>(null);
  const pointerAuraRef = useRef<HTMLDivElement | null>(null);
  const visualParallaxRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const targetScrollRef = useRef(0);
  const rafScrollRef = useRef(0);
  const draggingRef = useRef<{ active: boolean; startX: number; scrollLeft: number }>({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });

  const scrollProgressRef = useRef(0);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [activeChapterLabel, setActiveChapterLabel] = useState('Prologue');
  const [audioStatus, setAudioStatus] = useState<SoundscapeStatus>(() =>
    ambientSoundscape.getStatus()
  );

  useEffect(() => {
    const uninstallGesture = ambientSoundscape.installGestureUnlock();
    const unsubscribeStatus = ambientSoundscape.subscribeStatus(setAudioStatus);
    return () => {
      uninstallGesture();
      unsubscribeStatus();
    };
  }, []);

  useEffect(() => {
    ambientSoundscape.setChapter(getChapterFromLabel(activeChapterLabel));
  }, [activeChapterLabel]);

  const actGroups = useMemo(() => {
    const byId = new Map(repos.map((r) => [r.id.toLowerCase(), r]));
    const assigned = new Set<string>();
    const groups = CANONICAL_ACTS.map((act) => {
      const items = act.stationIds
        .map((id) => byId.get(id.toLowerCase()))
        .filter((r): r is RepoSpec => {
          if (!r) return false;
          assigned.add(r.id.toLowerCase());
          return true;
        });
      return { act, items };
    });
    const extras = repos.filter((r) => !assigned.has(r.id.toLowerCase()));
    if (extras.length > 0 && groups.length > 0) {
      groups[groups.length - 1].items.push(...extras);
    }
    return groups;
  }, [repos]);

  const applyParallaxTransforms = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (isMobile) {
      const sy = window.scrollY;
      if (bgGridRef.current) {
        bgGridRef.current.style.transform = `translate3d(0, ${computeParallaxShift(sy, 0.12)}px, 0)`;
      }
      if (midAxisRef.current) {
        midAxisRef.current.style.transform = `translate3d(0, ${computeParallaxShift(sy, 0.28)}px, 0)`;
      }
      const vh = window.innerHeight || 844;
      const vCenter = vh * 0.5;
      for (const node of Object.values(visualParallaxRefs.current)) {
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > vh + 120) continue;
        const offset = computeItemViewportParallax(
          rect.top + rect.height * 0.5,
          vCenter,
          vh * 0.65,
          10
        );
        node.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`;
      }
      return;
    }

    const el = trackRef.current;
    if (!el) return;
    const sx = el.scrollLeft;

    if (bgGridRef.current) {
      bgGridRef.current.style.transform = `translate3d(${computeParallaxShift(sx, 0.14)}px, 0, 0)`;
    }
    if (midAxisRef.current) {
      midAxisRef.current.style.transform = `translate3d(${computeParallaxShift(sx, 0.36)}px, 0, 0)`;
    }

    const vw = window.innerWidth || 1440;
    const vCenter = vw * 0.5;
    for (const node of Object.values(visualParallaxRefs.current)) {
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (rect.right < -160 || rect.left > vw + 160) continue;
      const offset = computeItemViewportParallax(
        rect.left + rect.width * 0.5,
        vCenter,
        vw * 0.65,
        16
      );
      node.style.transform = `translate3d(${offset}px, 0, 0) scale(1.06)`;
    }
  }, [isMobile]);

  const handleNarrativeFrameSync = useCallback(
    (progress: number) => {
      scrollProgressRef.current = progress;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      }
      window.dispatchEvent(new Event('sifr-scroll-sync'));
      applyParallaxTransforms();
    },
    [applyParallaxTransforms]
  );

  const handleMotionVelocityChange = useCallback((velocityNorm: number) => {
    ambientSoundscape.modulateScrollMotion(velocityNorm);
  }, []);

  const { registerSpread, syncNow } = useScrollNarrativeFlow({
    trackRef,
    motionBlurContainerRef,
    isMobile,
    onActiveLabelChange: setActiveChapterLabel,
    onSyncFrame: handleNarrativeFrameSync,
    onMotionVelocityChange: handleMotionVelocityChange,
  });

  useEffect(() => {
    syncNow();
    applyParallaxTransforms();
    window.addEventListener('resize', applyParallaxTransforms, { passive: true });
    return () => window.removeEventListener('resize', applyParallaxTransforms);
  }, [applyParallaxTransforms, syncNow, repos.length, isMobile]);

  // Desktop & Tablet: zero-friction dt-normalized mouse-wheel conversion + native horizontal trackpad passthrough
  useEffect(() => {
    if (isMobile) return;
    const el = trackRef.current;
    if (!el) return;

    targetScrollRef.current = el.scrollLeft;
    let lastFrameMs = performance.now();
    let expectedScrollLeft = el.scrollLeft;

    const animateScroll = (now: number) => {
      // Yield immediately if external horizontal scroll (trackpad, scrollbar drag, hash jump) moved the track
      if (Math.abs(el.scrollLeft - expectedScrollLeft) > 3) {
        targetScrollRef.current = el.scrollLeft;
        rafScrollRef.current = 0;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.004, (now - lastFrameMs) / 1000));
      lastFrameMs = now;

      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const clampedTarget = Math.max(0, Math.min(maxScroll, targetScrollRef.current));
      targetScrollRef.current = clampedTarget;

      const diff = clampedTarget - el.scrollLeft;
      if (Math.abs(diff) <= 0.5) {
        el.scrollLeft = clampedTarget;
        expectedScrollLeft = el.scrollLeft;
        rafScrollRef.current = 0;
        return;
      }
      // Frame-rate independent smooth damping (snappy with zero sluggish tail)
      const factor = 1 - Math.exp(-18 * dt);
      el.scrollLeft += diff * factor;
      expectedScrollLeft = el.scrollLeft;
      rafScrollRef.current = requestAnimationFrame(animateScroll);
    };

    const wakeLerp = () => {
      if (!rafScrollRef.current) {
        expectedScrollLeft = el.scrollLeft;
        lastFrameMs = performance.now();
        rafScrollRef.current = requestAnimationFrame(animateScroll);
      }
    };

    const onWheel = (e: WheelEvent) => {
      const scale = e.deltaMode === 1 ? 38 : e.deltaMode === 2 ? el.clientWidth * 0.85 : 1;
      const dx = e.deltaX * scale;
      const dy = e.deltaY * scale;

      if (Math.abs(dy) >= Math.abs(dx) && dy !== 0) {
        e.preventDefault();
        if (!rafScrollRef.current) {
          targetScrollRef.current = el.scrollLeft;
        }
        targetScrollRef.current += dy * 1.1;
        wakeLerp();
      } else if (dx !== 0) {
        // Trackpad horizontal gestures remain direct without added lerp drag
        if (rafScrollRef.current) {
          cancelAnimationFrame(rafScrollRef.current);
          rafScrollRef.current = 0;
        }
        targetScrollRef.current = el.scrollLeft + dx;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        if (!rafScrollRef.current) targetScrollRef.current = el.scrollLeft;
        targetScrollRef.current += 480;
        wakeLerp();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (!rafScrollRef.current) targetScrollRef.current = el.scrollLeft;
        targetScrollRef.current -= 480;
        wakeLerp();
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetScrollRef.current = 0;
        wakeLerp();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = 0;
    };
  }, [isMobile]);

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('a')) return;
    const el = trackRef.current;
    if (!el) return;
    if (rafScrollRef.current) {
      cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = 0;
    }
    targetScrollRef.current = el.scrollLeft;
    draggingRef.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    };
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current.active || !trackRef.current) return;
    const dx = e.clientX - draggingRef.current.startX;
    trackRef.current.scrollLeft = draggingRef.current.scrollLeft - dx;
    targetScrollRef.current = trackRef.current.scrollLeft;
  };

  const handleTrackPointerEnd = () => {
    draggingRef.current.active = false;
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile && pointerAuraRef.current) {
      pointerAuraRef.current.style.transform = `translate3d(${Math.round(e.clientX - 240)}px, ${Math.round(e.clientY - 240)}px, 0)`;
      pointerAuraRef.current.style.opacity = '1';
    }
    handleTrackPointerMove(e);
  };

  const renderSpread = (repo: RepoSpec, globalIndex: number) => {
    const act = getActForRepoId(repo.id);
    const story = getStoryForRepo(repo.id);
    const display = getDisplayName(repo);
    const frame = DESKTOP_ACT_FRAMES[act.id];
    const isPanorama = PANORAMA_REPOS.has(repo.id);
    const staggerClass = isMobile ? '' : DESKTOP_STAGGER_Y[globalIndex % DESKTOP_STAGGER_Y.length];

    const widthClass = isMobile
      ? 'w-full'
      : isPanorama
        ? 'w-[700px] lg:w-[780px]'
        : frame.widthClass;

    const visualBox = (
      <div className="overflow-hidden bg-[#04060b] relative [contain:layout_style_paint]">
        <div
          ref={(el) => {
            visualParallaxRefs.current[repo.id] = el;
          }}
        >
          <ProjectPhysicsIllustration
            schematic={repo.schematic}
            heightClass={isMobile ? 'h-36' : isPanorama ? 'h-48' : frame.visualHeightClass}
            onInteract={(kind) => ambientSoundscape.playPanelShimmer(globalIndex, kind)}
            onScrub={(normX) => ambientSoundscape.playScrubTick(normX)}
          />
        </div>
      </div>
    );

    const headerBlock = (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3 font-mobilis text-[13px] font-semibold text-[#c9d0de]">
          <span className="text-[#eab444] whitespace-nowrap shrink-0">
            {story.stationNumber} · {story.eraLabel}
          </span>
          <span className="truncate text-right">{repo.primaryLanguage}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-0.5">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <h3 className="text-2xl lg:text-[26px] font-extrabold text-[#ffffff] tracking-[-0.02em] truncate">
              {display.title}
            </h3>
          </div>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${display.title} on GitHub`}
            className="text-[#c9d0de] hover:text-[#eab444] transition-colors shrink-0 p-1"
          >
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    );

    const proseBlock = (
      <div className="space-y-3.5">
        <p className="text-[16.5px] text-[#f8faff] leading-[1.6] font-semibold">{story.openingHook}</p>
        <p className="text-[15.5px] text-[#d5dce8] leading-[1.68] font-medium">
          {story.engineeringNarrative} {story.turningPoint}
        </p>
        <div className="pt-2 border-t border-[#2d3038]/85 flex flex-wrap items-baseline justify-between gap-2 font-mobilis text-[13px] font-semibold text-[#e9eef7]">
          <span className="text-[#eab444]">{repo.proofMetric}</span>
        </div>
        <pre className="font-mobilis text-[13px] font-medium leading-[1.6] text-[#e1e6f0] bg-[#04060b] border border-[#2d3038]/80 px-4 py-3 overflow-x-auto no-scrollbar">
          {repo.codeExcerpt}
        </pre>
        <p className="text-[14.5px] font-medium text-[#c0c7d6] italic leading-[1.55]">{story.bridgeToNext}</p>
      </div>
    );

    return (
      <div key={repo.id} className={`${widthClass} shrink-0 ${staggerClass}`}>
        <article
          ref={registerSpread(`spread-${repo.id}`, {
            label: `${act.roman} · ${act.title}`,
          })}
          data-testid={`timeline-spread-${repo.id}`}
          onPointerEnter={(e) => {
            e.currentTarget.dataset.panelActive = 'true';
            ambientSoundscape.playPanelShimmer(globalIndex, 'hover');
          }}
          onPointerDown={(e) => {
            e.currentTarget.dataset.panelActive = 'true';
            ambientSoundscape.playPanelShimmer(globalIndex, 'touch');
          }}
          onPointerLeave={(e) => {
            delete e.currentTarget.dataset.panelActive;
          }}
          onPointerCancel={(e) => {
            delete e.currentTarget.dataset.panelActive;
          }}
          className="w-full border border-[#2d3038]/90 bg-[#0a0d13]/96 transition-[border-color,background-color,box-shadow] duration-200 hover:border-[#eab444]/65 hover:bg-[#0d121b] hover:shadow-[0_16px_48px_-20px_rgba(234,180,68,0.18)] data-[panel-active=true]:border-[#eab444]/70 data-[panel-active=true]:bg-[#0d121b]"
        >
          {isPanorama && !isMobile ? (
            <div className="grid grid-cols-[1.02fr_0.98fr] gap-6 p-6 items-start">
              <div className="space-y-4">
                {headerBlock}
                {visualBox}
              </div>
              <div className="space-y-3 pt-1">
                <div className="font-mobilis text-[12px] text-[#eab444]">
                  {story.chapterTitle}
                </div>
                {proseBlock}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="p-5 pb-3">{headerBlock}</div>
              {visualBox}
              <div className="p-5 pt-4 space-y-3">{proseBlock}</div>
            </div>
          )}
        </article>
      </div>
    );
  };

  const endingSection = (
    <div className={isMobile ? 'space-y-7' : 'w-[600px] lg:w-[680px] space-y-7'}>
      <div className="space-y-4">
        <div className="font-mobilis text-xs text-[#eab444] tracking-wider">
          End of the chronicle
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-[#f3f7fe] tracking-tight">
          Every Layer Owned
        </h2>
        <p className="text-[15px] text-[#a6acb9] leading-relaxed max-w-xl">
          Twenty systems moving across the stack: APIs, TCP sockets, ML math, GPU kernels, heap
          allocators, Linux telemetry, cryptography, Unix tools, and native Vulkan interfaces. Each
          chapter answered one question and prepared the ground for the next.
        </p>
      </div>

      {/* Language distribution across the twenty systems */}
      <div className="space-y-2.5 max-w-lg">
        <div className="flex h-1.5 w-full bg-[#171b21] overflow-hidden">
          {stats.languageShares.slice(0, 5).map((lang, idx) => (
            <div
              key={lang.language}
              style={{
                width: `${lang.percent}%`,
                backgroundColor:
                  idx === 0
                    ? '#eab444'
                    : idx === 1
                      ? '#f3f7fe'
                      : idx === 2
                        ? '#a6acb9'
                        : idx === 3
                          ? '#646b78'
                          : '#3b414c',
              }}
              title={`${lang.language}: ${lang.percent}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mobilis text-xs text-[#a6acb9]">
          {stats.languageShares.slice(0, 5).map((lang) => (
            <span key={lang.language}>
              {lang.language} {lang.percent}%
            </span>
          ))}
        </div>
      </div>

      {/* Plain human links, zero controls */}
      <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#f3f7fe] pt-1">
        <a
          href={profile.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-[#eab444] transition-colors"
        >
          GitHub <ArrowUpRight className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
        </a>
        <a
          href={`mailto:${SIFR_DIRECT_EMAIL}`}
          className="font-mobilis text-xs sm:text-sm text-[#e4e8f1] hover:text-[#eab444] transition-colors"
        >
          {SIFR_DIRECT_EMAIL}
        </a>
      </div>
    </div>
  );

  // ============================================================================
  // MOBILE: Vertical downward story progression with scroll-linked fade & parallax
  // ============================================================================
  if (isMobile) {
    let runningIndex = 0;
    return (
      <div
        data-audio-state={audioStatus}
        className="min-h-screen w-full bg-[#04060b] text-[#f3f7fe] relative overflow-x-hidden"
      >
        {/* Layer 0: Deep Parallax Field */}
        <div
          ref={bgGridRef}
          aria-hidden="true"
          data-testid="parallax-bg-layer"
          className="fixed inset-0 pointer-events-none will-change-transform opacity-45"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(234,180,68,0.06), transparent 55%), radial-gradient(circle at 1px 1px, rgba(243,247,254,0.06) 1px, transparent 0)',
            backgroundSize: '100% 100%, 36px 36px',
            height: '130vh',
          }}
        />

        {/* Layer 1: Midground Vertical Guide Spine */}
        <div
          ref={midAxisRef}
          aria-hidden="true"
          data-testid="parallax-mid-layer"
          className="fixed left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#2d3038] to-transparent pointer-events-none will-change-transform"
        />

        {/* Minimal Fixed Top Mark */}
        <header className="fixed top-0 left-0 right-0 z-30 h-12 px-5 bg-[#04060b]/80 backdrop-blur-md border-b border-[#2d3038]/55 flex items-center justify-between">
          <a href="#top" className="inline-flex items-center gap-2.5 text-left">
            <SifrMark size={20} className="text-[#f3f7fe]" />
            <span className="font-stabilis text-sm font-bold tracking-wide text-[#f3f7fe]">
              SIFR
            </span>
          </a>
          <span className="font-mobilis text-xs text-[#b4bac8]">{activeChapterLabel}</span>
        </header>

        <main
          id="top"
          ref={(el) => {
            motionBlurContainerRef.current = el;
          }}
          className="relative z-10 px-5 pt-20 pb-20 space-y-12 max-w-xl mx-auto"
        >
          <section
            ref={registerSpread('entrance', { label: 'Prologue', pinEdge: 'start' })}
            className="space-y-6 pt-2"
          >
            <div className="space-y-3">
              <div className="font-mobilis text-[13px] font-semibold text-[#eab444] tracking-wider">
                Mohamed Salahi
              </div>
              <h1 className="font-stabilis text-6xl font-extrabold tracking-tight text-[#ffffff]">
                SIFR
              </h1>
              <p className="text-base font-medium text-[#d8dfec] leading-relaxed">
                Twenty systems shaped by one continuous question: how does the layer underneath
                actually work?
              </p>
            </div>

            <PhysicsCipherCanvas
              shift={shift}
              onShiftChange={onShiftChange}
              compact
              minimal
              scrollProgressRef={scrollProgressRef}
            />

            <LivingScrollCue isMobile scrollProgressRef={scrollProgressRef} />
          </section>

          {actGroups.map(({ act, items }) => (
            <section key={act.id} className="space-y-6 pt-4 relative">
              <img
                src={ACT_BACKDROP_PLATES[act.id]}
                alt=""
                aria-hidden="true"
                data-testid={`chapter-plate-${act.id}`}
                className="pointer-events-none select-none absolute -top-10 -right-8 w-[340px] h-[220px] object-contain opacity-30 blur-[1.2px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_76%)]"
              />
              <div
                ref={registerSpread(`act-intro-${act.id}`, {
                  label: `${act.roman} · ${act.title}`,
                })}
                className="relative z-10 border-t border-[#2d3038] pt-5 space-y-1.5"
              >
                <div className="font-mobilis text-[13px] font-semibold text-[#eab444]">
                  {act.roman} · {act.timeframe}
                </div>
                <h2 className="text-2xl font-extrabold text-[#ffffff]">{act.title}</h2>
                <p className="text-[15px] font-medium text-[#d5dce8] leading-relaxed">{act.subtitle}</p>
              </div>

              <div className="relative z-10 space-y-7">
                {items.map((repo) => renderSpread(repo, runningIndex++))}
              </div>
            </section>
          ))}

          <section
            ref={registerSpread('ending', { label: 'Epilogue', pinEdge: 'end' })}
            className="pt-8 border-t border-[#2d3038] will-change-[opacity,transform]"
          >
            {endingSection}
          </section>
        </main>

        <div
          aria-hidden="true"
          className="fixed bottom-0 left-0 right-0 h-[2px] bg-[#171b21] z-30 overflow-hidden"
        >
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left bg-[#eab444] will-change-transform"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>
    );
  }

  // ============================================================================
  // DESKTOP & TABLET: Horizontal moving canvas with scroll-linked fade & multi-depth parallax
  // ============================================================================
  let desktopItemIndex = 0;
  return (
    <div
      data-audio-state={audioStatus}
      className="h-[100dvh] w-full bg-[#04060b] text-[#f3f7fe] relative overflow-hidden"
    >
      {/* Layer 0: Deep Parallax Field (0.14x horizontal speed) */}
      <div
        ref={bgGridRef}
        aria-hidden="true"
        data-testid="parallax-bg-layer"
        className="fixed inset-y-0 left-0 w-[340vw] pointer-events-none will-change-transform opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 22% 55% at 15% 45%, rgba(234,180,68,0.06), transparent 70%), radial-gradient(ellipse 18% 50% at 52% 55%, rgba(234,180,68,0.05), transparent 70%), radial-gradient(circle at 1px 1px, rgba(243,247,254,0.055) 1px, transparent 0)',
          backgroundSize: '100% 100%, 100% 100%, 40px 40px',
        }}
      />

      {/* Layer 1: Midground Story Progression Band (0.36x horizontal speed, tucked cleanly at lower band) */}
      <div
        ref={midAxisRef}
        aria-hidden="true"
        data-testid="parallax-mid-layer"
        className="fixed bottom-12 left-0 w-[520vw] h-[18px] border-t border-[#2d3038]/55 pointer-events-none will-change-transform flex items-end"
      >
        <div className="w-full flex justify-between px-[16vw] font-mobilis text-[10px] tracking-[0.18em] text-[#454c5c]">
          <span>I · First Systems</span>
          <span>II · Math to Silicon</span>
          <span>III · Memory and Trust</span>
          <span>IV · Crafted From Zero</span>
        </div>
      </div>

      {/* Ambient Cursor Aura Field (GPU compositor-only, zero text impact) */}
      <div
        ref={pointerAuraRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-[480px] h-[480px] pointer-events-none z-[2] opacity-0 transition-opacity duration-500 will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(234,180,68,0.065) 0%, rgba(148,158,179,0.025) 42%, transparent 72%)',
        }}
      />

      {/* Soft Optical Cinema Edge Scrims */}
      <div
        aria-hidden="true"
        className="fixed inset-y-0 left-0 w-16 pointer-events-none z-20 bg-gradient-to-r from-[#04060b] via-[#04060b]/55 to-transparent"
      />
      <div
        aria-hidden="true"
        className="fixed inset-y-0 right-0 w-16 pointer-events-none z-20 bg-gradient-to-l from-[#04060b] via-[#04060b]/55 to-transparent"
      />

      {/* Minimal Fixed Top Mark with frosted optical blur */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 px-8 flex items-center justify-between pointer-events-none bg-gradient-to-b from-[#04060b]/85 via-[#04060b]/45 to-transparent backdrop-blur-[6px]">
        <a
          href="#entrance"
          className="pointer-events-auto inline-flex items-center gap-2.5 group"
        >
          <SifrMark
            size={22}
            className="text-[#f3f7fe] group-hover:text-[#eab444] transition-colors"
          />
          <span className="font-stabilis text-sm font-bold tracking-wide text-[#f3f7fe]">
            SIFR
          </span>
        </a>

        <span className="font-mobilis text-xs text-[#c2c8d6]">{activeChapterLabel}</span>
      </header>

      {/* Horizontal Moving Canvas */}
      <div
        ref={trackRef}
        data-testid="horizontal-timeline-track"
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleTrackPointerEnd}
        onPointerCancel={handleTrackPointerEnd}
        onPointerLeave={() => {
          if (pointerAuraRef.current) pointerAuraRef.current.style.opacity = '0';
          handleTrackPointerEnd();
        }}
        className="relative z-10 h-full w-full overflow-x-auto overflow-y-hidden no-scrollbar flex items-center select-text"
      >
        <div
          ref={(el) => {
            motionBlurContainerRef.current = el;
          }}
          data-testid="scroll-motion-blur-rail"
          className="flex items-center h-full px-10 sm:px-16 gap-10 lg:gap-14 shrink-0"
        >
          {/* Entrance Frame */}
          <section
            ref={registerSpread('entrance', { label: 'Prologue', pinEdge: 'start' })}
            id="entrance"
            className="w-[82vw] md:w-[76vw] lg:w-[68vw] max-w-[980px] shrink-0 grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-10 items-center pr-8"
          >
            <div className="space-y-5">
              <div className="font-mobilis text-[13px] font-semibold text-[#eab444] tracking-wider">
                Mohamed Salahi
              </div>
              <h1 className="font-stabilis text-7xl lg:text-8xl font-extrabold tracking-tight text-[#ffffff]">
                SIFR
              </h1>
              <p className="text-lg lg:text-[20px] font-medium text-[#d8dfec] max-w-lg leading-[1.6]">
                Twenty systems shaped by one continuous question: how does the layer underneath
                actually work?
              </p>
              <LivingScrollCue isMobile={false} scrollProgressRef={scrollProgressRef} />
            </div>

            <PhysicsCipherCanvas
              shift={shift}
              onShiftChange={onShiftChange}
              minimal
              scrollProgressRef={scrollProgressRef}
            />
          </section>

          {/* Expanding Story Parts I -> IV with code-generated geometric backdrop plates */}
          {actGroups.map(({ act, items }) => (
            <div key={act.id} className="relative flex items-center gap-8 lg:gap-11 shrink-0">
              {/* Subtle atmospheric chapter geometric plate anchoring transition between sections */}
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute -left-24 top-1/2 -translate-y-1/2 w-[560px] h-[380px] z-0 overflow-hidden"
              >
                <img
                  src={ACT_BACKDROP_PLATES[act.id]}
                  alt=""
                  data-testid={`chapter-plate-${act.id}`}
                  className="w-full h-full object-contain opacity-45 blur-[1.4px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
                />
              </div>

              <div
                ref={registerSpread(`act-intro-${act.id}`, {
                  label: `${act.roman} · ${act.title}`,
                })}
                className="relative z-10 w-[270px] shrink-0 border-t border-[#2d3038] pt-4 space-y-2.5"
              >
                <div className="font-mobilis text-[13px] font-semibold text-[#eab444]">
                  {act.roman} · {act.timeframe}
                </div>
                <h2 className="text-2xl lg:text-[30px] font-extrabold text-[#ffffff]">{act.title}</h2>
                <p className="text-[15px] font-medium text-[#d5dce8] leading-[1.6]">{act.subtitle}</p>
              </div>

              <div className="relative z-10 flex items-center gap-8 lg:gap-11 shrink-0">
                {items.map((repo) => renderSpread(repo, desktopItemIndex++))}
              </div>
            </div>
          ))}

          {/* Ending Frame */}
          <section
            ref={registerSpread('ending', { label: 'Epilogue', pinEdge: 'end' })}
            className="shrink-0 pl-8 pr-20"
          >
            {endingSection}
          </section>
        </div>
      </div>

      {/* Bottom Story Progression Track */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-8 py-3 pointer-events-none flex items-center gap-6 bg-gradient-to-t from-[#04060b]/85 via-[#04060b]/40 to-transparent backdrop-blur-[4px]">
        <div className="flex-1 h-[2px] bg-[#171b21] relative overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left bg-[#eab444] will-change-transform"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
        <div className="hidden md:flex items-center gap-5 font-mobilis text-xs text-[#b4bac8] shrink-0">
          <span>I. First Systems</span>
          <span>II. Math to Silicon</span>
          <span>III. Memory and Trust</span>
          <span>IV. Crafted From Zero</span>
        </div>
      </footer>
    </div>
  );
}
