import { useState } from 'react';
import { useAdminData, adminApi } from '../hooks/useApi';
import { Plus, Pencil, Trash2, Save, X, Loader2 } from 'lucide-react';
import { DynamicServiceIcon } from '../components/DynamicServiceIcon';

interface CrudItem {
  id: string;
  [key: string]: any;
}

interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'icon-select' | 'number' | 'checkbox';
  options?: { label: string; value: string }[];
  placeholder?: string;
  rows?: number;
}

interface AdminCrudPageProps {
  title: string;
  subtitle: string;
  endpoint: string;
  fields: FieldDef[];
  displayField: string; // Which field to show as the item title in the list
  secondaryField?: string; // Optional secondary info line
  newItemDefaults: Record<string, any>;
}

function FormField({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded accent-indigo-500 bg-[#12121f] border-white/10" />
        <span className="text-sm text-gray-300">{field.label}</span>
      </label>
    );
  }
  if (field.type === 'icon-select' && field.options) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{field.label}</label>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 bg-[#12121f] border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto">
          {field.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${
                value === opt.value
                  ? 'bg-indigo-500/30 border border-indigo-500 text-white ring-1 ring-indigo-400/50'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
              }`}
              title={opt.label}
            >
              <DynamicServiceIcon iconName={opt.value} className="w-5 h-5" />
              <span className="text-[8px] leading-tight truncate w-full text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (field.type === 'select' && field.options) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{field.label}</label>
        <select value={value || ''} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all">
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{field.label}</label>
      {field.type === 'textarea' || field.rows ? (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={field.rows || 3} placeholder={field.placeholder}
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
      ) : (
        <input type={field.type || 'text'} value={value ?? ''} onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={field.placeholder}
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
      )}
    </div>
  );
}

export default function AdminCrudPage({ title, subtitle, endpoint, fields, displayField, secondaryField, newItemDefaults }: AdminCrudPageProps) {
  const { data: items, loading, refetch } = useAdminData<CrudItem[]>(endpoint, []);
  const [editingItem, setEditingItem] = useState<CrudItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const startCreate = () => {
    setEditingItem({ id: '', ...newItemDefaults });
    setIsCreating(true);
  };

  const startEdit = (item: CrudItem) => {
    setEditingItem({ ...item });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, ...data } = editingItem;
      if (isCreating) {
        await adminApi(endpoint, 'POST', data);
      } else {
        await adminApi(`${endpoint}/${id}`, 'PUT', data);
      }
      await refetch();
      cancelEdit();
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await adminApi(`${endpoint}/${id}`, 'DELETE');
      await refetch();
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  const updateField = (key: string, value: any) => {
    setEditingItem((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        {!editingItem && (
          <button onClick={startCreate}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {/* Edit/Create Form */}
      {editingItem && (
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-indigo-500/20 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">{isCreating ? 'Create New' : 'Edit Item'}</h2>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' || field.rows ? 'md:col-span-2' : ''}>
                <FormField field={field} value={editingItem[field.key]} onChange={(v) => updateField(field.key, v)} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={cancelEdit}
              className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : isCreating ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 text-center">
            <p className="text-gray-500 text-sm">No items yet. Click "Add New" to create one.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-[#1a1a2e] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">{item[displayField]}</div>
                {secondaryField && (
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{item[secondaryField]}</div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                <button onClick={() => startEdit(item)}
                  className="p-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
