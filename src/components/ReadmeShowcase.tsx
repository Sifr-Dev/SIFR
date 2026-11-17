import { useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import type { RepoStorySpec } from '../data/stories';
import { haptics } from '../lib/haptics';

interface ReadmeShowcaseProps {
  repoName: string;
  story: RepoStorySpec;
  compact?: boolean;
}

export function ReadmeShowcase({ repoName, story, compact = false }: ReadmeShowcaseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    haptics.trigger('confirm');
    try {
      await navigator.clipboard.writeText(story.readmeMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    haptics.trigger('detent');
    const blob = new Blob([story.readmeMarkdown], { type: 'text/markdown;charset=utf-8' });
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
        <div className="flex items-center gap-2.5 text-sm font-medium text-[#f3f7fe]">
          <FileCode2 className="w-4 h-4 text-[#eab444] shrink-0" aria-hidden="true" />
          <span className="font-mobilis text-[13px]">{repoName}/README.md</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[38px] px-3.5 py-1.5 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[13px] font-medium text-[#f3f7fe] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
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

      {/* Editorial Structured Summary Sections */}
      {story.readmeSections.length > 0 && (
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {story.readmeSections.map((sec) => (
            <div key={sec.heading} className="border border-[#2d3038] bg-[#04060b] p-4 sm:p-5 space-y-2">
              <h4 className="text-[14px] font-bold text-[#eab444]">{sec.heading}</h4>
              <p className="text-[14px] text-[#d2d7e2] leading-[1.6] whitespace-pre-line">
                {sec.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Full Raw Canonical README.md Source Preview */}
      <div className="border border-[#2d3038] bg-[#04060b] p-4 sm:p-5 space-y-2.5">
        <div className="text-xs font-medium text-[#9ca2af]">
          Publication Markdown Blueprint
        </div>
        <pre className="font-mobilis text-[12px] leading-[1.65] text-[#d7dce6] overflow-x-auto whitespace-pre-wrap max-h-[320px] overflow-y-auto">
          {story.readmeMarkdown}
        </pre>
      </div>
    </div>
  );
}
