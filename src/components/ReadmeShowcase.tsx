import { useState } from 'react';
import { Check, Copy, Download, FileCode2, GitCommitHorizontal } from 'lucide-react';
import type { RepoStorySpec } from '../data/stories';
import { useRepoLiveDetail } from '../hooks/useRepoLiveDetail';
import { haptics } from '../lib/haptics';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ReadmeShowcaseProps {
  repoName: string;
  story: RepoStorySpec;
  compact?: boolean;
}

export function ReadmeShowcase({ repoName, story, compact = false }: ReadmeShowcaseProps) {
  const [copied, setCopied] = useState(false);
  const [sourceMode, setSourceMode] = useState<'editorial' | 'upstream'>('editorial');
  const liveDetail = useRepoLiveDetail(repoName);

  const activeMarkdown =
    sourceMode === 'upstream' && liveDetail.rawReadme
      ? liveDetail.rawReadme
      : story.readmeMarkdown;

  const handleCopy = async () => {
    haptics.trigger('confirm');
    try {
      await navigator.clipboard.writeText(activeMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    haptics.trigger('detent');
    const blob = new Blob([activeMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${repoName}-README.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d3038] pb-3.5">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-[#f3f7fe]">
          <FileCode2 className="w-4 h-4 text-[#eab444] shrink-0" aria-hidden="true" />
          <span className="font-mobilis font-semibold text-[13px]">{repoName}/README.md</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[38px] px-3.5 py-1.5 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[13px] font-semibold text-[#f3f7fe] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#40e080]" aria-hidden="true" />
                Copied README
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
                Copy Markdown
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="min-h-[38px] px-3.5 py-1.5 bg-[#eab444] hover:bg-[#d39900] text-[#04060b] text-[13px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Save README.md
          </button>
        </div>
      </div>

      {/* Live Upstream Commit Attribution + Lens Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setSourceMode('editorial');
            }}
            className={`min-h-[34px] px-3 py-1 text-xs font-semibold border cursor-pointer transition-colors ${
              sourceMode === 'editorial'
                ? 'border-[#eab444] bg-[#171b21] text-[#eab444]'
                : 'border-[#2d3038] bg-[#04060b] text-[#a6acb9] hover:text-[#f3f7fe]'
            }`}
          >
            Editorial Blueprint
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setSourceMode('upstream');
            }}
            className={`min-h-[34px] px-3 py-1 text-xs font-semibold border cursor-pointer transition-colors ${
              sourceMode === 'upstream'
                ? 'border-[#eab444] bg-[#171b21] text-[#eab444]'
                : 'border-[#2d3038] bg-[#04060b] text-[#a6acb9] hover:text-[#f3f7fe]'
            }`}
          >
            {liveDetail.rawReadme ? 'Live GitHub README.md' : 'Upstream README (Fallback)'}
          </button>
        </div>

        {liveDetail.commit && (
          <div className="font-mobilis text-xs font-medium text-[#a6acb9] inline-flex items-center gap-1.5 max-w-full">
            <GitCommitHorizontal className="w-3.5 h-3.5 text-[#eab444] shrink-0" aria-hidden="true" />
            <span className="text-[#eab444] font-semibold shrink-0">{liveDetail.commit.sha}</span>
            <span className="truncate max-w-[240px] sm:max-w-[300px]" title={liveDetail.commit.message}>
              {liveDetail.commit.message}
            </span>
          </div>
        )}
      </div>

      {/* Editorial Structured Summary Sections (visible in Editorial mode) */}
      {sourceMode === 'editorial' && story.readmeSections.length > 0 && (
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {story.readmeSections.map((sec) => (
            <div key={sec.heading} className="border border-[#2d3038] bg-[#04060b] p-4 sm:p-5 space-y-2">
              <h4 className="text-[14px] font-bold text-[#eab444]">{sec.heading}</h4>
              <p className="text-[14px] font-medium text-[#e4e8f1] leading-[1.6] whitespace-pre-line">
                {sec.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Parsed Structured Markdown Renderer */}
      <div className="border border-[#2d3038] bg-[#04060b] p-4 sm:p-5 space-y-3">
        <div className="text-xs font-semibold text-[#a6acb9] pb-2 border-b border-[#2d3038]">
          {sourceMode === 'upstream' && liveDetail.rawReadme
            ? `Synced from github.com/Sifr-Dev/${repoName}`
            : 'Publication Markdown Blueprint'}
        </div>

        <MarkdownRenderer markdown={activeMarkdown} maxHeightClass="max-h-[340px]" />
      </div>
    </div>
  );
}
