export type SyntaxTokenKind = 'comment' | 'keyword' | 'type' | 'string' | 'number' | 'plain';

export interface SyntaxToken {
  kind: SyntaxTokenKind;
  text: string;
}

const KEYWORDS = new Set([
  'fn',
  'pub',
  'const',
  'let',
  'return',
  'struct',
  'typedef',
  'void',
  'unsigned',
  'if',
  'else',
  'for',
  'while',
  'import',
  'from',
  'export',
  'func',
  'package',
  'type',
  'async',
  'await',
]);

const TYPES = new Set([
  'size_t',
  'uint32_t',
  'u8',
  'u32',
  'u64',
  'usize',
  'int',
  'bool',
  'header_t',
  'Header',
  'string',
  'TaskStore',
  'Delivery',
  'UseCase',
  'Domain',
  'Repository',
  'PING',
  'SET',
  'GET',
  'DEL',
  'PONG',
  'OK',
  'POST',
  'PATCH',
]);

export function tokenizeCodeLine(line: string): SyntaxToken[] {
  const commentMatch = /(\/\/.*$|#(?![0-9a-fA-F]{3,6}\b).*$)/.exec(line);
  const codePart = commentMatch ? line.slice(0, commentMatch.index) : line;
  const commentPart = commentMatch ? line.slice(commentMatch.index) : '';

  const tokens: SyntaxToken[] = [];
  const regex = /("[^"]*"|'[^']*'|0x[0-9a-fA-F]+|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;

  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(codePart)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({ kind: 'plain', text: codePart.slice(lastIdx, match.index) });
    }
    const word = match[0];
    if (word.startsWith('"') || word.startsWith("'")) {
      tokens.push({ kind: 'string', text: word });
    } else if (/^(0x[0-9a-fA-F]+|\d+(\.\d+)?)$/.test(word)) {
      tokens.push({ kind: 'number', text: word });
    } else if (KEYWORDS.has(word)) {
      tokens.push({ kind: 'keyword', text: word });
    } else if (TYPES.has(word)) {
      tokens.push({ kind: 'type', text: word });
    } else {
      tokens.push({ kind: 'plain', text: word });
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < codePart.length) {
    tokens.push({ kind: 'plain', text: codePart.slice(lastIdx) });
  }

  if (commentPart) {
    tokens.push({ kind: 'comment', text: commentPart });
  }

  return tokens.length > 0 ? tokens : [{ kind: 'plain', text: line }];
}
