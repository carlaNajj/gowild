import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowLeft, Star, Heart, Minus, Plus, Eye } from 'lucide-react';
import { PIN_PRODUCTS, useStore, calculateBundlePrice } from '@/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PIN_IMAGES = ['/pin-mountain.jpg', '/pin-campfire.jpg', '/pin-compass.jpg', '/pin-bear.jpg', '/pin-tent.jpg', '/pin-hiker.jpg', '/pin-canoe.jpg', '/pin-deer.jpg'];

export function PinsBundlePage() {
  const [searchParams] = useSearchParams();
  const { addMultipleToCart, toggleWishlist, isInWishlist, setCartDrawerOpen } = useStore();

  // Parse URL: "pins=p1,p1,p1,p2" means 3x p1, 1x p2
  const pinIdsParam = searchParams.get('pins') || '';
  const [selectedPins, setSelectedPins] = useState<Map<string, number>>(() => {
    const counts = new Map<string, number>();
    pinIdsParam.split(',').forEach(id => {
      if (id && PIN_PRODUCTS.some(p => p.id === id)) {
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    });
    return counts;
  });

  const pinTotalQty = useMemo(() => {
    let total = 0;
    selectedPins.forEach(qty => total += qty);
    return total;
  }, [selectedPins]);

  const bundleCalc = useMemo(() => calculateBundlePrice(pinTotalQty), [pinTotalQty]);

  // Detail modal state
  const [detailPinId, setDetailPinId] = useState<string | null>(null);
  const detailProduct = PIN_PRODUCTS.find(p => p.id === detailPinId);

  function incrementPin(id: string) {
    setSelectedPins(prev => {
      const next = new Map(prev);
      next.set(id, (next.get(id) || 0) + 1);
      return next;
    });
  }

  function decrementPin(id: string) {
    setSelectedPins(prev => {
      const next = new Map(prev);
      const current = next.get(id) || 0;
      if (current <= 1) next.delete(id);
      else next.set(id, current - 1);
      return next;
    });
  }

  function addAllToCart() {
    if (pinTotalQty === 0) {
      toast.error('Please select at least one pin');
      return;
    }
    const items: { product: typeof PIN_PRODUCTS[0]; quantity: number; bundlePrice?: number }[] = [];
    let bundleSlotsRemaining = Math.floor(pinTotalQty / 3) * 3;

    PIN_PRODUCTS.forEach(product => {
      const qty = selectedPins.get(product.id) || 0;
      if (qty > 0) {
        for (let i = 0; i < qty; i++) {
          items.push({
            product,
            quantity: 1,
            bundlePrice: bundleSlotsRemaining > 0 ? 10 / 3 : undefined,
          });
          bundleSlotsRemaining--;
        }
      }
    });

    addMultipleToCart(items);
    setCartDrawerOpen(true);
    toast.success(`${pinTotalQty} pin${pinTotalQty > 1 ? 's' : ''} added! Saved $${bundleCalc.savings.toFixed(2)}`);
  }

  // Build flat list of selected pins for display (duplicates shown)
  const selectedPinsList = useMemo(() => {
    const list: typeof PIN_PRODUCTS[0][] = [];
    PIN_PRODUCTS.forEach(p => {
      const qty = selectedPins.get(p.id) || 0;
      for (let i = 0; i < qty; i++) list.push(p);
    });
    return list;
  }, [selectedPins]);

  // Unique selected products for the expandable list
  const selectedProducts = PIN_PRODUCTS.filter(p => (selectedPins.get(p.id) || 0) > 0);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A5A6B] to-[#1A8DA3] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={'/products?category=Pins&pins=' + selectedPinsList.map(p => p.id).join(',')}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Build Your Pin Bundle</h1>
          <p className="text-white/80 mt-2">Pick any 3 pins for $10. Mix and match your favorites.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Selected pins thumbnails — each quantity shown individually */}
        {pinTotalQty > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-semibold">Selected Pins ({pinTotalQty})</h2>
              <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setSelectedPins(new Map())}>
                <X className="w-3 h-3 mr-1" /> Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedPinsList.map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="relative flex-shrink-0">
                  <Link
                    to={`/product/${product.id}?from=bundle&pins=${selectedPinsList.map(p => p.id).join(',')}`}
                    className="block w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border-2 border-[#1A5A6B] hover:shadow-md transition-all"
                  >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </Link>
                  <button
                    onClick={() => decrementPin(product.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected pins list with quantity + expand for details */}
        {pinTotalQty > 0 && (
          <div className="mb-10 border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {pinTotalQty} pin{pinTotalQty !== 1 ? 's' : ''} in bundle
              </span>
            </div>
            <div className="divide-y">
              {selectedProducts.map(product => {
                const qty = selectedPins.get(product.id) || 0;
                return (
                  <div key={product.id} className="bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                          <span className="text-[10px] bg-[#1A5A6B] text-white font-bold px-1.5 py-0.5 rounded-full">x{qty}</span>
                        </div>
                        <p className="text-xs text-gray-400">${product.price.toFixed(2)} each</p>
                      </div>
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => decrementPin(product.id)}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{qty}</span>
                        <button
                          onClick={() => incrementPin(product.id)}
                          className="w-7 h-7 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center hover:bg-[#1A8DA3] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed mt-2">{product.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.specs?.map(s => (
                        <span key={s.label} className="text-[10px] text-[#6B7280] bg-gray-50 px-2 py-0.5 rounded-full">{s.label}: {s.value}</span>
                      ))}
                      <span className="flex items-center gap-0.5 text-[10px] text-[#6B7280]">
                        <Star className="w-2.5 h-2.5 fill-[#E8552A] text-[#E8552A]" /> {product.rating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider with Select All */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200" />
          <button
            onClick={() => {
              if (selectedPins.size === PIN_PRODUCTS.length) {
                setSelectedPins(new Map());
              } else {
                const all = new Map<string, number>();
                PIN_PRODUCTS.forEach(p => all.set(p.id, 1));
                setSelectedPins(all);
              }
            }}
            className="text-sm font-medium text-[#1A5A6B] hover:text-[#1A8DA3] hover:underline transition-colors whitespace-nowrap"
          >
            {selectedPins.size === PIN_PRODUCTS.length ? 'Deselect All' : 'Select All 20'}
          </button>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* All pins grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {PIN_PRODUCTS.map((product, i) => {
            const qty = selectedPins.get(product.id) || 0;
            const isSelected = qty > 0;
            const isWished = isInWishlist(product.id);
            const img = PIN_IMAGES[i % PIN_IMAGES.length];

            return (
              <div
                key={product.id}
                className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? 'ring-[3px] ring-[#1A5A6B] shadow-lg shadow-[#1A5A6B]/20'
                    : 'ring-1 ring-gray-100 hover:ring-gray-300 hover:shadow-md'
                }`}
              >
                {/* Selection badge with quantity */}
                <div className={`absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  isSelected ? 'bg-[#1A5A6B] border-[#1A5A6B] text-white' : 'bg-white/80 backdrop-blur-sm border-gray-300'
                }`}>
                  {isSelected ? <span className="text-[10px] font-bold">{qty}</span> : null}
                </div>

                {/* Wishlist */}
                <button
                  className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isWished ? 'bg-[#E85D4E] text-white' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-[#E85D4E]/10 hover:text-[#E85D4E]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                    toast(isWished ? 'Removed from wishlist' : 'Added to wishlist');
                  }}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-white' : ''}`} />
                </button>

                {/* Product image with floating stepper overlay at bottom center */}
                <div className="aspect-square bg-white relative">
                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                  {/* Floating quantity stepper - centered at bottom of image */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md px-1.5 py-1">
                    {isSelected && (
                      <button
                        onClick={(e) => { e.stopPropagation(); decrementPin(product.id); }}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSelected && (
                      <span className="text-xs font-bold w-5 text-center text-[#1A1A1A]">{qty}</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); incrementPin(product.id); }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#1A5A6B] text-white hover:bg-[#1A8DA3]' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2 bg-white">
                  <h3 className="text-[11px] font-semibold text-[#1A1A1A] truncate leading-tight">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-[#1A5A6B]">${product.price.toFixed(2)}</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-[#E8552A] text-[#E8552A]" />
                      <span className="text-[10px] text-[#6B7280]">{product.rating}</span>
                    </div>
                  </div>
                  {/* Show Details */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDetailPinId(product.id); }}
                    className="mt-1.5 text-[10px] text-[#1A5A6B] font-medium hover:underline flex items-center gap-0.5"
                  >
                    <Eye className="w-2.5 h-2.5" /> Show Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom action bar */}
      <AnimatePresence>
        {pinTotalQty > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              {/* Count */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A5A6B]/10 flex items-center justify-center text-[#1A5A6B] font-bold text-sm">
                  {pinTotalQty}
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-sm text-[#1A1A1A]">pin{pinTotalQty !== 1 ? 's' : ''} selected</p>
                </div>
              </div>

              {/* Price + Add to Cart */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-right">
                  <p className="text-xs text-[#6B7280] line-through">${bundleCalc.regularPrice.toFixed(2)}</p>
                  <p className="text-lg sm:text-2xl font-bold text-[#1A5A6B]">${bundleCalc.bundlePrice.toFixed(2)}</p>
                </div>
                {bundleCalc.savings > 0 && (
                  <p className="hidden md:block text-xs text-[#E8552A] font-medium">Save ${bundleCalc.savings.toFixed(2)}</p>
                )}
                <Button
                  onClick={addAllToCart}
                  className="bg-[#E8552A] hover:bg-[#C4451D] rounded-full px-5 sm:px-8 py-5 sm:py-5 font-semibold text-sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pin Detail Modal */}
      <AnimatePresence>
        {detailProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailPinId(null)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-[10vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg font-bold">{detailProduct.name}</h3>
                  <button onClick={() => setDetailPinId(null)} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Image */}
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4">
                  <img src={detailProduct.image} alt={detailProduct.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <p className="text-xs text-[#6B7280] uppercase tracking-wider">{detailProduct.category}</p>
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <span className="text-xl font-bold text-[#1A5A6B]">${detailProduct.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#E8552A] text-[#E8552A]" />
                    <span className="text-sm text-[#6B7280]">{detailProduct.rating} ({detailProduct.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{detailProduct.description}</p>

                {/* Specs */}
                {detailProduct.specs && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {detailProduct.specs.map(s => (
                      <span key={s.label} className="text-xs bg-[#F5F0E8] text-[#6B7280] px-3 py-1.5 rounded-full">
                        {s.label}: {s.value}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bundle info */}
                <div className="bg-[#F5F0E8] rounded-lg p-3 text-center mb-4">
                  <p className="text-xs text-[#6B7280]">Part of the 3-for-$10 bundle deal</p>
                </div>

                {/* Current quantity in bundle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">In your bundle:</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{selectedPins.get(detailProduct.id) || 0} pcs</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
