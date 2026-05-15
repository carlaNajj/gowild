import { useSiteSettings } from '@/lib/settings-context';
import { SectionCard, ToggleSwitch } from './cms-components';

function TextField({ label, value, onChange, type = 'text', textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean }) {
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: 'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30',
  };
  return (
    <div>
      <label className="text-sm font-medium text-[#1A1A1A] block mb-1">{label}</label>
      {textarea ? <textarea {...props} rows={3} /> : <input {...props} type={type} />}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#1A1A1A] block mb-1">{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
      />
    </div>
  );
}

export function SettingsEditor() {
  const { settings, updateSettings, resetSettings } = useSiteSettings();

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionCard title="Store Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Store Name" value={settings.storeName} onChange={v => updateSettings({ storeName: v })} />
          <TextField label="Contact Email" value={settings.contactEmail} onChange={v => updateSettings({ contactEmail: v })} />
          <div>
            <label className="text-sm font-medium text-[#1A1A1A] block mb-1">Currency</label>
            <select
              value={settings.currency}
              onChange={e => {
                const currency = e.target.value as 'USD' | 'EUR' | 'GBP';
                const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
                updateSettings({ currency, currencySymbol: symbol });
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <TextField label="Currency Symbol" value={settings.currencySymbol} onChange={v => updateSettings({ currencySymbol: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Shipping">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField label="Free Shipping Threshold ($)" value={settings.freeShippingThreshold} onChange={v => updateSettings({ freeShippingThreshold: v })} />
          <NumberField label="Standard Shipping Rate ($)" value={settings.standardShippingRate} onChange={v => updateSettings({ standardShippingRate: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Banner">
        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.bannerEnabled}
            onChange={v => updateSettings({ bannerEnabled: v })}
            label="Show Banner"
          />
          <TextField label="Banner Text" value={settings.bannerText} onChange={v => updateSettings({ bannerText: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Payment Methods">
        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.paymentMethods.cod}
            onChange={v => updateSettings({ paymentMethods: { ...settings.paymentMethods, cod: v } })}
            label="Cash on Delivery (COD)"
          />
          <ToggleSwitch
            checked={settings.paymentMethods.card}
            onChange={v => updateSettings({ paymentMethods: { ...settings.paymentMethods, card: v } })}
            label="Credit / Debit Card"
          />
        </div>
      </SectionCard>

      <SectionCard title="Footer">
        <div className="space-y-4">
          <TextField label="Footer Tagline" value={settings.footerTagline} onChange={v => updateSettings({ footerTagline: v })} textarea />
          <TextField label="Contact Phone" value={settings.contactPhone} onChange={v => updateSettings({ contactPhone: v })} />
          <TextField label="Contact Address" value={settings.contactAddress} onChange={v => updateSettings({ contactAddress: v })} />
        </div>
      </SectionCard>

      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={resetSettings}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Reset All Settings to Default
        </button>
      </div>
    </div>
  );
}
