import AdminCrudPage from './AdminCrudPage';

export default function AdminTestimonials() {
  return (
    <AdminCrudPage
      title="Testimonials"
      subtitle="Manage client testimonials displayed on the homepage"
      endpoint="testimonials"
      displayField="name"
      secondaryField="role"
      newItemDefaults={{ name: '', gender: 'female', text: '', role: '', order: 0, isActive: true }}
      fields={[
        { key: 'name', label: 'Client Name', placeholder: 'e.g. Sarah Jenkins' },
        { key: 'gender', label: 'Gender', type: 'select', options: [
          { label: 'Female', value: 'female' },
          { label: 'Male', value: 'male' },
        ]},
        { key: 'role', label: 'Role', placeholder: 'e.g. Client since 2021' },
        { key: 'text', label: 'Testimonial Text', type: 'textarea', rows: 3 },
        { key: 'order', label: 'Display Order', type: 'number' },
        { key: 'isActive', label: 'Active (visible on site)', type: 'checkbox' },
      ]}
    />
  );
}
