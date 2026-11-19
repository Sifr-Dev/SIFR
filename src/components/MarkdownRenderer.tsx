import { useMemo } from 'react';
import { parseInlineMarkdown, parseMarkdownBlocks } from '../lib/markdown';
import { SyntaxCodeBlock } from './SyntaxCodeBlock';

function renderTextWithCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, idx) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
      <code
        key={idx}
        className="font-mobilis text-[12px] px-1.5 py-0.5 bg-[#171b21] border border-[#2d3038] text-[#eab444] font-medium"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function InlineRuns({ text }: { text: string }) {
  const runs = parseInlineMarkdown(text);
  return (
    <>
      {runs.map((run, idx) =>
        run.kind === 'bold' ? (
          <strong key={idx} className="font-bold text-[#f3f7fe]">
            {renderTextWithCode(run.text)}
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

interface MarkdownRendererProps {
  markdown: string;
  maxHeightClass?: string;
}

export function MarkdownRenderer({
  markdown,
  maxHeightClass = 'max-h-[420px]',
}: MarkdownRendererProps) {
  const blocks = useMemo(() => parseMarkdownBlocks(markdown), [markdown]);

  return (
    <div className={`space-y-3 overflow-y-auto pr-1 ${maxHeightClass}`}>
      {blocks.map((block, idx) => {
        if (block.kind === 'heading') {
          return block.level === 1 ? (
            <h3 key={idx} className="text-lg font-bold text-[#f3f7fe] pt-1">
              <InlineRuns text={block.text} />
            </h3>
          ) : block.level === 2 ? (
            <h4
              key={idx}
              className="text-[14px] font-bold text-[#eab444] pt-2 border-t border-[#2d3038]/70 first:border-t-0 first:pt-0"
            >
              <InlineRuns text={block.text} />
            </h4>
          ) : (
            <h5 key={idx} className="text-[13px] font-bold text-[#f3f7fe] pt-1">
              <InlineRuns text={block.text} />
            </h5>
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
            <ul key={idx} className="space-y-1.5 text-[13.5px] text-[#e4e8f1] list-disc pl-5 leading-[1.6]">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <InlineRuns text={item} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="text-[13.5px] font-medium text-[#e4e8f1] leading-[1.65]">
            <InlineRuns text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
