# GoWild Outdoor Store — Agent Guide

## Project Overview

This is **GoWild Outdoor Store**, a single-page e-commerce frontend for outdoor accessories. It sells enamel pins, waterproof sticker packs, fleece neck warmers, picnic mats, and camping accessories. The app is entirely client-side — there is no backend server. Product data, authentication, cart, wishlist, orders, and reviews are all simulated in-memory and persisted to `localStorage`.

The project was bootstrapped with the **React + TypeScript + Vite** template and heavily augmented with **shadcn/ui** components.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 (StrictMode enabled) |
| Language | TypeScript 5.9 (strict mode) |
| Build Tool | Vite 7.2.4 |
| Router | react-router-dom v7 |
| Styling | Tailwind CSS 3.4.19 |
| UI Components | shadcn/ui (New York style, 40+ Radix-based components) |
| Animation | framer-motion |
| Forms | react-hook-form + zod |
| Notifications | sonner |
| Icons | lucide-react |
| Charts | recharts |
| Carousel | embla-carousel-react |
| Email (client) | @emailjs/browser |
| Theme | next-themes (CSS variable based) |
| Dev Plugin | kimi-plugin-inspect-react |

## Project Structure

```
src/
  components/ui/     # shadcn/ui components (accordion, button, card, dialog, sheet, sonner, etc.)
  hooks/             # Custom React hooks (e.g. use-mobile.ts)
  lib/               # Utility functions (cn.ts — clsx + tailwind-merge)
  pages/             # Route-level page components (17 pages)
  sections/          # Layout sections shared across pages (Navbar, Footer)
  auth.tsx           # AuthContext — login/register/logout, demo user, guest checkout
  store.tsx          # StoreContext — products, cart, wishlist, orders, reviews, bundle pricing
  App.tsx            # Root component with routes and layout wrappers
  main.tsx           # Entry point — renders App inside BrowserRouter + StrictMode
  index.css          # Global styles, Tailwind directives, CSS variables, font imports
  App.css            # Additional app-specific styles (currently minimal)
public/              # Static assets — product images, hero image, logos, category images
index.html           # HTML entry point
tailwind.config.js   # Tailwind theme extended with shadcn color tokens and keyframes
vite.config.ts       # Vite config with path alias @/ → ./src/
components.json      # shadcn/ui configuration
```

### Key Files

- **`src/store.tsx`** — The heart of the app. Defines all product data (`PIN_PRODUCTS`, `STICKER_PRODUCTS`, `NECK_WARMER_PRODUCTS`, `PICNIC_MAT_PRODUCT`, `ACCESSORY_PRODUCTS`), cart logic, wishlist logic, auto bundle pricing (3 pins for $10), and review management. All mutable state is synced to `localStorage`.
- **`src/auth.tsx`** — Authentication context. Uses a hardcoded demo user (`alex@gowild.com`) and localStorage for session persistence. Supports guest checkout via `GuestInfo`.
- **`src/App.tsx`** — Defines all routes and wraps the app in `AuthProvider`, `StoreProvider`, and a `Layout` component that conditionally hides Navbar/Footer on `/admin`.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Type-check and build for production
npm run build

# Preview production build
npm run preview

# Lint with ESLint
npm run lint
```

The Vite dev server is configured to run on **port 3000** and uses `base: './'` for relative asset paths.

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled (`strict: true`)
- `noUnusedLocals: true` and `noUnusedParameters: true` — unused variables will fail the build
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- Target: ES2022, JSX: `react-jsx`

### Import Conventions
- Use the `@/` path alias for all internal imports:
  ```ts
  import { Button } from '@/components/ui/button';
  import { useStore } from '@/store';
  import { cn } from '@/lib/utils';
  ```
- Use `import type` when importing only types.

### Styling Conventions
- **Tailwind CSS** is used for all styling. Avoid custom CSS when possible.
- Use the `cn()` utility (`src/lib/utils.ts`) to conditionally merge Tailwind classes:
  ```ts
  className={cn('base-class', condition && 'conditional-class', className)}
  ```
- The design uses specific brand colors:
  - Primary teal: `#1A5A6B` (also `hsl(var(--primary))`)
  - Accent orange: `#E8552A` / `#E85D4E`
  - Background cream: `#F5F0E8`
  - Light mint background: `#F0F7F5`
  - Dark text: `#1A1A1A`
  - Muted text: `#6B7280`
- Fonts: **Inter** for body text, **Montserrat** for headings (`font-heading`).
- shadcn/ui components use CSS variables defined in `src/index.css` under `:root`.

### Component Patterns
- shadcn/ui components are in `src/components/ui/` and follow the standard shadcn pattern using `cva` (class-variance-authority) for variants.
- Page components are exported as named exports from `src/pages/`.
- Section components (Navbar, Footer) are in `src/sections/`.
- Hooks are in `src/hooks/`.

### State Management
- Global state is handled via React Context in two providers:
  - `AuthProvider` — user session, login, register, logout, guest info
  - `StoreProvider` — cart, wishlist, orders, reviews
- Access context via custom hooks: `useAuth()` and `useStore()`
- Do not add prop drilling for global state — use the contexts.

## Testing

**There are currently no automated tests in this project.** No test runner (Jest, Vitest, Playwright, etc.) is installed, and no `*.test.*` or `*.spec.*` files exist.

If you add tests, the project uses Vite — **Vitest** is the recommended choice for unit/integration tests, and **Playwright** is recommended for E2E testing given the React + Vite stack.

## Deployment

The app builds to a static site via `npm run build`. Output goes to the `dist/` directory (standard Vite behavior). The `base: './'` setting means it can be served from any subdirectory without path issues.

Suggested deployment targets:
- Vercel / Netlify / Cloudflare Pages
- Any static file host (AWS S3, GitHub Pages, etc.)

No server-side rendering (SSR) or API routes are configured.

## Security Considerations

- **No real authentication backend** — The `auth.tsx` login/register logic is purely client-side simulation. Any email with `@` and password of 4+ characters will "succeed." Do not use this for production user data.
- **No payment processing** — Checkout is simulated. No PCI-sensitive data is handled.
- **localStorage for persistence** — Cart, wishlist, reviews, and user sessions are stored in `localStorage`. Data is not encrypted and is vulnerable to XSS if untrusted content is rendered unsafely.
- **No API keys** in the repository except `@emailjs/browser` (used client-side for contact forms).
- Input validation on forms uses **Zod** schemas via `react-hook-form` resolvers.

## Notable Business Logic

- **Pin Bundle Pricing**: Pins are priced at $4.99 individually, but the cart automatically applies a "3 for $10" bundle discount. See `calculateBundlePrice()` in `store.tsx`.
- **Product Categories**: Pins, Stickers, Neck Warmers, Picnic Mats, Accessories.
- **Color Variants**: Some products (picnic mat, camp lamp) have color-specific image sets mapped in `colorImages`.
- **Guest Checkout**: Users can checkout as guests. Guest info is stored in AuthContext and cleared on login.
- **Wishlist Merge**: On login, the local wishlist is merged with the server-side wishlist (hardcoded in `DEMO_USER`).
- **Search History**: Navbar search persists recent queries to `localStorage` (`gowild_search_history`).

## Adding New shadcn/ui Components

If you need to add more shadcn/ui components, use the shadcn CLI (if available globally) or manually create them following the existing patterns in `src/components/ui/`. The project uses:
- Style: `new-york`
- Base color: `slate`
- CSS variables enabled
- Icon library: `lucide`

## Environment Requirements

- **Node.js 20+** (confirmed working setup)
- npm (comes with Node.js)

## Common Pitfalls

1. **Unused imports/variables will break the build** due to `noUnusedLocals` and `noUnusedParameters` in `tsconfig.app.json`.
2. **Image paths** in the `public/` folder should be referenced with absolute paths from the root (e.g., `/hero.jpg`, `/logo.png`).
3. **Admin route** (`/admin`) hides the Navbar and Footer automatically in `App.tsx`.
4. The `store.tsx` file is large — it contains all product data and business logic. Keep new product data additions in the same file to maintain consistency.
