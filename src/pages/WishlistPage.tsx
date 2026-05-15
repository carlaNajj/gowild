import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/auth';
import { toast } from 'sonner';

export function WishlistPage() {
  const { wishlist, toggleWishlist, moveWishlistToCart, products } = useStore();
  const { isLoggedIn } = useAuth();

  const activeProducts = products.filter(p => p.status !== 'inactive');
  const wishlistProducts = activeProducts.filter(p => wishlist.includes(p.id));

  function handleRemove(productId: string, productName: string) {
    toggleWishlist(productId);
    toast.success(`${productName} removed from wishlist`);
  }

  function handleMoveToCart(productId: string, productName: string) {
    moveWishlistToCart(productId);
    toast.success(`${productName} added to cart`);
  }

  function handleAddAllToCart() {
    wishlistProducts.forEach(p => {
      moveWishlistToCart(p.id);
    });
    toast.success('All items moved to cart');
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gray-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-2">Your Wishlist is Empty</h1>
          <p className="text-gray-500 mb-6">
            {isLoggedIn
              ? "Save your favorite items here and they'll be waiting for you."
              : "Sign in to save your wishlist across devices, or start browsing to add items."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A5A6B] text-white rounded-full font-medium hover:bg-[#1A8DA3] transition-colors"
            >
              <Package className="w-4 h-4" /> Start Browsing
            </Link>
            {!isLoggedIn && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#1A5A6B] text-[#1A5A6B] rounded-full font-medium hover:bg-[#1A5A6B] hover:text-white transition-colors"
              >
                Sign In to Save
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">My Wishlist</h1>
          <p className="text-gray-500 mt-1">{wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved</p>
        </div>
        <button
          onClick={handleAddAllToCart}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A5A6B] text-white rounded-full font-medium hover:bg-[#1A8DA3] transition-colors self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" /> Add All to Cart
        </button>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistProducts.map(product => (
          <div
            key={product.id}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              {product.badge && (
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
              {product.originalPrice && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-[#E8552A] text-white px-2.5 py-1 rounded-full">
                  Sale
                </span>
              )}
              <button
                onClick={() => handleRemove(product.id, product.name)}
                className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-[#1A1A1A] group-hover:text-[#1A5A6B] transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <p className="text-xs text-gray-500 mt-1">{product.category}</p>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.reviewCount})</span>
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1A5A6B]">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleMoveToCart(product.id, product.name)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1A5A6B] text-white text-sm font-medium rounded-full hover:bg-[#1A8DA3] transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="mt-12 text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-[#1A5A6B] font-medium hover:underline"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
