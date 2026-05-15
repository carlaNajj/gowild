import { useSiteSettings, type SectionTitle, type BrandPromise } from '@/lib/settings-context';
import { SectionCard, ImageUploader, IconPicker, ProductSelector, ReviewSelector } from './cms-components';
import { CategoriesListEditor } from './CategoriesEditor';
import { ArrowRight } from 'lucide-react';

function TextField({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: 'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30',
  };
  return (
    <div>
      <label className="text-sm font-medium text-[#1A1A1A] block mb-1">{label}</label>
      {textarea ? <textarea {...props} rows={3} /> : <input {...props} type="text" />}
    </div>
  );
}

function SectionTitleEditor({ title, value, onChange, children }: { title: string; value: SectionTitle; onChange: (v: SectionTitle) => void; children?: React.ReactNode }) {
  return (
    <SectionCard title={title}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Title" value={value.title} onChange={t => onChange({ ...value, title: t })} />
        <TextField label="Subtitle" value={value.subtitle} onChange={s => onChange({ ...value, subtitle: s })} />
      </div>
      {children && <div className="pt-4 border-t mt-4">{children}</div>}
    </SectionCard>
  );
}

export function ContentEditor({ onNavigateToPromotions }: { onNavigateToPromotions?: () => void }) {
  const { settings, updateSettings } = useSiteSettings();

  const updateSectionTitle = (key: keyof typeof settings.sectionTitles, val: SectionTitle) => {
    updateSettings({ sectionTitles: { ...settings.sectionTitles, [key]: val } });
  };

  const updateBrandPromise = (index: number, val: BrandPromise) => {
    const copy = [...settings.brandPromises];
    copy[index] = val;
    updateSettings({ brandPromises: copy });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitleEditor title="Hero Section" value={{ title: settings.heroTitle, subtitle: settings.heroSubtitle }} onChange={v => { updateSettings({ heroTitle: v.title, heroSubtitle: v.subtitle }); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Tagline" value={settings.heroTagline} onChange={v => updateSettings({ heroTagline: v })} />
          <TextField label="CTA Primary" value={settings.heroCtaPrimary} onChange={v => updateSettings({ heroCtaPrimary: v })} />
          <TextField label="CTA Secondary" value={settings.heroCtaSecondary} onChange={v => updateSettings({ heroCtaSecondary: v })} />
          <ImageUploader label="Hero Image" value={settings.heroImage} onChange={v => updateSettings({ heroImage: v })} />
        </div>
      </SectionTitleEditor>

      <SectionTitleEditor title="Categories Section" value={settings.sectionTitles.categories} onChange={v => updateSectionTitle('categories', v)}>
        <CategoriesListEditor />
      </SectionTitleEditor>

      <SectionTitleEditor title="Best Sellers Section" value={settings.sectionTitles.bestSellers} onChange={v => updateSectionTitle('bestSellers', v)}>
        <ProductSelector
          label="Select Products"
          selected={settings.bestSellerIds}
          onChange={ids => updateSettings({ bestSellerIds: ids })}
        />
      </SectionTitleEditor>

      <SectionTitleEditor title="Recommended Section" value={settings.sectionTitles.recommended} onChange={v => updateSectionTitle('recommended', v)}>
        <ProductSelector
          label="Select Products (shown when user is not logged in)"
          selected={settings.recommendedIds}
          onChange={ids => updateSettings({ recommendedIds: ids })}
        />
      </SectionTitleEditor>

      <SectionTitleEditor title="New Arrivals Section" value={settings.sectionTitles.newArrivals} onChange={v => updateSectionTitle('newArrivals', v)}>
        <ProductSelector
          label="Select Products"
          selected={settings.newArrivalIds}
          onChange={ids => updateSettings({ newArrivalIds: ids })}
        />
      </SectionTitleEditor>

      <SectionTitleEditor title="Promotions & Deals" value={settings.sectionTitles.promotions} onChange={v => updateSectionTitle('promotions', v)}>
        {onNavigateToPromotions && (
          <button
            onClick={onNavigateToPromotions}
            className="w-full py-2.5 px-4 bg-[#1A5A6B] text-white rounded-lg text-sm font-medium hover:bg-[#1A8DA3] transition-colors flex items-center justify-center gap-2"
          >
            check and edit promotions <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </SectionTitleEditor>

      <SectionCard title="Bundle & Save Banner">
        <div className="space-y-4">
          <TextField label="Title" value={settings.sectionTitles.bundleBanner.title} onChange={v => updateSettings({ sectionTitles: { ...settings.sectionTitles, bundleBanner: { ...settings.sectionTitles.bundleBanner, title: v } } })} />
          <TextField label="Subtitle" value={settings.sectionTitles.bundleBanner.subtitle} onChange={v => updateSettings({ sectionTitles: { ...settings.sectionTitles, bundleBanner: { ...settings.sectionTitles.bundleBanner, subtitle: v } } })} textarea />
          <TextField label="CTA Button" value={settings.sectionTitles.bundleBanner.cta} onChange={v => updateSettings({ sectionTitles: { ...settings.sectionTitles, bundleBanner: { ...settings.sectionTitles.bundleBanner, cta: v } } })} />
        </div>
        <div className="pt-4 border-t mt-4">
          <p className="text-xs text-[#6B7280]">
            To edit bundle promotion texts (cart banner, navbar label, deals page copy, etc.),
            go to the <strong>Bundle Texts</strong> tab in the sidebar.
          </p>
        </div>
      </SectionCard>

      <SectionTitleEditor title="Reviews Section" value={settings.sectionTitles.reviews} onChange={v => updateSectionTitle('reviews', v)}>
        <ReviewSelector
          label="Select up to 4 approved reviews to feature on the homepage"
          selected={settings.featuredReviewIds}
          onChange={ids => updateSettings({ featuredReviewIds: ids })}
        />
      </SectionTitleEditor>

      <SectionTitleEditor title="Brand Promise Section" value={settings.sectionTitles.brandPromise} onChange={v => updateSectionTitle('brandPromise', v)}>
        <div className="space-y-4">
          {settings.brandPromises.map((bp, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
              <IconPicker label="Icon" value={bp.icon} onChange={icon => updateBrandPromise(i, { ...bp, icon })} />
              <TextField label="Title" value={bp.title} onChange={v => updateBrandPromise(i, { ...bp, title: v })} />
              <TextField label="Description" value={bp.description} onChange={v => updateBrandPromise(i, { ...bp, description: v })} />
            </div>
          ))}
        </div>
      </SectionTitleEditor>

      <SectionCard title="Join the Wild Club">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Title" value={settings.newsletterTitle} onChange={v => updateSettings({ newsletterTitle: v })} />
          <TextField label="CTA Button" value={settings.newsletterCta} onChange={v => updateSettings({ newsletterCta: v })} />
          <TextField label="Subtitle" value={settings.newsletterSubtitle} onChange={v => updateSettings({ newsletterSubtitle: v })} textarea />
          <TextField label="Placeholder" value={settings.newsletterPlaceholder} onChange={v => updateSettings({ newsletterPlaceholder: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Social Links">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Instagram URL" value={settings.socialLinks.instagram} onChange={v => updateSettings({ socialLinks: { ...settings.socialLinks, instagram: v } })} />
          <TextField label="Facebook URL" value={settings.socialLinks.facebook} onChange={v => updateSettings({ socialLinks: { ...settings.socialLinks, facebook: v } })} />
          <TextField label="Twitter URL" value={settings.socialLinks.twitter} onChange={v => updateSettings({ socialLinks: { ...settings.socialLinks, twitter: v } })} />
          <TextField label="YouTube URL" value={settings.socialLinks.youtube} onChange={v => updateSettings({ socialLinks: { ...settings.socialLinks, youtube: v } })} />
        </div>
      </SectionCard>
    </div>
  );
}
