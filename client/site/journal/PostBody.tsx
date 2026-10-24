// Article text: Portable Text with paragraphs, h2 headings, bullet and numbered lists
// (design: journal.js, renderBody()).
import type { RichText } from '../../context/SiteDataContext';
import { InlineText } from '../RichText';

export function PostBody({ body }: { body: RichText }) {
  return <InlineText value={body} />;
}
