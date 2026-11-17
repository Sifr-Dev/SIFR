import { useEffect, useState } from 'react';
import { type RepoSpec } from './data/repos';
import { useGitHubTelemetry } from './hooks/useGitHubTelemetry';
import { useIsMobileViewport } from './hooks/useIsMobileViewport';
import { haptics, type HapticKind } from './lib/haptics';
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
    >
      <PhysicsCursor enabled={!isMobile} />

      {isMobile ? (
        <MobileShell
          profile={profile}
          repos={repos}
          activity={activity}
          stats={stats}
          syncSource={syncSource}
          shift={shift}
          onShiftChange={setShift}
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
          onOpenShowreel={() => setShowreelOpen(true)}
        />
      ) : (
        <DesktopGallery
          profile={profile}
          repos={repos}
          activity={activity}
          stats={stats}
          syncSource={syncSource}
          shift={shift}
          onShiftChange={setShift}
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
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
          allRepos={repos}
        />
      )}

      <ShowreelModal
        open={showreelOpen}
        onClose={() => setShowreelOpen(false)}
      />
    </div>
  );
}
