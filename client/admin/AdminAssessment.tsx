import AdminCrudPage from './AdminCrudPage';

export default function AdminAssessment() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Assessment</h1>
        <p className="text-sm text-gray-500 mt-1">Manage self-assessment questions and score bands</p>
      </div>

      <AdminCrudPage
        title="Assessment Questions"
        subtitle="Questions shown in the self-audit checklist"
        endpoint="assessment-questions"
        displayField="text"
        newItemDefaults={{ text: '', order: 0, isActive: true }}
        fields={[
          { key: 'text', label: 'Question Text', type: 'textarea', rows: 2 },
          { key: 'order', label: 'Display Order', type: 'number' },
          { key: 'isActive', label: 'Active', type: 'checkbox' },
        ]}
      />

      <AdminCrudPage
        title="Score Bands"
        subtitle="Result messages based on score ranges"
        endpoint="assessment-score-bands"
        displayField="label"
        secondaryField="emoji"
        newItemDefaults={{ minScore: 0, maxScore: 1, emoji: '', label: '', message: '' }}
        fields={[
          { key: 'emoji', label: 'Emoji', placeholder: '🌱' },
          { key: 'label', label: 'Label', placeholder: 'e.g. Subtle Tension' },
          { key: 'minScore', label: 'Min Score', type: 'number' },
          { key: 'maxScore', label: 'Max Score', type: 'number' },
          { key: 'message', label: 'Message', type: 'textarea', rows: 3 },
        ]}
      />
    </div>
  );
}
