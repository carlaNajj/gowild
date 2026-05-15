import { useSiteSettings } from '@/lib/settings-context';
import { SectionCard, ImageUploader, SortableList, ToggleSwitch } from './cms-components';
import { Plus, Trash2 } from 'lucide-react';

export function NavigationEditor() {
  const { settings, updateSettings } = useSiteSettings();

  const updateNavLink = (index: number, updates: Partial<typeof settings.navLinks[0]>) => {
    const copy = [...settings.navLinks];
    copy[index] = { ...copy[index], ...updates };
    updateSettings({ navLinks: copy });
  };

  const addNavLink = () => {
    updateSettings({
      navLinks: [...settings.navLinks, { label: 'New Link', href: '/', visible: true }],
    });
  };

  const removeNavLink = (index: number) => {
    const copy = [...settings.navLinks];
    copy.splice(index, 1);
    updateSettings({ navLinks: copy });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionCard title="Site Logo">
        <ImageUploader
          label="Logo Image"
          value={settings.logo}
          onChange={v => updateSettings({ logo: v })}
        />
      </SectionCard>

      <SectionCard title="Navigation Links">
        <SortableList
          items={settings.navLinks.map((l, i) => ({ ...l, id: `${i}-${l.label}` }))}
          onReorder={items => updateSettings({ navLinks: items.map(({ id, ...rest }) => rest) })}
          renderItem={(item, i) => (
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={item.label}
                  onChange={e => updateNavLink(i, { label: e.target.value })}
                  placeholder="Label"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <input
                  type="text"
                  value={item.href}
                  onChange={e => updateNavLink(i, { href: e.target.value })}
                  placeholder="URL"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <div className="flex items-center gap-3">
                  <ToggleSwitch
                    checked={item.visible}
                    onChange={v => updateNavLink(i, { visible: v })}
                    label="Visible"
                  />
                </div>
              </div>
              <button
                onClick={() => removeNavLink(i)}
                className="p-1.5 hover:bg-red-50 text-[#E85D4E] rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
        <button
          onClick={addNavLink}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Nav Link
        </button>
      </SectionCard>
    </div>
  );
}
