import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Printer, Package, ShoppingBag, User, Mail, MailCheck } from 'lucide-react';
import { useAuth } from '@/auth';
import { useStore } from '@/store';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';

// EmailJS configuration — replace with your own from https://dashboard.emailjs.com
const EMAILJS_SERVICE_ID = 'service_gowild';
const EMAILJS_TEMPLATE_ID = 'template_order_confirm';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

export function ConfirmationPage() {
  const { isLoggedIn, user, guestInfo } = useAuth();
  const { cart, cartTotal, cartSavings } = useStore();
  const orderNumber = 'GW-2026-' + Math.floor(8000 + Math.random() * 2000);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(true);

  // Get order data from localStorage backup (cart was cleared)
  const storedOrder = (() => {
    try {
      const raw = localStorage.getItem('gowild_last_order');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  })();

  const displayTotal = cartTotal > 0 ? cartTotal : (storedOrder?.total || 44.97);
  const displayItems = cart.length > 0 ? cart : (storedOrder?.items || []);
  const shipping = storedOrder?.shipping || 0;
  const tax = storedOrder?.tax || displayTotal * 0.08;
  const bundleSavingsDisplay = cartSavings > 0 ? cartSavings : (storedOrder?.bundleSavings || 0);
  const finalTotal = displayTotal + shipping + tax;

  // FR-CONF-03 P0: Send order confirmation email
  useEffect(() => {
    const userEmail = isLoggedIn ? user?.email : guestInfo?.email;
    const userName = isLoggedIn ? user?.name : guestInfo?.name;
    const userPhone = isLoggedIn ? (user?.phone || '') : (guestInfo?.phone || '');
    const address = isLoggedIn ? user?.address : guestInfo?.address;

    if (!userEmail || emailSent) return;

    const itemsList = displayItems.map((item: any) =>
      `- ${item.product?.name || item.name || 'Item'} (Qty: ${item.quantity}) — $${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}`
    ).join('\n');

    const templateParams = {
      to_email: userEmail,
      to_name: userName || 'Valued Customer',
      order_number: orderNumber,
      order_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items_list: itemsList || '- 3 items from your order',
      subtotal: `$${displayTotal.toFixed(2)}`,
      shipping: shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free',
      tax: `$${(tax || 0).toFixed(2)}`,
      bundle_savings: bundleSavingsDisplay > 0 ? `-$${bundleSavingsDisplay.toFixed(2)}` : '$0.00',
      total: `$${finalTotal.toFixed(2)}`,
      delivery_address: address
        ? `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country || 'USA'}`
        : 'Not provided',
      contact_phone: userPhone || 'Not provided',
      reply_to: userEmail,
    };

    // Attempt to send email via EmailJS
    // User must configure their EmailJS account at https://dashboard.emailjs.com
    // with Service ID, Template ID, and Public Key matching the constants above
    if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
        .then(() => {
          setEmailSent(true);
          setSendingEmail(false);
          toast.success('Order confirmation email sent!');
        })
        .catch((err) => {
          console.warn('EmailJS error:', err);
          setSendingEmail(false);
          // Don't show error to user — the order is still confirmed
        });
    } else {
      // EmailJS not configured yet — show informative state
      setSendingEmail(false);
      console.log('[FR-CONF-03] EmailJS not configured. Template params:', templateParams);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto bg-[#52796F]/15 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#52796F]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#1A1A1A] mt-6">Order Confirmed!</h1>
          <p className="text-[#6B7280] mt-3">Thank you for your purchase. Your adventure gear is on its way.</p>
          <p className="text-[#1A5A6B] font-mono text-lg mt-2 font-semibold">Order #{orderNumber}</p>

          {/* Email status indicator */}
          {sendingEmail ? (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
              <Mail className="w-4 h-4 animate-pulse" /> Sending confirmation email...
            </div>
          ) : emailSent ? (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#52796F]/10 text-[#52796F] rounded-full text-sm font-medium">
              <MailCheck className="w-4 h-4" /> Confirmation email sent to {(isLoggedIn ? user?.email : guestInfo?.email) || 'your email'}
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm">
              <Mail className="w-4 h-4" /> Email notification — configure EmailJS to enable
            </div>
          )}

          {!isLoggedIn && (
            <div className="mt-4 bg-white rounded-lg p-4 shadow-sm max-w-sm mx-auto">
              <p className="text-sm text-[#6B7280] mb-2">Create an account to track your order and save your details for next time.</p>
              <Link to="/login" className="inline-block bg-[#1A5A6B] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#1A8DA3] transition-all">
                Create Account
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-xl p-6 mt-8 shadow-sm"
        >
          <h2 className="font-heading font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-4">
            {displayItems.length > 0 ? displayItems.map((item: any, idx: number) => (
              <div key={`${item.product?.id || item.id || idx}-${item.color || 'no-color'}`} className="flex items-center gap-4">
                <img src={item.product?.image || item.image || ''} alt={item.product?.name || item.name || ''} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product?.name || item.name || 'Item'}</p>
                  <p className="text-xs text-[#6B7280]">Qty: {item.quantity} {item.color ? `/ ${item.color}` : ''}</p>
                </div>
                <span className="font-semibold text-sm">${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            )) : (
              <div className="text-center py-6 text-[#6B7280]">
                <p>Your order has been processed.</p>
                <p className="text-sm">3 items &middot; ${displayTotal.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Subtotal</span>
              <span>${displayTotal.toFixed(2)}</span>
            </div>
            {bundleSavingsDisplay > 0 && (
              <div className="flex justify-between text-[#E8552A]">
                <span>Bundle Savings</span>
                <span>-${bundleSavingsDisplay.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Delivery Charge</span>
              <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#52796F]/10 rounded-lg">
            <p className="text-sm text-[#52796F] font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Estimated delivery: May 5 - May 8, 2026
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          {isLoggedIn ? (
            <Link to="/account" className="flex-1 bg-[#1A5A6B] text-white text-center py-4 rounded-full font-semibold hover:bg-[#1A8DA3] transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
              <User className="w-5 h-5" /> My Account
            </Link>
          ) : (
            <Link to="/account" className="flex-1 bg-[#1A5A6B] text-white text-center py-4 rounded-full font-semibold hover:bg-[#1A8DA3] transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
              <Package className="w-5 h-5" /> Track Your Order
            </Link>
          )}
          <Link to="/products" className="flex-1 border-2 border-[#1A5A6B] text-[#1A5A6B] text-center py-4 rounded-full font-semibold hover:bg-[#1A5A6B] hover:text-white transition-all flex items-center justify-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Continue Shopping
          </Link>
          <button className="sm:w-auto w-full px-6 py-4 border rounded-full text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </button>
        </motion.div>
      </div>
    </div>
  );
}
