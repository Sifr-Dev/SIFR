import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getTablistTargetIndex, resolveKeyboardAction } from './keyboard.ts';
import { parseInlineMarkdown, parseMarkdownBlocks } from './markdown.ts';
import { tokenizeCodeLine } from './syntax.ts';
import { injectOgMetaIntoHtml, resolveSceneMetadata } from './ogMeta.ts';

describe('keyboard navigation resolver', () => {
  it('resolves station ride shortcuts cleanly', () => {
    const base = {
      isInputTarget: false,
      hasEntered: true,
      hasExited: false,
      paused: false,
      helpOpen: false,
      currentIndex: 2,
    };

    assert.equal(resolveKeyboardAction({ ...base, key: 'j' }).action, 'advance');
    assert.equal(resolveKeyboardAction({ ...base, key: 'ArrowRight' }).action, 'advance');
    assert.equal(resolveKeyboardAction({ ...base, key: 'k' }).action, 'back');
    assert.equal(resolveKeyboardAction({ ...base, key: 'ArrowLeft' }).action, 'back');
    assert.equal(resolveKeyboardAction({ ...base, key: 'k', currentIndex: 0 }).action, null);
    assert.equal(resolveKeyboardAction({ ...base, key: '1' }).action, 'tab-1');
    assert.equal(resolveKeyboardAction({ ...base, key: '2' }).action, 'tab-2');
    assert.equal(resolveKeyboardAction({ ...base, key: '3' }).action, 'tab-3');
    assert.equal(resolveKeyboardAction({ ...base, key: 'f' }).action, 'open-lab');
    assert.equal(resolveKeyboardAction({ ...base, key: 'm' }).action, 'toggle-audio');
    assert.equal(resolveKeyboardAction({ ...base, key: 's' }).action, 'open-reel');
    assert.equal(resolveKeyboardAction({ ...base, key: '?' }).action, 'toggle-help');
  });

  it('ignores shortcuts inside text inputs or with modifier keys', () => {
    const base = {
      key: 'j',
      isInputTarget: true,
      hasEntered: true,
      hasExited: false,
      paused: false,
      helpOpen: false,
      currentIndex: 2,
    };

    assert.equal(resolveKeyboardAction(base).action, null);
    assert.equal(resolveKeyboardAction({ ...base, isInputTarget: false, ctrlKey: true }).action, null);
    assert.equal(resolveKeyboardAction({ ...base, isInputTarget: false, metaKey: true }).action, null);
  });

  it('handles help dialog closing and grand exit shortcuts', () => {
    assert.equal(
      resolveKeyboardAction({
        key: 'Escape',
        isInputTarget: false,
        hasEntered: true,
        hasExited: false,
        paused: false,
        helpOpen: true,
        currentIndex: 1,
      }).action,
      'close-help'
    );

    assert.equal(
      resolveKeyboardAction({
        key: 'd',
        isInputTarget: false,
        hasEntered: true,
        hasExited: true,
        paused: false,
        helpOpen: false,
        currentIndex: 11,
      }).action,
      'jump-dispatch'
    );

    assert.equal(
      resolveKeyboardAction({
        key: 'Home',
        isInputTarget: false,
        hasEntered: true,
        hasExited: true,
        paused: false,
        helpOpen: false,
        currentIndex: 11,
      }).action,
      'jump-top'
    );
  });

  it('wraps ARIA tablist arrow indices properly', () => {
    assert.equal(getTablistTargetIndex('ArrowRight', 2, 3), 0);
    assert.equal(getTablistTargetIndex('ArrowLeft', 0, 3), 2);
    assert.equal(getTablistTargetIndex('Home', 2, 4), 0);
    assert.equal(getTablistTargetIndex('End', 0, 4), 3);
    assert.equal(getTablistTargetIndex('Enter', 1, 3), null);
  });
});

describe('markdown parser and syntax tokenizer', () => {
  it('parses headings, quotes, tables, lists, and code blocks', () => {
    const md = [
      '# Architecture Spec',
      '',
      '> Built from zero.',
      '',
      '| Layer | Overhead |',
      '| --- | --- |',
      '| header_t | `24 bytes` |',
      '',
      '- **Deterministic** heap coalescing',
      '',
      '```c',
      'typedef struct header_t { size_t size; } header_t;',
      '```',
    ].join('\n');

    const blocks = parseMarkdownBlocks(md);
    assert.equal(blocks[0].kind, 'heading');
    assert.equal(blocks[1].kind, 'blockquote');
    assert.equal(blocks[2].kind, 'table');
    if (blocks[2].kind === 'table') {
      assert.deepEqual(blocks[2].headers, ['Layer', 'Overhead']);
      assert.deepEqual(blocks[2].rows[0], ['header_t', '`24 bytes`']);
    }
    assert.equal(blocks[3].kind, 'list');
    assert.equal(blocks[4].kind, 'code');
    if (blocks[4].kind === 'code') {
      assert.equal(blocks[4].lang, 'c');
    }

    const runs = parseInlineMarkdown('Use `my_malloc` for **zero** deps');
    assert.equal(runs[1].kind, 'code');
    assert.equal(runs[3].kind, 'bold');
  });

  it('tokenizes keywords, types, numbers, strings, and comments', () => {
    const tokens = tokenizeCodeLine('const struct header_t h = 24; // align');
    assert.ok(tokens.some((t) => t.kind === 'keyword' && t.text === 'const'));
    assert.ok(tokens.some((t) => t.kind === 'type' && t.text === 'header_t'));
    assert.ok(tokens.some((t) => t.kind === 'number' && t.text === '24'));
    assert.ok(tokens.some((t) => t.kind === 'comment' && t.text.includes('align')));
  });
});

describe('chapter-aware OG metadata injection', () => {
  it('injects chapter metadata into HTML template for valid scenes', () => {
    const html = `<html><head><title>Default</title><meta name="description" content="Def" /><meta property="og:title" content="DefOG" /><meta property="og:description" content="DefDesc" /></head></html>`;
    const meta = resolveSceneMetadata('verrev');
    assert.equal(meta.matchedRepoId, 'verrev');
    assert.ok(meta.title.includes('verrev'));
    assert.ok(meta.title.includes('Chapter 11'));

    const injected = injectOgMetaIntoHtml(html, meta);
    assert.ok(injected.includes(`<title>${meta.title}</title>`));
    assert.ok(injected.includes(`property="og:title" content="verrev`));
  });

  it('leaves HTML untouched when scene is absent or unknown', () => {
    const html = '<title>Default</title>';
    const unknown = resolveSceneMetadata('nonexistent-repo');
    assert.equal(unknown.matchedRepoId, null);
    assert.equal(injectOgMetaIntoHtml(html, unknown), html);
  });
});
