import { useSiteSettings } from '@/lib/settings-context';
import { SectionCard, ImageUploader, IconPicker, SortableList } from './cms-components';
import { Plus, Trash2 } from 'lucide-react';

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

export function AboutEditor() {
  const { settings, updateSettings } = useSiteSettings();

  const updateValue = (index: number, updates: Partial<typeof settings.aboutValues[0]>) => {
    const copy = [...settings.aboutValues];
    copy[index] = { ...copy[index], ...updates };
    updateSettings({ aboutValues: copy });
  };

  const updateStat = (index: number, updates: Partial<typeof settings.aboutStats[0]>) => {
    const copy = [...settings.aboutStats];
    copy[index] = { ...copy[index], ...updates };
    updateSettings({ aboutStats: copy });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionCard title="Hero Section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Tagline" value={settings.aboutHero.tagline} onChange={v => updateSettings({ aboutHero: { ...settings.aboutHero, tagline: v } })} error={!settings.aboutHero.tagline.trim() ? 'Tagline is required' : undefined} />
          <TextField label="Title" value={settings.aboutHero.title} onChange={v => updateSettings({ aboutHero: { ...settings.aboutHero, title: v } })} error={!settings.aboutHero.title.trim() ? 'Title is required' : undefined} />
          <TextField label="Subtitle" value={settings.aboutHero.subtitle} onChange={v => updateSettings({ aboutHero: { ...settings.aboutHero, subtitle: v } })} textarea error={!settings.aboutHero.subtitle.trim() ? 'Subtitle is required' : undefined} />
          <ImageUploader label="Hero Image" value={settings.aboutHero.image} onChange={v => updateSettings({ aboutHero: { ...settings.aboutHero, image: v } })} />
        </div>
      </SectionCard>

      <SectionCard title="Mission">
        <div className="space-y-3">
          <TextField label="Title" value={settings.aboutMission.title} onChange={v => updateSettings({ aboutMission: { ...settings.aboutMission, title: v } })} error={!settings.aboutMission.title.trim() ? 'Title is required' : undefined} />
          <TextField label="Text" value={settings.aboutMission.text} onChange={v => updateSettings({ aboutMission: { ...settings.aboutMission, text: v } })} textarea error={!settings.aboutMission.text.trim() ? 'Text is required' : undefined} />
        </div>
      </SectionCard>

      <SectionCard title="Values">
        <SortableList
          items={settings.aboutValues.map((v, i) => ({ ...v, id: `${i}-${v.title}` }))}
          onReorder={items => updateSettings({ aboutValues: items.map(({ id, ...rest }) => rest) })}
          renderItem={(val, i) => (
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <IconPicker value={val.icon} onChange={icon => updateValue(i, { icon })} />
                <input
                  type="text"
                  value={val.title}
                  onChange={e => updateValue(i, { title: e.target.value })}
                  placeholder="Title"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
                <input
                  type="text"
                  value={val.text}
                  onChange={e => updateValue(i, { text: e.target.value })}
                  placeholder="Description"
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                />
              </div>
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="Stats">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {settings.aboutStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                value={stat.value}
                onChange={e => updateStat(i, { value: e.target.value })}
                placeholder="Value"
                className="w-24 px-3 py-2 border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
              <input
                type="text"
                value={stat.label}
                onChange={e => updateStat(i, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Brand Story">
        <div className="space-y-3">
          <TextField label="Title" value={settings.aboutStory.title} onChange={v => updateSettings({ aboutStory: { ...settings.aboutStory, title: v } })} />
          <ImageUploader label="Story Image" value={settings.aboutStory.image} onChange={v => updateSettings({ aboutStory: { ...settings.aboutStory, image: v } })} />
          {settings.aboutStory.paragraphs.map((para, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                value={para}
                onChange={e => {
                  const copy = [...settings.aboutStory.paragraphs];
                  copy[i] = e.target.value;
                  updateSettings({ aboutStory: { ...settings.aboutStory, paragraphs: copy } });
                }}
                rows={3}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
              />
              <button
                onClick={() => {
                  const copy = [...settings.aboutStory.paragraphs];
                  copy.splice(i, 1);
                  updateSettings({ aboutStory: { ...settings.aboutStory, paragraphs: copy } });
                }}
                className="p-2 hover:bg-red-50 text-[#E85D4E] rounded h-fit"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => updateSettings({ aboutStory: { ...settings.aboutStory, paragraphs: [...settings.aboutStory.paragraphs, ''] } })}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Paragraph
          </button>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-[#1A1A1A] block mb-2">Story Features</label>
            <div className="space-y-3">
              {settings.aboutFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <IconPicker value={feat.icon} onChange={icon => {
                    const copy = [...settings.aboutFeatures];
                    copy[i] = { ...copy[i], icon };
                    updateSettings({ aboutFeatures: copy });
                  }} />
                  <input
                    type="text"
                    value={feat.label}
                    onChange={e => {
                      const copy = [...settings.aboutFeatures];
                      copy[i] = { ...copy[i], label: e.target.value };
                      updateSettings({ aboutFeatures: copy });
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                    placeholder="Feature label"
                  />
                  <button
                    onClick={() => {
                      const copy = [...settings.aboutFeatures];
                      copy.splice(i, 1);
                      updateSettings({ aboutFeatures: copy });
                    }}
                    className="p-2 hover:bg-red-50 text-[#E85D4E] rounded h-fit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateSettings({ aboutFeatures: [...settings.aboutFeatures, { icon: 'Award', label: '' }] })}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Feature
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Community CTA">
        <div className="space-y-3">
          <TextField label="Title" value={settings.aboutCta.title} onChange={v => updateSettings({ aboutCta: { ...settings.aboutCta, title: v } })} />
          <TextField label="Subtitle" value={settings.aboutCta.subtitle} onChange={v => updateSettings({ aboutCta: { ...settings.aboutCta, subtitle: v } })} textarea />
        </div>
      </SectionCard>
    </div>
  );
}
