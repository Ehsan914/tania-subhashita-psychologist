// Journal (design: site/journal.html + assets/journal.js): the post list at /blog, one
// article at /blog/:slug. The design's old ?post=<slug> links redirect to the article route.
import { useRef } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { useReveal } from '../site/motion';
import { JournalArticle } from '../site/journal/JournalArticle';
import NotFoundPage from './NotFoundPage';
import { JournalList } from '../site/journal/JournalList';
import { postHref, postImage } from '../site/journal/posts';
import { usePageMeta, useJsonLd } from '../hooks/usePageMeta';
import { clip } from '../lib/site';
import { articleNode, pageGraph } from '../lib/schema';

const JOURNAL = { name: 'Journal', path: '/blog' };
const SHARE_WIDTH = 1200; // link previews (og:image) and the article's JSON-LD image

export default function BlogPage() {
  // only published posts are loaded; a draft has no page
  const { posts } = useSiteData();
  const { slug } = useParams();
  const [params] = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);
  const legacySlug = params.get('post');

  const post = slug ? posts.find((p) => p.slug === slug) : undefined;

  useReveal(rootRef, [slug, posts]);
  const path = post ? postHref(post.slug) : '/blog';
  usePageMeta(
    post ? `${post.title} | Tania Subhashita`
      : slug ? 'Page not found — Tania Subhashita' : 'Journal: Mental Health Articles | Tania Subhashita, Psychologist',
    post ? clip(post.summary) : 'Plain-language articles on anxiety, depression, trauma, habits and finding the right help in Bangladesh, from psychologist Tania Subhashita.',
    post ? { type: 'article', image: postImage(post, SHARE_WIDTH) } : { noindex: !!slug },
  );
  useJsonLd('page', post
    ? pageGraph('WebPage', path, post.title, [JOURNAL, { name: post.title, path }], [articleNode(post, path, postImage(post, SHARE_WIDTH))])
    : !slug && pageGraph('CollectionPage', path, 'Journal', [JOURNAL]));

  if (!slug && legacySlug) return <Navigate to={postHref(legacySlug)} replace />;
  // An unknown or unpublished post is the site's 404 page, the same markup the host serves
  // for it from 404.html, so the browser takes over that page without a mismatch.
  if (slug && !post) return <NotFoundPage />;

  return (
    <div ref={rootRef}>
      {post ? <JournalArticle post={post} others={posts.filter((p) => p !== post)} /> : <JournalList posts={posts} />}
    </div>
  );
}
