import { useState } from 'react';
import { useSiteSettings } from '@/lib/settings-context';
import { SectionCard, ToggleSwitch, SortableList, ProductSelector } from './cms-components';
import { Plus, Trash2 } from 'lucide-react';

export function PromoCodesEditor() {
  const { settings, updateSettings } = useSiteSettings();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCode = (code: typeof settings.promoCodes[0], index: number) => {
    const next: Record<string, string> = {};
    if (!code.code.trim()) next[`code-${index}`] = 'Code is required';
    if (code.value <= 0) next[`value-${index}`] = 'Value must be greater than 0';
    if (code.usedCount < 0) next[`used-${index}`] = 'Used count cannot be negative';
    setErrors(prev => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const updateCode = (index: number, updates: Partial<typeof settings.promoCodes[0]>) => {
    const copy = [...settings.promoCodes];
    copy[index] = { ...copy[index], ...updates };
    // Clear errors for this field on change
    const errKey = Object.keys(updates)[0];
    if (errKey) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[`${errKey}-${index}`];
        return n;
      });
    }
    updateSettings({ promoCodes: copy });
  };

  const addCode = () => {
    const newCode = { id: `pc-${Date.now()}`, code: 'NEWCODE', type: 'percent' as const, value: 10, minOrder: 0, active: true, usedCount: 0 };
    if (settings.promoCodes.length > 0) {
      const last = settings.promoCodes[settings.promoCodes.length - 1];
      if (!validateCode(last, settings.promoCodes.length - 1)) return;
    }
    updateSettings({
      promoCodes: [...settings.promoCodes, newCode],
    });
    setErrors({});
  };

  const removeCode = (index: number) => {
    const copy = [...settings.promoCodes];
    copy.splice(index, 1);
    updateSettings({ promoCodes: copy });
  };

  const isExpired = (code: typeof settings.promoCodes[0]) => {
    if (!code.expiresAt) return false;
    return new Date(code.expiresAt) < new Date();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionCard title="Promo Codes">
        <SortableList
          items={settings.promoCodes}
          onReorder={items => updateSettings({ promoCodes: items })}
          renderItem={(code, i) => {
            const expired = isExpired(code);
            return (
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-[#1A5A6B]/10 text-[#1A5A6B] text-xs font-mono font-bold rounded">{code.code}</span>
                    {expired && <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">Expired</span>}
                    {code.usageLimit !== undefined && code.usageLimit > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${code.usedCount >= code.usageLimit ? 'text-red-600 bg-red-50' : 'text-amber-700 bg-amber-50'}`}>
                        Used {code.usedCount}/{code.usageLimit}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <input
                        type="text"
                        value={code.code}
                        onChange={e => updateCode(i, { code: e.target.value.toUpperCase() })}
                        placeholder="CODE"
                        className={`w-full px-3 py-2 border rounded-lg text-sm font-mono font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`code-${i}`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`code-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`code-${i}`]}</p>}
                    </div>
                    <select
                      value={code.type}
                      onChange={e => updateCode(i, { type: e.target.value as 'percent' | 'fixed' })}
                      className="px-3 py-2 border rounded-lg text-sm focus:outline-none"
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="fixed">Fixed ($)</option>
                    </select>
                    <div>
                      <input
                        type="number"
                        value={code.value}
                        onChange={e => updateCode(i, { value: parseFloat(e.target.value) || 0 })}
                        placeholder="Value"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`value-${i}`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`value-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`value-${i}`]}</p>}
                    </div>
                    <input
                      type="number"
                      value={code.minOrder || 0}
                      onChange={e => updateCode(i, { minOrder: parseFloat(e.target.value) || 0 })}
                      placeholder="Min Order $"
                      className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                    />
                    <input
                      type="date"
                      value={code.expiresAt || ''}
                      onChange={e => updateCode(i, { expiresAt: e.target.value || undefined })}
                      className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                    />
                    <input
                      type="number"
                      value={code.usageLimit ?? ''}
                      onChange={e => {
                        const val = e.target.value;
                        updateCode(i, { usageLimit: val === '' ? undefined : parseInt(val) || 0 });
                      }}
                      placeholder="Usage Limit (optional)"
                      className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                    />
                    <div>
                      <input
                        type="number"
                        value={code.usedCount}
                        onChange={e => updateCode(i, { usedCount: parseInt(e.target.value) || 0 })}
                        placeholder="Used Count"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 ${errors[`used-${i}`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`used-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`used-${i}`]}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch checked={code.active} onChange={v => updateCode(i, { active: v })} />
                      <span className="text-xs text-gray-500">{code.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <label className="text-xs text-gray-500 block mb-1">Apply to Specific Products (optional — leave empty for all products)</label>
                    <ProductSelector
                      selected={code.productIds || []}
                      onChange={ids => updateCode(i, { productIds: ids.length > 0 ? ids : undefined })}
                    />
                  </div>
                </div>
                <button onClick={() => removeCode(i)} className="p-1.5 hover:bg-red-50 text-[#E85D4E] rounded mt-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          }}
        />
        <button
          onClick={addCode}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Promo Code
        </button>
      </SectionCard>
    </div>
  );
}
