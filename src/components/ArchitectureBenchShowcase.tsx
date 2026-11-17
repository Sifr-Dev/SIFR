import { useState } from 'react';
import { Check, Copy, Gauge } from 'lucide-react';
import type { RepoSpec } from '../data/repos';
import { computeSpeedupRatio, getBenchmarkForRepo } from '../data/benchmarks';
import { getLineageForRepo } from '../lib/lineage';
import { haptics } from '../lib/haptics';
import { SyntaxCodeBlock } from './SyntaxCodeBlock';

interface ArchitectureBenchShowcaseProps {
  repo: RepoSpec;
  compact?: boolean;
}

export function ArchitectureBenchShowcase({
  repo,
  compact = false,
}: ArchitectureBenchShowcaseProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [viewMode, setViewMode] = useState<'bench' | 'dataflow' | 'invariants'>('bench');
  const bench = getBenchmarkForRepo(repo.id);
  const lineage = getLineageForRepo(repo.id);
  const speedup = computeSpeedupRatio(bench.baselineValue, bench.sifrValue, bench.lowerIsBetter);

  const maxVal = Math.max(bench.baselineValue, bench.sifrValue, 0.0001);
  const baselinePct = Math.max(6, Math.round((bench.baselineValue / maxVal) * 100));
  const sifrPct = Math.max(6, Math.round((bench.sifrValue / maxVal) * 100));

  const handleCopyCode = async () => {
    haptics.trigger('confirm');
    try {
      await navigator.clipboard.writeText(repo.codeExcerpt);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      setCopiedCode(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-Lens Toggle inside Architecture Tab */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2d3038]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setViewMode('bench');
            }}
            className={`min-h-[34px] px-3 py-1 text-xs font-semibold border cursor-pointer transition-colors ${
              viewMode === 'bench'
                ? 'border-[#eab444] bg-[#171b21] text-[#eab444]'
                : 'border-[#2d3038] bg-[#04060b] text-[#a6acb9] hover:text-[#f3f7fe]'
            }`}
          >
            Benchmark Proof
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setViewMode('dataflow');
            }}
            className={`min-h-[34px] px-3 py-1 text-xs font-semibold border cursor-pointer transition-colors ${
              viewMode === 'dataflow'
                ? 'border-[#eab444] bg-[#171b21] text-[#eab444]'
                : 'border-[#2d3038] bg-[#04060b] text-[#a6acb9] hover:text-[#f3f7fe]'
            }`}
          >
            Execution Dataflow
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setViewMode('invariants');
            }}
            className={`min-h-[34px] px-3 py-1 text-xs font-semibold border cursor-pointer transition-colors ${
              viewMode === 'invariants'
                ? 'border-[#eab444] bg-[#171b21] text-[#eab444]'
                : 'border-[#2d3038] bg-[#04060b] text-[#a6acb9] hover:text-[#f3f7fe]'
            }`}
          >
            System Invariants
          </button>
        </div>

        <span className="font-mobilis text-xs font-semibold text-[#eab444] inline-flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5" aria-hidden="true" />
          {speedup}x · {bench.lowerIsBetter ? 'lower is faster/leaner' : 'higher throughput'}
        </span>
      </div>

      {viewMode === 'bench' ? (
        <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-[#a6acb9]">{bench.metricLabel}</div>
            <div className="text-sm font-bold text-[#eab444] mt-1">{bench.gainSummary}</div>
          </div>

          <div className="space-y-3">
            {/* SIFR Implementation Bar */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="font-semibold text-[#f3f7fe] min-w-0">{bench.sifrLabel}</span>
                <span className="font-mobilis font-bold text-[#eab444] shrink-0 whitespace-nowrap">
                  {bench.sifrValue} {bench.unit}
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#171b21]">
                <div
                  className="h-full bg-[#eab444] transition-all duration-500"
                  style={{ width: `${sifrPct}%` }}
                />
              </div>
            </div>

            {/* Baseline Comparison Bar */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="font-medium text-[#a6acb9] min-w-0">{bench.baselineLabel}</span>
                <span className="font-mobilis font-medium text-[#a6acb9] shrink-0 whitespace-nowrap">
                  {bench.baselineValue} {bench.unit}
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#171b21]">
                <div
                  className="h-full bg-[#4a4f5c] transition-all duration-500"
                  style={{ width: `${baselinePct}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-[13px] font-medium text-[#e4e8f1] leading-[1.6] pt-1 border-t border-[#2d3038]">
            {bench.notes}
          </p>
        </div>
      ) : viewMode === 'dataflow' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 border border-[#2d3038] bg-[#04060b] p-3.5">
          {lineage.stages.map((stage) => (
            <div
              key={stage.step}
              className="border border-[#2d3038] bg-[#0a0d13] p-3 flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between gap-2 font-mobilis text-[11px]">
                <span className="text-[#eab444] font-bold">STAGE {stage.step}</span>
                <span className="text-[#a6acb9]">{stage.metric}</span>
              </div>
              <div className="text-[13px] font-bold text-[#f3f7fe]">{stage.label}</div>
              <div className="text-xs text-[#d2d7e2] leading-snug">{stage.detail}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[#2d3038] border border-[#2d3038] bg-[#04060b] px-4">
          {repo.highlights.map((h) => (
            <div key={h.label} className="py-2.5 flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-medium text-[#a6acb9]">{h.label}</span>
              <span className="font-mobilis font-semibold text-xs text-[#f3f7fe] text-right">
                {h.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Copyable Core Kernel / System Excerpt */}
      <div className="border border-[#2d3038] bg-[#04060b]">
        <div className="px-3.5 py-2 border-b border-[#2d3038] flex items-center justify-between gap-3">
          <span className="font-mobilis text-xs font-semibold text-[#a6acb9]">
            {repo.name} · core invariant
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="min-h-[30px] px-2.5 py-1 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-xs font-semibold text-[#f3f7fe] inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-3 h-3 text-[#40e080]" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#eab444]" aria-hidden="true" />
                Copy Excerpt
              </>
            )}
          </button>
        </div>
        <SyntaxCodeBlock code={repo.codeExcerpt} compact={compact} className="p-3.5" />
      </div>

      <p className="text-[13px] font-medium text-[#a6acb9] leading-[1.6]">
        {repo.architectureNote}
      </p>
    </div>
  );
}
