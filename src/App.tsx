import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findRepoByIdOrAlias, type RepoSpec } from './data/repos';
import { useGitHubTelemetry } from './hooks/useGitHubTelemetry';
import { useIsMobileViewport } from './hooks/useIsMobileViewport';
import { haptics } from './lib/haptics';
import { buildSceneSharePath, getOrderedTrack } from './lib/narrative';
import { Navbar } from './components/Navbar';
import { OverviewHero } from './components/OverviewHero';
import { FlagshipSection } from './components/FlagshipSection';
import { ProjectCatalogSection } from './components/ProjectCatalogSection';
import { TimelineCanvas } from './components/TimelineCanvas';
import { SignalDispatchSection } from './components/SignalDispatchSection';
import { RepoLabModal } from './components/RepoLabModal';

export default function App() {
  const isMobile = useIsMobileViewport(768);
  const { profile, repos, stats } = useGitHubTelemetry();

  const [shift, setShift] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState<RepoSpec | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const orderedRepos = useMemo(() => getOrderedTrack(repos), [repos]);

  useEffect(() => {
    haptics.setAudioEnabled(false);
  }, []);

  // Support deep linking via ?scene=<repo-id-or-alias>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scene = params.get('scene')?.trim();
    if (!scene) return;
    const resolved = findRepoByIdOrAlias(scene);
    if (resolved) {
      const liveMatch = orderedRepos.find((r) => r.id.toLowerCase() === resolved.id.toLowerCase());
      setSelectedRepo(liveMatch ?? resolved);
    }
  }, [orderedRepos]);

  const handleSelectRepo = useCallback((repo: RepoSpec) => {
    setSelectedRepo(repo);
    const nextUrl = `${window.location.pathname}${buildSceneSharePath(repo.id)}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedRepo(null);
    if (window.location.search.includes('scene=')) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
    }
  }, []);

  const focusSearch = useCallback(() => {
    const input = searchInputRef.current;
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      input.focus({ preventScroll: true });
    }, 120);
  }, []);

  // Global `/` shortcut to focus the repository search field cleanly
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (selectedRepo) return;
      e.preventDefault();
      focusSearch();
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [focusSearch, selectedRepo]);

  return (
    <div
      data-viewport={isMobile ? 'mobile' : 'desktop'}
      className="min-h-screen bg-[#04060b] text-[#f3f7fe]"
    >
      <Navbar onFocusSearch={focusSearch} />

      <main>
        <OverviewHero
          profile={profile}
          repoCount={orderedRepos.length}
          shift={shift}
          onShiftChange={setShift}
          onFocusSearch={focusSearch}
        />

        <FlagshipSection repos={orderedRepos} onSelectRepo={handleSelectRepo} />

        <ProjectCatalogSection
          repos={orderedRepos}
          searchInputRef={searchInputRef}
          onSelectRepo={handleSelectRepo}
        />

        <TimelineCanvas
          isMobile={isMobile}
          profile={profile}
          repos={orderedRepos}
          stats={stats}
          shift={shift}
          onShiftChange={setShift}
          onSelectRepo={handleSelectRepo}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SignalDispatchSection />
        </div>
      </main>

      <footer className="border-t border-[#2d3038] bg-[#04060b] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mobilis text-xs text-[#a6acb9]">
          <span>SIFR · Mohamed Salahy · github.com/Sifr-Dev</span>
          <span>20 Public Systems · Obsidian &amp; Brass</span>
        </div>
      </footer>

      <RepoLabModal
        repo={selectedRepo}
        onClose={handleCloseModal}
        onSelectRepo={handleSelectRepo}
        allRepos={orderedRepos}
      />
    </div>
  );
}
