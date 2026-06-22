import AdminCrudPage from './AdminCrudPage';

export default function AdminStatistics() {
  return (
    <AdminCrudPage
      title="Statistics"
      subtitle="Manage the impact statistics shown on the homepage"
      endpoint="statistics"
      displayField="label"
      secondaryField="value"
      newItemDefaults={{ value: '', label: '', detail: '', order: 0 }}
      fields={[
        { key: 'value', label: 'Value', placeholder: 'e.g. 1,560 or 10+' },
        { key: 'label', label: 'Label', placeholder: 'e.g. Therapy Sessions Every Year' },
        { key: 'detail', label: 'Detail Description', type: 'textarea', rows: 2 },
        { key: 'order', label: 'Display Order', type: 'number' },
      ]}
    />
  );
}
