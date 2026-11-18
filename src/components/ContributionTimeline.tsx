import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RepoSpec } from '../data/repos';
import {
  buildLastYearContributionSeries,
  summarizeContributionSeries,
  type MonthlyContributionPoint,
} from '../lib/contributionTimeline';

interface ContributionTimelineProps {
  repo?: RepoSpec;
  commitDates?: string[];
  seriesOverride?: MonthlyContributionPoint[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function ContributionTimeline({
  repo,
  commitDates = [],
  seriesOverride,
  title = 'Contribution Timeline',
  subtitle,
  compact = false,
}: ContributionTimelineProps) {
  const languageBytes = useMemo(
    () => (repo ? Object.values(repo.languages).reduce((sum, n) => sum + n, 0) : 0),
    [repo]
  );

  const series = useMemo(() => {
    if (seriesOverride && seriesOverride.length > 0) return seriesOverride;
    if (!repo) return [];
    return buildLastYearContributionSeries({
      repoId: repo.id,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      languageBytes,
      commitDates,
    });
  }, [seriesOverride, repo, languageBytes, commitDates]);

  const summary = useMemo(() => summarizeContributionSeries(series), [series]);
  const safeId = (repo?.id ?? title).replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `contrib-fill-${safeId}`;

  const resolvedSubtitle =
    subtitle ??
    (commitDates.length > 0
      ? 'Recorded GitHub commit frequency across the past 12 months.'
      : 'Monthly commit cadence across the past 12 months.');

  return (
    <div
      data-testid="contribution-timeline"
      className={
        compact
          ? 'border-t border-[#2d3038] pt-3 space-y-2.5'
          : 'border border-[#2d3038] bg-[#04060b] p-4 space-y-3'
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#f3f7fe]">{title}</h4>
          {!compact && <p className="text-xs text-[#a6acb9] mt-0.5">{resolvedSubtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mobilis text-[11px] text-[#a6acb9]">
          <span className="whitespace-nowrap">
            <strong className="text-[#eab444]">{summary.totalCommits}</strong> events
          </span>
          <span className="whitespace-nowrap">
            <strong className="text-[#f3f7fe]">{summary.activeMonths}</strong> active mo
          </span>
          <span className="whitespace-nowrap">
            Peak <strong className="text-[#f3f7fe]">{summary.peakMonth}</strong>
          </span>
        </div>
      </div>

      <div className={`${compact ? 'h-[118px]' : 'h-[156px]'} w-full min-w-0`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 10, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab444" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#eab444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2d3038" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              tick={{ fill: '#a6acb9', fontSize: 10, fontFamily: 'var(--font-mobilis)' }}
              tickLine={false}
              axisLine={{ stroke: '#2d3038' }}
            />
            <YAxis
              allowDecimals={false}
              stroke="#6b7280"
              tick={{ fill: '#a6acb9', fontSize: 10, fontFamily: 'var(--font-mobilis)' }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              cursor={{ stroke: '#eab444', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#0a0d13',
                border: '1px solid #2d3038',
                borderRadius: 0,
                fontFamily: 'var(--font-mobilis)',
                fontSize: 11,
                color: '#f3f7fe',
              }}
              labelStyle={{ color: '#eab444', fontWeight: 700, marginBottom: 2 }}
              formatter={(value) => [`${value ?? 0} events`, 'Activity']}
              labelFormatter={(_label, payload) => {
                const pt = payload?.[0]?.payload as { label?: string } | undefined;
                return pt?.label ?? String(_label);
              }}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="#eab444"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              activeDot={{ r: 3.5, fill: '#eab444', stroke: '#04060b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
