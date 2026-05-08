import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, Tag, Percent, ChevronRight, Pin } from 'lucide-react';
import { ALL_PRODUCTS, PIN_PRODUCTS, useStore } from '@/store';

const deals = [
  {
    title: 'Pick Any 3 Pins for $10',
    subtitle: 'Mix & match from 20 enamel pin designs',
    savings: 'Save up to 40%',
    badge: 'BUNDLE',
    color: 'from-[#1A5A6B] to-[#1A8DA3]',
    link: '/products#pins',
    icon: Pin,
    cta: 'Build Your Bundle',
  },
  {
    title: 'Picnic Mat Sale',
    subtitle: 'Waterproof picnic mat now $34.99',
    savings: 'Was $44.99',
    badge: 'SALE',
    color: 'from-[#E8552A] to-[#C4451D]',
    link: '/product/mat1',
    icon: Tag,
    cta: 'Shop Now',
  },
  {
    title: 'Free Shipping Over $50',
    subtitle: 'All orders ship free when you spend $50+',
    savings: 'Save $5.99',
    badge: 'SHIPPING',
    color: 'from-[#52796F] to-[#3d5c54]',
    link: '/products',
    icon: Percent,
    cta: 'Start Shopping',
  },
];

const saleProducts = ALL_PRODUCTS.filter(p => p.originalPrice || p.isPin).slice(0, 8);

export function DealsPage() {
  const { toggleWishlist, wishlist } = useStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#1A5A6B] to-[#1A8DA3] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Limited Time Offers
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
              GoWild Deals
            </h1>
            <p className="text-white/80 mt-3 text-lg max-w-xl mx-auto">
              Bundle your pins, grab discounted gear, and save on every adventure.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Deal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {deals.map((deal, i) => (
            <motion.div
              key={deal.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Link
                to={deal.link}
                className={`block bg-gradient-to-br ${deal.color} rounded-2xl p-6 text-white h-full hover:shadow-xl transition-all hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                    {deal.badge}
                  </span>
                  <deal.icon className="w-6 h-6 text-white/60" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{deal.title}</h3>
                <p className="text-white/80 text-sm mb-1">{deal.subtitle}</p>
                <p className="text-white/60 text-xs mb-4">{deal.savings}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-full">
                  {deal.cta} <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Deal: Pin Bundle */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">Pin Bundle: 3 for $10</h2>
              <p className="text-sm text-[#6B7280] mt-1">Our most popular deal. Mix any designs you love.</p>
            </div>
            <Link to="/products#pins" className="text-[#1A5A6B] font-medium text-sm hover:underline flex items-center gap-1">
              Shop All Pins <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {PIN_PRODUCTS.slice(0, 12).map((pin, i) => (
              <motion.div
                key={pin.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                <Link to="/products#pins" className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="aspect-square bg-gray-50">
                    <img src={pin.image} alt={pin.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 bg-white">
                    <h4 className="text-xs font-medium text-[#1A1A1A] truncate">{pin.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-[#1A5A6B]">${pin.price.toFixed(2)}</span>
                      <span className="text-[10px] bg-[#E8552A]/10 text-[#E8552A] px-1.5 py-0.5 rounded-full font-medium">
                        3/$10
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Discounted Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">On Sale Now</h2>
              <p className="text-sm text-[#6B7280] mt-1">Limited-time price drops on fan favorites.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleProducts.map((product, i) => {
              const isWished = wishlist.includes(product.id);
              const isPin = product.category === 'Pins';
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {(product.originalPrice || isPin) && (
                        <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${
                          product.originalPrice ? 'bg-[#E85D4E]' : 'bg-[#E8552A]'
                        }`}>
                          {product.originalPrice ? `SAVE $${(product.originalPrice - product.price).toFixed(0)}` : '3/$10'}
                        </span>
                      )}
                      <button
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:bg-[#E85D4E] hover:text-white transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${isWished ? 'fill-[#E85D4E] text-[#E85D4E]' : ''}`} />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-[#6B7280] text-[10px] uppercase tracking-wider font-medium">{product.category}</p>
                      <h3 className="font-heading font-semibold text-sm text-[#1A1A1A] mt-1 truncate group-hover:text-[#1A5A6B] transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-[#1A1A1A]">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <>
                            <span className="text-[#6B7280] text-sm line-through">${product.originalPrice.toFixed(2)}</span>
                            <span className="text-xs text-[#E85D4E] font-medium">
                              {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                            </span>
                          </>
                        )}
                        {isPin && <span className="text-xs text-[#52796F] font-medium">3/$10</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-3.5 h-3.5 fill-[#E8552A] text-[#E8552A]" />
                        <span className="text-xs text-[#6B7280]">{product.rating} ({product.reviewCount})</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
