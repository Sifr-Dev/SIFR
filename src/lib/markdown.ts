export type InlineRun =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'code'; text: string };

export type MarkdownBlock =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'blockquote'; lines: string[] }
  | { kind: 'code'; lang: string; content: string }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string };

export function parseInlineMarkdown(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIdx) {
      runs.push({ kind: 'text', text: text.slice(lastIdx, match.index) });
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      runs.push({ kind: 'code', text: token.slice(1, -1) });
    } else if (token.startsWith('**') && token.endsWith('**')) {
      runs.push({ kind: 'bold', text: token.slice(2, -2) });
    }
    lastIdx = pattern.lastIndex;
  }

  if (lastIdx < text.length) {
    runs.push({ kind: 'text', text: text.slice(lastIdx) });
  }

  return runs.length > 0 ? runs : [{ kind: 'text', text }];
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(line);
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ kind: 'code', lang, content: codeLines.join('\n') });
      continue;
    }

    // Headings (#, ##, ###)
    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const level = Math.min(3, headingMatch[1].length) as 1 | 2 | 3;
      blocks.push({ kind: 'heading', level, text: headingMatch[2].trim() });
      i += 1;
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({ kind: 'blockquote', lines: quoteLines });
      continue;
    }

    // Markdown table
    if (
      trimmed.includes('|') &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headers = splitTableRow(raw);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes('|')) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      blocks.push({ kind: 'table', headers, rows });
      continue;
    }

    // Bullet / numbered lists
    if (/^([-*]|\d+\.)\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^([-*]|\d+\.)\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^([-*]|\d+\.)\s+/, ''));
        i += 1;
      }
      blocks.push({ kind: 'list', items });
      continue;
    }

    // Paragraph (gather contiguous prose lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !/^([-*]|\d+\.)\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    if (paraLines.length > 0) {
      blocks.push({ kind: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return blocks;
}
