---
name: admin-content-section
description: Reference for the GoWild admin panel Content section covering Homepage, Categories, About Page, and Navigation editors. Use when working on CMS-style content editing, homepage sections, category management, about page content, or site navigation configuration.
---

# Admin Content Section

The Content section manages all customer-facing content on the site. All four tabs are rendered as imported editor components in `src/pages/AdminPage.tsx`.

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/AdminPage.tsx` | Host page; renders Content editors via `activeTab` |
| `src/components/admin/ContentEditor.tsx` | Homepage content editor |
| `src/components/admin/CategoriesEditor.tsx` | Category management |
| `src/components/admin/AboutEditor.tsx` | About page content editor |
| `src/components/admin/NavigationEditor.tsx` | Site logo and nav links editor |
| `src/lib/settings-context.tsx` | Defines all content data types and defaults |
| `src/components/admin/cms-components.tsx` | Shared CMS components: `SectionCard`, `ImageUploader`, `IconPicker`, `SortableList`, `ToggleSwitch`, `ProductSelector`, `ReviewSelector` |

## Data Source

All content data lives in `SiteSettings` (via `useSiteSettings()` from `src/lib/settings-context.tsx`) and persists to `localStorage` under key `gowild_site_settings`.

## Homepage Tab (`activeTab === 'homepage'`)

**Component**: `ContentEditor`

Edits all homepage sections. Each section is wrapped in `SectionCard` or `SectionTitleEditor`.

| Section | Editable Fields |
|---------|-----------------|
| **Hero Section** | Title, subtitle, tagline, CTA primary, CTA secondary, hero image (via `ImageUploader`) |
| **Categories Section** | Section title/subtitle, plus full category list editor (reuses `CategoriesListEditor`) |
| **Best Sellers Section** | Section title/subtitle, product selection via `ProductSelector` |
| **Recommended Section** | Section title/subtitle, product selection (shown to non-logged-in users) |
| **New Arrivals Section** | Section title/subtitle, product selection |
| **Promotions & Deals** | Section title/subtitle, plus button to navigate to Promotions tab |
| **Bundle & Save Banner** | Title, subtitle, CTA button text. Note: detailed bundle texts are edited in Marketing → Bundle Texts |
| **Reviews Section** | Section title/subtitle, featured review selection via `ReviewSelector` (up to 4) |
| **Brand Promise Section** | Section title/subtitle, 4 brand promises (icon + title + description each) |
| **Join the Wild Club** (Newsletter) | Title, subtitle, CTA button, placeholder text |
| **Social Links** | Instagram, Facebook, Twitter, YouTube, TikTok URLs |

## Categories Tab (`activeTab === 'categories'`)

**Component**: `CategoriesEditor`

- Manages category listings displayed on the homepage
- Each category has: `id`, `name`, `image`, `description`, `productCount`, `visible`
- **Features**:
  - Sortable list (drag to reorder)
  - Add category (with default empty values)
  - Remove category
  - Edit inline: name, description, image (via `ImageUploader`), product count
  - Visibility toggle
- **Default categories**: Pins, Stickers, Neck Warmers, Picnic Mats, Accessories, Hats
- **Also exported**: `CategoriesListEditor` — same UI without wrapping card, embedded inside `ContentEditor`

## About Page Tab (`activeTab === 'about'`)

**Component**: `AboutEditor`

Edits all sections of the `/about` page.

| Section | Editable Fields |
|---------|-----------------|
| **Hero Section** | Tagline, title, subtitle, hero image |
| **Mission** | Title, text |
| **Values** | Sortable list of values (icon + title + text). Default: Nature First, Explore Freely, Made with Care, Sustainable Mindset |
| **Stats** | 4 stat pairs (value + label). Default: 20+ designs, 12K+ packs, 50K+ adventurers, 30+ countries |
| **Brand Story** | Title, story image, paragraphs (add/remove), story features (icon + label) |
| **Community CTA** | Title, subtitle |

## Navigation Tab (`activeTab === 'navigation'`)

**Component**: `NavigationEditor`

- **Site Logo**: Upload/replace logo image via `ImageUploader`
- **Navigation Links**: Sortable list of links
  - Each link: `label`, `href`, `visible`
  - Add new link
  - Remove link
  - Edit label and URL inline
  - Visibility toggle
- **Default links**: Shop (`/products`), Deals (`/deals`), About (`/about`)

## Shared CMS Components

From `src/components/admin/cms-components.tsx`:

| Component | Purpose |
|-----------|---------|
| `SectionCard` | White rounded card with title prop — wraps every editor section |
| `ImageUploader` | Image upload with preview, supports URL input |
| `IconPicker` | Dropdown to select lucide-react icons by name |
| `GradientPicker` | Dropdown to select tailwind gradient classes |
| `SortableList` | Drag-and-drop reorderable list with render prop |
| `ToggleSwitch` | Styled on/off toggle switch |
| `ProductSelector` | Multi-select product picker with search |
| `ReviewSelector` | Multi-select review picker (approved reviews only) |

## SiteSettings Content-Related Types

```ts
interface NavLink { label: string; href: string; visible: boolean; }
interface CategoryConfig { id: string; name: string; image: string; description: string; productCount: number; visible: boolean; }
interface SectionTitle { title: string; subtitle: string; }
interface BrandPromise { icon: string; title: string; description: string; }
interface AboutValue { icon: string; title: string; text: string; }
interface AboutStat { label: string; value: string; }
```
