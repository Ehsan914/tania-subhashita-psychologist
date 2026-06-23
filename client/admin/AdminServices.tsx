import AdminCrudPage from './AdminCrudPage';

const categoryOptions = [
  { label: 'Mood & Emotion', value: 'Mood & Emotion' },
  { label: 'Addiction & Behavior', value: 'Addiction & Behavior' },
  { label: 'Self & Relationships', value: 'Self & Relationships' },
  { label: 'Specialized Care', value: 'Specialized Care' },
];

const iconOptions = [
  'Brain', 'Heart', 'ShieldAlert', 'Fingerprint', 'Activity', 'Sparkles',
  'SmartphoneOff', 'Sparkle', 'FlameKindling', 'Video', 'LifeBuoy', 'Wind',
  'BookOpen', 'CloudRain', 'GitCommit', 'Users', 'Sunset', 'Smile',
  'Moon', 'Baby', 'Flame', 'Eye', 'Clock', 'Home', 'Compass', 'Award',
].map((i) => ({ label: i, value: i }));

export default function AdminServices() {
  return (
    <AdminCrudPage
      title="Services"
      subtitle="Manage the therapy services displayed on the site. Drag to reorder."
      endpoint="services"
      displayField="name"
      secondaryField="category"
      reorderEndpoint="services/reorder"
      newItemDefaults={{ slug: '', name: '', description: '', category: 'Mood & Emotion', iconName: 'Brain', order: 0, isActive: true, treatmentPoints: '', clinicNote: '' }}
      fields={[
        { key: 'name', label: 'Service Name', placeholder: 'e.g. Anxiety Disorder' },
        { key: 'slug', label: 'URL Slug', placeholder: 'e.g. anxiety-disorder' },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions },
        { key: 'iconName', label: 'Icon', type: 'icon-select', options: iconOptions },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'treatmentPoints', label: 'Treatment Points (one per line)', type: 'textarea', rows: 4, placeholder: 'Initial diagnostics & cognitive distortion mapping.\nSomatic regulation protocols & distress containment plans.\nDirect homework sheets to build practical physical habits.' },
        { key: 'clinicNote', label: 'Clinic Delivery Note', type: 'textarea', rows: 3, placeholder: 'Available in-person or via secure tele-consultation. Includes a personalized recovery template.' },
        { key: 'isActive', label: 'Active (visible on site)', type: 'checkbox' },
      ]}
    />
  );
}
