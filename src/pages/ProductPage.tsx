import { useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Heart, ChevronDown, Minus, Plus, Truck, Shield, RefreshCw, Check, ShoppingBag,
  X, Camera, ImageIcon, ArrowLeft
} from 'lucide-react';
import { ALL_PRODUCTS, useStore, getProductImages } from '@/store';
import type { Product } from '@/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Star Rating Input                                                   */
/* ------------------------------------------------------------------ */
function StarRatingInput({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hover || rating) ? 'fill-[#E8552A] text-[#E8552A]' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500">
        {rating > 0 ? ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'][rating - 1] : 'Select a rating'}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Write Review Form                                                   */
/* ------------------------------------------------------------------ */
function WriteReviewForm({ product, onSubmitted }: { product: Product; onSubmitted: () => void }) {
  const { addReview } = useStore();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [userName, setUserName] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (rating === 0) newErrors.rating = 'Please select a rating';
    if (text.trim().length < 5) newErrors.text = 'Review must be at least 5 characters';
    if (userName.trim().length < 2) newErrors.userName = 'Please enter your name';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addReview({
      productId: product.id,
      productName: product.name,
      userName: userName.trim(),
      rating,
      text: text.trim(),
      photo: photo || undefined,
      date: new Date().toISOString().split('T')[0],
    });

    toast.success('Review submitted successfully!');
    setRating(0);
    setText('');
    setUserName('');
    setPhoto('');
    setErrors({});
    onSubmitted();
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Your Rating</label>
        <StarRatingInput rating={rating} onChange={setRating} />
        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Your Name</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 focus:border-[#1A5A6B]"
        />
        {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Your Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 focus:border-[#1A5A6B] resize-none"
        />
        {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Photo (optional)</label>
        {photo ? (
          <div className="relative inline-block">
            <img src={photo} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => setPhoto('')}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#1A5A6B] hover:bg-[#1A5A6B]/5 transition-all w-fit">
            <Camera className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Add a photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        )}
      </div>

      <Button type="submit" className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full px-8">
        Submit Review
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Product Page                                                   */
/* ------------------------------------------------------------------ */
export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const {
    addToCart, addMultipleToCart, toggleWishlist, isInWishlist, getProductReviews
  } = useStore();
  const product = ALL_PRODUCTS.find(p => p.id === id);

  // Read bundle query params for back navigation
  const [searchParams] = useSearchParams();
  const fromBundle = searchParams.get('from') === 'bundle';
  const bundlePins = searchParams.get('pins') || '';

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Reset state when product changes
  useMemo(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedColors([]);
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
      setAddedToCart(false);
      setShowReviewForm(false);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Product not found</h1>
          <Link to="/products" className="text-[#1A5A6B] mt-4 inline-block hover:underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);
  const productReviews = getProductReviews(product.id);
  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
    : product.rating.toFixed(1);

  const isPin = product.isPin;
  const isSticker = product.isBundle;
  const hasColorImages = !!product.colorImages;

  // Active color for image display
  const displayColor = selectedColors[0] || product.colors?.[0];
  const images = getProductImages(product, displayColor);
  const mainImage = images[selectedImage] || product.image;

  // Related products
  const relatedProducts = ALL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  // Toggle color selection (multi-select)
  function toggleColor(color: string) {
    setSelectedColors(prev => {
      const exists = prev.includes(color);
      if (exists) return prev.filter(c => c !== color);
      return [...prev, color];
    });
    setSelectedImage(0); // Reset to first image when color changes
  }

  function handleAddToCart() {
    if (!product) return;
    if (product.colors && product.colors.length > 0 && selectedColors.length === 0) {
      toast.error('Please select at least one color');
      return;
    }

    if (product.colors && selectedColors.length > 0) {
      // Multi-color: add each selected color as separate cart item
      const items = selectedColors.map(color => ({
        product: product!,
        quantity,
        color,
        size: selectedSize || undefined,
      }));
      addMultipleToCart(items);
      toast.success(`${selectedColors.length} color(s) of ${product.name} added to cart!`);
    } else {
      addToCart({ product: product!, quantity, color: selectedColors[0], size: selectedSize || undefined });
      toast.success(`${product.name} added to cart!`);
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  // Distribution of ratings
  const ratingDist = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(r => { dist[r.rating as keyof typeof dist]++; });
    return dist;
  }, [productReviews]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Bundle Banner */}
        {isPin && fromBundle && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-[#F5F0E8] border border-[#1A5A6B]/20 rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1A5A6B]/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[#1A5A6B]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">Building a bundle?</p>
                <p className="text-xs text-[#6B7280]">{bundlePins.split(',').filter(Boolean).length} pins selected</p>
              </div>
            </div>
            <Link
              to={`/pins-bundle?pins=${bundlePins}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A5A6B] text-white rounded-full text-sm font-semibold hover:bg-[#1A8DA3] transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Bundle
            </Link>
          </motion.div>
        )}

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#6B7280] mb-8">
          <Link to="/" className="hover:text-[#1A5A6B]">Home</Link>
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          <Link to="/products" className="hover:text-[#1A5A6B]">Shop</Link>
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          <span className="text-[#1A1A1A] font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden relative">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && (
                <span className={`absolute top-4 left-4 text-white text-sm font-semibold px-4 py-1.5 rounded-full ${
                  product.badge === 'Sale' ? 'bg-[#E85D4E]' : product.badge === 'New' ? 'bg-[#52796F]' : 'bg-[#E8552A]'
                }`}>
                  {product.badge}
                </span>
              )}
              {isSticker && (
                <div className="absolute bottom-4 left-4 bg-[#1A5A6B] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {product.bundleSize} Stickers Inside
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={`${displayColor}-${i}`}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === i ? 'border-[#1A5A6B]' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {hasColorImages && displayColor && (
              <p className="text-xs text-gray-500 mt-2">Showing images for {displayColor}</p>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#1A5A6B] bg-[#1A5A6B]/10 px-2 py-1 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              {isPin && (
                <span className="text-xs font-medium text-[#52796F] bg-[#52796F]/10 px-2 py-1 rounded-full">
                  Bundle & Save
                </span>
              )}
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#1A1A1A]">{product.name}</h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? 'fill-[#E8552A] text-[#E8552A]' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-[#6B7280]">{avgRating} ({productReviews.length || product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-[#1A1A1A]">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-[#6B7280] line-through">${product.originalPrice.toFixed(2)}</span>
                  <span className="text-sm font-semibold text-[#E85D4E] bg-[#E85D4E]/10 px-2 py-1 rounded-full">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <span className="inline-flex items-center gap-1.5 mt-4 bg-[#52796F]/15 text-[#52796F] text-sm font-medium px-3 py-1.5 rounded-full">
              <Check className="w-4 h-4" /> In Stock ({product.stock} left)
            </span>

            <p className="text-[#6B7280] mt-6 leading-relaxed">{product.description}</p>

            {/* Pin Bundle Info - subtle */}
            {isPin && (
              <div className="mt-6 bg-[#F5F0E8] border border-[#E8552A]/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8552A]/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-[#E8552A]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1A1A1A]">Bundle & Save — pick any 3 pins</p>
                    <p className="text-xs text-[#6B7280]">Mix and match on the shop page. Discount applied automatically in cart.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-sm">
                    Color{product.colors.length > 1 ? 's' : ''}:
                    {selectedColors.length > 0 && (
                      <span className="font-normal text-[#6B7280] ml-1">{selectedColors.join(', ')}</span>
                    )}
                  </h3>
                  {product.colors.length > 1 && (
                    <span className="text-xs text-[#6B7280]">{selectedColors.length} of {product.colors.length} selected</span>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map(color => {
                    const isSelected = selectedColors.includes(color);
                    // Color swatch for visual colors
                    const colorMap: Record<string, string> = {
                      Red: '#DC2626', Blue: '#1E40AF', Black: '#1A1A1A',
                      Teal: '#1A5A6B', Orange: '#E8552A',
                    };
                    const swatchColor = colorMap[color];
                    return (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-[#1A5A6B] bg-[#1A5A6B]/5 text-[#1A5A6B]'
                            : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'
                        }`}
                      >
                        {swatchColor && (
                          <span
                            className={`w-4 h-4 rounded-full border border-gray-200 ${isSelected ? 'ring-2 ring-[#1A5A6B] ring-offset-1' : ''}`}
                            style={{ backgroundColor: swatchColor }}
                          />
                        )}
                        {color}
                        {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    );
                  })}
                </div>
                {selectedColors.length > 0 && (
                  <p className="text-xs text-[#52796F] mt-2">
                    Each selected color will be added as a separate item in cart
                  </p>
                )}
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-heading font-semibold text-sm mb-3">
                  Size: <span className="font-normal text-[#6B7280]">{selectedSize}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-[#1A5A6B] text-white border-[#1A5A6B]'
                          : 'border-gray-300 text-[#1A1A1A] hover:border-[#1A5A6B] hover:text-[#1A5A6B]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex gap-4 mt-8">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <Button
                onClick={handleAddToCart}
                className={`flex-1 rounded-full font-semibold text-base py-6 transition-all ${
                  addedToCart ? 'bg-[#52796F] hover:bg-[#52796F]' : 'bg-[#1A5A6B] hover:bg-[#1A8DA3] hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                {addedToCart ? (
                  <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Added to Cart</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Add to Cart &mdash; ${(product.price * quantity).toFixed(2)}</span>
                )}
              </Button>
              {/* Wishlist button with clear states */}
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast(isWished ? 'Removed from wishlist' : 'Added to wishlist');
                }}
                className={`w-14 rounded-lg border flex items-center justify-center transition-all ${
                  isWished
                    ? 'bg-[#E85D4E]/10 border-[#E85D4E] text-[#E85D4E]'
                    : 'border-gray-200 text-gray-400 hover:border-[#E85D4E]/40 hover:text-[#E85D4E] hover:bg-[#E85D4E]/5'
                }`}
                title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 transition-all ${isWished ? 'fill-[#E85D4E] scale-110' : ''}`} />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'Orders $50+' },
                { icon: Shield, label: 'Quality Guarantee', desc: '100% inspected' },
                { icon: RefreshCw, label: '30-Day Returns', desc: 'Hassle-free' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-5 h-5 mx-auto text-[#1A5A6B]" />
                  <p className="text-xs font-medium mt-2">{item.label}</p>
                  <p className="text-xs text-[#6B7280]">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-16 border-t">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Rating Summary */}
            <div className="lg:w-80 flex-shrink-0">
              <h2 className="font-heading text-2xl font-bold text-[#1A1A1A] mb-6">Customer Reviews</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-5xl font-bold text-[#1A1A1A]">{avgRating}</div>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? 'fill-[#E8552A] text-[#E8552A]' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-[#6B7280] mt-1">Based on {productReviews.length} reviews</p>

                {/* Rating distribution */}
                <div className="mt-4 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3">{star}</span>
                      <Star className="w-3 h-3 fill-[#E8552A] text-[#E8552A]" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E8552A] rounded-full transition-all"
                          style={{ width: `${productReviews.length > 0 ? (ratingDist[star as keyof typeof ratingDist] / productReviews.length * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">{ratingDist[star as keyof typeof ratingDist]}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="mt-6 w-full bg-[#1A5A6B] text-white px-6 py-3 rounded-full font-medium hover:bg-[#1A8DA3] transition-all"
                >
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="flex-1">
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border rounded-xl p-6 mb-8 shadow-sm"
                >
                  <h3 className="font-semibold text-lg mb-4">Write a Review for {product.name}</h3>
                  <WriteReviewForm product={product} onSubmitted={() => setShowReviewForm(false)} />
                </motion.div>
              )}

              {productReviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No reviews yet</p>
                  <p className="text-gray-400 text-sm mt-1">Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {productReviews.map(review => (
                    <div key={review.id} className="pb-6 border-b last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-semibold text-sm">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{review.userName}</p>
                            <p className="text-xs text-[#6B7280]">{review.date}</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#6B7280] bg-gray-100 px-2 py-1 rounded-full">
                          Verified Purchase
                        </span>
                      </div>
                      <div className="flex gap-1 mt-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#E8552A] text-[#E8552A]' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-[#6B7280] text-sm mt-2 leading-relaxed">{review.text}</p>
                      {review.photo && (
                        <img src={review.photo} alt="Review photo" className="mt-3 w-32 h-32 object-cover rounded-lg border" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t">
            <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}${fromBundle && bundlePins ? `?from=bundle&pins=${bundlePins}` : ''}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:bg-[#E85D4E] hover:text-white transition-all"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-[#6B7280] text-[10px] uppercase tracking-wider">{p.category}</p>
                    <h3 className="font-heading font-semibold text-xs mt-1 truncate">{p.name}</h3>
                    <span className="font-bold text-sm mt-1 block">${p.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
