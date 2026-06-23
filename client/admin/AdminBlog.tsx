import AdminCrudPage from './AdminCrudPage';

export default function AdminBlog() {
  return (
    <AdminCrudPage
      title="Blog Posts"
      subtitle="Manage clinical articles and mental wellness content"
      endpoint="blog-posts"
      displayField="title"
      secondaryField="category"
      newItemDefaults={{ slug: '', title: '', date: '', category: '', summary: '', content: '', readTime: '5 min read', published: true, order: 0 }}
      reorderEndpoint="blog-posts/reorder"
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'URL Slug', placeholder: 'e.g. understanding-cbt' },
        { key: 'date', label: 'Date', placeholder: 'e.g. June 12, 2026' },
        { key: 'category', label: 'Category', placeholder: 'e.g. Psychotherapy' },
        { key: 'readTime', label: 'Read Time', placeholder: 'e.g. 5 min read' },
        { key: 'summary', label: 'Summary', type: 'textarea', rows: 2 },
        { key: 'content', label: 'Content (Markdown)', type: 'textarea', rows: 10 },
        { key: 'published', label: 'Published (visible on site)', type: 'checkbox' },
      ]}
    />
  );
}
