import { useEffect, useMemo, useState } from 'react';
import { type RepoSpec } from './data/repos';
import { useGitHubTelemetry } from './hooks/useGitHubTelemetry';
import { useIsMobileViewport } from './hooks/useIsMobileViewport';
import { haptics, type HapticKind } from './lib/haptics';
import {
  RIDE_STORAGE_KEY,
  advanceRide,
  createInitialRideState,
  enterRide,
  getActForRepoId,
  getOrderedTrack,
  jumpToUnlockedStation,
  parseRideState,
  resolveSceneParam,
  restartRide,
  serializeRideState,
  stepBackRide,
  type RideState,
} from './lib/narrative';
import { DesktopGallery } from './components/DesktopGallery';
import { MobileShell } from './components/MobileShell';
import { RepoLabModal } from './components/RepoLabModal';
import { ShowreelModal } from './components/ShowreelModal';
import { PhysicsCursor } from './components/PhysicsCursor';

export default function App() {
  const isMobile = useIsMobileViewport(768);
  const { profile, repos, activity, stats, syncSource } = useGitHubTelemetry();

  const [shift, setShift] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [modalRepo, setModalRepo] = useState<RepoSpec | null>(null);
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [lastHaptic, setLastHaptic] = useState<{ kind: HapticKind; ts: number } | null>(null);

  const orderedRepos = useMemo(() => getOrderedTrack(repos), [repos]);

  const [rideState, setRideState] = useState<RideState>(() => {
    const initialTrack = getOrderedTrack(repos);
    let base = createInitialRideState();
    if (typeof window !== 'undefined') {
      try {
        const stored = parseRideState(window.sessionStorage.getItem(RIDE_STORAGE_KEY), initialTrack.length);
        if (stored) base = stored;
      } catch {
        // Ignore restricted sessionStorage contexts
      }
      if (new URLSearchParams(window.location.search).get('autostart') === '1') {
        base = enterRide(base);
      }
      base = resolveSceneParam(window.location.search, base, initialTrack);
    }
    return base;
  });

  // Persist session ride state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(RIDE_STORAGE_KEY, serializeRideState(rideState));
    } catch {
      // Ignore storage failures
    }
  }, [rideState]);

  // Sync procedural per-Act Web Audio ambient drone
  useEffect(() => {
    if (!rideState.hasEntered) {
      haptics.setAmbientAct('entrance');
      return;
    }
    if (rideState.hasExited) {
      haptics.setAmbientAct('exit');
      return;
    }
    const activeRepo = orderedRepos[rideState.currentIndex];
    const act = activeRepo ? getActForRepoId(activeRepo.id) : null;
    haptics.setAmbientAct(act?.id ?? 'act-1');
  }, [orderedRepos, rideState.currentIndex, rideState.hasEntered, rideState.hasExited]);

  useEffect(() => {
    return haptics.subscribe((kind, ts) => {
      setLastHaptic({ kind, ts });
    });
  }, []);

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    haptics.setAudioEnabled(next);
    if (!next) {
      haptics.trigger('tap');
    }
  };

  const handleRestartRide = () => {
    const fresh = restartRide();
    setRideState(fresh);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(RIDE_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <div
      data-viewport={isMobile ? 'mobile' : 'desktop'}
      data-last-haptic={lastHaptic?.kind ?? 'none'}
      data-ride-station={rideState.currentIndex + 1}
      data-ride-exited={rideState.hasExited ? 'true' : 'false'}
    >
      <PhysicsCursor enabled={!isMobile} />

      {isMobile ? (
        <MobileShell
          profile={profile}
          repos={orderedRepos}
          activity={activity}
          stats={stats}
          syncSource={syncSource}
          shift={shift}
          onShiftChange={setShift}
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
          rideState={rideState}
          onEnterRide={() => setRideState((prev) => enterRide(prev))}
          onAdvanceRide={() => setRideState((prev) => advanceRide(prev, orderedRepos.length))}
          onStepBackRide={() => setRideState((prev) => stepBackRide(prev))}
          onJumpToStation={(idx) =>
            setRideState((prev) => jumpToUnlockedStation(prev, idx, orderedRepos.length))
          }
          onRestartRide={handleRestartRide}
          onOpenShowreel={() => setShowreelOpen(true)}
        />
      ) : (
        <DesktopGallery
          profile={profile}
          repos={orderedRepos}
          activity={activity}
          stats={stats}
          syncSource={syncSource}
          shift={shift}
          onShiftChange={setShift}
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
          rideState={rideState}
          onEnterRide={() => setRideState((prev) => enterRide(prev))}
          onAdvanceRide={() => setRideState((prev) => advanceRide(prev, orderedRepos.length))}
          onStepBackRide={() => setRideState((prev) => stepBackRide(prev))}
          onJumpToStation={(idx) =>
            setRideState((prev) => jumpToUnlockedStation(prev, idx, orderedRepos.length))
          }
          onRestartRide={handleRestartRide}
          onOpenRepoModal={(repo) => setModalRepo(repo)}
          onOpenShowreel={() => setShowreelOpen(true)}
          paused={Boolean(modalRepo) || showreelOpen}
        />
      )}

      {!isMobile && (
        <RepoLabModal
          repo={modalRepo}
          onClose={() => setModalRepo(null)}
          onSelectRepo={(repo) => setModalRepo(repo)}
          allRepos={orderedRepos}
          maxUnlockedIndex={rideState.maxUnlockedIndex}
          hasExited={rideState.hasExited}
        />
      )}

      <ShowreelModal open={showreelOpen} onClose={() => setShowreelOpen(false)} />
    </div>
  );
}
