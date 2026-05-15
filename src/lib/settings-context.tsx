import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Data Interfaces                                                    */
/* ------------------------------------------------------------------ */

export interface NavLink {
  label: string;
  href: string;
  visible: boolean;
}

export interface CategoryConfig {
  id: string;
  name: string;
  image: string;
  description: string;
  productCount: number;
  visible: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  savings: string;
  gradient: string;
  icon: string;
  link: string;
  cta: string;
  visible: boolean;
}

export interface BundleTextItem {
  id: string;
  key: string;
  label: string;
  value: string;
  description: string;
  page: string;
  pageLink: string;
  isSystem: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number;
  active: boolean;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  productIds?: string[];
}

export interface ProductBundle {
  id: string;
  name: string;
  productIds: string[];
  quantity: number;
  price: number;
  active: boolean;
  bannerText: string;
  cartBannerText: string;
}

export interface BrandPromise {
  icon: string;
  title: string;
  description: string;
}

export interface ReviewHighlight {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  productId: string;
  productName: string;
  date: string;
}

export interface SectionTitle {
  title: string;
  subtitle: string;
}

export interface AboutValue {
  icon: string;
  title: string;
  text: string;
}

export interface AboutStat {
  label: string;
  value: string;
}

export interface SiteSettings {
  /* ---- Store Info ---- */
  storeName: string;
  contactEmail: string;
  currency: 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;

  /* ---- Shipping ---- */
  freeShippingThreshold: number;
  standardShippingRate: number;

  /* ---- Hero ---- */
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroTagline: string;

  /* ---- Banner ---- */
  bannerText: string;
  bannerEnabled: boolean;

  /* ---- Footer ---- */
  footerTagline: string;
  contactPhone: string;
  contactAddress: string;

  /* ---- Logo ---- */
  logo: string;

  /* ---- Navigation ---- */
  navLinks: NavLink[];

  /* ---- Section Titles ---- */
  sectionTitles: {
    categories: SectionTitle;
    bestSellers: SectionTitle;
    recommended: SectionTitle;
    newArrivals: SectionTitle;
    promotions: SectionTitle;
    reviews: SectionTitle;
    bundleBanner: { title: string; subtitle: string; cta: string };
    brandPromise: SectionTitle;
  };

  /* ---- Bundle Texts ---- */
  bundleTexts: BundleTextItem[];

  /* ---- Product Bundles ---- */
  productBundles: ProductBundle[];

  /* ---- Categories ---- */
  categories: CategoryConfig[];

  /* ---- Product Lists ---- */
  bestSellerIds: string[];
  newArrivalIds: string[];
  recommendedIds: string[];
  featuredReviewIds: string[];

  /* ---- Promotions ---- */
  promotions: Promotion[];

  /* ---- Promo Codes ---- */
  promoCodes: PromoCode[];

  /* ---- Payment Methods ---- */
  paymentMethods: {
    cod: boolean;
    card: boolean;
  };

  /* ---- Brand Promises ---- */
  brandPromises: BrandPromise[];

  /* ---- Review Highlights ---- */
  reviewHighlights: ReviewHighlight[];

  /* ---- Social Links ---- */
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };

  /* ---- Newsletter ---- */
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterCta: string;
  newsletterPlaceholder: string;

  /* ---- About Page ---- */
  aboutHero: { title: string; subtitle: string; tagline: string; image: string };
  aboutMission: { title: string; text: string };
  aboutValues: AboutValue[];
  aboutStats: AboutStat[];
  aboutStory: { title: string; paragraphs: string[]; image: string };
  aboutCta: { title: string; subtitle: string };
}

/* ------------------------------------------------------------------ */
/*  Defaults (match current hardcoded content exactly)                */
/* ------------------------------------------------------------------ */

const SETTINGS_KEY = 'gowild_site_settings';

export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'GoWild',
  contactEmail: 'hello@gowild.com',
  currency: 'USD',
  currencySymbol: '$',

  freeShippingThreshold: 50,
  standardShippingRate: 5.99,

  heroTitle: 'Gear Up for Adventure',
  heroSubtitle: 'Pins, stickers, neck warmers & essentials for the modern adventurer. Small gear with big personality.',
  heroImage: '/hero.jpg',
  heroCtaPrimary: 'Shop Now',
  heroCtaSecondary: 'Explore Categories',
  heroTagline: 'Adventure Awaits',

  bannerText: 'Free shipping on orders over $50',
  bannerEnabled: true,

  footerTagline: 'Pins, stickers, neck warmers & essentials for the modern adventurer. Small gear with big personality.',
  contactPhone: '(555) 867-5309',
  contactAddress: '123 Adventure Ave, Boulder, CO 80301',

  logo: '/logo.png',

  navLinks: [
    { label: 'Shop', href: '/products', visible: true },
    { label: 'Deals', href: '/deals', visible: true },
    { label: 'About', href: '/about', visible: true },
  ],

  sectionTitles: {
    categories: { title: 'Shop by Category', subtitle: 'Find your perfect outdoor accessories' },
    bestSellers: { title: 'Best Sellers', subtitle: 'Our most popular adventure essentials' },
    recommended: { title: 'Recommended For You', subtitle: 'Based on your wishlist and interests' },
    newArrivals: { title: 'New Arrivals', subtitle: 'Fresh drops for your next adventure' },
    promotions: { title: 'Promotions & Deals', subtitle: 'Limited-time offers you don\'t want to miss' },
    reviews: { title: 'What Adventurers Say', subtitle: 'Real reviews from the GoWild community' },
    bundleBanner: { title: 'Pick Any 3 Pins for $10', subtitle: 'Mix and match from 20 unique enamel pin designs. The more you pick, the more you save. 6 pins = $20, 9 pins = $30.', cta: 'Build Your Bundle' },
    brandPromise: { title: 'Why GoWild?', subtitle: 'Small gear, big adventures, unmatched quality' },
  },

  bundleTexts: [
    { id: 'bt-1', key: 'title', label: 'Bundle Title', value: 'Pick Any 3 Pins for $10', description: 'Main headline shown on the Deals page and Pins Bundle page hero.', page: 'Deals & Pins Bundle', pageLink: '/deals', isSystem: true },
    { id: 'bt-2', key: 'subtitle', label: 'Bundle Subtitle', value: 'Mix & match from 20 enamel pin designs', description: 'Short description shown under the title on the Deals and Pins Bundle pages.', page: 'Deals & Pins Bundle', pageLink: '/deals', isSystem: true },
    { id: 'bt-3', key: 'cta', label: 'CTA Button Text', value: 'Build Your Bundle', description: 'Text on the call-to-action button that takes users to the bundle builder.', page: 'Deals Page', pageLink: '/deals', isSystem: true },
    { id: 'bt-4', key: 'savingsText', label: 'Savings Banner Text', value: 'Save up to 40% when you bundle', description: 'Text shown in the savings banner on the Deals page.', page: 'Deals Page', pageLink: '/deals', isSystem: true },
    { id: 'bt-5', key: 'cartBannerText', label: 'Cart Banner Text', value: 'You saved {savings} with pin bundle pricing! 3 pins for $10 deal applied.', description: 'Message shown in the cart when bundle pricing is applied. Use {savings} as a placeholder for the saved amount.', page: 'Cart Page', pageLink: '/cart', isSystem: true },
    { id: 'bt-6', key: 'navLabel', label: 'Navbar Cart Label', value: 'Bundle Savings (3 pins for $10)', description: 'Label shown in the navbar mini-cart dropdown next to the bundle savings amount.', page: 'Navbar Mini-Cart', pageLink: '/cart', isSystem: true },
  ],

  productBundles: [],

  categories: [
    { id: 'pins', name: 'Pins', image: '/cat-pins.jpg', description: 'Enamel pins for your gear', productCount: 20, visible: true },
    { id: 'stickers', name: 'Stickers', image: '/cat-stickers.jpg', description: '50-sticker waterproof packs', productCount: 5, visible: true },
    { id: 'neck-warmers', name: 'Neck Warmers', image: '/prod-neckwarmer.jpg', description: 'Fleece for cold adventures', productCount: 10, visible: true },
    { id: 'picnic-mats', name: 'Picnic Mats', image: '/mat-red.jpg', description: 'Waterproof, 3 colors', productCount: 1, visible: true },
    { id: 'accessories', name: 'Accessories', image: '/prod-lamp.jpg', description: 'Smart gear essentials', productCount: 2, visible: true },
    { id: 'hats', name: 'Hats', image: '/cat-hats.jpg', description: 'Coming soon', productCount: 0, visible: true },
  ],

  bestSellerIds: ['p1', 'p8', 's1', 's5', 'n1', 'n5', 'mat1', 'a2'],
  newArrivalIds: ['p5', 'p10', 's5', 'n6', 'a1', 'p18', 'n8', 'p12'],
  recommendedIds: ['p2', 'p4', 's3', 'n3'],
  featuredReviewIds: [],

  promotions: [
    {
      id: 'promo-1',
      title: 'Pick Any 3 Pins for $10',
      subtitle: 'Mix & match 20 unique designs',
      badge: 'Bundle',
      savings: 'Save up to 40% when you bundle',
      gradient: 'from-[#1A5A6B] to-[#1A8DA3]',
      icon: 'Percent',
      link: '/products',
      cta: 'Build Your Bundle',
      visible: true,
    },
    {
      id: 'promo-2',
      title: 'Summer Picnic Sale',
      subtitle: 'Waterproof picnic mat',
      badge: 'Sale',
      savings: 'Was $44.99 — Now $34.99',
      gradient: 'from-[#E8552A] to-[#C4451D]',
      icon: 'Tag',
      link: '/product/mat1',
      cta: 'Shop Now',
      visible: true,
    },
    {
      id: 'promo-3',
      title: 'Free Shipping $50+',
      subtitle: 'All orders ship free',
      badge: 'Shipping',
      savings: 'Lightweight gear ships in 5-7 days',
      gradient: 'from-[#52796F] to-[#3d5c54]',
      icon: 'Truck',
      link: '/products',
      cta: 'Start Shopping',
      visible: true,
    },
  ],

  promoCodes: [
    { id: 'pc-1', code: 'WILD10', type: 'percent', value: 10, minOrder: 0, active: true, usedCount: 0 },
    { id: 'pc-2', code: 'GOWILD5', type: 'fixed', value: 5, minOrder: 25, active: true, usedCount: 0 },
    { id: 'pc-3', code: 'PINBUDDY', type: 'fixed', value: 2, minOrder: 10, active: true, usedCount: 0 },
    { id: 'pc-4', code: 'SUMMER20', type: 'percent', value: 20, minOrder: 50, active: true, usedCount: 0 },
  ],

  paymentMethods: {
    cod: true,
    card: true,
  },

  socialLinks: {
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
  },

  newsletterTitle: 'Join the Wild Club',
  newsletterSubtitle: 'Get exclusive deals, new arrival alerts, and outdoor tips.',
  newsletterCta: 'Subscribe',
  newsletterPlaceholder: 'Enter your email',

  brandPromises: [
    { icon: 'Truck', title: 'Free Shipping', description: 'On orders over ${threshold}. Lightweight gear ships fast.' },
    { icon: 'Shield', title: 'Quality Guarantee', description: 'Every product inspected for premium quality.' },
    { icon: 'RefreshCw', title: 'Easy Returns', description: '30-day hassle-free returns on all items.' },
    { icon: 'Headphones', title: 'Expert Support', description: 'Our team is here to help, 24/7.' },
  ],

  reviewHighlights: [
    { id: 'r1', name: 'Sarah M.', avatar: '', rating: 5, text: 'Absolutely love this pin! The gold plating is gorgeous and the detail is incredible. Already got compliments on my backpack.', productId: 'p1', productName: 'Summit Seeker Pin', date: '2026-03-15' },
    { id: 'r6', name: 'Alex P.', avatar: '', rating: 5, text: '50 unique stickers and every single one is amazing quality. The waterproof vinyl held up through rain and sun on my water bottle.', productId: 's1', productName: 'Mountain Vibes Sticker Pack', date: '2026-04-05' },
    { id: 'r9', name: 'Tom R.', avatar: '', rating: 4, text: 'Kept me warm on a 5F hike. The fleece is soft and does not itch. Great for the price point.', productId: 'n1', productName: 'Alpine Frost Neck Warmer', date: '2026-03-25' },
    { id: 'r12', name: 'Jenny L.', avatar: '', rating: 5, text: 'Used this at the beach and it was perfect. The waterproof bottom kept us dry even on wet sand. Folds up so small!', productId: 'mat1', productName: 'GoWild Waterproof Picnic Mat', date: '2026-03-30' },
  ],

  aboutHero: {
    title: 'Born in the Mountains',
    subtitle: 'GoWild started with a simple idea: make outdoor gear that lets you express your love for adventure, without the heavy price tag.',
    tagline: 'Our Story',
    image: '/hero.jpg',
  },

  aboutMission: {
    title: 'Our Mission',
    text: 'We exist to help people connect with the outdoors. Whether it is a pin on your backpack that sparks a conversation, a neck warmer on a cold summit, or a sticker on your water bottle that reminds you to plan your next trip — GoWild gear is made to inspire adventure.',
  },

  aboutValues: [
    { icon: 'TreePine', title: 'Nature First', text: 'We believe the best experiences happen outdoors. Every product we design is inspired by the mountains, forests, and trails that shape our world.' },
    { icon: 'Compass', title: 'Explore Freely', text: 'Adventure should not break the bank. We keep our gear affordable so everyone can explore without limits — from weekend hikers to weekend warriors.' },
    { icon: 'Heart', title: 'Made with Care', text: 'Every enamel pin, sticker pack, and neck warmer is crafted with attention to detail. We inspect every item before it reaches your hands.' },
    { icon: 'Leaf', title: 'Sustainable Mindset', text: 'We choose durable materials and minimal packaging. Our products are built to last, reducing waste and keeping trails clean.' },
  ],

  aboutStats: [
    { label: 'Unique Pin Designs', value: '20+' },
    { label: 'Sticker Packs Sold', value: '12K+' },
    { label: 'Happy Adventurers', value: '50K+' },
    { label: 'Countries Shipped', value: '30+' },
  ],

  aboutStory: {
    title: 'Small Gear, Big Personality',
    paragraphs: [
      'We started GoWild because we were tired of outdoor gear that cost a fortune and weighed a ton. We wanted simple, affordable essentials that let you express your outdoor identity — whether you are summiting a peak or just dreaming about your next trip from your desk.',
      'Our pins and stickers are designed by outdoor enthusiasts, for outdoor enthusiasts. Our neck warmers are tested on real trails in real cold. And our picnic mats have been laid out on grass, sand, and rock from Colorado to California.',
    ],
    image: '/cat-hats.jpg',
  },

  aboutCta: {
    title: 'Join the Wild Community',
    subtitle: 'Follow us on social media to see how our community rocks GoWild gear. Tag us with #GoWildOutdoors and your post might be featured.',
  },
};

/* ------------------------------------------------------------------ */
/*  Deep merge helper for loading settings                             */
/* ------------------------------------------------------------------ */

function deepMerge<T>(target: T, source: unknown): T {
  if (source === null || source === undefined) return target;
  if (typeof source !== 'object') return source as T;
  if (Array.isArray(source)) {
    // For arrays, use source if it has items, otherwise keep target
    return (source.length > 0 ? source : target) as T;
  }
  if (typeof target !== 'object' || target === null) return source as T;

  const result = { ...target } as Record<string, unknown>;
  for (const key of Object.keys(source as Record<string, unknown>)) {
    if (key in result) {
      result[key] = deepMerge(result[key], (source as Record<string, unknown>)[key]);
    } else {
      result[key] = (source as Record<string, unknown>)[key];
    }
  }
  return result as T;
}

export function getBundleText(settings: SiteSettings, key: string): string {
  return settings.bundleTexts.find(bt => bt.key === key)?.value || '';
}

function migrateBundleDeal(parsed: Record<string, unknown>): void {
  if (parsed.bundleDeal && !parsed.bundleTexts) {
    const bd = parsed.bundleDeal as Record<string, string>;
    parsed.bundleTexts = [
      { id: 'bt-1', key: 'title', label: 'Bundle Title', value: bd.title || 'Pick Any 3 Pins for $10', description: 'Main headline shown on the Deals page and Pins Bundle page hero.', page: 'Deals & Pins Bundle', pageLink: '/deals', isSystem: true },
      { id: 'bt-2', key: 'subtitle', label: 'Bundle Subtitle', value: bd.subtitle || 'Mix & match from 20 enamel pin designs', description: 'Short description shown under the title on the Deals and Pins Bundle pages.', page: 'Deals & Pins Bundle', pageLink: '/deals', isSystem: true },
      { id: 'bt-3', key: 'cta', label: 'CTA Button Text', value: bd.cta || 'Build Your Bundle', description: 'Text on the call-to-action button that takes users to the bundle builder.', page: 'Deals Page', pageLink: '/deals', isSystem: true },
      { id: 'bt-4', key: 'savingsText', label: 'Savings Banner Text', value: bd.savingsText || 'Save up to 40% when you bundle', description: 'Text shown in the savings banner on the Deals page.', page: 'Deals Page', pageLink: '/deals', isSystem: true },
      { id: 'bt-5', key: 'cartBannerText', label: 'Cart Banner Text', value: bd.cartBannerText || 'You saved {savings} with pin bundle pricing! 3 pins for $10 deal applied.', description: 'Message shown in the cart when bundle pricing is applied. Use {savings} as a placeholder for the saved amount.', page: 'Cart Page', pageLink: '/cart', isSystem: true },
      { id: 'bt-6', key: 'navLabel', label: 'Navbar Cart Label', value: bd.navLabel || 'Bundle Savings (3 pins for $10)', description: 'Label shown in the navbar mini-cart dropdown next to the bundle savings amount.', page: 'Navbar Mini-Cart', pageLink: '/cart', isSystem: true },
    ];
    delete parsed.bundleDeal;
  }
}

function loadSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      migrateBundleDeal(parsed);
      return deepMerge(DEFAULT_SETTINGS, parsed);
    }
  } catch { /* ignore */ }
  return structuredClone(DEFAULT_SETTINGS);
}

function saveSettings(settings: SiteSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(loadSettings);

  const updateSettings = useCallback((updates: Partial<SiteSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const fresh = structuredClone(DEFAULT_SETTINGS);
    setSettings(fresh);
    saveSettings(fresh);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SettingsProvider');
  return ctx;
}
