import AdminCrudPage from './AdminCrudPage';

export default function AdminGallery() {
  return (
    <AdminCrudPage
      title="Gallery"
      subtitle="Manage healing space gallery images"
      endpoint="gallery"
      displayField="altText"
      secondaryField="url"
      newItemDefaults={{ url: '', altText: '', order: 0, isActive: true }}
      fields={[
        { key: 'url', label: 'Image URL', placeholder: 'https://images.unsplash.com/...' },
        { key: 'altText', label: 'Alt Text / Description', placeholder: 'Therapy room with natural light' },
        { key: 'order', label: 'Display Order', type: 'number' },
        { key: 'isActive', label: 'Active (visible on site)', type: 'checkbox' },
      ]}
    />
  );
}
