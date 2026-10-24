// Converts the database's text formats to Portable Text for the Sanity import.
// - Inline HTML (announcement, welcome, credential line, about bio): <strong>/<b>, <em>/<i>,
//   <a href>, <br>; <span> and <u> keep their text and lose the tag (studio/schemaTypes/richText.ts
//   has no underline or classes).
// - Posts: the Markdown subset client/site/journal/PostBody.tsx parses, line for line the same rules.
// - The hero's three title lines: the two-line headline studio/schemaTypes/richText.ts defines.
// Anything else is reported through `warn` and kept as plain text, so nothing disappears silently.

export interface LinkDef { _type: 'link'; _key: string; href: string }
export interface Span { _type: 'span'; _key: string; text: string; marks: string[] }
export interface Block {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h2';
  markDefs: LinkDef[];
  children: Span[];
  listItem?: 'bullet' | 'number';
  level?: number;
}
export type Warn = (message: string) => void;

const DECORATORS: Record<string, string> = { strong: 'strong', b: 'strong', em: 'em', i: 'em' };
const DROPPED_TAGS = new Set(['span', 'u']);
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] === '#') {
      const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return ENTITIES[name.toLowerCase()] ?? whole;
  });
}

const keyMaker = () => {
  let n = 0;
  return () => `k${(n++).toString(36)}`;
};

// One block from a run of inline HTML.
function inlineBlock(html: string, key: () => string, warn: Warn): Block {
  const block: Block = { _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [] };
  // Open tags, innermost last; null for a tag that adds no mark.
  const open: { tag: string; mark: string | null }[] = [];

  const addText = (text: string) => {
    if (!text) return;
    const marks = open.flatMap((o) => (o.mark ? [o.mark] : []));
    const last = block.children.at(-1);
    if (last && last.marks.join() === marks.join()) last.text += text;
    else block.children.push({ _type: 'span', _key: key(), text, marks });
  };

  for (const [, closing, rawTag, attrs, text] of html.matchAll(/<(\/?)([a-z0-9]+)([^>]*)>|([^<]+)/gi)) {
    if (text !== undefined) {
      addText(decodeEntities(text));
      continue;
    }
    const tag = rawTag.toLowerCase();
    if (tag === 'br') {
      addText('\n');
    } else if (closing) {
      const at = open.map((o) => o.tag).lastIndexOf(tag);
      if (at >= 0) open.splice(at);
    } else {
      open.push({ tag, mark: openMark(tag, attrs, block, key, warn) });
    }
  }
  if (block.children.length === 0) block.children.push({ _type: 'span', _key: key(), text: '', marks: [] });
  return block;
}

// The mark an opening tag adds, creating the link definition for <a>.
function openMark(tag: string, attrs: string, block: Block, key: () => string, warn: Warn): string | null {
  if (DECORATORS[tag]) return DECORATORS[tag];
  if (tag === 'a') {
    const href = attrs.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i);
    if (!href) {
      warn(`<a> without href kept as plain text`);
      return null;
    }
    const link: LinkDef = { _type: 'link', _key: key(), href: decodeEntities(href[1] ?? href[2]) };
    block.markDefs.push(link);
    return link._key;
  }
  if (!DROPPED_TAGS.has(tag)) warn(`<${tag}> is not supported; its text is kept without the tag`);
  return null;
}

// Each paragraph of inline HTML becomes one block; empty paragraphs are skipped.
export function inlineHtmlToBlocks(paragraphs: string[], warn: Warn): Block[] {
  const key = keyMaker();
  return paragraphs.filter((p) => p.trim()).map((p) => inlineBlock(p.trim(), key, warn));
}

const markdownInline = (text: string) =>
  text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');

// A post's text: blank lines split chunks, "### " lines are headings, "- " and "1. " lines list items.
export function markdownToBlocks(content: string, warn: Warn): Block[] {
  const key = keyMaker();
  const blocks: Block[] = [];
  const chunks = content.replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/);
  for (const chunk of chunks) {
    for (const line of chunk.split('\n')) {
      if (!line.trim()) continue;
      const bullet = line.match(/^- (.*)/);
      const numbered = line.match(/^\d+\. (.*)/);
      const item = bullet ?? numbered;
      if (item) {
        const block = inlineBlock(markdownInline(item[1]), key, warn);
        blocks.push({ ...block, listItem: bullet ? 'bullet' : 'number', level: 1 });
        continue;
      }
      const heading = line.startsWith('### ');
      const block = inlineBlock(markdownInline(heading ? line.slice(4) : line), key, warn);
      blocks.push(heading ? { ...block, style: 'h2' } : block);
    }
  }
  return blocks;
}

// The hero's three title boxes as the two lines the site shows (HomeHero.tsx): line 1 alone,
// then line 2 followed by line 3 in italic. Empty lines are left out.
export function headlineToBlocks(line1: string, line2: string, line3: string): Block[] {
  const key = keyMaker();
  const block = (parts: [string, string[]][]): Block => ({
    _type: 'block', _key: key(), style: 'normal', markDefs: [],
    children: parts.map(([text, marks]) => ({ _type: 'span', _key: key(), text, marks })),
  });
  const second: [string, string[]][] = [];
  if (line2.trim()) second.push([line3.trim() ? `${line2.trim()} ` : line2.trim(), []]);
  if (line3.trim()) second.push([line3.trim(), ['em']]);
  return second.length ? [block([[line1.trim(), []]]), block(second)] : [block([[line1.trim(), []]])];
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

// A post's date as Sanity's date type stores it: "October 24, 2026" or an ISO string → "2026-10-24".
export function toIsoDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const long = trimmed.match(/^([a-z]+) (\d{1,2}), (\d{4})$/i);
  const month = long ? MONTHS.indexOf(long[1].toLowerCase()) : -1;
  if (!long || month < 0) throw new Error(`Unrecognised post date "${value}"`);
  return `${long[3]}-${String(month + 1).padStart(2, '0')}-${long[2].padStart(2, '0')}`;
}
