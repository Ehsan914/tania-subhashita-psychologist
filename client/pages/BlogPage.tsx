import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bookmark } from 'lucide-react';
import { useSiteData, BlogPostData } from '../context/SiteDataContext';
import { Reveal } from '../components/Reveal';

export default function BlogPage() {
  const navigate = useNavigate();
  const { blogPosts } = useSiteData();
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPostData | null>(null);
  const [blogBookmarks, setBlogBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tania_blog_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogActiveCategory, setBlogActiveCategory] = useState<string>('All');

  const toggleBookmark = (id: string) => {
    let updated;
    if (blogBookmarks.includes(id)) {
      updated = blogBookmarks.filter(item => item !== id);
    } else {
      updated = [...blogBookmarks, id];
    }
    setBlogBookmarks(updated);
    localStorage.setItem('tania_blog_bookmarks', JSON.stringify(updated));
  };

  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesCategory = blogActiveCategory === 'All' || post.category === blogActiveCategory;
    const matchesSearch = post.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(blogSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const blogCategories = useMemo(() => {
    const categories = new Set(blogPosts.map(post => post.category));
    return ['All', ...Array.from(categories)];
  }, [blogPosts]);

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto text-left">
      <Reveal delay={100} className="mb-12 text-center md:text-left space-y-4">
        <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">Educating the Mind</span>
        <h1 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#1C4751] font-light">Clinical Mental Wellness Articles</h1>
        <p className="text-sm text-[#5C6A6C] max-w-2xl leading-relaxed">
          A selection of short, unhurried, evidence-based articles detailing cognitive restructures, neural anxiety hacks, and behavioral addiction escape pathways.
        </p>
      </Reveal>

      {selectedBlogPost ? (
        <Reveal className="bg-[#FAF4E2] border border-[#1C4751]/12 p-8 rounded-xl space-y-6 shadow-sm max-w-3xl mx-auto">
          <button onClick={() => setSelectedBlogPost(null)} className="text-xs text-[#1C4751] font-bold hover:underline mb-4 flex items-center gap-1.5 focus:outline-none" id="back-to-all-blogs">
            ← Back to all articles
          </button>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[9px] font-bold tracking-widest text-white bg-[#1C4751] px-2 py-0.5 rounded uppercase">{selectedBlogPost.category}</span>
              <span className="text-xs text-[#5C6A6C]">{selectedBlogPost.date}</span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-[#5C6A6C] font-semibold">{selectedBlogPost.readTime}</span>
            </div>
            <h1 className="font-serif-cormorant text-3xl sm:text-4xl text-[#1C4751] font-semibold tracking-normal leading-tight">{selectedBlogPost.title}</h1>
          </div>
          <div className="prose prose-sm prose-[#1C4751] text-sm text-[#2A3A3E] leading-relaxed max-w-none space-y-4 pt-6 border-t border-[#1C4751]/10 whitespace-pre-wrap">
            {selectedBlogPost.content}
          </div>
          <div className="mt-8 pt-8 border-t border-[#1C4751]/10 flex justify-between items-center bg-[#EFE5C8]/30 p-4 rounded-lg">
            <div>
              <p className="text-xs font-bold text-[#1C4751]">Struggling with issues explained here?</p>
              <p className="text-xs text-[#5C6A6C]">Get guided support tailored for your specific biological response.</p>
            </div>
            <button
              onClick={() => {
                navigate('/book', { state: { serviceId: selectedBlogPost.linkedServiceSlug || 'psychotherapy' } });
              }}
              className="bg-[#1C4751] hover:bg-[#4F8E99] text-[#FAF4E2] text-[11px] font-bold uppercase tracking-wider py-2.5 px-4 rounded transition"
              id="book-from-blog"
            >
              Discuss in Session
            </button>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-8">
          <Reveal delay={100} className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#FAF4E2] p-4 rounded-lg border border-[#1C4751]/12 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {blogCategories.map(cat => (
                <button key={cat} onClick={() => setBlogActiveCategory(cat)} className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded transition ${blogActiveCategory === cat ? 'bg-[#1C4751] text-[#FAF4E2]' : 'bg-[#EFE5C8] text-[#1C4751] hover:bg-[#1C4751]/10'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5C6A6C]" />
              <input type="text" placeholder="Search articles..." value={blogSearchQuery} onChange={(e) => setBlogSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-[#1C4751]/20 rounded text-xs text-[#1C4751] focus:outline-none focus:border-[#4F8E99] font-medium" />
            </div>
          </Reveal>

          {filteredBlogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredBlogPosts.map((post, i) => (
                <Reveal delay={i * 100} key={post.id} className="h-full">
                  <div className="bg-[#FAF4E2] border border-[#1C4751]/12 p-6 rounded-lg flex flex-col justify-between hover:border-[#1C4751]/50 transition shadow-sm text-left group h-full">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] tracking-widest font-extrabold text-[#6E7C4E] uppercase bg-[#6E7C4E]/10 px-2 py-0.5 rounded">{post.category}</span>
                        <button onClick={() => toggleBookmark(post.id)} className="text-[#5C6A6C] hover:text-[#E4B24C] cursor-pointer" aria-label="Bookmark article" id={`bookmark-${post.slug}`}>
                          <Bookmark className={`w-4 h-4 ${blogBookmarks.includes(post.id) ? 'fill-[#E4B24C] text-[#C9923A]' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      <h3 className="font-serif-cormorant text-xl font-bold text-[#1C4751] group-hover:text-[#4F8E99] leading-tight mb-2 transition">{post.title}</h3>
                      <p className="text-xs text-[#5C6A6C] leading-relaxed mb-4 line-clamp-4">{post.summary}</p>
                    </div>
                    <div className="pt-4 border-t border-[#1C4751]/5 flex justify-between items-center text-xs mt-3">
                      <span className="text-[#5C6A6C] font-semibold text-[11px]">{post.readTime}</span>
                      <button onClick={() => setSelectedBlogPost(post)} className="text-[#1C4751] font-bold hover:underline cursor-pointer flex items-center" id={`read-article-${post.slug}`}>
                        Read full article →
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#FAF4E2] border border-[#1C4751]/10 rounded-lg">
              <p className="text-[#5C6A6C] font-medium">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {!selectedBlogPost && blogBookmarks.length > 0 && (
        <div className="mt-12 bg-[#EFE5C8] p-4 rounded-lg flex items-center justify-between">
          <span className="text-xs text-[#1C4751] font-bold">🔖 You have bookmarked {blogBookmarks.length} article(s) for quiet secondary reading.</span>
          <button onClick={() => { setBlogBookmarks([]); localStorage.removeItem('tania_blog_bookmarks'); }} className="text-[10px] uppercase font-bold text-red-700 hover:underline" id="clear-bookmarks">
            Clear Bookmarks
          </button>
        </div>
      )}
    </div>
  );
}
