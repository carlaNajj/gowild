import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Truck, Shield, RefreshCw, Headphones, Star, Heart, Tag, Percent, Quote } from 'lucide-react';
import { ALL_PRODUCTS, PIN_PRODUCTS, STICKER_PRODUCTS, NECK_WARMER_PRODUCTS, useStore } from '@/store';
import { useAuth } from '@/auth';
import { toast } from 'sonner';

const categories = [
  { name: 'Pins', count: PIN_PRODUCTS.length, image: '/cat-pins.jpg', desc: 'Enamel pins for your gear', link: '/products?category=Pins' },
  { name: 'Stickers', count: STICKER_PRODUCTS.length, image: '/cat-stickers.jpg', desc: '50-sticker waterproof packs', link: '/products?category=Stickers' },
  { name: 'Neck Warmers', count: NECK_WARMER_PRODUCTS.length, image: '/prod-neckwarmer.jpg', desc: 'Fleece for cold adventures', link: '/products?category=Neck+Warmers' },
  { name: 'Picnic Mats', count: 1, image: '/mat-red.jpg', desc: 'Waterproof, 3 colors', link: '/products?category=Picnic+Mats' },
  { name: 'Accessories', count: 2, image: '/prod-lamp.jpg', desc: 'Smart gear essentials', link: '/products?category=Accessories' },
  { name: 'Hats', count: 0, image: '/cat-hats.jpg', desc: 'Coming soon', link: '/products' },
];

const featuredProducts = [
  PIN_PRODUCTS[0], PIN_PRODUCTS[7], STICKER_PRODUCTS[0], STICKER_PRODUCTS[4],
  NECK_WARMER_PRODUCTS[0], NECK_WARMER_PRODUCTS[4],
  ALL_PRODUCTS.find(p => p.id === 'mat1')!, ALL_PRODUCTS.find(p => p.id === 'a2')!,
].filter(Boolean);

const newProducts = [
  ALL_PRODUCTS.find(p => p.id === 'p5')!, ALL_PRODUCTS.find(p => p.id === 'p10')!,
  ALL_PRODUCTS.find(p => p.id === 's5')!, ALL_PRODUCTS.find(p => p.id === 'n6')!,
  ALL_PRODUCTS.find(p => p.id === 'a1')!, ALL_PRODUCTS.find(p => p.id === 'p18')!,
  ALL_PRODUCTS.find(p => p.id === 'n8')!, ALL_PRODUCTS.find(p => p.id === 'p12')!,
].filter(Boolean);

// Reviews for preview section
const REVIEW_PREVIEW = [
  { id: 'r1', userName: 'Sarah M.', rating: 5, text: 'Absolutely love this pin! The gold plating is gorgeous and the detail is incredible. Already got compliments on my backpack.', productId: 'p1', productName: 'Summit Seeker Pin', date: '2026-03-15' },
  { id: 'r6', userName: 'Alex P.', rating: 5, text: '50 unique stickers and every single one is amazing quality. The waterproof vinyl held up through rain and sun on my water bottle.', productId: 's1', productName: 'Mountain Vibes Sticker Pack', date: '2026-04-05' },
  { id: 'r9', userName: 'Tom R.', rating: 4, text: 'Kept me warm on a 5F hike. The fleece is soft and does not itch. Great for the price point.', productId: 'n1', productName: 'Alpine Frost Neck Warmer', date: '2026-03-25' },
  { id: 'r12', userName: 'Jenny L.', rating: 5, text: 'Used this at the beach and it was perfect. The waterproof bottom kept us dry even on wet sand. Folds up so small!', productId: 'mat1', productName: 'GoWild Waterproof Picnic Mat', date: '2026-03-30' },
];

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50. Lightweight gear ships fast.' },
  { icon: Shield, title: 'Quality Guarantee', desc: 'Every product inspected for premium quality.' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns on all items.' },
  { icon: Headphones, title: 'Expert Support', desc: 'Our team is here to help, 24/7.' },
];

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] overflow-hidden flex items-center justify-center">
        <motion.div className="absolute inset-0" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}>
          <img src="/hero.jpg" alt="Mountain landscape" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        </motion.div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-[#E8552A] uppercase tracking-[0.25em] text-sm font-semibold mb-4">Adventure Awaits</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">Express Your Wild</motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }} className="text-white/90 text-lg mt-6 max-w-xl mx-auto leading-relaxed">Pins, stickers, neck warmers, and essentials for the modern adventurer. Small gear with big personality for every trail and every story.</motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }} className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/products" className="bg-white text-[#1A5A6B] px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg inline-block">Shop Now</Link>
            <Link to="/products" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-white/15 transition-all inline-block">Explore Categories</Link>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronDown className="w-5 h-5" /></motion.div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">Shop by Category</h2>
            <p className="text-[#6B7280] mt-3 text-base">Find your perfect outdoor accessories</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true, margin: '-50px' }}>
                <Link to={cat.link} className="group block relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <h3 className="font-heading text-white font-semibold text-xl">{cat.name}</h3>
                    <p className="text-white/70 text-sm mt-0.5">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">Best Sellers</h2>
              <p className="text-[#6B7280] mt-2 text-sm">Our most popular adventure essentials</p>
            </div>
            <Link to="/products" className="text-[#1A5A6B] font-medium text-sm hover:underline flex items-center gap-1">View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true, margin: '-50px' }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended For You */}
      <RecommendedSection />

      {/* Promotional Banners */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">Promotions & Deals</h2>
            <p className="text-[#6B7280] mt-2">Limited-time offers you don&apos;t want to miss</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <Link to="/products" className="group block bg-gradient-to-br from-[#1A5A6B] to-[#1A8DA3] rounded-2xl p-6 text-white h-full hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Bundle</span>
                  <Percent className="w-6 h-6 text-white/60" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Pick Any 3 Pins for $10</h3>
                <p className="text-white/80 text-sm mb-1">Mix & match 20 unique designs</p>
                <p className="text-white/60 text-xs mb-4">Save up to 40% when you bundle</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 group-hover:bg-white/30 transition-colors px-4 py-2 rounded-full">Build Your Bundle <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></span>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Link to="/product/mat1" className="group block bg-gradient-to-br from-[#E8552A] to-[#C4451D] rounded-2xl p-6 text-white h-full hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Sale</span>
                  <Tag className="w-6 h-6 text-white/60" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Summer Picnic Sale</h3>
                <p className="text-white/80 text-sm mb-1">Waterproof picnic mat</p>
                <p className="text-white/60 text-xs mb-4">Was $44.99 — Now $34.99</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 group-hover:bg-white/30 transition-colors px-4 py-2 rounded-full">Shop Now <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></span>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}>
              <Link to="/products" className="group block bg-gradient-to-br from-[#52796F] to-[#3d5c54] rounded-2xl p-6 text-white h-full hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Shipping</span>
                  <Truck className="w-6 h-6 text-white/60" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Free Shipping $50+</h3>
                <p className="text-white/80 text-sm mb-1">All orders ship free</p>
                <p className="text-white/60 text-xs mb-4">Lightweight gear ships in 5-7 days</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 group-hover:bg-white/30 transition-colors px-4 py-2 rounded-full">Start Shopping <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">New Arrivals</h2>
              <p className="text-[#6B7280] mt-2 text-sm">Fresh drops for your next adventure</p>
            </div>
            <Link to="/products" className="text-[#1A5A6B] font-medium text-sm hover:underline flex items-center gap-1">View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true, margin: '-50px' }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Preview */}
      <section className="py-20 bg-[#F0F7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">What Adventurers Say</h2>
            <p className="text-[#6B7280] mt-3">Real reviews from the GoWild community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REVIEW_PREVIEW.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/product/${review.productId}`} className="block bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-[#E8552A] text-[#E8552A]' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <Quote className="w-5 h-5 text-[#1A5A6B]/30 flex-shrink-0 mt-0.5" />
                    <p className="text-[#1A1A1A] text-sm leading-relaxed">{review.text}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center text-xs font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">{review.userName}</p>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#1A5A6B] bg-[#1A5A6B]/10 px-3 py-1 rounded-full font-medium">
                      Review for {review.productName}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/products" className="inline-flex items-center gap-2 text-[#1A5A6B] font-medium hover:underline">
              Explore all products and reviews <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bundle Deal Banner */}
      <section className="py-16 bg-gradient-to-r from-[#E8552A] to-[#C4451D]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <p className="text-white/80 text-sm uppercase tracking-wider font-medium mb-2">Bundle & Save</p>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white">Pick Any 3 Pins for $10</h2>
            <p className="text-white/80 mt-4 text-base max-w-xl mx-auto">Mix and match from 20 unique enamel pin designs. The more you pick, the more you save. 6 pins = $20, 9 pins = $30.</p>
            <Link to="/products" className="inline-block mt-8 bg-white text-[#E8552A] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg">Build Your Bundle</Link>
          </motion.div>
        </div>
      </section>

      {/* Brand Promise */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">Why GoWild?</h2>
            <p className="text-[#6B7280] mt-3">Small gear, big adventures, unmatched quality</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="w-14 h-14 mx-auto bg-[#1A5A6B]/15 rounded-xl flex items-center justify-center text-[#1A5A6B]">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-semibold text-[#1A1A1A] mt-4">{f.title}</h3>
                <p className="text-[#6B7280] text-sm mt-2 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Card with clear wishlist states                            */
/* ------------------------------------------------------------------ */
function ProductCard({ product }: { product: typeof ALL_PRODUCTS[0] }) {
  const isPin = product.category === 'Pins';
  const { toggleWishlist, isInWishlist } = useStore();
  const isWished = isInWishlist(product.id);

  return (
    <Link to={`/product/${product.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {product.badge && (
          <span className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${product.badge === 'Sale' ? 'bg-[#E85D4E]' : product.badge === 'New' ? 'bg-[#52796F]' : 'bg-[#E8552A]'}`}>
            {product.badge}
          </span>
        )}
        {isPin && (
          <span className="absolute bottom-3 left-3 bg-[#1A5A6B] text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Bundle & Save
          </span>
        )}
        {/* Wishlist button - clear visual states */}
        <button
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isWished
              ? 'bg-[#E85D4E] text-white'
              : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-[#E85D4E]/10 hover:text-[#E85D4E]'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
            toast(isWished ? 'Removed from wishlist' : 'Added to wishlist');
          }}
        >
          <Heart className={`w-4 h-4 transition-all ${isWished ? 'fill-white scale-110' : ''}`} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-[#6B7280] text-xs uppercase tracking-wider">{product.category}</p>
        <h3 className="font-heading font-semibold text-sm text-[#1A1A1A] mt-1 truncate group-hover:text-[#1A5A6B] transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-[#1A1A1A]">${product.price.toFixed(2)}</span>
          {product.originalPrice && <span className="text-[#6B7280] text-sm line-through">${product.originalPrice.toFixed(2)}</span>}
          {isPin && <span className="text-xs text-[#52796F] font-medium">3/$10</span>}
        </div>
        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3.5 h-3.5 fill-[#E8552A] text-[#E8552A]" />
          <span className="text-xs text-[#6B7280]">{product.rating} ({product.reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Recommended Products (logged-in)                                   */
/* ------------------------------------------------------------------ */
function RecommendedSection() {
  const { isLoggedIn } = useAuth();
  const { wishlist } = useStore();

  if (!isLoggedIn) return null;

  const wishlistedProducts = ALL_PRODUCTS.filter(p => wishlist.includes(p.id));
  const wishlistedCategories = [...new Set(wishlistedProducts.map(p => p.category))];
  const recommended = ALL_PRODUCTS
    .filter(p => wishlistedCategories.includes(p.category) && !wishlist.includes(p.id))
    .slice(0, 4);
  const fallbackProducts = ALL_PRODUCTS.filter(p => !wishlist.includes(p.id)).sort((a, b) => b.rating - a.rating).slice(0, 4);
  const displayProducts = recommended.length > 0 ? recommended : fallbackProducts;
  if (displayProducts.length === 0) return null;

  return (
    <section className="py-20 bg-[#F0F7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">Recommended For You</h2>
            <p className="text-[#6B7280] mt-2 text-sm">Based on your wishlist and interests</p>
          </div>
          <Link to="/products" className="text-[#1A5A6B] font-medium text-sm hover:underline flex items-center gap-1">View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true, margin: '-50px' }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
