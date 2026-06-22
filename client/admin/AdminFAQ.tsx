import AdminCrudPage from './AdminCrudPage';

export default function AdminFAQ() {
  return (
    <AdminCrudPage
      title="FAQs"
      subtitle="Manage frequently asked questions"
      endpoint="faqs"
      displayField="question"
      newItemDefaults={{ question: '', answer: '', order: 0, isActive: true }}
      fields={[
        { key: 'question', label: 'Question' },
        { key: 'answer', label: 'Answer', type: 'textarea', rows: 4 },
        { key: 'order', label: 'Display Order', type: 'number' },
        { key: 'isActive', label: 'Active (visible on site)', type: 'checkbox' },
      ]}
    />
  );
}
