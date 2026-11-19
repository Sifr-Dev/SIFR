import { ArrowDownRight, ArrowUpRight, Mail, Search } from 'lucide-react';
import type { GitHubProfileSnapshot } from '../data/repos';
import { SIFR_GITHUB_OWNER, SIFR_GITHUB_URL, SIFR_LINKEDIN_URL } from '../lib/identity';
import { SIFR_DIRECT_EMAIL } from '../lib/signal';
import { PhysicsCipherCanvas } from './PhysicsCipherCanvas';

interface OverviewHeroProps {
  profile: GitHubProfileSnapshot;
  repoCount: number;
  shift: number;
  onShiftChange: (next: number) => void;
  onFocusSearch: () => void;
}

export function OverviewHero({
  profile,
  repoCount,
  shift,
  onShiftChange,
  onFocusSearch,
}: OverviewHeroProps) {
  return (
    <section
      id="overview"
      aria-labelledby="hero-heading"
      className="border-b border-[#2d3038] bg-[#04060b] relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 46% 60% at 75% 32%, rgba(234,180,68,0.08), transparent 70%), radial-gradient(circle at 1px 1px, rgba(243,247,254,0.05) 1px, transparent 0)',
          backgroundSize: '100% 100%, 36px 36px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-12 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="font-mobilis text-xs font-semibold text-[#eab444] tracking-wider">
              Mohamed Salahy · github.com/{profile.login || SIFR_GITHUB_OWNER}
            </div>
            <div className="text-sm font-semibold text-[#c9d0de]">
              Systems &amp; ML Engineer · Co-Founder &amp; Tech Lead @Argos-Security
            </div>
          </div>

          <h1
            id="hero-heading"
            className="font-stabilis text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#ffffff] leading-[1.08]"
          >
            Engineering from sockets and allocators up to GPU kernels and Vulkan UI.
          </h1>

          <p className="text-base sm:text-lg font-medium text-[#d5dce8] max-w-2xl leading-[1.65]">
            SIFR documents {repoCount} public engineering repositories built to inspect how
            foundational layers actually behave: a native Linux Wayland and Vulkan toolkit in Zig,
            fused Triton and XLA GPU kernels, clean-architecture Go services, Rust Unix utilities,
            and early post-quantum systems research.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { value: `${repoCount}`, label: 'Public Repositories' },
              { value: '628 KB', label: 'Cipher Binary (4 libs)' },
              { value: '0.147 ms', label: 'RMSNorm XLA Kernel' },
              { value: '0.032 ms', label: '105-Control Frame' },
            ].map((item) => (
              <div key={item.label} className="border border-[#2d3038] bg-[#0a0d13] p-3">
                <div className="font-mobilis text-base sm:text-lg font-bold text-[#eab444]">
                  {item.value}
                </div>
                <div className="text-xs font-medium text-[#b4bac8] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href="#flagships"
              className="min-h-[40px] px-4 py-2 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-[13px] font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>Inspect Flagships</span>
              <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={onFocusSearch}
              className="min-h-[40px] px-3.5 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-semibold text-[#f3f7fe] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
              <span>Filter {repoCount} Systems (/)</span>
            </button>

            <a
              href={profile.htmlUrl || SIFR_GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="min-h-[40px] px-3 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-semibold text-[#e4e8f1] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
            </a>

            <a
              href={SIFR_LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="min-h-[40px] px-3 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-semibold text-[#e4e8f1] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
            </a>

            <a
              href={`mailto:${SIFR_DIRECT_EMAIL}`}
              className="min-h-[40px] px-3 py-2 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-[13px] font-semibold text-[#e4e8f1] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
              <span>Email</span>
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <PhysicsCipherCanvas shift={shift} onShiftChange={onShiftChange} compact />
        </div>
      </div>
    </section>
  );
}
