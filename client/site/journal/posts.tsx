// Shared pieces of the Journal list and article view (design: journal.js).
import { Link } from 'react-router-dom';
import type { BlogPostData, RichText } from '../../context/SiteDataContext';
import { imageUrl } from '../../lib/sanity';

export const postHref = (slug: string) => `/blog/${encodeURIComponent(slug)}`;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "2026-10-24" or "2026-10-24T…" → "24 October 2026", the same in the prerender and every browser.
export function longDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// A post without its own image gets the design's photo for the seeded posts, or a steady
// pick (by slug) from the same calm set.
const POST_IMAGES: Record<string, string> = {
  'cbt-steps': '/images/tea.jpg',
  'overcome-procrastination': '/images/plant.jpg',
  'trauma-healing': '/images/poppies.jpg',
};
const FALLBACK_IMAGES = ['/images/tea.jpg', '/images/plant.jpg', '/images/poppies.jpg', '/images/chair.jpg', '/images/sage-wall.jpg', '/images/dock.jpg'];

function stockImage(slug: string): string {
  const known = POST_IMAGES[slug];
  if (known) return known;
  const seed = [...slug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return FALLBACK_IMAGES[seed % FALLBACK_IMAGES.length];
}

/** The post's own image from the Studio at `width`, else its stock photo. */
export function postImage(post: BlogPostData, width?: number): string {
  return imageUrl(post.image, width) ?? stockImage(post.slug);
}

const WORDS_PER_MINUTE = 200;

// "4 min read", from the words in the post itself. A block's spans are joined as written (a
// bolded word stays one word); blocks are kept apart so paragraphs don't run together.
export function readingTime(body: RichText): string {
  const text = body
    .map((block) => (Array.isArray(block.children) ? block.children.map((span) => (typeof span.text === 'string' ? span.text : '')).join('') : ''))
    .join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}

export function PostMeta({ post }: { post: BlogPostData }) {
  return (
    <p className="post-meta"><span className="cat">{post.category}</span><span>{longDate(post.date)}</span><span>{readingTime(post.body)}</span></p>
  );
}

export function PostRow({ post }: { post: BlogPostData }) {
  return (
    <li className="post-row">
      <Link to={postHref(post.slug)}>
        <PostMeta post={post} />
        <div><h3>{post.title}</h3><p>{post.summary}</p></div>
        <span className="read">Read →</span>
      </Link>
    </li>
  );
}
