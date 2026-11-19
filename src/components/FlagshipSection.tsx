import { ArrowUpRight, Layers } from 'lucide-react';
import type { RepoSpec } from '../data/repos';
import { ProjectPhysicsIllustration } from './ProjectPhysicsIllustration';
import { haptics } from '../lib/haptics';

interface FlagshipSectionProps {
  repos: RepoSpec[];
  onSelectRepo: (repo: RepoSpec) => void;
}

const SECONDARY_SPOTLIGHT_IDS = ['GreenLens', 'tachyon-fetch', 'mizan', 'procstatd'] as const;

export function FlagshipSection({ repos, onSelectRepo }: FlagshipSectionProps) {
  const byId = new Map(repos.map((r) => [r.id.toLowerCase(), r]));
  const cipher = byId.get('cipher');
  const cipherDesk = byId.get('cipherdesk');
  const subtorch = byId.get('subtorch');
  const verrev = byId.get('verrev');

  const secondaryRepos = SECONDARY_SPOTLIGHT_IDS.map((id) => byId.get(id.toLowerCase())).filter(
    (r): r is RepoSpec => Boolean(r)
  );

  const openRepo = (repo?: RepoSpec) => {
    if (!repo) return;
    haptics.trigger('detent');
    onSelectRepo(repo);
  };

  return (
    <section
      id="flagships"
      aria-labelledby="flagships-heading"
      className="border-b border-[#2d3038] bg-[#07090e] py-14 sm:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2d3038] pb-5">
          <div className="space-y-1.5">
            <div className="font-mobilis text-xs font-semibold text-[#eab444] tracking-wider">
              Flagship Systems
            </div>
            <h2 id="flagships-heading" className="text-2xl sm:text-3xl font-extrabold text-[#ffffff]">
              Two-Layer Technical Breakdown
            </h2>
            <p className="text-sm sm:text-base text-[#c9d0de] max-w-2xl">
              Clear summaries above, full architecture specs and measured caveats on inspection.
              Nothing relies on synthetic numbers or hidden prototypes.
            </p>
          </div>
          <a
            href="#catalog"
            className="text-xs font-mobilis font-semibold text-[#eab444] hover:underline"
          >
            Jump to all {repos.length} repositories -&gt;
          </a>
        </div>

        {/* 1. CIPHER + CIPHERDESK */}
        {cipher && (
          <article className="border border-[#2d3038] bg-[#0a0d13] grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5 border-b lg:border-b-0 lg:border-r border-[#2d3038]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mobilis text-xs">
                  <span className="text-[#eab444] font-bold">01 · NATIVE UI TOOLKIT &amp; DESKTOP SUITE</span>
                  <span className="px-2 py-0.5 border border-[#40e080]/55 text-[#40e080]">
                    Zig · Zero C-SDK Build Deps
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ffffff]">
                    Cipher &amp; CipherDesk
                  </h3>
                  <p className="text-sm font-medium text-[#eab444] mt-1">
                    {cipher.subtitle}
                  </p>
                </div>

                <p className="text-[15px] text-[#e4e8f1] leading-[1.65]">{cipher.summary}</p>

                {cipherDesk && (
                  <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-2">
                    <div className="font-mobilis text-xs font-bold text-[#eab444]">
                      CipherDesk Applications
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#d5dce8] leading-[1.6]">
                      {cipherDesk.summary}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openRepo(cipherDesk)}
                        className="text-xs font-mobilis text-[#eab444] hover:underline cursor-pointer"
                      >
                        Inspect CipherDesk Dossier -&gt;
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => openRepo(cipher)}
                  className="min-h-[40px] px-4 py-2 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  Inspect Engineering Dossier
                </button>
                <a
                  href={cipher.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[40px] px-3.5 py-2 border border-[#2d3038] bg-[#04060b] hover:border-[#eab444] text-xs font-semibold text-[#f3f7fe] inline-flex items-center gap-1.5"
                >
                  Sifr-Dev/Cipher <ArrowUpRight className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-[#04060b] space-y-5 flex flex-col justify-between">
              <ProjectPhysicsIllustration schematic={cipher.schematic} heightClass="h-36" />

              <div className="space-y-2.5">
                <div className="font-mobilis text-xs font-bold text-[#c9d0de]">
                  Same-Hardware Bench (Ryzen 7 7435HS · RTX 4060 · bench/BENCH.md)
                </div>
                <div className="overflow-x-auto border border-[#2d3038]">
                  <table className="w-full text-left font-mobilis text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#171b21] border-b border-[#2d3038] text-[#eab444]">
                        <th className="px-3 py-2">Toolkit</th>
                        <th className="px-3 py-2">Binary</th>
                        <th className="px-3 py-2">Shared Libs</th>
                        <th className="px-3 py-2">105-Control Frame</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d3038] text-[#e4e8f1]">
                      <tr className="bg-[#0a0d13]">
                        <td className="px-3 py-2 font-bold text-[#eab444]">Cipher (wl_shm / Vulkan)</td>
                        <td className="px-3 py-2">628 KB</td>
                        <td className="px-3 py-2">4 (libc/m/dl)</td>
                        <td className="px-3 py-2">0.030-0.035 ms</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Qt6 Reference</td>
                        <td className="px-3 py-2">49 MB +deps</td>
                        <td className="px-3 py-2">45 libs</td>
                        <td className="px-3 py-2">0.925-0.950 ms</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">GTK4 Reference</td>
                        <td className="px-3 py-2">~294-305 MB</td>
                        <td className="px-3 py-2">113 libs</td>
                        <td className="px-3 py-2">1.086-1.197 ms (cairo lb)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-[#a6acb9] leading-relaxed">
                  Caveat: Vulkan GPU process RSS reaches ~270-325 MB due to NVIDIA driver floor
                  (software wl_shm RSS is 23.4 MB vs Qt6 38.6-39.0 MB). Cipher omits HarfBuzz text
                  shaping, IME, AT-SPI accessibility, and printing.
                </p>
              </div>
            </div>
          </article>
        )}

        {/* 2. SUBTORCH & 3. VERREV SIDE BY SIDE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subtorch && (
            <article className="border border-[#2d3038] bg-[#0a0d13] p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mobilis text-xs">
                  <span className="text-[#eab444] font-bold">02 · CUDA / TRITON GPU KERNELS</span>
                  <span className="px-2 py-0.5 border border-[#40e080]/55 text-[#40e080]">
                    Python · 36 pytest pass
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-[#ffffff]">subtorch</h3>
                  <p className="text-sm font-medium text-[#eab444] mt-1">{subtorch.subtitle}</p>
                </div>

                <p className="text-[14.5px] text-[#e4e8f1] leading-[1.65]">{subtorch.summary}</p>

                <div className="overflow-x-auto border border-[#2d3038] bg-[#04060b]">
                  <table className="w-full text-left font-mobilis text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#171b21] border-b border-[#2d3038] text-[#eab444]">
                        <th className="px-3 py-2">Kernel (RTX 4060)</th>
                        <th className="px-3 py-2">Baseline</th>
                        <th className="px-3 py-2">Triton / XLA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d3038] text-[#e4e8f1]">
                      <tr>
                        <td className="px-3 py-2">RMSNorm (4096x4096 fp16)</td>
                        <td className="px-3 py-2">3.360 ms PyTorch</td>
                        <td className="px-3 py-2 text-[#eab444]">0.311 ms Triton · 0.147 ms XLA</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Attn (4x16x1024x64 causal)</td>
                        <td className="px-3 py-2">0.632 ms Triton</td>
                        <td className="px-3 py-2 text-[#eab444]">0.372 ms SDPA (fastest)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Attn (bf16 non-causal)</td>
                        <td className="px-3 py-2">0.627 ms SDPA</td>
                        <td className="px-3 py-2 text-[#eab444]">0.617 ms Triton</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openRepo(subtorch)}
                  className="min-h-[38px] px-4 py-2 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  Inspect Dossier
                </button>
                <a
                  href={subtorch.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[38px] px-3.5 py-2 border border-[#2d3038] bg-[#04060b] hover:border-[#eab444] text-xs font-semibold text-[#f3f7fe] inline-flex items-center gap-1.5"
                >
                  Sifr-Dev/subtorch <ArrowUpRight className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                </a>
              </div>
            </article>
          )}

          {verrev && (
            <article className="border border-[#2d3038] bg-[#0a0d13] p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mobilis text-xs">
                  <span className="text-[#eab444] font-bold">03 · POST-QUANTUM OS PROTOTYPE</span>
                  <span className="px-2 py-0.5 border border-[#eab444]/60 text-[#eab444]">
                    Prototype · 48 tests / 7 crates
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-[#ffffff]">verrev</h3>
                  <p className="text-sm font-medium text-[#eab444] mt-1">{verrev.subtitle}</p>
                </div>

                <p className="text-[14.5px] text-[#e4e8f1] leading-[1.65]">{verrev.summary}</p>

                <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-2 text-xs font-mobilis">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#40e080]">Working Crates (7)</span>
                    <span className="text-[#f3f7fe]">hash, crypto (27t), identity, capability, relay, fs</span>
                  </div>
                  <div className="flex justify-between gap-2 pt-2 border-t border-[#2d3038]">
                    <span className="text-[#eab444]">Explicit Stubs (9)</span>
                    <span className="text-[#b4bac8]">transport, p2p discovery, mesh, CRDT sync, wasm</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openRepo(verrev)}
                  className="min-h-[38px] px-4 py-2 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  Inspect Dossier
                </button>
                <a
                  href={verrev.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[38px] px-3.5 py-2 border border-[#2d3038] bg-[#04060b] hover:border-[#eab444] text-xs font-semibold text-[#f3f7fe] inline-flex items-center gap-1.5"
                >
                  Sifr-Dev/verrev <ArrowUpRight className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                </a>
              </div>
            </article>
          )}
        </div>

        {/* SELECTED SECONDARY SYSTEMS */}
        {secondaryRepos.length > 0 && (
          <div className="space-y-4">
            <div className="font-mobilis text-xs font-semibold text-[#a6acb9] uppercase tracking-wider">
              Selected Systems
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {secondaryRepos.map((repo) => (
                <article
                  key={repo.id}
                  className="border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444]/65 transition-colors p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mobilis text-[11px]">
                      <span className="text-[#eab444]">{repo.primaryLanguage}</span>
                      <span className="text-[#a6acb9]">{repo.maturity}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#ffffff]">{repo.name}</h3>
                    <p className="text-xs text-[#d5dce8] leading-relaxed">{repo.subtitle}</p>
                  </div>

                  <div className="pt-2 border-t border-[#2d3038] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openRepo(repo)}
                      className="text-xs font-mobilis font-semibold text-[#eab444] hover:underline cursor-pointer"
                    >
                      Inspect Dossier -&gt;
                    </button>
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${repo.name} on GitHub`}
                      className="text-[#a6acb9] hover:text-[#eab444] p-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
