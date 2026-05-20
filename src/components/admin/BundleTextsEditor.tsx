import { useState } from 'react';
import { useSiteSettings, type BundleTextItem } from '@/lib/settings-context';
import { SectionCard } from './cms-components';
import { Plus, Pencil, Trash2, X, Check, Gift } from 'lucide-react';
import { toast } from 'sonner';

function TextField({ label, value, onChange, textarea, error }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; error?: string }) {
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${error ? 'border-red-500' : ''}`,
  };
  return (
    <div>
      <label className="text-sm font-medium text-[#1A1A1A] block mb-1">{label}</label>
      {textarea ? <textarea {...props} rows={3} /> : <input {...props} type="text" />}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const EMPTY_ITEM: Omit<BundleTextItem, 'id'> = {
  key: '',
  label: '',
  value: '',
  description: '',
  page: '',
  pageLink: '',
  isSystem: false,
};

export function BundleTextsEditor() {
  const { settings, updateSettings } = useSiteSettings();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<BundleTextItem, 'id'>>(EMPTY_ITEM);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.key.trim()) next.key = 'Key is required';
    else if (!/^[a-zA-Z0-9_-]+$/.test(form.key)) next.key = 'Key must contain only letters, numbers, hyphens and underscores';
    if (!form.label.trim()) next.label = 'Label is required';
    if (!form.value.trim()) next.value = 'Value is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const startEdit = (item: BundleTextItem) => {
    setForm({
      key: item.key,
      label: item.label,
      value: item.value,
      description: item.description,
      page: item.page,
      pageLink: item.pageLink,
      isSystem: item.isSystem,
    });
    setEditingId(item.id);
    setIsCreating(false);
  };

  const startCreate = () => {
    setForm(EMPTY_ITEM);
    setEditingId(null);
    setIsCreating(true);
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(EMPTY_ITEM);
    setErrors({});
  };

  const saveItem = () => {
    if (!validate()) return;

    if (isCreating) {
      const newItem: BundleTextItem = {
        ...form,
        id: `bt-${Date.now()}`,
      };
      updateSettings({ bundleTexts: [...settings.bundleTexts, newItem] });
      toast.success('Bundle text created');
    } else if (editingId) {
      updateSettings({
        bundleTexts: settings.bundleTexts.map(bt =>
          bt.id === editingId ? { ...bt, ...form } : bt
        ),
      });
      toast.success('Bundle text updated');
    }
    cancelEdit();
  };

  const deleteItem = (id: string) => {
    const item = settings.bundleTexts.find(bt => bt.id === id);
    if (item?.isSystem) {
      toast.error('System bundle texts cannot be deleted');
      return;
    }
    updateSettings({ bundleTexts: settings.bundleTexts.filter(bt => bt.id !== id) });
    toast.success('Bundle text deleted');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-[#1A5A6B]/10 rounded-xl p-4 border border-[#1A5A6B]/20 flex items-start gap-3">
        <Gift className="w-5 h-5 text-[#1A5A6B] flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-heading font-semibold text-[#1A1A1A] text-sm">Bundle Texts</h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Manage all texts related to the 3-for-$10 pin bundle promotion across your store.
            System texts (marked with a shield) are used by the website code and cannot be deleted,
            but you can edit their content. Custom texts can be created for future use.
          </p>
        </div>
      </div>

      {/* Create / Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-semibold text-[#1A1A1A]">
              {isCreating ? 'Create Bundle Text' : 'Edit Bundle Text'}
            </h4>
            <button onClick={cancelEdit} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Key *" value={form.key} onChange={v => setForm({ ...form, key: v })} error={errors.key} />
            <TextField label="Label *" value={form.label} onChange={v => setForm({ ...form, label: v })} error={errors.label} />
            <TextField label="Page Name" value={form.page} onChange={v => setForm({ ...form, page: v })} />
            <TextField label="Page Link" value={form.pageLink} onChange={v => setForm({ ...form, pageLink: v })} />
          </div>
          <TextField label="Value *" value={form.value} onChange={v => setForm({ ...form, value: v })} textarea error={errors.value} />
          <TextField label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} textarea />
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveItem}
              className="px-4 py-2 bg-[#1A5A6B] text-white rounded-lg text-sm font-medium hover:bg-[#1A8DA3] transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Save
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {settings.bundleTexts.map(item => {
          const isEditing = editingId === item.id;
          if (isEditing) return null; // editing form shown above

          return (
            <SectionCard key={item.id} title={item.label}>
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">key: {item.key}</code>
                    {item.isSystem && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1A5A6B]/15 text-[#1A5A6B]">
                        System
                      </span>
                    )}
                    {item.page && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {item.page}
                      </span>
                    )}
                    {item.pageLink && (
                      <a
                        href={item.pageLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#1A5A6B] hover:underline"
                      >
                        View page →
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280]">{item.description}</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-[#1A1A1A]">
                    {item.value}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1A5A6B]"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#E85D4E]"
                    title={item.isSystem ? 'System texts cannot be deleted' : 'Delete'}
                    disabled={item.isSystem}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>

      {/* Add Button */}
      {!isCreating && !editingId && (
        <button
          onClick={startCreate}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Bundle Text
        </button>
      )}
    </div>
  );
}
