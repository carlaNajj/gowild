---
name: admin-system-section
description: Reference for the GoWild admin panel System section covering Analytics and Settings. Use when working on admin analytics dashboards, store configuration, shipping settings, payment methods, or system-level admin preferences.
---

# Admin System Section

The System section contains Analytics dashboards and store-wide Settings configuration.

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/AdminPage.tsx` | Main admin page. Renders Analytics inline; hosts `SettingsEditor` component |
| `src/components/admin/SettingsEditor.tsx` | Store settings editor |
| `src/lib/settings-context.tsx` | Defines `SiteSettings` interface, defaults, `useSiteSettings()` hook |

## Data Source

Analytics data comes from `useStore()` → `orders`, `products`. Settings data comes from `useSiteSettings()` → `settings`, `updateSettings`, `resetSettings`.

## Analytics Tab (`activeTab === 'analytics'`)

Rendered inline in `src/pages/AdminPage.tsx`.

- **Revenue Trend**: AreaChart showing last 15 orders (date vs total)
  - Uses `recharts` `AreaChart`, `Area`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`
  - Stroke/fill color: `#1A5A6B`
- **Top Selling Products**: List of top 5 products by quantity sold
  - Computed from non-cancelled/non-refunded orders
  - Aggregates `order.items` by `product.id`
  - Shows rank, thumbnail, name, qty sold, revenue
  - Empty state: "No sales data yet."

## Settings Tab (`activeTab === 'settings'`)

**Component**: `SettingsEditor`

Edits store-wide configuration. All changes are persisted to `localStorage` via `updateSettings()`.

### Store Information

| Field | Type | Default |
|-------|------|---------|
| Store Name | string | "GoWild" |
| Contact Email | email | "hello@gowild.com" |
| Currency | select (USD/EUR/GBP) | USD |
| Currency Symbol | string | "$" |

Currency selection auto-updates the symbol (`$`, `€`, `£`).

### Shipping

| Field | Type | Default |
|-------|------|---------|
| Free Shipping Threshold | number | 50 |
| Standard Shipping Rate | number | 5.99 |

Both fields have min=0 validation.

### Banner

| Field | Type | Default |
|-------|------|---------|
| Show Banner | toggle | true |
| Banner Text | string | "Free shipping on orders over $50" |

The banner appears site-wide at the top of the page when enabled.

### Payment Methods

| Method | Default |
|--------|---------|
| Cash on Delivery (COD) | enabled |
| Credit / Debit Card | enabled |

Toggles control which payment options appear at checkout.

### Footer

| Field | Type | Default |
|-------|------|---------|
| Footer Tagline | textarea | "Pins, stickers, neck warmers & essentials..." |
| Contact Phone | string | "(555) 867-5309" |
| Contact Address | string | "123 Adventure Ave, Boulder, CO 80301" |

### Reset Button

- **Reset All Settings to Default** → calls `resetSettings()` which restores `DEFAULT_SETTINGS` from `src/lib/settings-context.tsx` and clears localStorage customizations

## SiteSettings Interface (Relevant Fields)

```ts
interface SiteSettings {
  storeName: string;
  contactEmail: string;
  currency: 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingRate: number;
  bannerText: string;
  bannerEnabled: boolean;
  footerTagline: string;
  contactPhone: string;
  contactAddress: string;
  paymentMethods: { cod: boolean; card: boolean; };
  // ... plus many content/marketing fields
}
```

## Notes

- Settings are stored in `localStorage` under key `gowild_site_settings`
- On first load, settings are deep-merged with `DEFAULT_SETTINGS` so new fields are backward-compatible
- `resetSettings` restores the entire object to factory defaults — this affects ALL settings including content, marketing, and system settings
