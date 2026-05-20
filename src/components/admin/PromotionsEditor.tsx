import { useState } from 'react';
import { useSiteSettings } from '@/lib/settings-context';
import { SectionCard, GradientPicker, IconPicker, SortableList, ToggleSwitch } from './cms-components';
import { Plus, Trash2 } from 'lucide-react';

function usePromotionsEditor() {
  const { settings, updateSettings } = useSiteSettings();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePromotion = (promo: typeof settings.promotions[0], index: number) => {
    const next: Record<string, string> = {};
    if (!promo.title.trim()) next[`title-${index}`] = 'Title is required';
    if (!promo.link.trim()) next[`link-${index}`] = 'Link is required';
    if (!promo.cta.trim()) next[`cta-${index}`] = 'CTA text is required';
    setErrors(prev => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const updatePromotion = (index: number, updates: Partial<typeof settings.promotions[0]>) => {
    const copy = [...settings.promotions];
    copy[index] = { ...copy[index], ...updates };
    const errKey = Object.keys(updates)[0];
    if (errKey) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[`${errKey}-${index}`];
        return n;
      });
    }
    updateSettings({ promotions: copy });
  };

  const addPromotion = () => {
    if (settings.promotions.length > 0) {
      const last = settings.promotions[settings.promotions.length - 1];
      if (!validatePromotion(last, settings.promotions.length - 1)) return;
    }
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
    setErrors({});
  };

  const removePromotion = (index: number) => {
    const copy = [...settings.promotions];
    copy.splice(index, 1);
    updateSettings({ promotions: copy });
  };

  return { settings, updateSettings, updatePromotion, addPromotion, removePromotion, errors };
}

export function PromotionsEditor() {
  const { settings, updateSettings, updatePromotion, addPromotion, removePromotion, errors } = usePromotionsEditor();

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
                <div>
                  <input
                    type="text"
                    value={promo.title}
                    onChange={e => updatePromotion(i, { title: e.target.value })}
                    placeholder="Title"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`title-${i}`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`title-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`title-${i}`]}</p>}
                </div>
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
                <div>
                  <input
                    type="text"
                    value={promo.link}
                    onChange={e => updatePromotion(i, { link: e.target.value })}
                    placeholder="Link"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`link-${i}`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`link-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`link-${i}`]}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    value={promo.cta}
                    onChange={e => updatePromotion(i, { cta: e.target.value })}
                    placeholder="CTA Text"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`cta-${i}`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`cta-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`cta-${i}`]}</p>}
                </div>
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
  const { settings, updateSettings, updatePromotion, addPromotion, removePromotion, errors } = usePromotionsEditor();

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
              <div>
                <input
                  type="text"
                  value={promo.title}
                  onChange={e => updatePromotion(i, { title: e.target.value })}
                  placeholder="Title"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`title-${i}`] ? 'border-red-500' : ''}`}
                />
                {errors[`title-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`title-${i}`]}</p>}
              </div>
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
              <div>
                <input
                  type="text"
                  value={promo.link}
                  onChange={e => updatePromotion(i, { link: e.target.value })}
                  placeholder="Link"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`link-${i}`] ? 'border-red-500' : ''}`}
                />
                {errors[`link-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`link-${i}`]}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={promo.cta}
                  onChange={e => updatePromotion(i, { cta: e.target.value })}
                  placeholder="CTA Text"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`cta-${i}`] ? 'border-red-500' : ''}`}
                />
                {errors[`cta-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`cta-${i}`]}</p>}
              </div>
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
