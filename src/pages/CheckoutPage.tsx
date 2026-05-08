import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, CheckCircle, Shield, User, ArrowRight, Mail, Eye, EyeOff, ChevronDown, MapPin, Phone, Edit3, Save, Tag } from 'lucide-react';
import { useAuth } from '@/auth';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SHIPPING_METHODS_US = [
  { id: 'standard', label: 'Standard Shipping', price: 0, days: '5-7 business days', free: true },
  { id: 'express', label: 'Express Shipping', price: 5.99, days: '2-3 business days', free: false },
  { id: 'priority', label: 'Priority Shipping', price: 9.99, days: '1-2 business days', free: false },
];

const SHIPPING_METHODS_LB = [
  { id: 'standard', label: 'Standard Delivery', price: 3.00, days: '3-5 business days', free: false },
  { id: 'express', label: 'Express Delivery', price: 5.00, days: '1-2 business days', free: false },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, guestInfo, setGuestInfo, login, updateProfile } = useAuth();
  const { cart, cartTotal, cartSavings, clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [authMode, setAuthMode] = useState<'choice' | 'login' | 'signup' | 'guest'>('choice');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [showPass, setShowPass] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Sign up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signingUp, setSigningUp] = useState(false);

  // Country / location logic
  const initialCountry = isLoggedIn
    ? (user?.address?.country || 'USA')
    : (guestInfo?.address?.country || 'USA');
  const [country, setCountry] = useState(initialCountry);
  const isLebanon = country === 'Lebanon' || country === 'LB';

  // Guest form state
  const [gName, setGName] = useState(guestInfo?.name || '');
  const [gEmail, setGEmail] = useState(guestInfo?.email || '');
  const [gPhone, setGPhone] = useState(guestInfo?.phone || '');
  const [gStreet, setGStreet] = useState(guestInfo?.address?.street || '');
  const [gCity, setGCity] = useState(guestInfo?.address?.city || '');
  const [gState, setGState] = useState(guestInfo?.address?.state || '');
  const [gZip, setGZip] = useState(guestInfo?.address?.zip || '');

  // Payment form
  const [cardNum, setCardNum] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState(user?.name || '');

  // FR-CART-08 & FR-CART-10: Shipping info display + inline editing
  const [editShippingMode, setEditShippingMode] = useState(false);
  const [editName, setEditName] = useState(isLoggedIn ? (user?.name || '') : (guestInfo?.name || ''));
  const [editEmail, setEditEmail] = useState(isLoggedIn ? (user?.email || '') : (guestInfo?.email || ''));
  const [editPhone, setEditPhone] = useState(isLoggedIn ? (user?.phone || '') : (guestInfo?.phone || ''));
  const [editStreet, setEditStreet] = useState(isLoggedIn ? (user?.address?.street || '') : (guestInfo?.address?.street || ''));
  const [editCity, setEditCity] = useState(isLoggedIn ? (user?.address?.city || '') : (guestInfo?.address?.city || ''));
  const [editState, setEditState] = useState(isLoggedIn ? (user?.address?.state || '') : (guestInfo?.address?.state || ''));
  const [editZip, setEditZip] = useState(isLoggedIn ? (user?.address?.zip || '') : (guestInfo?.address?.zip || ''));
  const [editCountry, setEditCountry] = useState(initialCountry);

  // FR-CART-08 P1: Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; type: 'percent' | 'fixed' } | null>(null);

  function handleApplyPromo() {
    const trimmed = promoInput.trim().toUpperCase();
    if (!trimmed) return;
    const promos: Record<string, { discount: number; type: 'percent' | 'fixed' }> = {
      'WILD10': { discount: 10, type: 'percent' },
      'GOWILD5': { discount: 5, type: 'fixed' },
      'PINBUDDY': { discount: 2, type: 'fixed' },
      'SUMMER20': { discount: 20, type: 'percent' },
    };
    const found = promos[trimmed];
    if (found) {
      setAppliedPromo({ code: trimmed, ...found });
      toast.success(`Promo code "${trimmed}" applied — ${found.type === 'percent' ? found.discount + '%' : '$' + found.discount.toFixed(2)} off`);
    } else {
      toast.error('Invalid promo code');
      setAppliedPromo(null);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoInput('');
    toast.info('Promo code removed');
  }

  // Pricing calculations
  const subtotal = cartTotal;
  const bundleSavings = cartSavings;
  const shippingMethods = isLebanon ? SHIPPING_METHODS_LB : SHIPPING_METHODS_US;
  const shipping = shippingMethods.find(s => s.id === shippingMethod)?.price || 0;
  const tax = isLebanon ? 0 : subtotal * 0.08;
  const promoDiscount = appliedPromo
    ? (appliedPromo.type === 'percent' ? (subtotal + tax + shipping) * appliedPromo.discount / 100 : appliedPromo.discount)
    : 0;
  const total = subtotal + shipping + tax - promoDiscount;

  const steps = [
    { num: 1, label: 'Account', icon: User },
    { num: 2, label: 'Shipping', icon: Truck },
    { num: 3, label: 'Payment', icon: CreditCard },
    { num: 4, label: 'Review', icon: CheckCircle },
  ];

  const effectiveStep = isLoggedIn && step === 1 ? 2 : step;

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setTimeout(async () => {
      const ok = await login(loginEmail, loginPass);
      if (ok) {
        toast.success('Welcome back!');
        setAuthMode('choice');
        setStep(2);
      } else {
        toast.error('Invalid email or password');
      }
      setLoggingIn(false);
    }, 500);
  }

  function handleGuestContinue() {
    if (!gName || !gEmail || !gStreet || !gCity || !gState || !gZip) {
      toast.error('Please fill in all required fields');
      return;
    }
    setGuestInfo({
      name: gName,
      email: gEmail,
      phone: gPhone,
      address: { street: gStreet, city: gCity, state: gState, zip: gZip, country },
    });
    setStep(2);
  }

  function handlePlaceOrder() {
    // FR-CONF-03: Save order data for confirmation page email + display
    const orderData = {
      items: cart.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
        },
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
      total: cartTotal,
      bundleSavings: cartSavings,
      shipping: shipping,
      tax: tax,
      promoDiscount: promoDiscount,
      grandTotal: total,
      orderDate: new Date().toISOString(),
    };
    localStorage.setItem('gowild_last_order', JSON.stringify(orderData));
    clearCart();
    toast.success('Order placed successfully!');
    navigate('/confirmation');
  }

  function handleSaveShipping() {
    if (!editName || !editEmail || !editStreet || !editCity || !editState || !editZip) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (isLoggedIn) {
      updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: { street: editStreet, city: editCity, state: editState, zip: editZip, country: editCountry },
      });
    } else {
      setGuestInfo({
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: { street: editStreet, city: editCity, state: editState, zip: editZip, country: editCountry },
      });
    }
    setCountry(editCountry);
    setEditShippingMode(false);
    toast.success('Shipping details updated');
  }

  // Order Summary reused inline (avoid defining component inside component to prevent input focus loss)

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-[#1A1A1A] text-center mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, i) => {
            const isActive = effectiveStep >= s.num;
            const isCurrent = effectiveStep === s.num;
            const isPast = effectiveStep > s.num;
            return (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isPast ? 'bg-[#52796F] text-white' : isCurrent ? 'bg-[#1A5A6B] text-white ring-4 ring-[#1A5A6B]/20' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isPast ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 ${isPast ? 'bg-[#52796F]' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Order Summary (collapsible / top) */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-heading font-bold text-[#1A1A1A] mb-4 text-base">Order Summary</h2>

            {/* Items list */}
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.color || 'no-color'}-${item.size || 'no-size'}`} className="flex items-center gap-3">
                  <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.product.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {item.color || item.size ? [item.color, item.size].filter(Boolean).join(' / ') : ''}
                      {item.color || item.size ? ' · ' : ''}Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Promo code input */}
            <div className="border-t pt-3 mb-3">
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 bg-[#1A5A6B]/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#1A5A6B]" />
                    <span className="text-xs font-medium text-[#1A5A6B]">{appliedPromo.code}</span>
                    <span className="text-xs text-[#52796F]">
                      {appliedPromo.type === 'percent' ? `-${appliedPromo.discount}%` : `-$${appliedPromo.discount.toFixed(2)}`}
                    </span>
                  </div>
                  <button onClick={handleRemovePromo} className="text-xs text-[#E85D4E] hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Promo code"
                      className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2.5 rounded-lg border text-sm font-medium text-[#1A5A6B] hover:bg-[#1A5A6B]/5 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {bundleSavings > 0 && (
                <div className="flex justify-between text-[#E8552A]">
                  <span className="text-[#E8552A]">Bundle Savings</span>
                  <span className="font-medium">-${bundleSavings.toFixed(2)}</span>
                </div>
              )}
              {effectiveStep >= 2 && (
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Delivery Charge</span>
                  <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
              )}
              {promoDiscount > 0 && (
                <div className="flex justify-between text-[#1A5A6B]">
                  <span className="text-[#1A5A6B]">Promo ({appliedPromo?.code})</span>
                  <span className="font-medium">-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Forms */}
          <div className="lg:col-span-7">
            {/* STEP 1: Account */}
            {effectiveStep === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {authMode === 'choice' && (
                  <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                    <User className="w-12 h-12 text-[#1A5A6B] mx-auto mb-4" />
                    <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2">How would you like to proceed?</h2>
                    <p className="text-sm text-[#6B7280] mb-8">Sign in for faster checkout, or continue without an account.</p>

                    <div className="space-y-3 max-w-xs mx-auto">
                      <button
                        onClick={() => setAuthMode('login')}
                        className="w-full bg-[#1A5A6B] text-white py-3.5 rounded-full font-semibold hover:bg-[#1A8DA3] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" /> Sign In to Account
                      </button>
                      <button
                        onClick={() => setAuthMode('signup')}
                        className="w-full border-2 border-[#52796F] text-[#52796F] py-3.5 rounded-full font-semibold hover:bg-[#52796F]/5 transition-all flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" /> Create Account
                      </button>
                      <button
                        onClick={() => setAuthMode('guest')}
                        className="w-full border-2 border-[#1A5A6B] text-[#1A5A6B] py-3.5 rounded-full font-semibold hover:bg-[#1A5A6B]/5 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" /> Continue as Guest
                      </button>
                    </div>

                    <p className="text-xs text-[#6B7280] mt-6">
                      Don&apos;t have an account?{' '}
                      <Link to="/login" state={{ from: '/checkout' }} className="text-[#1A5A6B] font-medium hover:underline">
                        Create one here
                      </Link>
                    </p>
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <button onClick={() => setAuthMode('choice')} className="text-sm text-[#1A5A6B] hover:underline mb-4 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 rotate-180" /> Back
                    </button>
                    <h2 className="font-heading text-lg font-bold mb-4">Sign In</h2>
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="alex@gowild.com" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Password</label>
                        <div className="relative">
                          <input type={showPass ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Min. 4 characters" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm pr-10" required />
                          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" disabled={loggingIn} className="w-full bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full py-6">
                        {loggingIn ? 'Signing in...' : 'Sign In & Continue'}
                      </Button>
                    </form>
                  </div>
                )}

                {authMode === 'signup' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <button onClick={() => setAuthMode('choice')} className="text-sm text-[#1A5A6B] hover:underline mb-4 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 rotate-180" /> Back
                      </button>
                      <h2 className="font-heading text-lg font-bold mb-4">Create Account</h2>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!signupName || !signupEmail || !signupPass) { toast.error('Please fill in all fields'); return; }
                        if (signupPass !== signupConfirm) { toast.error('Passwords do not match'); return; }
                        if (signupPass.length < 4) { toast.error('Password must be at least 4 characters'); return; }
                        setSigningUp(true);
                        setTimeout(() => {
                          setSigningUp(false);
                          toast.success('Account created! Welcome to GoWild');
                          setAuthMode('choice');
                          setStep(2);
                        }, 800);
                      }} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Full Name</label>
                          <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Alex Walker" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email</label>
                          <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="alex@gowild.com" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Password</label>
                          <div className="relative">
                            <input type={showPass ? 'text' : 'password'} value={signupPass} onChange={e => setSignupPass(e.target.value)} placeholder="Min. 4 characters" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm pr-10" required />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                          <input type="password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} placeholder="Repeat password" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                        </div>
                        <Button type="submit" disabled={signingUp} className="w-full bg-[#52796F] hover:bg-[#3D5A52] rounded-full py-6">
                          {signingUp ? 'Creating account...' : 'Create Account & Continue'}
                        </Button>
                      </form>
                      <p className="text-xs text-[#6B7280] mt-4 text-center">
                        Already have an account?{' '}
                        <button onClick={() => setAuthMode('login')} className="text-[#1A5A6B] font-medium hover:underline">Sign In</button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {authMode === 'guest' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => setAuthMode('choice')} className="text-sm text-[#1A5A6B] hover:underline flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 rotate-180" /> Back
                      </button>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Guest Checkout</span>
                    </div>
                    <h2 className="font-heading text-lg font-bold mb-4">Guest Information</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Full Name *</label>
                          <input type="text" value={gName} onChange={e => setGName(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email *</label>
                          <input type="email" value={gEmail} onChange={e => setGEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Phone</label>
                        <input type="tel" value={gPhone} onChange={e => setGPhone(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Street Address *</label>
                        <input type="text" value={gStreet} onChange={e => setGStreet(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">City *</label>
                          <input type="text" value={gCity} onChange={e => setGCity(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">State / Province *</label>
                          <input type="text" value={gState} onChange={e => setGState(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">ZIP / Postal Code *</label>
                          <input type="text" value={gZip} onChange={e => setGZip(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Country *</label>
                          <div className="relative">
                            <select
                              value={country}
                              onChange={e => setCountry(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm appearance-none bg-white"
                            >
                              <option value="USA">United States</option>
                              <option value="Lebanon">Lebanon</option>
                              <option value="Canada">Canada</option>
                              <option value="UK">United Kingdom</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleGuestContinue} className="w-full bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full py-6 font-semibold">
                        Continue to Shipping
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Shipping */}
            {effectiveStep === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-lg font-bold">Shipping Address</h2>
                    {!editShippingMode && (
                      <button
                        onClick={() => setEditShippingMode(true)}
                        className="flex items-center gap-1.5 text-xs text-[#1A5A6B] font-medium hover:underline"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>

                  {/* VIEW MODE — FR-CART-08: Display full shipping info */}
                  {!editShippingMode && (
                    <div className="p-4 bg-[#F5F0E8] rounded-lg mb-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[#1A5A6B] flex-shrink-0" />
                        <p className="font-medium text-sm text-[#1A1A1A]">{isLoggedIn ? user?.name : guestInfo?.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#1A5A6B] flex-shrink-0" />
                        <p className="text-sm text-[#6B7280]">{isLoggedIn ? user?.email : guestInfo?.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#1A5A6B] flex-shrink-0" />
                        <p className="text-sm text-[#6B7280]">{isLoggedIn ? (user?.phone || 'Not provided') : (guestInfo?.phone || 'Not provided')}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#1A5A6B] flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-[#6B7280]">
                          <p>{isLoggedIn ? user?.address?.street : guestInfo?.address?.street}</p>
                          <p>{isLoggedIn ? `${user?.address?.city}, ${user?.address?.state} ${user?.address?.zip}` : `${guestInfo?.address?.city}, ${guestInfo?.address?.state} ${guestInfo?.address?.zip}`}</p>
                          <p>{isLoggedIn ? (user?.address?.country || 'USA') : country}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE — FR-CART-10: Edit shipping details inline */}
                  {editShippingMode && (
                    <div className="space-y-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Full Name *</label>
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email *</label>
                          <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Phone</label>
                        <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Street Address *</label>
                        <input type="text" value={editStreet} onChange={e => setEditStreet(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">City *</label>
                          <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">State / Province *</label>
                          <input type="text" value={editState} onChange={e => setEditState(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">ZIP / Postal Code *</label>
                          <input type="text" value={editZip} onChange={e => setEditZip(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Country *</label>
                          <div className="relative">
                            <select
                              value={editCountry}
                              onChange={e => setEditCountry(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm appearance-none bg-white"
                            >
                              <option value="USA">United States</option>
                              <option value="Lebanon">Lebanon</option>
                              <option value="Canada">Canada</option>
                              <option value="UK">United Kingdom</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setEditShippingMode(false)} className="flex-1 rounded-full">Cancel</Button>
                        <Button onClick={handleSaveShipping} className="flex-1 bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full font-semibold">
                          <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                      </div>
                    </div>
                  )}

                  <h3 className="font-semibold text-sm mb-3 mt-6">
                    {isLebanon ? 'Delivery Method' : 'Shipping Method'}
                  </h3>
                  <div className="space-y-3">
                    {shippingMethods.map(method => (
                      <label key={method.id} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        shippingMethod === method.id ? 'border-[#1A5A6B] bg-[#1A5A6B]/5' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shipping" checked={shippingMethod === method.id} onChange={() => setShippingMethod(method.id)} className="w-4 h-4 accent-[#1A5A6B]" />
                          <div>
                            <p className="font-medium text-sm">{method.label}</p>
                            <p className="text-xs text-[#6B7280]">{method.days}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-sm">{method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  {!isLoggedIn && <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full py-6">Back</Button>}
                  <Button onClick={() => setStep(3)} className="flex-1 bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full py-6 font-semibold">Continue to Payment</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Payment */}
            {effectiveStep === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="font-heading text-lg font-bold mb-6">Payment</h2>

                  <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Card Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type="text" value={cardNum} onChange={e => setCardNum(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 font-mono text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Expiry</label>
                          <input type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">CVV</label>
                          <input type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Name on Card</label>
                        <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#1A5A6B]" defaultChecked={isLoggedIn} />
                        Save card for future purchases
                      </label>
                    </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-full py-6">Back</Button>
                  <Button onClick={() => setStep(4)} className="flex-1 bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full py-6 font-semibold">Review Order</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review */}
            {effectiveStep === 4 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="font-heading text-lg font-bold mb-6">Review Your Order</h2>
                  <div className="space-y-4">
                    <div className="pb-4 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">
                          {isLebanon ? 'Delivery Address' : 'Shipping'}
                        </h3>
                        <button onClick={() => setStep(2)} className="text-xs text-[#1A5A6B] hover:underline">Change</button>
                      </div>
                      <div className="text-sm text-[#6B7280] space-y-0.5">
                        <p className="font-medium text-[#1A1A1A]">{isLoggedIn ? user?.name : guestInfo?.name}</p>
                        <p>{isLoggedIn ? user?.email : guestInfo?.email}</p>
                        <p>{isLoggedIn ? (user?.phone || '') : (guestInfo?.phone || '')}</p>
                        <p>{isLoggedIn ? user?.address?.street : guestInfo?.address?.street}</p>
                        <p>{isLoggedIn ? `${user?.address?.city}, ${user?.address?.state} ${user?.address?.zip}` : `${guestInfo?.address?.city}, ${guestInfo?.address?.state} ${guestInfo?.address?.zip}`}</p>
                        <p>{country}</p>
                      </div>
                    </div>
                    <div className="pb-4 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">Payment</h3>
                        <button onClick={() => setStep(3)} className="text-xs text-[#1A5A6B] hover:underline">Change</button>
                      </div>
                      <p className="text-sm text-[#6B7280]">Visa ending in {cardNum.slice(-4)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-3">Items ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
                      <div className="space-y-3">
                        {cart.map(item => (
                          <div key={`${item.product.id}-${item.color || 'no-color'}-${item.size || 'no-size'}`} className="flex items-center gap-3">
                            <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.product.name}</p>
                              <p className="text-xs text-[#6B7280]">Qty: {item.quantity} {item.color ? `/ ${item.color}` : ''}</p>
                            </div>
                            <span className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Price breakdown in review */}
                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Subtotal</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      {bundleSavings > 0 && (
                        <div className="flex justify-between text-[#E8552A]">
                          <span>Bundle Savings</span>
                          <span className="font-medium">-${bundleSavings.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">{isLebanon ? 'Delivery Charge' : 'Shipping'}</span>
                        <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      {!isLebanon && (
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">Tax</span>
                          <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                      )}
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-[#1A5A6B]">
                          <span>Promo ({appliedPromo?.code})</span>
                          <span className="font-medium">-${promoDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1 rounded-full h-14">Back</Button>
                  <Button onClick={handlePlaceOrder} className="flex-1 bg-[#E8552A] hover:bg-[#C4451D] text-white rounded-full h-14 font-semibold text-lg transition-all hover:scale-[1.02] shadow-lg">
                    Place Order &mdash; ${total.toFixed(2)}
                  </Button>
                </div>
                <p className="text-xs text-[#6B7280] text-center mt-4 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> By placing your order, you agree to our Terms and Privacy Policy.
                </p>
              </motion.div>
            )}
          </div>

          {/* RIGHT: Sticky Order Summary (desktop only) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-heading font-bold text-[#1A1A1A] mb-4 text-lg">Order Summary</h2>

                {/* Items list */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.color || 'no-color'}-${item.size || 'no-size'}`} className="flex items-center gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.product.name}</p>
                        <p className="text-xs text-[#6B7280]">
                          {item.color || item.size ? [item.color, item.size].filter(Boolean).join(' / ') : ''}
                          {item.color || item.size ? ' · ' : ''}Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Promo code input */}
                <div className="border-t pt-3 mb-3">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#1A5A6B]/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#1A5A6B]" />
                        <span className="text-xs font-medium text-[#1A5A6B]">{appliedPromo.code}</span>
                        <span className="text-xs text-[#52796F]">
                          {appliedPromo.type === 'percent' ? `-${appliedPromo.discount}%` : `-$${appliedPromo.discount.toFixed(2)}`}
                        </span>
                      </div>
                      <button onClick={handleRemovePromo} className="text-xs text-[#E85D4E] hover:underline">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={e => setPromoInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                          placeholder="Promo code"
                          className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 rounded-lg border text-sm font-medium text-[#1A5A6B] hover:bg-[#1A5A6B]/5 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {bundleSavings > 0 && (
                    <div className="flex justify-between text-[#E8552A]">
                      <span className="text-[#E8552A]">Bundle Savings</span>
                      <span className="font-medium">-${bundleSavings.toFixed(2)}</span>
                    </div>
                  )}
                  {effectiveStep >= 2 && (
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Delivery Charge</span>
                      <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-[#1A5A6B]">
                      <span className="text-[#1A5A6B]">Promo ({appliedPromo?.code})</span>
                      <span className="font-medium">-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-white rounded-xl p-4 shadow-sm">
                <Shield className="w-4 h-4 text-[#52796F] flex-shrink-0" />
                <span>Secure checkout. Your data is protected.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
