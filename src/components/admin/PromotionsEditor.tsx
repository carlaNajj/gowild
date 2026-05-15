import { useSiteSettings } from '@/lib/settings-context';
import { SectionCard, GradientPicker, IconPicker, SortableList, ToggleSwitch } from './cms-components';
import { Plus, Trash2 } from 'lucide-react';

function usePromotionsEditor() {
  const { settings, updateSettings } = useSiteSettings();

  const updatePromotion = (index: number, updates: Partial<typeof settings.promotions[0]>) => {
    const copy = [...settings.promotions];
    copy[index] = { ...copy[index], ...updates };
    updateSettings({ promotions: copy });
  };

  const addPromotion = () => {
    updateSettings({
      promotions: [
        ...settings.promotions,
        {
          id: `promo-${Date.now()}`,
          title: 'New Promotion',
          subtitle: '',
          badge: 'Deal',
          savings: '',
          gradient: 'from-[#1A5A6B] to-[#1A8DA3]',
          icon: 'Tag',
          link: '/products',
          cta: 'Shop Now',
          visible: true,
        },
      ],
    });
  };

  const removePromotion = (index: number) => {
    const copy = [...settings.promotions];
    copy.splice(index, 1);
    updateSettings({ promotions: copy });
  };

  return { settings, updateSettings, updatePromotion, addPromotion, removePromotion };
}

export function PromotionsEditor() {
  const { settings, updateSettings, updatePromotion, addPromotion, removePromotion } = usePromotionsEditor();

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionCard title="Promotions & Deals">
        <SortableList
          items={settings.promotions}
          onReorder={items => updateSettings({ promotions: items })}
          renderItem={(promo, i) => (
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{promo.title || 'Untitled'}</span>
                <button onClick={() => removePromotion(i)} className="p-1.5 hover:bg-red-50 text-[#E85D4E] rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={promo.title}
                  onChange={e => updatePromotion(i, { title: e.target.value })}
                  placeholder="Title"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <input
                  type="text"
                  value={promo.subtitle}
                  onChange={e => updatePromotion(i, { subtitle: e.target.value })}
                  placeholder="Subtitle"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <input
                  type="text"
                  value={promo.badge}
                  onChange={e => updatePromotion(i, { badge: e.target.value })}
                  placeholder="Badge"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <input
                  type="text"
                  value={promo.savings}
                  onChange={e => updatePromotion(i, { savings: e.target.value })}
                  placeholder="Savings text"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <input
                  type="text"
                  value={promo.link}
                  onChange={e => updatePromotion(i, { link: e.target.value })}
                  placeholder="Link"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <input
                  type="text"
                  value={promo.cta}
                  onChange={e => updatePromotion(i, { cta: e.target.value })}
                  placeholder="CTA Text"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Icon</label>
                  <IconPicker value={promo.icon} onChange={icon => updatePromotion(i, { icon })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Gradient</label>
                  <GradientPicker value={promo.gradient} onChange={g => updatePromotion(i, { gradient: g })} />
                </div>
              </div>
              <ToggleSwitch checked={promo.visible} onChange={v => updatePromotion(i, { visible: v })} label="Visible" />
            </div>
          )}
        />
        <button
          onClick={addPromotion}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Promotion
        </button>
      </SectionCard>
    </div>
  );
}

export function PromotionsListEditor() {
  const { settings, updateSettings, updatePromotion, addPromotion, removePromotion } = usePromotionsEditor();

  return (
    <>
      <SortableList
        items={settings.promotions}
        onReorder={items => updateSettings({ promotions: items })}
        renderItem={(promo, i) => (
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{promo.title || 'Untitled'}</span>
              <button onClick={() => removePromotion(i)} className="p-1.5 hover:bg-red-50 text-[#E85D4E] rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={promo.title}
                onChange={e => updatePromotion(i, { title: e.target.value })}
                placeholder="Title"
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
              <input
                type="text"
                value={promo.subtitle}
                onChange={e => updatePromotion(i, { subtitle: e.target.value })}
                placeholder="Subtitle"
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
              <input
                type="text"
                value={promo.badge}
                onChange={e => updatePromotion(i, { badge: e.target.value })}
                placeholder="Badge"
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
              <input
                type="text"
                value={promo.savings}
                onChange={e => updatePromotion(i, { savings: e.target.value })}
                placeholder="Savings text"
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
              <input
                type="text"
                value={promo.link}
                onChange={e => updatePromotion(i, { link: e.target.value })}
                placeholder="Link"
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
              <input
                type="text"
                value={promo.cta}
                onChange={e => updatePromotion(i, { cta: e.target.value })}
                placeholder="CTA Text"
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Icon</label>
                <IconPicker value={promo.icon} onChange={icon => updatePromotion(i, { icon })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Gradient</label>
                <GradientPicker value={promo.gradient} onChange={g => updatePromotion(i, { gradient: g })} />
              </div>
            </div>
            <ToggleSwitch checked={promo.visible} onChange={v => updatePromotion(i, { visible: v })} label="Visible" />
          </div>
        )}
      />
      <button
        onClick={addPromotion}
        className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Promotion
      </button>
    </>
  );
}
