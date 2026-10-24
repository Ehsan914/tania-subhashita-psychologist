// Build step after `vite build`: renders every public page to static HTML, so search
// engines, AI assistants and link previews (WhatsApp, Facebook) read real content
// instead of an empty <div id="root">. Writes into dist/:
//   <path>.html        each page, with its own head tags and JSON-LD; the app hydrates it
//   404.html           served by the host, with a 404 status, for any unknown address
//   sitemap.xml, llms.txt
// Content comes from Sanity at build time; publishing in the Studio triggers a rebuild.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { SiteDataSeed, loadSiteData, type SiteData } from './context/SiteDataContext';
import { HeadSinkProvider, NOINDEX, renderHead, scriptJson, type HeadSink } from './hooks/usePageMeta';
import { qualificationsOf } from './lib/schema';
import { PERSON_NAME, SITE_NAME, absoluteUrl } from './lib/site';
import { postHref } from './site/journal/posts';
import { serviceHref } from './site/therapies/therapyData';

const DIST = resolve('dist');
const NOT_FOUND_ROUTE = '/__not-found__';
const STATIC_ROUTES = ['/', '/about', '/services', '/programs', '/blog', '/contact', '/book'];

// Runs before the stylesheets apply: hides what is about to animate in (see site-extras.css),
// unless the visitor prefers reduced motion, in which case nothing animates.
const REVEAL_SCRIPT = `<script>if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!/[?&]motion=off/.test(location.search))document.documentElement.classList.add('reveal-pending')</script>`;

interface RenderedPage {
  path: string;
  title: string;
  description: string;
  indexable: boolean;
  lastmod?: string;
}

function render(path: string, data: SiteData): { html: string; head: HeadSink } {
  const head: HeadSink = { title: '', tags: [], jsonLd: {} };
  const html = renderToString(
    <StaticRouter location={path}>
      <SiteDataSeed.Provider value={data}>
        <HeadSinkProvider value={head}>
          <App />
        </HeadSinkProvider>
      </SiteDataSeed.Provider>
    </StaticRouter>,
  );
  return { html, head };
}

const tagContent = (head: HeadSink, key: string) => head.tags.find((t) => t.key === key)?.attrs.content ?? '';

// Replacements go through functions: as a plain string, any "$&" or "$$" in editor-entered
// content would be read as a replacement pattern and corrupt the page.
function page(template: string, html: string, head: HeadSink, data: SiteData): string {
  const withHead = template.replace(
    /<title>[\s\S]*?<\/title>\s*<meta name="description"[^>]*>/,
    () => `${REVEAL_SCRIPT}\n    ${renderHead(head)}`,
  );
  if (withHead === template) throw new Error('index.html no longer has the <title> + description pair the prerender replaces');
  return withHead.replace(
    '<div id="root"></div>',
    () => `<div id="root">${html}</div>\n    <script type="application/json" id="site-data">${scriptJson(data)}</script>`,
  );
}

// /about → about.html, served at /about by the host's clean URLs (vercel.json: cleanUrls).
function fileFor(route: string): string {
  if (route === NOT_FOUND_ROUTE) return join(DIST, '404.html');
  if (route === '/') return join(DIST, 'index.html');
  return join(DIST, `${route}.html`);
}

function writePage(route: string, contents: string) {
  const file = fileFor(route);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

function routesOf(data: SiteData): { path: string; lastmod?: string }[] {
  return [
    ...STATIC_ROUTES.map((path) => ({ path })),
    ...data.services.map((s) => ({ path: serviceHref(s.slug), lastmod: s._updatedAt })),
    ...data.posts.map((p) => ({ path: postHref(p.slug), lastmod: p._updatedAt })),
  ];
}

function sitemap(pages: RenderedPage[]): string {
  const urls = pages.filter((p) => p.indexable).map((p) => {
    const lastmod = p.lastmod ? `<lastmod>${p.lastmod.slice(0, 10)}</lastmod>` : '';
    return `  <url><loc>${absoluteUrl(p.path)}</loc>${lastmod}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

// llms.txt (llmstxt.org): a plain summary of the practice and its pages for AI assistants.
function llmsTxt(pages: RenderedPage[], data: SiteData): string {
  const contact = data.contact;
  const qualifications = qualificationsOf(data.home);
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const link = (path: string) => {
    const p = byPath.get(path);
    return p ? `- [${p.title}](${absoluteUrl(path)}): ${p.description}` : '';
  };
  const facts = [
    contact && `- In person: ${[contact.practiceName, contact.address].filter(Boolean).join(', ')}`,
    '- Online: video sessions by Zoom or Google Meet, anywhere in Bangladesh',
    '- Sessions: 60 minutes; the first 20 minutes are free',
    contact?.openingHours && `- Hours: ${contact.openingHours}`,
    contact?.phone && `- Phone and WhatsApp: ${contact.phone}`,
    contact?.email && `- Email: ${contact.email}`,
    `- Book a session: ${absoluteUrl('/book')}`,
    '- In a crisis in Bangladesh: call 999, or the Kaan Pete Roi emotional support helpline on 09612-119911 (3 pm to 3 am daily). This practice is not an emergency service.',
  ].filter(Boolean);

  return [
    `# ${SITE_NAME}`,
    '',
    `> ${PERSON_NAME} is a psychologist offering counselling and psychotherapy in New Eskaton, Dhaka, Bangladesh, and online across Bangladesh.${qualifications ? ` ${qualifications}` : ''}`,
    '',
    ...facts,
    '',
    '## Pages',
    ...['/about', '/services', '/programs', '/blog', '/contact', '/book'].map(link),
    '',
    '## Therapies',
    ...data.services.map((s) => `- [${s.name}](${absoluteUrl(serviceHref(s.slug))}): ${s.summary}`),
    '',
    ...(data.posts.length > 0 ? ['## Journal', ...data.posts.map((p) => link(postHref(p.slug))), ''] : []),
  ].join('\n');
}

async function main() {
  const data = await loadSiteData({ strict: true });
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');

  const pages: RenderedPage[] = [];
  for (const { path, lastmod } of [...routesOf(data), { path: NOT_FOUND_ROUTE }]) {
    const { html, head } = render(path, data);
    writePage(path, page(template, html, head, data));
    pages.push({
      path, lastmod, title: head.title, description: tagContent(head, 'description'),
      indexable: path !== NOT_FOUND_ROUTE && tagContent(head, 'robots') !== NOINDEX,
    });
  }

  writeFileSync(join(DIST, 'sitemap.xml'), sitemap(pages));
  writeFileSync(join(DIST, 'llms.txt'), llmsTxt(pages, data));
  const indexed = pages.filter((p) => p.indexable).length;
  console.log(`Prerendered ${pages.length} pages (${indexed} in the sitemap, ${pages.length - indexed} kept out of search).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
