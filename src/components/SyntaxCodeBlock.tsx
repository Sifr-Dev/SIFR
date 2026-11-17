import { tokenizeCodeLine, type SyntaxTokenKind } from '../lib/syntax';

interface SyntaxCodeBlockProps {
  code: string;
  compact?: boolean;
  className?: string;
}

const TOKEN_CLASSES: Record<SyntaxTokenKind, string> = {
  comment: 'text-[#8e95a4]',
  keyword: 'text-[#eab444] font-semibold',
  type: 'text-[#f3f7fe] font-semibold',
  string: 'text-[#72d6a0]',
  number: 'text-[#eab444]',
  plain: 'text-[#dde2ec]',
};

export function SyntaxCodeBlock({
  code,
  compact = false,
  className = '',
}: SyntaxCodeBlockProps) {
  const lines = code.replace(/\r\n/g, '\n').split('\n');

  return (
    <pre
      className={`font-mobilis font-medium overflow-x-auto leading-[1.65] ${
        compact ? 'text-[12px]' : 'text-[12.5px]'
      } ${className}`}
    >
      <code>
        {lines.map((line, lineIdx) => {
          const tokens = tokenizeCodeLine(line);
          return (
            <span key={lineIdx} className="block">
              {tokens.map((tok, tokIdx) => (
                <span key={tokIdx} className={TOKEN_CLASSES[tok.kind]}>
                  {tok.text}
                </span>
              ))}
              {line.length === 0 ? ' ' : ''}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
