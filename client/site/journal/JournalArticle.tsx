// A single Journal article, then the other posts (design: journal.js, renderArticle()).
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPostData } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';
import { PostBody } from './PostBody';
import { PostMeta, PostRow, postImage } from './posts';

function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => { document.title = previous; };
  }, [title]);
}

function BackLink() {
  return <div className="wrap"><Link className="back" to="/blog"><span aria-hidden="true">←</span> All articles</Link></div>;
}

export function JournalArticle({ post, others }: { post: BlogPostData; others: BlogPostData[] }) {
  useDocumentTitle(`${post.title} — Tania Subhashita`);

  return (
    <>
      <article className="article">
        <BackLink />
        <header className="wrap">
          <div data-reveal="rise"><PostMeta post={post} /></div>
          <h1 className="h1" data-reveal="split"><SplitWords>{post.title}</SplitWords></h1>
        </header>
        <div className="wrap"><figure className="banner" data-reveal="mask"><img src={postImage(post.slug)} alt="" /></figure></div>
        <div className="wrap">
          <div className="body" data-reveal="rise"><PostBody content={post.content} /></div>
          <aside className="aside-cta" data-reveal="rise">
            <strong>Would it help to talk it through?</strong>
            <Link className="btn" to="/book">Book a free consult <span className="arrow" aria-hidden="true">→</span></Link>
          </aside>
        </div>
      </article>
      {others.length > 0 && (
        <section className="section wrap">
          <h2 className="h2" data-reveal="split" style={{ marginBottom: 24 }}><SplitWords>Keep <em>reading</em></SplitWords></h2>
          <ul className="post-rows rule-list" data-reveal="list" style={{ marginTop: 0 }}>
            {others.map((p) => <PostRow key={p.slug} post={p} />)}
          </ul>
        </section>
      )}
    </>
  );
}

// An unknown or unpublished slug: say so kindly and point back to the Journal.
export function ArticleNotFound() {
  useDocumentTitle('Article not found — Tania Subhashita');

  return (
    <article className="article" style={{ paddingBottom: 'var(--section)' }}>
      <BackLink />
      <header className="wrap">
        <h1 className="h1">This note isn’t <em>here.</em></h1>
        <p className="lede" style={{ marginTop: 22 }}>It may have moved or been taken down. The other articles are still in the Journal.</p>
        <Link className="btn" to="/blog" style={{ marginTop: 32 }}>Back to the Journal <span className="arrow" aria-hidden="true">→</span></Link>
      </header>
    </article>
  );
}
