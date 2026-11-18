import { useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2, GitCommitHorizontal } from 'lucide-react';
import type { RepoStorySpec } from '../data/stories';
import { useRepoLiveDetail } from '../hooks/useRepoLiveDetail';
import { haptics } from '../lib/haptics';
import { parseInlineMarkdown, parseMarkdownBlocks } from '../lib/markdown';
import { SyntaxCodeBlock } from './SyntaxCodeBlock';

interface ReadmeShowcaseProps {
  repoName: string;
  story: RepoStorySpec;
  compact?: boolean;
}

function InlineRuns({ text }: { text: string }) {
  const runs = parseInlineMarkdown(text);
  return (
    <>
      {runs.map((run, idx) =>
        run.kind === 'bold' ? (
          <strong key={idx} className="font-bold text-[#f3f7fe]">
            {run.text}
          </strong>
        ) : run.kind === 'code' ? (
          <code
            key={idx}
            className="font-mobilis text-[12px] px-1.5 py-0.5 bg-[#171b21] border border-[#2d3038] text-[#eab444]"
          >
            {run.text}
          </code>
        ) : (
          <span key={idx}>{run.text}</span>
        )
      )}
    </>
  );
}

export function ReadmeShowcase({ repoName, story, compact = false }: ReadmeShowcaseProps) {
  const [copied, setCopied] = useState(false);
  const [sourceMode, setSourceMode] = useState<'editorial' | 'upstream'>('editorial');
  const liveDetail = useRepoLiveDetail(repoName);

  const activeMarkdown =
    sourceMode === 'upstream' && liveDetail.rawReadme
      ? liveDetail.rawReadme
      : story.readmeMarkdown;

  const blocks = useMemo(() => parseMarkdownBlocks(activeMarkdown), [activeMarkdown]);

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
            ? `Synced from github.com/Sifr-dev/${repoName}`
            : 'Publication Markdown Blueprint'}
        </div>

        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {blocks.map((block, idx) => {
            if (block.kind === 'heading') {
              return block.level === 1 ? (
                <h3 key={idx} className="text-lg font-bold text-[#f3f7fe] pt-1">
                  <InlineRuns text={block.text} />
                </h3>
              ) : (
                <h4 key={idx} className="text-[14px] font-bold text-[#eab444] pt-2">
                  <InlineRuns text={block.text} />
                </h4>
              );
            }

            if (block.kind === 'blockquote') {
              return (
                <div
                  key={idx}
                  className="border border-[#2d3038] bg-[#0a0d13] px-3.5 py-2.5 text-[13px] font-medium text-[#d2d7e2] space-y-1"
                >
                  {block.lines.map((line, lIdx) => (
                    <p key={lIdx}>
                      <InlineRuns text={line} />
                    </p>
                  ))}
                </div>
              );
            }

            if (block.kind === 'code') {
              return (
                <div key={idx} className="border border-[#2d3038] bg-[#0a0d13] p-3">
                  <SyntaxCodeBlock code={block.content} compact />
                </div>
              );
            }

            if (block.kind === 'table') {
              return (
                <div key={idx} className="overflow-x-auto border border-[#2d3038]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#171b21] border-b border-[#2d3038] text-[#eab444]">
                        {block.headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-3 py-2 font-semibold">
                            <InlineRuns text={h} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d3038]">
                      {block.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="bg-[#04060b] text-[#e4e8f1]">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 align-top">
                              <InlineRuns text={cell} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            if (block.kind === 'list') {
              return (
                <ul key={idx} className="space-y-1.5 text-[13px] text-[#e4e8f1] list-disc pl-5">
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <InlineRuns text={item} />
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={idx} className="text-[13px] font-medium text-[#e4e8f1] leading-[1.65]">
                <InlineRuns text={block.text} />
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
