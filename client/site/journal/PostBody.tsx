// Article text. Posts are written in the small Markdown subset the admin describes
// ("### for a heading, a blank line between paragraphs"): ### headings, - and 1. lists,
// **bold** and *italic* (design: journal.js, renderBody()). Inline text may also carry the
// light HTML sanitizeHtml allows; everything else is stripped.
import { sanitizeHtml } from '../../lib/sanitizeHtml';

type Block =
  | { kind: 'p' | 'h2'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] };

const inlineHtml = (text: string) => sanitizeHtml(
  text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>'),
);

function parse(content: string): Block[] {
  const blocks: Block[] = [];
  const chunks = content.replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/);
  for (const chunk of chunks) {
    let list: Extract<Block, { items: string[] }> | null = null;
    for (const line of chunk.split('\n')) {
      if (!line.trim()) continue;
      const bullet = line.match(/^- (.*)/);
      const numbered = line.match(/^\d+\. (.*)/);
      const item = bullet ?? numbered;
      if (item) {
        const kind = bullet ? 'ul' : 'ol';
        if (!list || list.kind !== kind) {
          list = { kind, items: [] };
          blocks.push(list);
        }
        list.items.push(item[1]);
        continue;
      }
      list = null;
      blocks.push(line.startsWith('### ') ? { kind: 'h2', text: line.slice(4) } : { kind: 'p', text: line });
    }
  }
  return blocks;
}

export function PostBody({ content }: { content: string }) {
  return parse(content).map((block, i) => {
    if ('items' in block) {
      const List = block.kind;
      return (
        <List key={i}>
          {block.items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inlineHtml(item) }} />)}
        </List>
      );
    }
    const Tag = block.kind;
    return <Tag key={i} dangerouslySetInnerHTML={{ __html: inlineHtml(block.text) }} />;
  });
}
