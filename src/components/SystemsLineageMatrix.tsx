import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Layers } from 'lucide-react';
import type { RepoSpec } from '../data/repos';
import { computeSpeedupRatio, getBenchmarkForRepo } from '../data/benchmarks';
import { CANONICAL_ACTS } from '../lib/narrative';
import { getLineageConnections, getLineageForRepo } from '../lib/lineage';
import { haptics } from '../lib/haptics';

interface SystemsLineageMatrixProps {
  repos: RepoSpec[];
  onJumpToStation: (index: number) => void;
  onOpenRepoModal: (repo: RepoSpec) => void;
}

export function SystemsLineageMatrix({
  repos,
  onJumpToStation,
  onOpenRepoModal,
}: SystemsLineageMatrixProps) {
  const [selectedId, setSelectedId] = useState<string>('verrev');

  const repoById = useMemo(
    () => new Map(repos.map((r, index) => [r.id.toLowerCase(), { repo: r, index }])),
    [repos]
  );

  const selectedEntry = repoById.get(selectedId.toLowerCase()) ?? {
    repo: repos[0],
    index: 0,
  };
  const selectedRepo = selectedEntry.repo;
  const relations = useMemo(
    () => getLineageConnections(selectedRepo.id),
    [selectedRepo.id]
  );
  const lineage = useMemo(() => getLineageForRepo(selectedRepo.id), [selectedRepo.id]);
  const bench = getBenchmarkForRepo(selectedRepo.id);
  const speedup = computeSpeedupRatio(bench.baselineValue, bench.sifrValue, bench.lowerIsBetter);

  const upstreamSet = new Set(relations.builtUpon.map((s) => s.toLowerCase()));
  const downstreamSet = new Set(relations.powers.map((s) => s.toLowerCase()));

  return (
    <section
      id="lineage"
      aria-label="Zero-Origin Systems Architecture Matrix"
      className="space-y-6 py-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.06em] text-[#eab444] inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            Architectural Topology · Dependency Matrix
          </p>
          <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-[#f3f7fe]">
            How every system builds upon the last.
          </h2>
        </div>
        <p className="text-[13px] font-medium text-[#a6acb9] max-w-md">
          Select any node across the four architectural strata to trace upstream primitives and
          downstream systems powered by it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
        {/* Left: 4-Strata Interactive Architectural Map */}
        <div className="border border-[#2d3038] ethereal-surface p-5 space-y-3">
          {[...CANONICAL_ACTS].reverse().map((act) => (
            <div
              key={act.id}
              className="border border-[#2d3038] bg-[#04060b]/85 p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-mobilis font-semibold text-[#eab444] tracking-[0.08em] uppercase">
                  {act.roman} · {act.title}
                </span>
                <span className="text-[#9ca2af] hidden sm:inline">{act.timeframe}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {act.stationIds.map((stationId) => {
                  const found = repoById.get(stationId.toLowerCase());
                  if (!found) return null;
                  const { repo } = found;
                  const lower = repo.id.toLowerCase();
                  const isSelected = lower === selectedRepo.id.toLowerCase();
                  const isUpstream = upstreamSet.has(lower);
                  const isDownstream = downstreamSet.has(lower);
                  const repoBench = getBenchmarkForRepo(repo.id);
                  const repoRatio = computeSpeedupRatio(
                    repoBench.baselineValue,
                    repoBench.sifrValue,
                    repoBench.lowerIsBetter
                  );

                  return (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        haptics.trigger('detent');
                        setSelectedId(repo.id);
                      }}
                      className={`text-left p-2.5 border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#eab444] bg-[#eab444] text-[#04060b]'
                          : isUpstream
                            ? 'border-[#40e080]/70 bg-[#0a130e] text-[#f3f7fe]'
                            : isDownstream
                              ? 'border-[#eab444]/70 bg-[#17130a] text-[#f3f7fe]'
                              : 'border-[#2d3038] bg-[#0a0d13] text-[#e4e8f1] hover:border-[#eab444]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-mobilis text-[11px] font-bold truncate ${
                            isSelected ? 'text-[#04060b]' : 'text-[#f3f7fe]'
                          }`}
                        >
                          {repo.name}
                        </span>
                        <span
                          className={`font-mobilis text-[10px] font-bold shrink-0 ${
                            isSelected
                              ? 'text-[#04060b]'
                              : isUpstream
                                ? 'text-[#40e080]'
                                : 'text-[#eab444]'
                          }`}
                        >
                          {repoRatio}x
                        </span>
                      </div>
                      <div
                        className={`text-[11px] mt-1 flex items-center justify-between gap-1 ${
                          isSelected ? 'text-[#04060b]/85 font-semibold' : 'text-[#9ca2af]'
                        }`}
                      >
                        <span className="truncate">{repo.primaryLanguage}</span>
                        {isUpstream && <span className="text-[#40e080] font-semibold">Foundation</span>}
                        {isDownstream && <span className="text-[#eab444] font-semibold">Depends</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Focused Dependency & Execution Pipeline Inspector */}
        <div className="border border-[#2d3038] ethereal-surface chamfer p-6 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="font-mobilis text-xs font-semibold text-[#eab444]">
                  {selectedRepo.primaryLanguage} · {speedup}x Benchmark Delta
                </div>
                <h3 className="text-xl font-bold text-[#f3f7fe] mt-1">{selectedRepo.name}</h3>
              </div>
              <span className="font-mobilis text-xs text-[#a6acb9]">
                {selectedRepo.highlights[0]?.value}
              </span>
            </div>

            <p className="text-[14px] text-[#e4e8f1] leading-[1.6]">{selectedRepo.summary}</p>

            {/* Upstream / Downstream Dependency Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2d3038]">
              <div className="border border-[#2d3038] bg-[#04060b] p-3">
                <div className="font-mobilis text-[11px] font-semibold text-[#40e080] inline-flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  Built Upon ({relations.builtUpon.length})
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {relations.builtUpon.length === 0 ? (
                    <span className="text-xs text-[#9ca2af]">Bare-metal OS origin</span>
                  ) : (
                    relations.builtUpon.map((dep) => (
                      <button
                        key={dep}
                        type="button"
                        onClick={() => {
                          haptics.trigger('detent');
                          setSelectedId(dep);
                        }}
                        className="font-mobilis text-xs px-2 py-0.5 border border-[#2d3038] bg-[#0a0d13] hover:border-[#40e080] text-[#f3f7fe] cursor-pointer"
                      >
                        {dep}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="border border-[#2d3038] bg-[#04060b] p-3">
                <div className="font-mobilis text-[11px] font-semibold text-[#eab444] inline-flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3" aria-hidden="true" />
                  Powers ({relations.powers.length})
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {relations.powers.length === 0 ? (
                    <span className="text-xs text-[#9ca2af]">Capstone Exhibition Engine</span>
                  ) : (
                    relations.powers.map((dep) => (
                      <button
                        key={dep}
                        type="button"
                        onClick={() => {
                          haptics.trigger('detent');
                          setSelectedId(dep);
                        }}
                        className="font-mobilis text-xs px-2 py-0.5 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[#f3f7fe] cursor-pointer"
                      >
                        {dep}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 4-Stage Execution Pipeline Summary */}
            <div className="space-y-2 pt-2 border-t border-[#2d3038]">
              <div className="font-mobilis text-[11px] font-semibold text-[#a6acb9] uppercase tracking-[0.08em]">
                Core Execution Pipeline
              </div>
              <div className="grid grid-cols-2 gap-2">
                {lineage.stages.map((stage) => (
                  <div
                    key={stage.step}
                    className="border border-[#2d3038] bg-[#04060b] p-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 font-mobilis text-[11px]">
                      <span className="text-[#eab444] font-bold">{stage.step}</span>
                      <span className="text-[#9ca2af]">{stage.metric}</span>
                    </div>
                    <div className="text-xs font-bold text-[#f3f7fe] truncate">{stage.label}</div>
                    <div className="text-[11px] text-[#a6acb9] line-clamp-1">{stage.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#2d3038]">
            <button
              type="button"
              onClick={() => {
                haptics.trigger('confirm');
                onOpenRepoModal(selectedRepo);
              }}
              className="min-h-[40px] px-4 py-2 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              Inspect in Fullscreen Lab
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                haptics.trigger('detent');
                onJumpToStation(selectedEntry.index);
              }}
              className="min-h-[40px] px-4 py-2 border border-[#2d3038] bg-[#04060b] hover:border-[#eab444] text-[#f3f7fe] text-[13px] font-semibold cursor-pointer"
            >
              Re-enter Chapter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
