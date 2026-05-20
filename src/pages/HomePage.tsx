import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/lib/settings-context';
import { motion } from 'framer-motion';
import { ChevronDown, Star, Heart, Quote, Tag } from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useStore } from '@/store';
import { useAuth } from '@/auth';
import { toast } from 'sonner';

export function HomePage() {
  const { settings } = useSiteSettings();
  const { products, reviews } = useStore();

  const activeProducts = products.filter(p => p.status !== 'inactive');

  const featuredProducts = [
    ...new Set([
      ...settings.bestSellerIds,
      ...activeProducts.filter(p => p.isBestSeller).map(p => p.id),
    ]),
  ]
    .map(id => activeProducts.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const newProducts = settings.newArrivalIds
    .map(id => activeProducts.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const visiblePromotions = settings.promotions.filter(p => p.visible);

  /* Real approved reviews for homepage */
  const approvedReviews = reviews.filter(r => r.approved !== false);
  const featuredReviews = settings.featuredReviewIds.length > 0
    ? settings.featuredReviewIds
        .map(id => approvedReviews.find(r => r.id === id))
        .filter((r): r is NonNullable<typeof r> => !!r)
    : approvedReviews.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] overflow-hidden flex items-center justify-center">
        <motion.div className="absolute inset-0" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}>
          <img src={settings.heroImage} alt="Mountain landscape" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        </motion.div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-[#E8552A] uppercase tracking-[0.25em] text-sm font-semibold mb-4">{settings.heroTagline}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">{settings.heroTitle}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }} className="text-white/90 text-lg mt-6 max-w-xl mx-auto leading-relaxed">{settings.heroSubtitle}</motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }} className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/products" className="bg-white text-[#1A5A6B] px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg inline-block">{settings.heroCtaPrimary}</Link>
            <Link to="/products" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-white/15 transition-all inline-block">{settings.heroCtaSecondary}</Link>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronDown className="w-5 h-5" /></motion.div>
        </motion.div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">{settings.sectionTitles.bestSellers.title}</h2>
              <p className="text-[#6B7280] mt-2 text-sm">{settings.sectionTitles.bestSellers.subtitle}</p>
            </div>
            <Link to="/products" className="text-[#1A5A6B] font-medium text-sm hover:underline flex items-center gap-1 self-start sm:self-auto">View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></Link>
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

      {/* Categories CTA */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">{settings.sectionTitles.categories.title}</h2>
          <p className="text-[#6B7280] mt-3 text-base max-w-xl mx-auto">{settings.sectionTitles.categories.subtitle}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-6 bg-[#1A5A6B] text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-[#1A8DA3] transition-all hover:scale-[1.02] shadow-lg"
          >
            Explore Categories <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </Link>
        </div>
      </section>

      {/* Recommended For You */}
      <RecommendedSection />

      {/* Promotional Banners */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">{settings.sectionTitles.promotions.title}</h2>
            <p className="text-[#6B7280] mt-2">{settings.sectionTitles.promotions.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visiblePromotions.map((promo, i) => (
              <motion.div key={promo.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <Link to={promo.link} className={`group block bg-gradient-to-br ${promo.gradient} rounded-2xl p-6 text-white h-full hover:shadow-xl transition-all hover:-translate-y-1`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">{promo.badge}</span>
                    <DynamicIcon name={promo.icon} className="w-6 h-6 text-white/60" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">{promo.title}</h3>
                  <p className="text-white/80 text-sm mb-1">{promo.subtitle}</p>
                  <p className="text-white/60 text-xs mb-4">{promo.savings}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 group-hover:bg-white/30 transition-colors px-4 py-2 rounded-full">{promo.cta} <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Deals */}
      {settings.productBundles.filter(b => b.active).length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">Bundle Deals</h2>
              <p className="text-[#6B7280] mt-2">Buy more, save more — exclusive bundle pricing</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settings.productBundles.filter(b => b.active).map((bundle, i) => {
                const bundleProducts = activeProducts.filter(p => bundle.productIds.includes(p.id)).slice(0, 4);
                return (
                  <motion.div key={bundle.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                    <Link to="/products" className="group block bg-gradient-to-br from-[#1A5A6B] to-[#1A8DA3] rounded-2xl p-6 text-white h-full hover:shadow-xl transition-all hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Bundle</span>
                        <Tag className="w-6 h-6 text-white/60" />
                      </div>
                      <h3 className="font-heading text-xl font-bold mb-2">{bundle.name}</h3>
                      <p className="text-white/80 text-sm mb-3">{bundle.bannerText || `Buy ${bundle.quantity} for $${bundle.price.toFixed(2)}`}</p>
                      {bundleProducts.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          {bundleProducts.map(p => (
                            <img key={p.id} src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded-full border-2 border-white/30" />
                          ))}
                          {bundle.productIds.length > 4 && (
                            <span className="text-xs text-white/60">+{bundle.productIds.length - 4} more</span>
                          )}
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 group-hover:bg-white/30 transition-colors px-4 py-2 rounded-full">
                        Shop Bundle <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">{settings.sectionTitles.newArrivals.title}</h2>
              <p className="text-[#6B7280] mt-2 text-sm">{settings.sectionTitles.newArrivals.subtitle}</p>
            </div>
            <Link to="/products" className="text-[#1A5A6B] font-medium text-sm hover:underline flex items-center gap-1 self-start sm:self-auto">View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></Link>
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
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">{settings.sectionTitles.reviews.title}</h2>
            <p className="text-[#6B7280] mt-3">{settings.sectionTitles.reviews.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredReviews.length > 0 ? featuredReviews.map((review, i) => (
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
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center text-xs font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">{review.userName}</p>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                    </div>
                    <span className="self-start text-xs text-[#1A5A6B] bg-[#1A5A6B]/10 px-3 py-1 rounded-full font-medium">
                      Review for {review.productName}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )) : settings.reviewHighlights.map((review, i) => (
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
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center text-xs font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">{review.name}</p>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                    </div>
                    <span className="self-start text-xs text-[#1A5A6B] bg-[#1A5A6B]/10 px-3 py-1 rounded-full font-medium">
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
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white">{settings.sectionTitles.bundleBanner.title}</h2>
            <p className="text-white/80 mt-4 text-base max-w-xl mx-auto">{settings.sectionTitles.bundleBanner.subtitle}</p>
            <Link to="/products" className="inline-block mt-8 bg-white text-[#E8552A] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg">{settings.sectionTitles.bundleBanner.cta}</Link>
          </motion.div>
        </div>
      </section>

      {/* Brand Promise */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">{settings.sectionTitles.brandPromise.title}</h2>
            <p className="text-[#6B7280] mt-3">{settings.sectionTitles.brandPromise.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {settings.brandPromises.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="w-14 h-14 mx-auto bg-[#1A5A6B]/15 rounded-xl flex items-center justify-center text-[#1A5A6B]">
                  <DynamicIcon name={f.icon} className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-semibold text-[#1A1A1A] mt-4">{f.title}</h3>
                <p className="text-[#6B7280] text-sm mt-2 leading-relaxed">{f.description.replace('{threshold}', String(settings.freeShippingThreshold))}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Wild Club */}
      <section className="py-16 bg-[#1A4A52]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">{settings.newsletterTitle}</h2>
            <p className="text-white/70 mt-3 text-sm md:text-base max-w-lg mx-auto">{settings.newsletterSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-0 mt-8 max-w-md mx-auto">
              <input
                type="email"
                placeholder={settings.newsletterPlaceholder}
                className="flex-1 px-5 py-3 rounded-l-full sm:rounded-r-none rounded-r-full sm:rounded-l-full text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8552A]"
              />
              <button
                onClick={() => toast.success('Thanks for subscribing!')}
                className="bg-[#E8552A] text-white px-6 py-3 rounded-r-full sm:rounded-l-none rounded-l-full sm:rounded-r-full font-medium text-sm hover:bg-[#C4451D] transition-colors mt-2 sm:mt-0"
              >
                {settings.newsletterCta}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Card with clear wishlist states                            */
/* ------------------------------------------------------------------ */
function ProductCard({ product }: { product: ReturnType<typeof useStore>['products'][0] }) {
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
/*  Recommended Products (logged-in or CMS-selected)                   */
/* ------------------------------------------------------------------ */
function RecommendedSection() {
  const { isLoggedIn } = useAuth();
  const { wishlist, products } = useStore();
  const { settings } = useSiteSettings();

  const activeProducts = products.filter(p => p.status !== 'inactive');

  /* Logged-in: algorithmic based on wishlist categories */
  const wishlistedProducts = activeProducts.filter(p => wishlist.includes(p.id));
  const wishlistedCategories = [...new Set(wishlistedProducts.map(p => p.category))];
  const recommended = activeProducts
    .filter(p => wishlistedCategories.includes(p.category) && !wishlist.includes(p.id))
    .slice(0, 4);
  const fallbackProducts = activeProducts.filter(p => !wishlist.includes(p.id)).sort((a, b) => b.rating - a.rating).slice(0, 4);
  const algorithmicProducts = recommended.length > 0 ? recommended : fallbackProducts;

  /* Not logged-in or no algorithmic results: use CMS-selected */
  const cmsProducts = settings.recommendedIds
    .map(id => activeProducts.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const displayProducts = isLoggedIn && algorithmicProducts.length > 0 ? algorithmicProducts : cmsProducts;

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-20 bg-[#F0F7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">{settings.sectionTitles.recommended.title}</h2>
            <p className="text-[#6B7280] mt-2 text-sm">{settings.sectionTitles.recommended.subtitle}</p>
          </div>
          <Link to="/products" className="text-[#1A5A6B] font-medium text-sm hover:underline flex items-center gap-1 self-start sm:self-auto">View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></Link>
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
