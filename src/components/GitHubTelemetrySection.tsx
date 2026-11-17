import { ArrowUpRight } from 'lucide-react';
import type { GitHubActivityItem, GitHubProfileSnapshot } from '../data/repos';
import type { GitHubAggregateStats } from '../lib/githubStats';
import { formatRelativeDate } from '../lib/githubStats';
import type { SyncSource } from '../hooks/useGitHubTelemetry';
import { haptics } from '../lib/haptics';

interface GitHubTelemetrySectionProps {
  profile: GitHubProfileSnapshot;
  stats: GitHubAggregateStats;
  activity: GitHubActivityItem[];
  syncSource: SyncSource;
  onSelectRepoByName: (name: string) => void;
}

export function GitHubTelemetrySection({
  profile,
  stats,
  activity,
  syncSource,
  onSelectRepoByName,
}: GitHubTelemetrySectionProps) {
  return (
    <section id="activity" className="py-12 border-t border-[#2d3038]">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.06em] text-[#eab444]">
            GitHub Archive · @{profile.login}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#f3f7fe]">
            Public output &amp; engineering footprint.
          </h2>
        </div>
        <div className="flex items-center gap-4 text-[13px] text-[#9ca2af]">
          <span>
            Source:{' '}
            <span className="text-[#f3f7fe] font-medium">
              {syncSource === 'live' ? 'GitHub REST Live' : 'Verified Snapshot'}
            </span>
          </span>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => haptics.trigger('tap')}
            className="inline-flex items-center gap-1 text-[#eab444] hover:underline whitespace-nowrap shrink-0 font-medium"
          >
            github.com/{profile.login} <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Quantitative Footprint Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-[#2d3038] bg-[#0a0d13] divide-y lg:divide-y-0 lg:divide-x divide-[#2d3038]">
        <div className="p-5">
          <div className="text-xs font-medium text-[#9ca2af]">Public Repositories</div>
          <div className="font-mobilis text-2xl font-bold text-[#f3f7fe] mt-2">
            {profile.publicRepos}
          </div>
          <div className="text-[13px] text-[#9ca2af] mt-1">
            {stats.categoryCounts.systems} systems · {stats.categoryCounts.ml} ml · {stats.categoryCounts.infra} infra
          </div>
        </div>

        <div className="p-5 border-l border-[#2d3038] lg:border-l-0">
          <div className="text-xs font-medium text-[#9ca2af]">Indexed Code Volume</div>
          <div className="font-mobilis text-2xl font-bold text-[#eab444] mt-2">
            {stats.totalKilobytes.toLocaleString()} KB
          </div>
          <div className="text-[13px] text-[#9ca2af] mt-1">
            across {stats.languageShares.length} languages
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-[#9ca2af]">Primary Language</div>
          <div className="text-2xl font-bold text-[#f3f7fe] mt-2">
            {stats.languageShares[0]?.language ?? 'Rust'}
          </div>
          <div className="text-[13px] text-[#9ca2af] mt-1">
            {stats.languageShares[0]?.percent.toFixed(1)}% of codebase
          </div>
        </div>

        <div className="p-5 border-l border-[#2d3038] lg:border-l-0">
          <div className="text-xs font-medium text-[#9ca2af]">Affiliation</div>
          <div className="text-2xl font-bold text-[#f3f7fe] mt-2">
            {profile.company || 'Argos'}
          </div>
          <div className="text-[13px] text-[#9ca2af] mt-1">
            {profile.followers} followers · {profile.following} following
          </div>
        </div>
      </div>

      {/* Two-Column Language Allocation & Recent Commit Activity */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="border border-[#2d3038] bg-[#0a0d13] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#f3f7fe] mb-5">
              Language Distribution (Measured Byte Share)
            </h3>
            <div className="space-y-4">
              {stats.languageShares.map((lang, idx) => (
                <div key={lang.language} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className={idx === 0 ? 'text-[#eab444] font-bold' : 'text-[#f3f7fe] font-medium'}>
                      {lang.language}
                    </span>
                    <span className="font-mobilis text-xs text-[#9ca2af]">
                      {Math.round(lang.bytes / 1024)} KB · {lang.percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#171b21]">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.max(3, lang.percent)}%`,
                        backgroundColor: idx === 0 ? '#eab444' : idx === 1 ? '#f3f7fe' : '#9ca2af',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 pt-4 border-t border-[#2d3038] text-[13px] text-[#9ca2af]">
            Aggregated directly from GitHub language byte trees across all {stats.totalRepos} public repositories.
          </p>
        </div>

        <div className="border border-[#2d3038] bg-[#0a0d13] p-6">
          <h3 className="text-sm font-bold text-[#f3f7fe] mb-4">
            Recent Public Activity
          </h3>
          <div className="divide-y divide-[#2d3038]">
            {activity.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  onSelectRepoByName(item.repo);
                }}
                className="w-full py-3.5 flex items-start justify-between gap-4 text-left hover:bg-[#171b21] px-2 -mx-2 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-[#eab444] truncate">
                    {item.repo}
                  </div>
                  <div className="text-[13px] text-[#d2d7e2] mt-0.5 line-clamp-1">
                    {item.actionLabel}
                  </div>
                </div>
                <div className="font-mobilis text-xs text-[#9ca2af] whitespace-nowrap shrink-0">
                  {formatRelativeDate(item.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
