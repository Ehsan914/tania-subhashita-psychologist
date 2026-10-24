import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SHARE_IMAGE, SITE_NAME, absoluteUrl } from '../lib/site';

// One <head> manager for the browser and the prerender. In the browser the hooks update
// document.head after each render; while prerendering there are no effects, so they write
// into a HeadSink during render and the prerender serialises it into the page's HTML.

export interface PageMetaOptions {
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

interface HeadTag {
  tag: 'meta' | 'link';
  key: string;
  attrs: Record<string, string>;
}

export interface HeadSink {
  title: string;
  tags: HeadTag[];
  jsonLd: Record<string, unknown>;
}

const HeadSinkContext = createContext<HeadSink | null>(null);
export const HeadSinkProvider = HeadSinkContext.Provider;

export const NOINDEX = 'noindex, follow';

const meta = (attr: 'name' | 'property', key: string, content: string): HeadTag => ({ tag: 'meta', key, attrs: { [attr]: key, content } });

function pageTags(title: string, description: string, path: string, options: PageMetaOptions): HeadTag[] {
  const url = absoluteUrl(path);
  const image = absoluteUrl(options.image ?? DEFAULT_SHARE_IMAGE);
  return [
    meta('name', 'description', description),
    meta('name', 'robots', options.noindex ? NOINDEX : 'index, follow, max-image-preview:large'),
    // a page kept out of search names no canonical, so the two signals never disagree
    ...(options.noindex ? [] : [{ tag: 'link', key: 'canonical', attrs: { rel: 'canonical', href: url } } as HeadTag]),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:type', options.type ?? 'website'),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', image),
    meta('name', 'twitter:card', 'summary_large_image'),
  ];
}

function findTag(tag: HeadTag): Element | null {
  return tag.tag === 'link'
    ? document.head.querySelector(`link[rel="${tag.key}"]`)
    : document.head.querySelector(`meta[name="${tag.key}"], meta[property="${tag.key}"]`);
}

function upsert(tag: HeadTag) {
  let el = findTag(tag);
  if (!el) {
    el = document.createElement(tag.tag);
    document.head.appendChild(el);
  }
  for (const [name, value] of Object.entries(tag.attrs)) el.setAttribute(name, value);
}

/**
 * Sets the tab title and, when a description is given, the page's description, canonical
 * URL (from the current path), robots directive and link-preview tags. Without a
 * description only the title changes, which is all the admin panel needs.
 */
export function usePageMeta(title: string, description?: string, options: PageMetaOptions = {}) {
  const sink = useContext(HeadSinkContext);
  const { pathname } = useLocation();
  const tags = description === undefined ? [] : pageTags(title, description, pathname, options);
  if (sink) {
    sink.title = title;
    sink.tags = tags;
  }

  // tags is rebuilt every render; its signature says when it really changed
  const signature = JSON.stringify(tags);
  useEffect(() => {
    document.title = title;
    tags.forEach(upsert);
    if (tags.length > 0 && !tags.some((t) => t.key === 'canonical')) document.head.querySelector('link[rel="canonical"]')?.remove();
  }, [title, signature]);
}

// JSON inside <script> must not be able to close the tag.
export const scriptJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

/** Adds one JSON-LD block to the head, replaced whenever `data` changes and removed on unmount. */
export function useJsonLd(key: string, data: unknown) {
  const sink = useContext(HeadSinkContext);
  if (sink && data) sink.jsonLd[key] = data;

  const json = data ? scriptJson(data) : '';
  useEffect(() => {
    if (!json) return;
    let el = document.head.querySelector<HTMLScriptElement>(`script[data-ld="${key}"]`);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.dataset.ld = key;
      document.head.appendChild(el);
    }
    if (el.textContent !== json) el.textContent = json;
    const script = el;
    return () => script.remove();
  }, [key, json]);
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The collected head as HTML, for the prerender. */
export function renderHead(sink: HeadSink): string {
  const tags = sink.tags.map((t) => {
    const attrs = Object.entries(t.attrs).map(([k, v]) => `${k}="${escapeHtml(v)}"`).join(' ');
    return `<${t.tag} ${attrs}>`;
  });
  const scripts = Object.entries(sink.jsonLd).map(
    ([key, data]) => `<script type="application/ld+json" data-ld="${key}">${scriptJson(data)}</script>`,
  );
  return [`<title>${escapeHtml(sink.title)}</title>`, ...tags, ...scripts].join('\n    ');
}
