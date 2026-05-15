import { useSiteSettings } from '@/lib/settings-context';
import { SectionCard, ImageUploader, SortableList, ToggleSwitch } from './cms-components';
import { Plus, Trash2 } from 'lucide-react';

function useCategoriesEditor() {
  const { settings, updateSettings } = useSiteSettings();

  const updateCategory = (index: number, updates: Partial<typeof settings.categories[0]>) => {
    const copy = [...settings.categories];
    copy[index] = { ...copy[index], ...updates };
    updateSettings({ categories: copy });
  };

  const addCategory = () => {
    updateSettings({
      categories: [
        ...settings.categories,
        { id: `cat-${Date.now()}`, name: 'New Category', image: '', description: '', productCount: 0, visible: true },
      ],
    });
  };

  const removeCategory = (index: number) => {
    const copy = [...settings.categories];
    copy.splice(index, 1);
    updateSettings({ categories: copy });
  };

  return { settings, updateSettings, updateCategory, addCategory, removeCategory };
}

export function CategoriesEditor() {
  const { settings, updateSettings, updateCategory, addCategory, removeCategory } = useCategoriesEditor();

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionCard title="Categories">
        <SortableList
          items={settings.categories}
          onReorder={items => updateSettings({ categories: items })}
          renderItem={(cat, i) => (
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={e => updateCategory(i, { name: e.target.value })}
                    placeholder="Category Name"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                  />
                  <input
                    type="text"
                    value={cat.description}
                    onChange={e => updateCategory(i, { description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                  />
                </div>
                <div className="space-y-2">
                  <ImageUploader value={cat.image} onChange={v => updateCategory(i, { image: v })} />
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={cat.productCount}
                      onChange={e => updateCategory(i, { productCount: parseInt(e.target.value) || 0 })}
                      placeholder="Count"
                      className="w-20 px-3 py-2 border rounded-lg text-sm"
                    />
                    <ToggleSwitch checked={cat.visible} onChange={v => updateCategory(i, { visible: v })} label="Visible" />
                  </div>
                </div>
              </div>
              <button onClick={() => removeCategory(i)} className="p-1.5 hover:bg-red-50 text-[#E85D4E] rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
        <button
          onClick={addCategory}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </SectionCard>
    </div>
  );
}

export function CategoriesListEditor() {
  const { settings, updateSettings, updateCategory, addCategory, removeCategory } = useCategoriesEditor();

  return (
    <>
      <SortableList
        items={settings.categories}
        onReorder={items => updateSettings({ categories: items })}
        renderItem={(cat, i) => (
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <input
                  type="text"
                  value={cat.name}
                  onChange={e => updateCategory(i, { name: e.target.value })}
                  placeholder="Category Name"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <input
                  type="text"
                  value={cat.description}
                  onChange={e => updateCategory(i, { description: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
              </div>
              <div className="space-y-2">
                <ImageUploader value={cat.image} onChange={v => updateCategory(i, { image: v })} />
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={cat.productCount}
                    onChange={e => updateCategory(i, { productCount: parseInt(e.target.value) || 0 })}
                    placeholder="Count"
                    className="w-20 px-3 py-2 border rounded-lg text-sm"
                  />
                  <ToggleSwitch checked={cat.visible} onChange={v => updateCategory(i, { visible: v })} label="Visible" />
                </div>
              </div>
            </div>
            <button onClick={() => removeCategory(i)} className="p-1.5 hover:bg-red-50 text-[#E85D4E] rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
      <button
        onClick={addCategory}
        className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Category
      </button>
    </>
  );
}
