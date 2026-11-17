import { useEffect, useMemo, useState } from 'react';
import { type RepoSpec } from './data/repos';
import { useGitHubTelemetry } from './hooks/useGitHubTelemetry';
import { useIsMobileViewport } from './hooks/useIsMobileViewport';
import { haptics, type HapticKind } from './lib/haptics';
import {
  CANONICAL_TRACK_ORDER,
  advanceRide,
  createInitialRideState,
  enterRide,
  jumpToUnlockedStation,
  restartRide,
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

  const [rideState, setRideState] = useState<RideState>(() => {
    const base = createInitialRideState();
    if (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('autostart') === '1'
    ) {
      return enterRide(base);
    }
    return base;
  });

  const orderedRepos = useMemo(() => {
    const byId = new Map(repos.map((r) => [r.id, r]));
    return CANONICAL_TRACK_ORDER.map((id) => byId.get(id)).filter((r): r is RepoSpec => Boolean(r));
  }, [repos]);

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
          onAdvanceRide={() => setRideState((prev) => advanceRide(prev))}
          onStepBackRide={() => setRideState((prev) => stepBackRide(prev))}
          onJumpToStation={(idx) => setRideState((prev) => jumpToUnlockedStation(prev, idx))}
          onRestartRide={() => setRideState(restartRide())}
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
          onAdvanceRide={() => setRideState((prev) => advanceRide(prev))}
          onStepBackRide={() => setRideState((prev) => stepBackRide(prev))}
          onJumpToStation={(idx) => setRideState((prev) => jumpToUnlockedStation(prev, idx))}
          onRestartRide={() => setRideState(restartRide())}
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
