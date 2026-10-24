import assert from 'node:assert/strict';
import { test } from 'node:test';
import { headlineToBlocks, inlineHtmlToBlocks, markdownToBlocks, toIsoDate, type Block } from './portableText.js';

const noWarn = (message: string) => assert.fail(`unexpected warning: ${message}`);
const spans = (block: Block) => block.children.map((c) => [c.text, c.marks]);

test('decodes entities in plain inline text', () => {
  const [block] = inlineHtmlToBlocks(['Psychologist &amp; Counselor. Bachelor&#39;s &#x2014; DU'], noWarn);
  assert.deepEqual(spans(block), [["Psychologist & Counselor. Bachelor's — DU", []]]);
});

test('marks bold text and keeps the text around it', () => {
  const [block] = inlineHtmlToBlocks(['I am <strong>Tania</strong>, a psychologist.'], noWarn);
  assert.deepEqual(spans(block), [['I am ', []], ['Tania', ['strong']], [', a psychologist.', []]]);
});

test('turns links into link annotations, nested marks included', () => {
  const [block] = inlineHtmlToBlocks(['Call <a href="tel:999"><b>999</b> now</a>.'], noWarn);
  assert.deepEqual(block.markDefs, [{ _type: 'link', _key: block.markDefs[0]._key, href: 'tel:999' }]);
  const link = block.markDefs[0]._key;
  assert.deepEqual(spans(block), [['Call ', []], ['999', [link, 'strong']], [' now', [link]], ['.', []]]);
});

test('one block per non-empty paragraph, with keys unique across the field', () => {
  const blocks = inlineHtmlToBlocks(['First.', '  ', '<em>Second.</em>'], noWarn);
  assert.equal(blocks.length, 2);
  const keys = blocks.flatMap((b) => [b._key, ...b.children.map((c) => c._key)]);
  assert.equal(new Set(keys).size, keys.length);
});

test('drops span and u silently, reports other tags and keeps their text', () => {
  const warnings: string[] = [];
  const [block] = inlineHtmlToBlocks(['<span class="x">a</span><u>b</u><mark>c</mark>'], (m) => warnings.push(m));
  assert.deepEqual(spans(block), [['abc', []]]);
  assert.deepEqual(warnings, ['<mark> is not supported; its text is kept without the tag']);
});

test('converts the post Markdown subset the way PostBody renders it', () => {
  const blocks = markdownToBlocks(
    'Intro with **bold** and *italic*.\n\n### A heading\n- one\n- two <a href="/book">book</a>\n\n1. first\n2. second',
    noWarn,
  );
  assert.deepEqual(
    blocks.map((b) => [b.style, b.listItem ?? null, b.children.map((c) => c.text).join('')]),
    [
      ['normal', null, 'Intro with bold and italic.'],
      ['h2', null, 'A heading'],
      ['normal', 'bullet', 'one'],
      ['normal', 'bullet', 'two book'],
      ['normal', 'number', 'first'],
      ['normal', 'number', 'second'],
    ],
  );
  assert.deepEqual(spans(blocks[0]), [['Intro with ', []], ['bold', ['strong']], [' and ', []], ['italic', ['em']], ['.', []]]);
  assert.equal(blocks[3].markDefs[0].href, '/book');
});

test('the hero headline becomes two lines, the third title line in italic at the end of the second', () => {
  const blocks = headlineToBlocks('A quiet room', 'to set it', 'down.');
  assert.deepEqual(blocks.map(spans), [[['A quiet room', []]], [['to set it ', []], ['down.', ['em']]]]);
  assert.ok(blocks.every((b) => b.style === 'normal' && b.markDefs.length === 0));
});

test('a headline without a second line or italic ending keeps only what exists', () => {
  assert.deepEqual(headlineToBlocks('One line', '', '').map(spans), [[['One line', []]]]);
  assert.deepEqual(headlineToBlocks('First', '', 'ending.').map(spans), [[['First', []]], [['ending.', ['em']]]]);
  assert.deepEqual(headlineToBlocks('First', 'second', '').map(spans), [[['First', []]], [['second', []]]]);
});

test('post dates become ISO dates', () => {
  assert.equal(toIsoDate('October 24, 2026'), '2026-10-24');
  assert.equal(toIsoDate('March 3, 2026'), '2026-03-03');
  assert.equal(toIsoDate('2026-10-24T08:00:00.000Z'), '2026-10-24');
  assert.throws(() => toIsoDate('24/10/2026'), /Unrecognised post date/);
});
