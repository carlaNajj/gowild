---
name: admin-marketing-section
description: Reference for the GoWild admin panel Marketing section covering Promotions, Promo Codes, Bundle Texts, and Product Bundles. Use when working on marketing content, discount codes, bundle pricing copy, or product bundle configuration in the admin panel.
---

# Admin Marketing Section

The Marketing section manages promotional content, discount codes, and bundle offers. All four tabs are rendered as imported editor components in `src/pages/AdminPage.tsx`.

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/AdminPage.tsx` | Host page; renders Marketing editor components via `activeTab` |
| `src/components/admin/PromotionsEditor.tsx` | Promotional banners/deals editor |
| `src/components/admin/PromoCodesEditor.tsx` | Discount/coupon code editor |
| `src/components/admin/BundleTextsEditor.tsx` | Bundle promotion text manager |
| `src/components/admin/BundlesEditor.tsx` | Product bundle configuration |
| `src/lib/settings-context.tsx` | Defines all marketing data types and `useSiteSettings()` hook |

## Data Source

All marketing data lives in `SiteSettings` (via `useSiteSettings()` from `src/lib/settings-context.tsx`) and persists to `localStorage` under key `gowild_site_settings`.

## Promotions Tab (`activeTab === 'promotions'`)

**Component**: `PromotionsEditor`

- Manages promotional banners displayed on the homepage
- Each promotion has: `id`, `title`, `subtitle`, `badge`, `savings`, `gradient`, `icon`, `link`, `cta`, `visible`
- **Features**:
  - Sortable list (drag to reorder)
  - Add new promotion (validates last item before adding)
  - Remove promotion
  - Edit fields inline: title, subtitle, badge, savings text, link, CTA
  - `IconPicker` component for lucide icon selection
  - `GradientPicker` component for tailwind gradient selection
  - `ToggleSwitch` for visibility
- **Default promotions**: 3 items (Pin Bundle, Summer Picnic Sale, Free Shipping)
- **Also exported**: `PromotionsListEditor` — same UI without the wrapping `SectionCard`, used inside `ContentEditor`

## Promo Codes Tab (`activeTab === 'promoCodes'`)

**Component**: `PromoCodesEditor`

- Manages discount/coupon codes
- Each code has: `id`, `code`, `type` (`'percent' | 'fixed'`), `value`, `minOrder`, `active`, `expiresAt`, `usageLimit`, `usedCount`, `productIds?`
- **Features**:
  - Sortable list
  - Add new code (validates last item before adding)
  - Remove code
  - Edit inline: code (auto-uppercase), type dropdown, value, min order, expiry date, usage limit, used count
  - Active/inactive toggle
  - Expired badge shown when `expiresAt` is past
  - Usage counter badge (`Used X/Y`)
  - `ProductSelector` for restricting code to specific products (optional)
- **Default codes**: `WILD10` (10%), `GOWILD5` ($5 off), `PINBUDDY` ($2 off), `SUMMER20` (20%)

## Bundle Texts Tab (`activeTab === 'bundleTexts'`)

**Component**: `BundleTextsEditor`

- Manages all copy/text for the 3-for-$10 pin bundle promotion across the site
- Each item has: `id`, `key`, `label`, `value`, `description`, `page`, `pageLink`, `isSystem`
- **Features**:
  - List view showing key, label, value, description, page reference
  - System items marked with shield badge; cannot be deleted
  - Create custom bundle texts
  - Edit any item (including system items)
  - Delete custom items only
- **System keys** (used by website code):
  - `title` — Main headline on Deals/Pins Bundle pages
  - `subtitle` — Short description under title
  - `cta` — CTA button text
  - `savingsText` — Savings banner text
  - `cartBannerText` — Cart banner message (supports `{savings}` placeholder)
  - `navLabel` — Navbar mini-cart label

## Product Bundles Tab (`activeTab === 'bundles'`)

**Component**: `BundlesEditor`

- Creates bundle deals for specific products (separate from the automatic pin bundle logic)
- Each bundle has: `id`, `name`, `productIds`, `quantity`, `price`, `active`, `bannerText`, `cartBannerText`
- **Features**:
  - Create/edit bundles with form validation
  - Product picker dropdown (multi-select from active products)
  - Set quantity threshold and bundle price
  - Custom banner text for product page and cart
  - Activate/deactivate bundles
  - Delete bundles
  - Savings auto-calculated and displayed in list view
- **Cart banner text**: Supports `{savings}` placeholder for dynamic saved amount

## Shared Components (from `cms-components.tsx`)

| Component | Used By |
|-----------|---------|
| `SectionCard` | All editors — white card wrapper with title |
| `SortableList` | Promotions, PromoCodes — drag-to-reorder list |
| `ToggleSwitch` | Promotions, PromoCodes — on/off toggle |
| `IconPicker` | Promotions — lucide icon selection |
| `GradientPicker` | Promotions — tailwind gradient selection |
| `ProductSelector` | PromoCodes, ContentEditor — multi-product picker |
