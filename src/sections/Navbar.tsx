import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Clock, Trash2, ArrowUpRight, Heart, Package, LogOut } from 'lucide-react';
import { useAuth } from '@/auth';
import { useStore } from '@/store';
import { useSiteSettings, getBundleText } from '@/lib/settings-context';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const STORAGE_KEY = 'gowild_search_history';
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveSearchHistory(history: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function addSearchQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;
  const history = getSearchHistory();
  const filtered = history.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
  saveSearchHistory([trimmed, ...filtered]);
}

function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount, cart, cartTotal, cartSavings, updateQuantity, removeFromCart, toggleWishlist, wishlistCount, cartDrawerOpen, setCartDrawerOpen, products } = useStore();
  const { settings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const activeProducts = products.filter(p => p.status !== 'inactive');

  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  // Track scroll position for glassmorphism
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load history when search opens
  useEffect(() => {
    if (searchOpen) {
      setSearchHistory(getSearchHistory());
    }
  }, [searchOpen]);

  // Filter products based on search query
  const searchResults = searchQuery.length >= 2
    ? activeProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchOpen]);



  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const navLinks = settings.navLinks.filter(l => l.visible);

  const handleSaveAndClose = useCallback(() => {
    addSearchQuery(searchQuery);
    setSearchHistory(getSearchHistory());
    setSearchOpen(false);
    setSearchQuery('');
  }, [searchQuery]);

  function handleResultClick(productId: string) {
    addSearchQuery(searchQuery);
    setSearchHistory(getSearchHistory());
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchQuery(searchQuery);
      setSearchHistory(getSearchHistory());
      setSearchOpen(false);
      setSearchQuery('');
      navigate('/products');
    }
  }

  function handleHistoryClick(query: string) {
    setSearchQuery(query);
    addSearchQuery(query);
    setSearchHistory(getSearchHistory());
    // Trigger search with this query
    const results = activeProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
    if (results.length === 1) {
      setSearchOpen(false);
      setSearchQuery('');
      navigate(`/product/${results[0].id}`);
    }
  }

  function handleClearHistory() {
    clearSearchHistory();
    setSearchHistory([]);
  }

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-[16px] border-b border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] h-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={settings.logo} alt={settings.storeName} className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-medium text-[#1A1A1A] hover:text-[#1A5A6B] transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1A5A6B] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              {searchOpen ? <X className="w-5 h-5 text-[#1A1A1A]" /> : <Search className="w-5 h-5 text-[#1A1A1A]" />}
            </button>

            {/* Search Dropdown */}
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] bg-white/80 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 overflow-hidden">
                <form onSubmit={handleSearchSubmit} className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search pins, stickers, neck warmers..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 focus:border-[#1A5A6B]"
                    />
                  </div>
                </form>

                <div className="max-h-[420px] overflow-y-auto">
                  {/* Search Results */}
                  {searchQuery.length >= 2 && searchResults.length > 0 && (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                          Results for &ldquo;{searchQuery}&rdquo;
                        </p>
                      </div>
                      {searchResults.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#6B7280]">{product.category}</span>
                              <span className="text-xs text-[#1A5A6B] font-semibold">${product.price.toFixed(2)}</span>
                              {product.isPin && (
                                <span className="text-[10px] bg-[#E8552A]/10 text-[#E8552A] px-1.5 py-0.5 rounded-full">3/$10</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* No Results */}
                  {searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="p-6 text-center">
                      <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">No results found</p>
                      <p className="text-xs text-gray-400 mt-1">Try &quot;pin&quot;, &quot;sticker&quot;, or &quot;neck&quot;</p>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {searchQuery.length < 2 && searchHistory.length > 0 && (
                    <>
                      <div className="px-3 py-2 flex items-center justify-between">
                        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                          Recent Searches
                        </p>
                        <button
                          onClick={handleClearHistory}
                          className="text-xs text-[#E85D4E] hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>
                      {searchHistory.map((query, i) => (
                        <button
                          key={`${query}-${i}`}
                          onClick={() => handleHistoryClick(query)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left group"
                        >
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-[#1A1A1A] flex-1">{query}</span>
                          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#1A5A6B] transition-colors" />
                        </button>
                      ))}
                    </>
                  )}

                  {/* Empty state when no history */}
                  {searchQuery.length < 2 && searchHistory.length === 0 && (
                    <div className="p-6 text-center">
                      <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Start searching</p>
                      <p className="text-xs text-gray-400 mt-1">Type to find pins, stickers, neck warmers...</p>
                      <div className="flex flex-wrap gap-2 mt-3 justify-center">
                        {['pin', 'sticker', 'neck warmer', 'lamp', 'mat'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => { setSearchQuery(tag); addSearchQuery(tag); }}
                            className="text-xs bg-gray-100 text-[#6B7280] px-2.5 py-1 rounded-full hover:bg-[#1A5A6B]/10 hover:text-[#1A5A6B] transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="p-2 border-t bg-gray-50">
                    <button
                      onClick={() => {
                        handleSaveAndClose();
                        navigate('/products');
                      }}
                      className="w-full text-center text-xs text-[#1A5A6B] font-medium py-1.5 hover:underline"
                    >
                      View all products
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Sheet open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative" aria-label="Cart">
                <ShoppingCart className="w-5 h-5 text-[#1A1A1A]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8552A] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-md bg-white overflow-hidden p-0 flex flex-col">
              <SheetHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b flex-shrink-0">
                <SheetTitle className="font-heading text-lg">Your Cart ({cartCount})</SheetTitle>
              </SheetHeader>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-6 py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <Link to="/products" onClick={() => setCartDrawerOpen(false)} className="mt-4 text-[#1A5A6B] font-medium hover:underline text-sm">Continue Shopping</Link>
                </div>
              ) : (
                <>
                  {/* Scrollable items list */}
                  <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3">
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div
                          key={`${item.product.id}-${item.color || 'no-color'}-${item.size || 'no-size'}`}
                          className="flex gap-3 p-2.5 bg-gray-50 rounded-lg items-center"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-[#1A1A1A] truncate leading-tight">{item.product.name}</h4>
                            <p className="text-xs text-gray-400 h-4">
                              {(item.color || item.size) ? [item.color, item.size].filter(Boolean).join(' / ') : '\u00A0'}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center border rounded bg-white">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                toggleWishlist(item.product.id);
                                removeFromCart(item.product.id);
                                toast.success(`${item.product.name} saved for later`);
                              }}
                              className="text-gray-400 hover:text-[#E8552A] p-1 transition-colors"
                              title="Save for later"
                            >
                              <Heart className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sticky summary at bottom */}
                  <div className="border-t bg-white px-5 sm:px-6 py-4 space-y-2 flex-shrink-0">
                    {cartSavings > 0 && (
                      <div className="space-y-1">
                        {getBundleText(settings, 'navLabel') && (
                          <div className="flex justify-between text-sm text-[#E8552A]">
                            <span>{getBundleText(settings, 'navLabel')}</span>
                            <span className="font-semibold">-${cartSavings.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => { setCartDrawerOpen(false); navigate('/checkout'); }}
                      className="block w-full bg-[#1A5A6B] text-white text-center py-3 rounded-full font-medium hover:bg-[#1A8DA3] transition-all text-sm"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => { setCartDrawerOpen(false); navigate('/products'); }}
                      className="block w-full text-center text-xs text-gray-600 hover:text-[#1A5A6B]"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>

          {/* Desktop: Account */}
          {isLoggedIn && (
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium text-[#1A1A1A] hidden lg:block">{user?.name?.split(' ')[0]}</span>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors"
                  >
                    <Package className="w-4 h-4 text-gray-400" /> My Account
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-gray-400" /> My Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto text-xs bg-[#E8552A] text-white px-1.5 py-0.5 rounded-full font-medium">{wishlistCount}</span>
                    )}
                  </Link>
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E85D4E] hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className={`md:hidden border-t transition-colors ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
            : 'bg-white border-gray-100'
        }`}>
          <nav className="flex flex-col p-4 space-y-3">
            {/* User profile header — shown at top when logged in */}
            {isLoggedIn && user && (
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-10 h-10 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-base font-medium text-[#1A1A1A] hover:text-[#1A5A6B] py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <div className="pt-3 border-t space-y-2">
                <Link to="/account" className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A] py-2" onClick={() => setMobileOpen(false)}>
                  <Package className="w-4 h-4" /> My Account
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A] py-2" onClick={() => setMobileOpen(false)}>
                  <Heart className="w-4 h-4" /> My Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto text-xs bg-[#E8552A] text-white px-1.5 py-0.5 rounded-full font-medium">{wishlistCount}</span>
                  )}
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 text-sm font-medium text-[#E85D4E] py-2 w-full text-left">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
