import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ShoppingCart, ArrowRight, Tag, Pin } from 'lucide-react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function CartPage() {
  const { cart, cartTotal, cartSavings, updateQuantity, removeFromCart } = useStore();
  const [promoCode, setPromoCode] = useState('');
  const shipping = cartTotal > 50 ? 0 : 5.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  // Auto-bundle savings from store
  const bundleSavings = cartSavings;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#1A1A1A]">Shopping Cart</h1>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Your cart is empty</h2>
            <p className="text-[#6B7280] mt-2 mb-8">Time to gear up for your next adventure.</p>
            <Link to="/products" className="bg-[#1A5A6B] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1A8DA3] transition-all hover:scale-[1.02] inline-flex items-center gap-2">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-[#6B7280]">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                <Link to="/products" className="text-sm text-[#1A5A6B] font-medium hover:underline">Continue Shopping</Link>
              </div>

              {/* Bundle savings banner */}
              {bundleSavings > 0 && (
                <div className="mb-4 bg-[#52796F]/10 border border-[#52796F]/20 rounded-lg p-3 flex items-center gap-3">
                  <Pin className="w-5 h-5 text-[#52796F]" />
                  <p className="text-sm text-[#52796F] font-medium">
                    You saved ${bundleSavings.toFixed(2)} with pin bundle pricing! 3 pins for $10 deal applied.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {cart.map((item, i) => (
                  <motion.div key={`${item.product.id}-${item.color}-${item.size}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4 sm:gap-6 bg-gray-50 rounded-xl p-4">
                    <Link to={`/product/${item.product.id}`} className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/product/${item.product.id}`} className="font-heading font-semibold text-[#1A1A1A] hover:text-[#1A5A6B] transition-colors text-sm sm:text-base">{item.product.name}</Link>
                          {(item.color || item.size) && <p className="text-xs text-[#6B7280] mt-1">{[item.color, item.size].filter(Boolean).join(' / ')}</p>}
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-[#E85D4E] transition-colors p-1" aria-label="Remove item">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-lg bg-white">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 sm:px-3 py-1.5 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                          <span className="px-3 py-1.5 font-medium text-sm min-w-[2rem] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 sm:px-3 py-1.5 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#1A1A1A]">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-[#F5F0E8] rounded-xl p-6 sticky top-24">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  {bundleSavings > 0 && (
                    <div className="flex justify-between text-[#52796F]">
                      <span className="text-[#6B7280]">Bundle Savings</span>
                      <span className="font-medium">-${bundleSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? <span className="text-[#52796F]">Free</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Estimated Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Promo code" className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <Button variant="outline" className="rounded-lg px-4">Apply</Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {shipping === 0 && <p className="text-xs text-[#52796F] mt-1">You qualify for free shipping!</p>}
                </div>

                <Link to="/checkout" className="block w-full mt-6 bg-[#1A5A6B] text-white text-center py-4 rounded-full font-semibold hover:bg-[#1A8DA3] transition-all hover:scale-[1.02] shadow-lg">
                  Proceed to Checkout
                </Link>
                <div className="mt-4 text-center">
                  <Link to="/products" className="text-sm text-[#6B7280] hover:text-[#1A5A6B]">Continue Shopping</Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
