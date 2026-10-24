// The Journal's post list: the newest post as a feature, the rest as rows (design: journal.js, renderList()).
import { Link } from 'react-router-dom';
import type { BlogPostData } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';
import { PostMeta, PostRow, postHref, postImage } from './posts';

const FEATURE_WIDTH = 1200; // the newest post's photo, about half the page wide

function FeaturePost({ post }: { post: BlogPostData }) {
  const href = postHref(post.slug);
  return (
    <article className="feature">
      <Link to={href} tabIndex={-1} aria-hidden="true">
        <figure data-reveal="mask"><img src={postImage(post, FEATURE_WIDTH)} alt="" /></figure>
      </Link>
      <div>
        <div data-reveal="rise"><PostMeta post={post} /></div>
        <h2 className="h2" data-reveal="split"><Link to={href}><SplitWords>{post.title}</SplitWords></Link></h2>
        <p className="lede" data-reveal="rise">{post.summary}</p>
        <Link className="link" to={href} data-reveal="rise" style={{ display: 'inline-block', marginTop: 26 }}>Read the article</Link>
      </div>
    </article>
  );
}

export function JournalList({ posts }: { posts: BlogPostData[] }) {
  const [first, ...rest] = posts;

  return (
    <>
      <header className="page-head wrap">
        <p className="eyebrow" data-reveal="rise">Journal</p>
        <h1 className="h1" data-reveal="split"><SplitWords>Notes for the <em>in-between days.</em></SplitWords></h1>
        <p className="lede" data-reveal="rise">Short, practical pieces on how therapy works and what you can try on your own between sessions.</p>
      </header>
      <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
        {first ? <FeaturePost post={first} /> : (
          <p className="lede">New notes are on their way. Until then, a <Link className="link" to="/book">free 20-minute conversation</Link> is a good place to start.</p>
        )}
        {rest.length > 0 && (
          <ul className="post-rows rule-list" data-reveal="list">
            {rest.map((p) => <PostRow key={p.slug} post={p} />)}
          </ul>
        )}
      </section>
    </>
  );
}
