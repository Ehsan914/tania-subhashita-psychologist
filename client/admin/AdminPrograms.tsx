import AdminCrudPage from './AdminCrudPage';

export default function AdminPrograms() {
  return (
    <AdminCrudPage
      title="Programs"
      subtitle="Manage structured healing programs"
      endpoint="programs"
      displayField="title"
      secondaryField="duration"
      newItemDefaults={{ slug: '', title: '', subtitle: '', duration: '', description: '', details: [], suitability: '', order: 0, isActive: true }}
      fields={[
        { key: 'title', label: 'Program Title' },
        { key: 'slug', label: 'URL Slug', placeholder: 'e.g. anxiety-panic' },
        { key: 'subtitle', label: 'Subtitle' },
        { key: 'duration', label: 'Duration', placeholder: 'e.g. 8 Weekly Sessions' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'suitability', label: 'Suitability', type: 'textarea', rows: 2 },
        { key: 'order', label: 'Display Order', type: 'number' },
        { key: 'isActive', label: 'Active (visible on site)', type: 'checkbox' },
      ]}
    />
  );
}
