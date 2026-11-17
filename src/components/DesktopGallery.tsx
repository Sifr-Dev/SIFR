import { useMemo, useState } from 'react';
import { ArrowUpRight, Play, Terminal, Volume2, VolumeX, FileText } from 'lucide-react';
import {
  ZERO_DOCTRINES,
  type GitHubActivityItem,
  type GitHubProfileSnapshot,
  type RepoCategory,
  type RepoSpec,
} from '../data/repos';
import type { GitHubAggregateStats } from '../lib/githubStats';
import { formatRelativeDate } from '../lib/githubStats';
import type { SyncSource } from '../hooks/useGitHubTelemetry';
import { haptics } from '../lib/haptics';
import { SifrMark } from './SifrMark';
import { PhysicsCipherCanvas } from './PhysicsCipherCanvas';
import { ProjectPhysicsIllustration } from './ProjectPhysicsIllustration';
import { InteractiveRepoDemo } from './InteractiveDemos';
import { GitHubTelemetrySection } from './GitHubTelemetrySection';

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
  onOpenRepoModal,
  onOpenShowreel,
  paused = false,
}: DesktopGalleryProps) {
  const [filter, setFilter] = useState<'all' | RepoCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [labRepoId, setLabRepoId] = useState<string>('tachyon-fetch');

  const filteredRepos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return repos.filter((r) => {
      if (filter !== 'all' && r.category !== filter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.primaryLanguage.toLowerCase().includes(q) ||
        r.stack.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [repos, filter, searchQuery]);

  const activeLabRepo = useMemo(
    () => repos.find((r) => r.id === labRepoId) ?? repos[0],
    [repos, labRepoId]
  );

  const featuredRepos = filteredRepos.filter((r) => r.featured);
  const archiveRepos = filteredRepos.filter((r) => !r.featured);

  return (
    <div id="top" className="min-h-screen bg-[#04060b] text-[#f3f7fe]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#04060b]/95 backdrop-blur-xs border-b border-[#2d3038]">
        <div className="max-w-[1180px] mx-auto px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            onClick={() => haptics.trigger('tap')}
            className="inline-flex items-center gap-3 whitespace-nowrap shrink-0"
          >
            <SifrMark size={24} shift={shift} />
            <span className="font-mobilis text-[15px] font-bold tracking-[0.06em] text-[#f3f7fe]">
              SIFR
            </span>
          </a>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav aria-label="Primary navigation" className="flex items-center gap-7">
            {[
              { href: '#works', label: 'Works' },
              { href: '#lab', label: 'Live Lab' },
              { href: '#activity', label: 'Activity' },
              { href: '#dossier', label: 'Dossier' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => haptics.trigger('tap')}
                className="font-mobilis text-xs uppercase tracking-[0.12em] text-[#9498a1] hover:text-[#f3f7fe] hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                haptics.trigger('confirm');
                onOpenRepoModal(activeLabRepo);
              }}
              className="min-h-[40px] px-4 py-2 bg-[#eab444] hover:bg-[#d39900] text-[#04060b] font-mobilis text-xs font-bold uppercase tracking-[0.1em] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Launch Lab
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-8">
        {/* Hero Split */}
        <section className="py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div className="space-y-5">
            <div className="font-mobilis text-xs uppercase tracking-[0.14em] text-[#9498a1]">
              SIFR · صفر · Mohamed Salahi
            </div>
            <h1 className="text-[46px] xl:text-[56px] font-bold tracking-[-0.025em] leading-[1.06] text-[#f3f7fe] max-w-xl">
              built from <span className="text-[#eab444]">zero.</span>
            </h1>
            <p className="text-base text-[#b9bec7] leading-relaxed max-w-[56ch]">
              Systems, machine learning, and native graphics engineer. Head engineer and co-founder
              at Argos Security. Every artifact below is built from first principles—from hand-marshaled
              Wayland &amp; Vulkan shaders in Zig to post-quantum Rust kernels and sub-millisecond GPU kernels.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-4">
              <a
                href="#works"
                onClick={() => haptics.trigger('confirm')}
                className="min-h-[44px] px-6 py-3 bg-[#eab444] hover:bg-[#d39900] text-[#04060b] font-mobilis text-xs font-bold uppercase tracking-[0.1em] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                Explore 11 Works
              </a>
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  onOpenShowreel();
                }}
                className="min-h-[44px] px-5 py-3 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[#f3f7fe] font-mobilis text-xs uppercase tracking-[0.1em] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                Brand Motion Reel
              </button>
              <a
                href={profile.htmlUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => haptics.trigger('tap')}
                className="min-h-[44px] px-4 py-3 font-mobilis text-xs uppercase tracking-[0.1em] text-[#9498a1] hover:text-[#eab444] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                GitHub <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PhysicsCipherCanvas shift={shift} onShiftChange={onShiftChange} paused={paused} />
          </div>
        </section>

        {/* Full-Width Quantitative Proof Strip */}
        <section
          aria-label="Verified engineering highlights"
          className="border-y border-[#2d3038] py-5 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div>
            <div className="font-mobilis text-[11px] uppercase tracking-[0.12em] text-[#9498a1]">
              Public Repositories
            </div>
            <div className="font-mobilis text-xl font-bold text-[#f3f7fe] mt-1">
              {repos.length} Verified
            </div>
          </div>
          <div>
            <div className="font-mobilis text-[11px] uppercase tracking-[0.12em] text-[#9498a1]">
              Verrev PQ Kernel
            </div>
            <div className="font-mobilis text-xl font-bold text-[#f3f7fe] mt-1">
              31/31 Tests Pass
            </div>
          </div>
          <div>
            <div className="font-mobilis text-[11px] uppercase tracking-[0.12em] text-[#9498a1]">
              RMSNorm JAX XLA
            </div>
            <div className="font-mobilis text-xl font-bold text-[#eab444] mt-1">
              0.147 ms (22.8×)
            </div>
          </div>
          <div>
            <div className="font-mobilis text-[11px] uppercase tracking-[0.12em] text-[#9498a1]">
              Cipher Wayland GPU
            </div>
            <div className="font-mobilis text-xl font-bold text-[#f3f7fe] mt-1">
              24 Frames · Zero C
            </div>
          </div>
        </section>

        {/* Selected Works & Complete 11-Repo Gallery */}
        <section id="works" className="py-16">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
            <div>
              <p className="font-mobilis text-xs uppercase tracking-[0.14em] text-[#9498a1]">
                Complete Repository Exhibition · 01–11
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#f3f7fe]">
                Selected works &amp; live schematics.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                role="tablist"
                aria-label="Filter repositories by discipline"
                className="flex items-center border border-[#2d3038] bg-[#0a0d13] p-1 gap-1"
              >
                {(
                  [
                    { key: 'all', label: `All (${stats.categoryCounts.all})` },
                    { key: 'systems', label: `Systems (${stats.categoryCounts.systems})` },
                    { key: 'ml', label: `ML & Vision (${stats.categoryCounts.ml})` },
                    { key: 'infra', label: `Backend (${stats.categoryCounts.infra})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={filter === tab.key}
                    onClick={() => {
                      haptics.trigger('detent');
                      setFilter(tab.key);
                    }}
                    className={`min-h-[36px] px-3 py-1.5 font-mobilis text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      filter === tab.key
                        ? 'bg-[#eab444] text-[#04060b] font-bold'
                        : 'text-[#9498a1] hover:text-[#f3f7fe]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter stack or repo..."
                aria-label="Search repositories"
                className="min-h-[44px] w-52 px-3 bg-[#0a0d13] border border-[#2d3038] font-mobilis text-xs text-[#f3f7fe] placeholder:text-[#9498a1]"
              />
            </div>
          </div>

          {filteredRepos.length === 0 ? (
            <div className="border border-[#2d3038] bg-[#0a0d13] p-10 text-center space-y-3">
              <p className="font-mobilis text-sm text-[#b9bec7]">
                No repositories match "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  setFilter('all');
                  setSearchQuery('');
                }}
                className="min-h-[40px] px-4 py-2 bg-[#eab444] text-[#04060b] font-mobilis text-xs font-bold uppercase cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Flagship 2-Column Chamfered Showcase */}
              {featuredRepos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {featuredRepos.map((repo) => (
                    <article
                      key={repo.id}
                      className="border border-[#2d3038] bg-[#0a0d13] chamfer flex flex-col justify-between hover:border-[#eab444]/70 transition-colors"
                    >
                      <div>
                        <ProjectPhysicsIllustration schematic={repo.schematic} heightClass="h-44" />
                        <div className="p-6 space-y-3">
                          <div className="flex items-center gap-2 font-mobilis text-xs text-[#9498a1]">
                            <span className="text-[#eab444]">{repo.primaryLanguage}</span>
                            <span aria-hidden="true">·</span>
                            <span>{repo.categoryLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatRelativeDate(repo.updatedAt)}</span>
                          </div>
                          <h3 className="text-xl font-bold text-[#f3f7fe]">
                            {repo.name} — {repo.subtitle}
                          </h3>
                          <p className="text-sm text-[#b9bec7] leading-relaxed">
                            {repo.summary}
                          </p>
                          <div className="pt-1 font-mobilis text-xs text-[#eab444]">
                            {repo.proofMetric}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 border-t border-[#2d3038] flex items-center justify-between gap-4">
                        <button
                          type="button"
                          aria-label={`Open live demo for ${repo.name}`}
                          onClick={() => {
                            haptics.trigger('confirm');
                            onOpenRepoModal(repo);
                          }}
                          className="min-h-[40px] px-4 py-2 bg-[#171b21] hover:bg-[#eab444] hover:text-[#04060b] border border-[#2d3038] hover:border-[#eab444] font-mobilis text-xs font-bold uppercase tracking-wider text-[#f3f7fe] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Open Live Demo
                        </button>
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => haptics.trigger('tap')}
                          className="min-h-[40px] px-2 inline-flex items-center gap-1 font-mobilis text-xs text-[#9498a1] hover:text-[#eab444] whitespace-nowrap shrink-0"
                        >
                          GitHub <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Remaining Public Repositories 3-Column Matrix */}
              {archiveRepos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {archiveRepos.map((repo) => (
                    <article
                      key={repo.id}
                      className="border border-[#2d3038] bg-[#0a0d13] flex flex-col justify-between hover:border-[#eab444]/70 transition-colors"
                    >
                      <div>
                        <ProjectPhysicsIllustration schematic={repo.schematic} heightClass="h-32" />
                        <div className="p-5 space-y-2.5">
                          <div className="flex items-center gap-2 font-mobilis text-[11px] text-[#9498a1]">
                            <span className="text-[#eab444]">{repo.primaryLanguage}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatRelativeDate(repo.updatedAt)}</span>
                          </div>
                          <h3 className="text-lg font-bold text-[#f3f7fe]">{repo.name}</h3>
                          <p className="text-xs text-[#b9bec7] leading-relaxed line-clamp-3">
                            {repo.summary}
                          </p>
                          <div className="font-mobilis text-[11px] text-[#eab444] pt-1">
                            {repo.proofMetric}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-3.5 border-t border-[#2d3038] flex items-center justify-between gap-3">
                        <button
                          type="button"
                          aria-label={`Open interactive demo for ${repo.name}`}
                          onClick={() => {
                            haptics.trigger('confirm');
                            onOpenRepoModal(repo);
                          }}
                          className="min-h-[38px] px-3 py-1.5 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] hover:text-[#eab444] font-mobilis text-xs text-[#f3f7fe] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Interactive Demo
                        </button>
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => haptics.trigger('tap')}
                          className="min-h-[38px] inline-flex items-center gap-1 font-mobilis text-xs text-[#9498a1] hover:text-[#eab444] whitespace-nowrap shrink-0"
                        >
                          Repo <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Inline Interactive Engineering Lab */}
        <section id="lab" className="py-16 border-t border-[#2d3038]">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
            <div>
              <p className="font-mobilis text-xs uppercase tracking-[0.14em] text-[#9498a1]">
                Interactive Sandbox · Real Logic
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#f3f7fe]">
                Inspect running simulations.
              </h2>
            </div>
            <div className="font-mobilis text-xs text-[#9498a1]">
              Select any of the {repos.length} public repositories below
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-stretch">
            <div className="border border-[#2d3038] bg-[#0a0d13] divide-y divide-[#2d3038]">
              {repos.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    haptics.trigger('detent');
                    setLabRepoId(r.id);
                  }}
                  className={`w-full min-h-[44px] px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                    r.id === activeLabRepo.id
                      ? 'bg-[#171b21] text-[#eab444]'
                      : 'text-[#b9bec7] hover:bg-[#171b21]/50 hover:text-[#f3f7fe]'
                  }`}
                >
                  <span className="font-mobilis text-xs font-bold truncate">{r.name}</span>
                  <span className="font-mobilis text-[11px] text-[#9498a1] shrink-0">
                    {r.primaryLanguage}
                  </span>
                </button>
              ))}
            </div>

            <div className="border border-[#2d3038] bg-[#0a0d13] chamfer p-6 flex flex-col justify-between space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#2d3038] pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mobilis text-xs text-[#eab444]">
                    <Terminal className="w-4 h-4" aria-hidden="true" />
                    <span>{activeLabRepo.name}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#f3f7fe] mt-1">
                    {activeLabRepo.subtitle}
                  </h3>
                </div>
                <a
                  href={activeLabRepo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => haptics.trigger('tap')}
                  className="min-h-[38px] px-3 py-1.5 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] font-mobilis text-xs text-[#f3f7fe] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  Inspect Source <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>

              <InteractiveRepoDemo repo={activeLabRepo} />
            </div>
          </div>
        </section>

        {/* Live GitHub Telemetry & Activity */}
        <GitHubTelemetrySection
          profile={profile}
          stats={stats}
          activity={activity}
          syncSource={syncSource}
          onSelectRepoByName={(name) => {
            const match = repos.find((r) => r.name.toLowerCase() === name.toLowerCase());
            if (match) onOpenRepoModal(match);
          }}
        />

        {/* Zero Doctrine & Brand Dossier */}
        <section id="dossier" className="py-16 border-t border-[#2d3038]">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <div>
              <p className="font-mobilis text-xs uppercase tracking-[0.14em] text-[#9498a1]">
                Zero Doctrine &amp; Dossier
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#f3f7fe]">
                Open mechanism, secret key.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/brand/sifr-cv.pdf"
                target="_blank"
                rel="noreferrer"
                onClick={() => haptics.trigger('tap')}
                className="min-h-[42px] px-4 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] font-mobilis text-xs text-[#f3f7fe] inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                Curriculum Vitae (PDF)
              </a>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`min-h-[42px] px-4 py-2 border font-mobilis text-xs inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  audioEnabled
                    ? 'border-[#eab444] bg-[#171b21] text-[#eab444]'
                    : 'border-[#2d3038] bg-[#0a0d13] text-[#9498a1] hover:text-[#f3f7fe]'
                }`}
              >
                {audioEnabled ? (
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                Haptic Audio: {audioEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ZERO_DOCTRINES.map((d) => (
              <div key={d.index} className="border border-[#2d3038] bg-[#0a0d13] p-5 space-y-2">
                <div className="font-mobilis text-xs text-[#eab444]">{d.index}.</div>
                <h3 className="text-base font-bold text-[#f3f7fe]">{d.title}</h3>
                <p className="text-xs text-[#9498a1] leading-relaxed">{d.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Shell Identity Footer */}
      <footer className="border-t border-[#2d3038] bg-[#04060b]">
        <div className="max-w-[1180px] mx-auto px-8 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="font-mobilis text-sm text-[#f3f7fe] flex items-center gap-2">
            <span>sifr@mobilis ~</span>
            <span className="text-[#eab444]">❯</span>
            <span className="inline-block w-2 h-4 bg-[#eab444]" aria-hidden="true" />
            <span className="text-xs text-[#9498a1] ml-3">shift {shift}</span>
          </div>
          <div className="flex items-center gap-6 font-mobilis text-xs text-[#9498a1]">
            <a
              href="https://github.com/mohamedsalahi"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#eab444]"
            >
              github.com/mohamedsalahi
            </a>
            <span>Argos Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
