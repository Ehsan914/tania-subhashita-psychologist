// Shared pieces of the Journal list and article view (design: journal.js).
import { Link } from 'react-router-dom';
import type { BlogPostData } from '../../context/SiteDataContext';

export const postHref = (slug: string) => `/blog/${encodeURIComponent(slug)}`;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "2026-10-24" or "2026-10-24T…" → "24 October 2026", the same in the prerender and every browser.
export function longDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// Posts have no image field: the design's photos for the seeded posts, and a
// steady pick (by slug) from the same calm set for any post added later.
const POST_IMAGES: Record<string, string> = {
  'cbt-steps': '/images/tea.jpg',
  'overcome-procrastination': '/images/plant.jpg',
  'trauma-healing': '/images/poppies.jpg',
};
const FALLBACK_IMAGES = ['/images/tea.jpg', '/images/plant.jpg', '/images/poppies.jpg', '/images/chair.jpg', '/images/sage-wall.jpg', '/images/dock.jpg'];

export function postImage(slug: string): string {
  const known = POST_IMAGES[slug];
  if (known) return known;
  const seed = [...slug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return FALLBACK_IMAGES[seed % FALLBACK_IMAGES.length];
}

export function PostMeta({ post }: { post: BlogPostData }) {
  return (
    <p className="post-meta"><span className="cat">{post.category}</span><span>{longDate(post.date)}</span><span>{post.readTime}</span></p>
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
