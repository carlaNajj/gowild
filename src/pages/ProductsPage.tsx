import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, Check, ShoppingBag, Package, Thermometer, Map as MapIcon, Zap,
  SlidersHorizontal, ChevronDown, X, Eye, Minus, Plus, Search
} from 'lucide-react';
import {
  PIN_PRODUCTS, STICKER_PRODUCTS, NECK_WARMER_PRODUCTS,
  PICNIC_MAT_PRODUCT, ACCESSORY_PRODUCTS, ALL_PRODUCTS, useStore, calculateBundlePrice
} from '@/store';
import type { Product } from '@/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Synonym & typo mappings for FR-SRC-04                              */
/* ------------------------------------------------------------------ */
const SYNONYM_MAP: Record<string, string[]> = {
  'hat': ['neck warmer', 'warmer'],
  'hats': ['neck warmer', 'warmer'],
  'light': ['lamp', 'emergency lamp'],
  'lights': ['lamp', 'emergency lamp'],
  'fork': ['spork', 'tool', 'multifunctional fork'],
  'forks': ['spork', 'tool', 'multifunctional fork'],
  'spoon': ['spork', 'tool'],
  'pinns': ['pin'],
  'pinn': ['pin'],
  'pen': ['pin'],
  'nec': ['neck'],
  'warmer': ['neck warmer'],
  'warmers': ['neck warmer'],
  'mat': ['picnic mat'],
  'mats': ['picnic mat'],
  'blanket': ['picnic mat'],
  'sticker': ['stickers'],
  ' decal': ['stickers'],
  'patch': ['pin'],
  'badge': ['pin'],
  'lamp': ['emergency lamp'],
  'lantern': ['emergency lamp'],
  'torch': ['emergency lamp'],
  'tool': ['multi-tool', 'spork'],
  'utensil': ['spork'],
  'camping': ['outdoor', 'adventure'],
  'hiking': ['outdoor', 'trail'],
};

// Compute Levenshtein distance for typo tolerance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

// Expand search query with synonyms and typo corrections
function expandSearchQuery(query: string): { expanded: string[]; corrected?: string } {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { expanded: [] };

  const expanded: string[] = [...words];
  let corrected = false;
  const correctedWords: string[] = [];

  for (const word of words) {
    // Check direct synonym match
    if (SYNONYM_MAP[word]) {
      expanded.push(...SYNONYM_MAP[word]);
      correctedWords.push(SYNONYM_MAP[word][0]);
      corrected = true;
      continue;
    }
    // Check fuzzy match (Levenshtein distance <= 2)
    let bestMatch = '';
    let bestDist = Infinity;
    for (const key of Object.keys(SYNONYM_MAP)) {
      const dist = levenshtein(word, key);
      if (dist <= 2 && dist < bestDist) {
        bestDist = dist;
        bestMatch = key;
      }
    }
    if (bestMatch) {
      expanded.push(...SYNONYM_MAP[bestMatch]);
      correctedWords.push(SYNONYM_MAP[bestMatch][0]);
      corrected = true;
    } else {
      correctedWords.push(word);
    }
  }

  return {
    expanded: [...new Set(expanded)],
    corrected: corrected ? correctedWords.join(' ') : undefined,
  };
}

// Score a product against search terms
function scoreProduct(product: Product, terms: string[]): number {
  let score = 0;
  const name = product.name.toLowerCase();
  const desc = product.description.toLowerCase();
  const cat = product.category.toLowerCase();
  const specs = product.specs?.map(s => `${s.label} ${s.value}`.toLowerCase()).join(' ') || '';

  for (const term of terms) {
    if (name.includes(term)) score += 10;
    if (cat.includes(term)) score += 8;
    if (desc.includes(term)) score += 5;
    if (specs.includes(term)) score += 3;
    if (product.colors?.some(c => c.toLowerCase().includes(term))) score += 2;
  }
  return score;
}

/* ------------------------------------------------------------------ */
/*  Pin card                                                           */
/* ------------------------------------------------------------------ */
function PinCard({
  product, index, quantity, onIncrement, onDecrement,
}: {
  product: Product; index: number; quantity: number;
  onIncrement: () => void; onDecrement: () => void;
}) {
  const { toggleWishlist, isInWishlist } = useStore();
  const isWished = isInWishlist(product.id);
  const isSelected = quantity > 0;
  const img = PIN_IMAGES[index % PIN_IMAGES.length];

  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <>
      <div
        className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'ring-[3px] ring-[#1A5A6B] shadow-lg shadow-[#1A5A6B]/20'
            : 'ring-1 ring-gray-100 hover:ring-gray-300 hover:shadow-md'
        }`}
        onClick={() => onIncrement()}
      >
        <button
          className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isWished ? 'bg-[#E85D4E] text-white' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-[#E85D4E]/10 hover:text-[#E85D4E]'
          }`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); toast(isWished ? 'Removed from wishlist' : 'Added to wishlist'); }}
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-white' : ''}`} />
        </button>
        <div className="aspect-square bg-white relative">
          <img src={img} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md px-1.5 py-1">
            {isSelected && (
              <button onClick={(e) => { e.stopPropagation(); onDecrement(); }} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}
            {isSelected && <span className="text-xs font-bold w-5 text-center text-[#1A1A1A]">{quantity}</span>}
            <button onClick={(e) => { e.stopPropagation(); onIncrement(); }} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-[#1A5A6B] text-white hover:bg-[#1A8DA3]' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="p-2 bg-white">
          <h3 className="text-[11px] font-semibold text-[#1A1A1A] truncate leading-tight">{product.name}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-bold text-[#1A5A6B]">${product.price.toFixed(2)}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-[#E8552A] text-[#E8552A]" />
              <span className="text-[10px] text-[#6B7280]">{product.rating}</span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDetailModal(true); }}
            className="mt-1 text-[10px] text-[#1A5A6B] font-medium hover:underline flex items-center gap-0.5"
          >
            <Eye className="w-2.5 h-2.5" /> Show Details
          </button>
        </div>
      </div>

      {/* Pin Detail Modal - compact centered */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[75vh] overflow-y-auto z-10">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100 shadow">
              <X className="w-4 h-4" />
            </button>
            <div className="aspect-square bg-gray-50 rounded-t-2xl overflow-hidden">
              <img src={img} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <p className="text-xs text-[#6B7280] uppercase tracking-wider">{product.category}</p>
              <h3 className="font-heading text-lg font-bold text-[#1A1A1A] mt-0.5">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1 mb-3">
                <span className="text-xl font-bold text-[#1A5A6B]">${product.price.toFixed(2)}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#E8552A] text-[#E8552A]" />
                  <span className="text-sm text-[#6B7280]">{product.rating} ({product.reviewCount})</span>
                </div>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{product.description}</p>
              {product.specs && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.specs.map(s => (
                    <span key={s.label} className="text-xs bg-[#F5F0E8] text-[#6B7280] px-3 py-1 rounded-full">{s.label}: {s.value}</span>
                  ))}
                </div>
              )}
              <div className="bg-[#F5F0E8] rounded-lg p-3 text-center">
                <p className="text-xs text-[#6B7280]">Pick any 3 pins for only <span className="font-bold text-[#1A5A6B]">$10.00</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const PIN_IMAGES = ['/pin-mountain.jpg', '/pin-campfire.jpg', '/pin-compass.jpg', '/pin-bear.jpg', '/pin-tent.jpg', '/pin-hiker.jpg', '/pin-canoe.jpg', '/pin-deer.jpg'];

const CATEGORY_CONFIG = [
  { key: 'pins', label: 'Outdoor Pins', icon: MapIcon, products: PIN_PRODUCTS, subtitle: 'Pick any 3 for $10 \u2022 Mix & match', isPinSection: true },
  { key: 'stickers', label: 'Sticker Packs', icon: Package, products: STICKER_PRODUCTS, subtitle: '50 waterproof stickers per pack', isPinSection: false },
  { key: 'neckwarmers', label: 'Neck Warmers', icon: Thermometer, products: NECK_WARMER_PRODUCTS, subtitle: 'Warm fleece for cold adventures', isPinSection: false },
  { key: 'picnicmats', label: 'Picnic Mats', icon: MapIcon, products: [PICNIC_MAT_PRODUCT], subtitle: 'Waterproof \u2022 3 colors', isPinSection: false },
  { key: 'accessories', label: 'Accessories', icon: Zap, products: ACCESSORY_PRODUCTS, subtitle: 'Smart gear for every adventure', isPinSection: false },
];

const ALL_CATEGORIES = ['All', 'Pins', 'Stickers', 'Neck Warmers', 'Picnic Mats', 'Accessories'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'rating', label: 'Highest Rated' },
];
const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $10', min: 0, max: 10 },
  { label: '$10 - $20', min: 10, max: 20 },
  { label: '$20 - $35', min: 20, max: 35 },
  { label: 'Over $35', min: 35, max: Infinity },
];

/* ------------------------------------------------------------------ */
/*  Filter & sort logic — FR-SRC-02, FR-SRC-03                        */
/* ------------------------------------------------------------------ */
function filterAndSortProducts(
  products: Product[],
  category: string,
  priceRange: { min: number; max: number },
  sortBy: string,
  searchQuery: string,
  minRating: number,
  inStockOnly: boolean,
): { products: Product[]; corrected?: string } {
  let filtered = [...products];

  // Category filter
  if (category !== 'All') filtered = filtered.filter(p => p.category === category);

  // Price range
  filtered = filtered.filter(p => p.price >= priceRange.min && p.price < priceRange.max);

  // Rating filter (FR-SRC-02)
  if (minRating > 0) filtered = filtered.filter(p => p.rating >= minRating);

  // Availability filter (FR-SRC-02)
  if (inStockOnly) filtered = filtered.filter(p => p.stock > 0);

  // Search with typo tolerance & synonyms (FR-SRC-04)
  let corrected: string | undefined;
  if (searchQuery.trim()) {
    const { expanded, corrected: corr } = expandSearchQuery(searchQuery);
    corrected = corr;
    const scored = filtered.map(p => ({ product: p, score: scoreProduct(p, expanded) }));
    scored.sort((a, b) => b.score - a.score);
    filtered = scored.filter(s => s.score > 0).map(s => s.product);
    if (filtered.length === 0) {
      // No results — keep all for fallback display
      filtered = [];
    }
  }

  // Sort
  switch (sortBy) {
    case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
    case 'newest': filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
    default: filtered.sort((a, b) => b.reviewCount - a.reviewCount); break;
  }

  return { products: filtered, corrected };
}

/* ------------------------------------------------------------------ */
/*  Standard product card                                              */
/* ------------------------------------------------------------------ */
function ProductCard({ product, index }: { product: Product; index: number }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const isWished = isInWishlist(product.id);
  const isSticker = product.category === 'Stickers';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.05 }}>
      <Link to={`/product/${product.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {product.badge && (
            <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${product.badge === 'Sale' ? 'bg-[#E85D4E]' : product.badge === 'New' ? 'bg-[#52796F]' : product.badge === 'Ultralight' ? 'bg-[#1A8DA3]' : 'bg-[#E8552A]'}`}>
              {product.badge}
            </span>
          )}
          {isSticker && <span className="absolute bottom-3 left-3 bg-[#1A5A6B] text-white text-[10px] font-bold px-2 py-1 rounded-full">50 STICKERS</span>}
          {product.stock === 0 && (
            <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
            </span>
          )}
          <button className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${isWished ? 'bg-[#E85D4E] text-white' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-[#E85D4E]/10 hover:text-[#E85D4E]'}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); toast(isWished ? 'Removed from wishlist' : 'Added to wishlist'); }}>
            <Heart className={`w-4 h-4 transition-all ${isWished ? 'fill-white scale-110' : ''}`} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-[#6B7280] text-[10px] uppercase tracking-wider font-medium">{product.category}</p>
          <h3 className="font-heading font-semibold text-sm text-[#1A1A1A] mt-1 leading-tight group-hover:text-[#1A5A6B] transition-colors">{product.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-[#1A1A1A]">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="text-[#6B7280] text-xs line-through">${product.originalPrice.toFixed(2)}</span>}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3.5 h-3.5 fill-[#E8552A] text-[#E8552A]" />
            <span className="text-xs text-[#6B7280]">{product.rating} ({product.reviewCount})</span>
            {product.stock > 0 ? (
              <span className="text-[10px] text-[#52796F] ml-auto">In Stock</span>
            ) : (
              <span className="text-[10px] text-[#E85D4E] ml-auto">Out of Stock</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Picnic mat card                                                    */
/* ------------------------------------------------------------------ */
function PicnicMatCard() {
  const { toggleWishlist, isInWishlist, addToCart } = useStore();
  const product = PICNIC_MAT_PRODUCT;
  const isWished = isInWishlist(product.id);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Red');
  const colorImgMap: Record<string, string> = { Red: '/mat-red.jpg', Blue: '/mat-blue.jpg', Black: '/mat-black.jpg' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
        <Link to={`/product/${product.id}`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
            <img src={colorImgMap[selectedColor] || product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {product.badge && <span className="absolute top-3 left-3 bg-[#E85D4E] text-white text-xs font-bold px-2.5 py-1 rounded-full">{product.badge}</span>}
            <button className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${isWished ? 'bg-[#E85D4E] text-white' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-[#E85D4E]/10 hover:text-[#E85D4E]'}`}
              onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); toast(isWished ? 'Removed from wishlist' : 'Added to wishlist'); }}>
              <Heart className={`w-4 h-4 ${isWished ? 'fill-white' : ''}`} />
            </button>
          </div>
        </Link>
        <div className="p-4">
          <p className="text-[#6B7280] text-[10px] uppercase tracking-wider font-medium">{product.category}</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-heading font-semibold text-sm text-[#1A1A1A] mt-1 leading-tight group-hover:text-[#1A5A6B] transition-colors">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-[#1A1A1A]">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="text-[#6B7280] text-xs line-through">${product.originalPrice.toFixed(2)}</span>}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-[#6B7280]">Color:</span>
            <div className="flex gap-1.5">
              {product.colors?.map((c) => (
                <button key={c} onClick={() => setSelectedColor(c)} className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === c ? 'border-[#1A5A6B] ring-2 ring-[#1A5A6B]/30' : 'border-gray-200 hover:border-gray-400'}`}
                  style={{ backgroundColor: c === 'Red' ? '#DC2626' : c === 'Blue' ? '#1E40AF' : '#1A1A1A' }} title={c} />
              ))}
            </div>
          </div>
          <Button size="sm" className="w-full mt-3 bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full text-xs"
            onClick={() => { addToCart({ product, quantity: 1, color: selectedColor }); toast.success(`${product.name} (${selectedColor}) added to cart!`); }}>
            <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add to Cart
          </Button>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3.5 h-3.5 fill-[#E8552A] text-[#E8552A]" />
            <span className="text-xs text-[#6B7280]">{product.rating} ({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Search suggestions dropdown (FR-SRC-04)                            */
/* ------------------------------------------------------------------ */
function SearchSuggestions({
  query, onSelect,
}: {
  query: string; onSelect: (q: string) => void;
}) {
  const suggestions = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const matches: { label: string; type: 'product' | 'category' | 'synonym' }[] = [];

    // Product name matches
    ALL_PRODUCTS.forEach(p => {
      if (p.name.toLowerCase().includes(q)) {
        matches.push({ label: p.name, type: 'product' });
      }
    });

    // Category matches
    ALL_CATEGORIES.forEach(c => {
      if (c.toLowerCase().includes(q) && c !== 'All') {
        matches.push({ label: c, type: 'category' });
      }
    });

    // Synonym suggestions
    for (const [key, values] of Object.entries(SYNONYM_MAP)) {
      if (key.includes(q) || q.includes(key)) {
        values.forEach(v => matches.push({ label: v, type: 'synonym' }));
      }
    }

    return [...new Map(matches.map(m => [m.label, m])).values()].slice(0, 6);
  }, [query]);

  if (suggestions.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      {suggestions.map((s, i) => (
        <button key={`${s.label}-${i}`} onClick={() => onSelect(s.label)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-[#1A1A1A]">{s.label}</span>
          <span className="text-[10px] text-gray-400 ml-auto capitalize">{s.type}</span>
        </button>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Filter Bottom Sheet (FR-SRC-02)                             */
/* ------------------------------------------------------------------ */
function MobileFilterSheet({
  isOpen, onClose,
  activeCategory, setActiveCategory,
  activePriceRange, setActivePriceRange,
  sortBy, setSortBy,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  minRating, setMinRating,
  inStockOnly, setInStockOnly,
}: {
  isOpen: boolean; onClose: () => void;
  activeCategory: string; setActiveCategory: (c: string) => void;
  activePriceRange: typeof PRICE_RANGES[0]; setActivePriceRange: (p: typeof PRICE_RANGES[0]) => void;
  sortBy: string; setSortBy: (s: string) => void;
  minPrice: string; setMinPrice: (s: string) => void;
  maxPrice: string; setMaxPrice: (s: string) => void;
  minRating: number; setMinRating: (r: number) => void;
  inStockOnly: boolean; setInStockOnly: (v: boolean) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1" onClick={onClose}><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
            <div className="px-5 pb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">Sort By</p>
                <div className="space-y-2">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setSortBy(opt.value)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${sortBy === opt.value ? 'bg-[#1A5A6B]/10 text-[#1A5A6B] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-[#1A5A6B] text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">Price Range</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRICE_RANGES.map(range => (
                    <button key={range.label} onClick={() => { setActivePriceRange(range); setMinPrice(''); setMaxPrice(''); }}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${activePriceRange.label === range.label ? 'bg-[#1A5A6B] text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {range.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                      className="w-full pl-6 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                  </div>
                  <span className="text-gray-400">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                      className="w-full pl-6 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">Minimum Rating</p>
                <div className="flex flex-wrap gap-2">
                  {[0, 3, 4, 4.5].map(r => (
                    <button key={r} onClick={() => setMinRating(r)}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${minRating === r ? 'bg-[#1A5A6B] text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {r === 0 ? 'Any' : <><Star className="w-3.5 h-3.5 fill-current" /> {r}+</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">Availability</p>
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50">
                  <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="w-4 h-4 accent-[#1A5A6B]" />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>

              <Button onClick={onClose} className="w-full bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full py-4 text-sm font-semibold h-14">
                Show Results
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export function ProductsPage() {
  const navigate = useNavigate();
  const { addMultipleToCart } = useStore();
  const [urlSearchParams] = useSearchParams();
  const searchParams = urlSearchParams;
  const [selectedPins, setSelectedPins] = useState<Map<string, number>>(() => {
    const pinsParam = searchParams.get('pins');
    if (!pinsParam) return new Map();
    const counts = new Map<string, number>();
    pinsParam.split(',').filter(Boolean).forEach(id => {
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
  });
  const [showBundleModal, setShowBundleModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter & sort state
  const initialCategory = searchParams.get('category');
  const validCategories = ALL_CATEGORIES;
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && validCategories.includes(initialCategory) ? initialCategory : 'All'
  );
  const [activePriceRange, setActivePriceRange] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState('popular');
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // FR-SRC-04: Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // FR-SRC-02: New filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Compute effective price range from inputs or preset
  const effectivePriceRange = useMemo(() => {
    const min = minPrice ? parseFloat(minPrice) : activePriceRange.min;
    const max = maxPrice ? parseFloat(maxPrice) : activePriceRange.max;
    return { min: isNaN(min) ? 0 : min, max: isNaN(max) ? Infinity : max };
  }, [minPrice, maxPrice, activePriceRange]);

  // Filtered products with search + all filters
  const { products: filteredProducts, corrected } = useMemo(() =>
    filterAndSortProducts(ALL_PRODUCTS, activeCategory, effectivePriceRange, sortBy, searchQuery, minRating, inStockOnly),
    [activeCategory, effectivePriceRange, sortBy, searchQuery, minRating, inStockOnly]
  );

  const hasSearchResults = searchQuery.trim() && filteredProducts.length > 0;
  const hasNoResults = searchQuery.trim() && filteredProducts.length === 0;

  // Recommended products for no-results fallback
  const recommendedProducts = useMemo(() => {
    if (!hasNoResults) return [];
    return ALL_PRODUCTS
      .filter(p => p.rating >= 4.5)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 4);
  }, [hasNoResults]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useMemo(() => { setCurrentPage(1); }, [activeCategory, effectivePriceRange, sortBy, searchQuery, minRating, inStockOnly]);

  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl && validCategories.includes(catFromUrl)) setActiveCategory(catFromUrl);
  }, [searchParams]);

  const activeFilterCount = (activeCategory !== 'All' ? 1 : 0) + (activePriceRange.label !== 'All Prices' || minPrice || maxPrice ? 1 : 0) + (minRating > 0 ? 1 : 0) + (inStockOnly ? 1 : 0);

  // Pin helpers
  const pinTotalQty = useMemo(() => { let t = 0; selectedPins.forEach(q => t += q); return t; }, [selectedPins]);
  const bundleCalc = useMemo(() => calculateBundlePrice(pinTotalQty), [pinTotalQty]);

  function incrementPin(id: string) { setSelectedPins(p => { const n = new Map(p); n.set(id, (n.get(id) || 0) + 1); return n; }); }
  function decrementPin(id: string) { setSelectedPins(p => { const n = new Map(p); const c = n.get(id) || 0; if (c <= 1) n.delete(id); else n.set(id, c - 1); return n; }); }

  function addSelectedPinsToCart() {
    const items: { product: typeof PIN_PRODUCTS[0]; quantity: number; bundlePrice?: number }[] = [];
    let slots = Math.floor(pinTotalQty / 3) * 3;
    PIN_PRODUCTS.forEach(p => {
      const q = selectedPins.get(p.id) || 0;
      for (let i = 0; i < q; i++) { items.push({ product: p, quantity: 1, bundlePrice: slots > 0 ? 10 / 3 : undefined }); slots--; }
    });
    addMultipleToCart(items);
    toast.success(`${pinTotalQty} pin${pinTotalQty > 1 ? 's' : ''} added! Saved $${bundleCalc.savings.toFixed(2)}.`);
    setSelectedPins(new Map());
  }

  // Clear all filters
  function clearAllFilters() {
    setActiveCategory('All');
    setActivePriceRange(PRICE_RANGES[0]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('popular');
  }

  // Handle search suggestion selection
  const handleSearchSelect = useCallback((value: string) => {
    setSearchQuery(value);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1A5A6B] to-[#1A8DA3] py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white">Shop GoWild</h1>
          <p className="text-white/80 mt-2 text-xs md:text-sm">Pins, stickers, neck warmers &amp; adventure essentials</p>

          {/* FR-SRC-04: Search bar with suggestions */}
          <div className="max-w-lg mx-auto mt-6 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={e => e.key === 'Enter' && setShowSuggestions(false)}
                placeholder="Search pins, stickers, neck warmers..."
                className="w-full pl-12 pr-10 py-3.5 rounded-full text-sm bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setShowSuggestions(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showSuggestions && (
              <SearchSuggestions query={searchQuery} onSelect={handleSearchSelect} />
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Sticky filter toolbar */}
      <div className="hidden md:block sticky top-[72px] z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto flex-1 no-scrollbar">
              {ALL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#1A5A6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${showDesktopFilters || activeFilterCount > 0 ? 'bg-[#1A5A6B] text-white border-[#1A5A6B]' : 'bg-white text-gray-700 border-gray-200'}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 cursor-pointer">
                  {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Desktop expandable filter panel */}
          <AnimatePresence>
            {showDesktopFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="pt-4 pb-2 border-t mt-3 space-y-4">
                  {/* Price */}
                  <div className="flex items-end gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold mb-2">Price Range</p>
                      <div className="flex flex-wrap gap-2">
                        {PRICE_RANGES.map(range => (
                          <button key={range.label} onClick={() => { setActivePriceRange(range); setMinPrice(''); setMaxPrice(''); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activePriceRange.label === range.label ? 'bg-[#1A5A6B] text-white' : 'bg-gray-100 text-gray-600'}`}>{range.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                          className="w-20 pl-5 pr-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                      </div>
                      <span className="text-gray-400 text-xs">—</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                          className="w-20 pl-5 pr-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                      </div>
                    </div>
                  </div>

                  {/* Rating & Availability */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold mb-2">Rating</p>
                      <div className="flex gap-2">
                        {[0, 3, 4, 4.5].map(r => (
                          <button key={r} onClick={() => setMinRating(r)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${minRating === r ? 'bg-[#1A5A6B] text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {r === 0 ? 'Any' : <><Star className="w-3 h-3 fill-current" /> {r}+</>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Availability</p>
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all hover:bg-gray-50">
                        <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="w-3.5 h-3.5 accent-[#1A5A6B]" />
                        <span className="text-xs">In Stock Only</span>
                      </label>
                    </div>
                    {activeFilterCount > 0 && (
                      <button onClick={clearAllFilters} className="flex items-center gap-1.5 text-sm text-[#E85D4E] hover:underline ml-auto">
                        <X className="w-4 h-4" /> Clear all
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: Horizontal category chips + filter button */}
      <div className="md:hidden sticky top-[72px] z-40 bg-white border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto flex-1 no-scrollbar snap-x snap-mandatory py-0.5">
              {ALL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 snap-start min-h-[36px] flex items-center ${activeCategory === cat ? 'bg-[#1A5A6B] text-white shadow-sm' : 'bg-gray-100 text-gray-600 active:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => setShowMobileFilters(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border flex-shrink-0 transition-all min-h-[36px] ${activeFilterCount > 0 ? 'bg-[#1A5A6B] text-white border-[#1A5A6B] shadow-sm' : 'bg-white text-gray-700 border-gray-200 active:bg-gray-50'}`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {activeFilterCount > 0 ? `(${activeFilterCount})` : 'Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)}
        activeCategory={activeCategory} setActiveCategory={setActiveCategory}
        activePriceRange={activePriceRange} setActivePriceRange={setActivePriceRange}
        sortBy={sortBy} setSortBy={setSortBy}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        minRating={minRating} setMinRating={setMinRating}
        inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
      />

      {/* Results info + search correction message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* FR-SRC-04: Typo correction message */}
        {corrected && corrected !== searchQuery.toLowerCase().trim() && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-[#52796F] mb-2 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            Showing results for &ldquo;<span className="font-medium">{corrected}</span>&rdquo; instead of &ldquo;{searchQuery}&rdquo;
          </motion.p>
        )}

        {hasSearchResults && (
          <p className="text-sm text-gray-500">
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {!searchQuery && (
          <p className="text-sm text-gray-500">
            {activeCategory === 'All' ? 'Showing all products' : `${filteredProducts.length} products in ${activeCategory}`}
            {(activePriceRange.label !== 'All Prices' || minPrice || maxPrice) && ` • ${minPrice || activePriceRange.min}$ - ${maxPrice || (activePriceRange.max === Infinity ? '∞' : activePriceRange.max)}$`}
            {minRating > 0 && ` • ${minRating}★+`}
            {inStockOnly && ' • In Stock'}
          </p>
        )}
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">

        {/* FR-SRC-04: No results fallback with recommendations */}
        {hasNoResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2">No results for &ldquo;{searchQuery}&rdquo;</h3>
            <p className="text-sm text-[#6B7280] mb-6">Try different keywords or check out our popular items below.</p>
            <Button onClick={clearAllFilters} variant="outline" className="rounded-full mb-8">
              <X className="w-4 h-4 mr-2" /> Clear Filters
            </Button>
            <h4 className="font-heading font-bold text-lg text-[#1A1A1A] mb-4 text-left">Recommended For You</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </motion.div>
        )}

        {/* Search results grid */}
        {hasSearchResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((p, i) => p.id === 'mat1' ? <PicnicMatCard key={p.id} /> : <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}

        {/* Filtered grid view (non-All, non-Pins, no active search) */}
        {!searchQuery && activeCategory !== 'All' && activeCategory !== 'Pins' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((p, i) => p.id === 'mat1' ? <PicnicMatCard key={p.id} /> : <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}

        {/* Pins view */}
        {!searchQuery && activeCategory === 'Pins' && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1A5A6B]/10 flex items-center justify-center text-[#1A5A6B]">
                <MapIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">Outdoor Pins</h2>
                <p className="text-sm text-[#6B7280]">{PIN_PRODUCTS.length} unique designs</p>
              </div>
            </div>
            <div className="mb-6 bg-[#F5F0E8] rounded-xl p-4 flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#1A5A6B] flex-shrink-0" />
              <p className="text-sm text-[#1A1A1A]"><span className="font-semibold">Bundle & Save</span> — pick any 3 pins and pay only $10. Discount applies automatically in cart.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {PIN_PRODUCTS.map((p, i) => <PinCard key={p.id} product={p} index={i} quantity={selectedPins.get(p.id) || 0} onIncrement={() => incrementPin(p.id)} onDecrement={() => decrementPin(p.id)} />)}
            </div>
          </section>
        )}

        {/* All view */}
        {!searchQuery && activeCategory === 'All' && (
          <>
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1A5A6B]/10 flex items-center justify-center text-[#1A5A6B]"><MapIcon className="w-5 h-5" /></div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">Outdoor Pins</h2>
                  <p className="text-sm text-[#6B7280]">{PIN_PRODUCTS.length} unique designs</p>
                </div>
              </div>
              <div className="mb-6 bg-[#F5F0E8] rounded-xl p-4 flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#1A5A6B] flex-shrink-0" />
                <p className="text-sm text-[#1A1A1A]"><span className="font-semibold">Bundle & Save</span> — pick any 3 pins and pay only $10. Discount applies automatically in cart.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {PIN_PRODUCTS.map((p, i) => <PinCard key={p.id} product={p} index={i} quantity={selectedPins.get(p.id) || 0} onIncrement={() => incrementPin(p.id)} onDecrement={() => decrementPin(p.id)} />)}
              </div>
            </section>
            {CATEGORY_CONFIG.filter(c => c.key !== 'pins').map((cat) => (
              <section key={cat.key}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1A5A6B]/10 flex items-center justify-center text-[#1A5A6B]"><cat.icon className="w-5 h-5" /></div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">{cat.label}</h2>
                    <p className="text-sm text-[#6B7280]">{cat.subtitle}</p>
                  </div>
                </div>
                {cat.key === 'picnicmats' ? (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PicnicMatCard />
                    <div className="sm:col-span-1 lg:col-span-2 flex items-center">
                      <div className="bg-[#F5F0E8] rounded-xl p-6 h-full flex flex-col justify-center">
                        <h3 className="font-heading font-bold text-lg mb-2">Why GoWild Picnic Mats?</h3>
                        <ul className="space-y-2 text-sm text-[#6B7280]">
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#52796F]" /> Soft quilted fleece top layer</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#52796F]" /> 100% waterproof PEVA bottom</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#52796F]" /> Folds compact with carry strap</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#52796F]" /> 3 colors: Red, Blue, Black</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#52796F]" /> Machine washable</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cat.products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                  </div>
                )}
              </section>
            ))}
          </>
        )}
      </div>

      {/* Pagination for search/filtered results */}
      {(hasSearchResults || (!searchQuery && activeCategory !== 'All' && activeCategory !== 'Pins')) && totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${currentPage === i + 1 ? 'bg-[#1A5A6B] text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}

      {/* Mini floating bar for pins */}
      <AnimatePresence>
        {pinTotalQty > 0 && !showBundleModal && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A5A6B] text-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">{pinTotalQty}</div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{pinTotalQty} pin{pinTotalQty > 1 ? 's' : ''} selected</p>
                  <p className="text-xs text-white/70">${bundleCalc.bundlePrice.toFixed(2)} · Save ${bundleCalc.savings.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-white/50 text-white hover:bg-white/20 rounded-full text-xs px-3 bg-transparent" onClick={() => navigate('/pins-bundle?pins=' + Array.from(selectedPins.entries()).flatMap(([id, qty]) => Array(qty).fill(id)).join(','))}>
                  <Eye className="w-3.5 h-3.5 mr-1" /> Show Details
                </Button>
                <Button size="sm" className="bg-white text-[#1A5A6B] hover:bg-white/90 rounded-full text-xs px-4 font-semibold" onClick={addSelectedPinsToCart}>
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bundle Review Modal */}
      <AnimatePresence>
        {showBundleModal && pinTotalQty > 0 && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBundleModal(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
              <div className="px-5 pb-8 sm:px-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold">Your Pin Bundle</h3>
                    <p className="text-sm text-gray-500">{pinTotalQty} pins selected</p>
                  </div>
                  <button onClick={() => setShowBundleModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>
                <div className="bg-[#F5F0E8] rounded-xl p-4 mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#6B7280]">Bundle Price</p>
                    <p className="text-2xl font-bold text-[#1A5A6B]">${bundleCalc.bundlePrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#6B7280] line-through">${bundleCalc.regularPrice.toFixed(2)}</p>
                    {bundleCalc.savings > 0 && <p className="text-sm font-semibold text-[#E8552A]">Save ${bundleCalc.savings.toFixed(2)}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-6">
                  {PIN_PRODUCTS.map(p => {
                    const qty = selectedPins.get(p.id) || 0;
                    if (qty === 0) return null;
                    return (
                      <div key={p.id} className="relative">
                        <div className="aspect-square bg-white rounded-lg overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute top-1 left-1 bg-[#1A5A6B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{qty}</div>
                        <button onClick={() => decrementPin(p.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"><X className="w-3 h-3" /></button>
                        <p className="text-[10px] text-center mt-1 truncate">{p.name}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button variant="outline" className="rounded-full px-5 py-3 text-sm" onClick={() => { setSelectedPins(new Map()); setShowBundleModal(false); }}>
                    <X className="w-4 h-4 mr-1.5" /> Clear All
                  </Button>
                  <Button className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full px-6 py-3 text-sm font-semibold"
                    onClick={() => { const ids: string[] = []; selectedPins.forEach((q, id) => { for (let i = 0; i < q; i++) ids.push(id); }); setShowBundleModal(false); navigate(`/pins-bundle?pins=${ids.join(',')}`); }}>
                    <Eye className="w-4 h-4 mr-1.5" /> Show Details
                  </Button>
                  <Button className="bg-[#E8552A] hover:bg-[#C4451D] rounded-full px-6 py-3 text-sm font-semibold" onClick={() => { setShowBundleModal(false); addSelectedPinsToCart(); }}>
                    <ShoppingBag className="w-4 h-4 mr-1.5" /> Add {pinTotalQty} to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
