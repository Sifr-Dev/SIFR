import { useEffect, useMemo, useState } from 'react';
import { useGitHubTelemetry } from './hooks/useGitHubTelemetry';
import { useIsMobileViewport } from './hooks/useIsMobileViewport';
import { haptics } from './lib/haptics';
import { getOrderedTrack } from './lib/narrative';
import { TimelineCanvas } from './components/TimelineCanvas';

export default function App() {
  const isMobile = useIsMobileViewport(768);
  const { profile, repos, stats } = useGitHubTelemetry();

  const [shift, setShift] = useState(0);
  const orderedRepos = useMemo(() => getOrderedTrack(repos), [repos]);

  useEffect(() => {
    haptics.setAudioEnabled(false);
  }, []);

  return (
    <div data-viewport={isMobile ? 'mobile' : 'desktop'}>
      <TimelineCanvas
        isMobile={isMobile}
        profile={profile}
        repos={orderedRepos}
        stats={stats}
        shift={shift}
        onShiftChange={setShift}
      />
    </div>
  );
}
