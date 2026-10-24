// A single Journal article, then the other posts (design: journal.js, renderArticle()).
import { Link } from 'react-router-dom';
import type { BlogPostData } from '../../context/SiteDataContext';
import { isoDate } from '../../lib/schema';
import { SplitWords } from '../motion';
import { PostBody } from './PostBody';
import { PostMeta, PostRow, longDate, postImage } from './posts';

const BANNER_WIDTH = 1800; // the full-width banner, sharp on wide and high-density screens

// Health articles say who wrote them, and when they last changed if that was after publication.
function Byline({ post }: { post: BlogPostData }) {
  const published = isoDate(post.date);
  const updated = published && post._updatedAt.slice(0, 10) > published ? post._updatedAt : null;
  return (
    <p className="byline" data-reveal="rise">
      <img src="/images/tania-subhashita-portrait.jpeg" alt="" width={48} height={48} />
      <span>
        Written by <Link to="/about">Tania Subhashita</Link>, psychologist in Dhaka
        {updated && <><br />Updated {longDate(updated)}</>}
      </span>
    </p>
  );
}

function BackLink() {
  return <div className="wrap"><Link className="back" to="/blog"><span aria-hidden="true">←</span> All articles</Link></div>;
}

export function JournalArticle({ post, others }: { post: BlogPostData; others: BlogPostData[] }) {
  return (
    <>
      <article className="article">
        <BackLink />
        <header className="wrap">
          <div data-reveal="rise"><PostMeta post={post} /></div>
          <h1 className="h1" data-reveal="split"><SplitWords>{post.title}</SplitWords></h1>
          <Byline post={post} />
        </header>
        <div className="wrap"><figure className="banner" data-reveal="mask"><img src={postImage(post, BANNER_WIDTH)} alt={post.image?.alt ?? ""} /></figure></div>
        <div className="wrap">
          <div className="body" data-reveal="rise"><PostBody body={post.body} /></div>
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
