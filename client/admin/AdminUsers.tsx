import AdminCrudPage from './AdminCrudPage';

export default function AdminUsers() {
  return (
    <AdminCrudPage
      title="Admin Users"
      subtitle="Manage Gmail accounts that can access this admin panel"
      endpoint="users"
      displayField="email"
      secondaryField="name"
      newItemDefaults={{ email: '', name: '' }}
      fields={[
        { key: 'email', label: 'Gmail Address', placeholder: 'user@gmail.com' },
        { key: 'name', label: 'Display Name (optional)', placeholder: 'e.g. Tania Subhashita' },
      ]}
    />
  );
}
