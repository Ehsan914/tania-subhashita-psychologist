// The public address of the site. Canonical links, the sitemap, link previews and
// structured data are all built from it, so it must be the final production origin.
export const SITE_URL = 'https://taniasubhashita.com';
export const SITE_NAME = 'Tania Subhashita, Psychologist';
export const PERSON_NAME = 'Tania Subhashita';

// The picture link previews fall back to when a page has none of its own.
export const DEFAULT_SHARE_IMAGE = '/images/tania-subhashita-portrait.jpeg';

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;

// Meta descriptions are cut by search results at roughly 155-160 characters; end on a word.
export function clip(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:\s]+$/, '')}…`;
}
