// Journal (design: site/journal.html + assets/journal.js): the post list at /blog, one
// article at /blog/:slug. The design's old ?post=<slug> links redirect to the article route.
import { useRef } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { useReveal } from '../site/motion';
import { ArticleNotFound, JournalArticle } from '../site/journal/JournalArticle';
import { JournalList } from '../site/journal/JournalList';
import { postHref } from '../site/journal/posts';
import { usePageMeta } from '../hooks/usePageMeta';

export default function BlogPage() {
  // the API returns published posts only
  const { blogPosts } = useSiteData();
  const { slug } = useParams();
  const [params] = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);
  const legacySlug = params.get('post');

  const post = slug ? blogPosts.find((p) => p.slug === slug) : undefined;

  useReveal(rootRef, [slug, blogPosts]);
  usePageMeta(
    post ? `${post.title} — Tania Subhashita` : 'Journal — Tania Subhashita, Psychologist',
    'Notes on therapy, anxiety, habits and healing from psychologist Tania Subhashita.',
  );

  if (!slug && legacySlug) return <Navigate to={postHref(legacySlug)} replace />;

  return (
    <div ref={rootRef}>
      {!slug && <JournalList posts={blogPosts} />}
      {slug && post && <JournalArticle post={post} others={blogPosts.filter((p) => p !== post)} />}
      {slug && !post && <ArticleNotFound />}
    </div>
  );
}
