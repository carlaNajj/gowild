import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, MapPin, CreditCard, Settings, LogOut,
  Clock, Truck, CheckCircle, XCircle,
  Save, Camera, X, Plus, ShoppingBag, Trash2, Edit3, ChevronRight,
  ClipboardCheck, Warehouse, Plane, Home
} from 'lucide-react';
import { useAuth } from '@/auth';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

/* SHEIN-style Lebanon tracking timeline stages */
const TRACKING_STAGES = [
  { key: 'placed', label: 'Order Placed', desc: 'Order confirmed and payment received', icon: ClipboardCheck },
  { key: 'processing', label: 'Processing', desc: 'Warehouse preparing your items', icon: Warehouse },
  { key: 'shipped', label: 'Shipped', desc: 'Package handed to Aramex', icon: Package },
  { key: 'transit', label: 'In Transit', desc: 'Arrived at Beirut sorting facility', icon: Plane },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Local Aramex courier on the way', icon: Truck },
  { key: 'delivered', label: 'Delivered', desc: 'Package delivered to your address', icon: Home },
];

/* Map order status to tracking stage index */
const STATUS_STAGE_MAP: Record<string, number> = {
  pending: 1,
  shipped: 2,
  transit: 3,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
};

const SIDEBAR_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'settings', label: 'Account Settings', icon: Settings },
];

/* SHEIN-style visual tracking timeline */
function TrackingTimeline({ status, orderDate }: { status: string; orderDate: string }) {
  const currentStage = STATUS_STAGE_MAP[status] ?? 0;

  // Generate fake but realistic tracking dates based on order date
  const baseDate = new Date(orderDate);
  const getDate = (daysAfter: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysAfter);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const getTime = (daysAfter: number, hour: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysAfter);
    d.setHours(hour, 0, 0, 0);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const stageDates = [
    { date: getDate(0), time: getTime(0, 14) },      // Placed
    { date: getDate(1), time: getTime(1, 9) },       // Processing
    { date: getDate(2), time: getTime(2, 16) },      // Shipped
    { date: getDate(4), time: getTime(4, 11) },      // Transit
    { date: getDate(5), time: getTime(5, 8) },       // Out for delivery
    { date: getDate(5), time: getTime(5, 14) },      // Delivered
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm text-[#1A1A1A]">Tracking Details</h4>
        <span className="text-xs bg-[#1A5A6B]/10 text-[#1A5A6B] px-2.5 py-1 rounded-full font-medium">Aramex</span>
      </div>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200" />

        <div className="space-y-0">
          {TRACKING_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;
            const isFuture = idx > currentStage;
            const dateInfo = stageDates[idx];

            return (
              <div key={stage.key} className={`flex items-start gap-4 py-3 ${isFuture ? 'opacity-40' : ''}`}>
                {/* Icon circle */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                  isCompleted
                    ? 'bg-[#52796F] text-white'
                    : isCurrent
                    ? 'bg-[#1A5A6B] text-white ring-4 ring-[#1A5A6B]/20'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <stage.icon className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-[#1A5A6B]' : 'text-[#1A1A1A]'}`}>
                      {stage.label}
                    </p>
                    {!isFuture && (
                      <span className="text-xs text-[#6B7280]">{dateInfo.date}</span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">{stage.desc}</p>
                  {(isCompleted || isCurrent) && (
                    <p className="text-[10px] text-[#6B7280] mt-0.5">{dateInfo.time}</p>
                  )}
                  {isCurrent && status === 'out_for_delivery' && (
                    <p className="text-[10px] text-[#E8552A] mt-1 font-medium">Expected by 6:00 PM today</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking number */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <span className="text-xs text-[#6B7280]">Tracking Number</span>
        <span className="text-xs font-mono font-medium text-[#1A1A1A]">ARAMEX-LB-{Math.floor(100000000 + Math.random() * 900000000)}</span>
      </div>
    </div>
  );
}

/* Payment method type */
interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  name: string;
  isDefault: boolean;
}

function loadPaymentMethods(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem('gowild_payment_methods');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [
    { id: 'pm1', type: 'visa', last4: '4242', expiry: '12/28', name: 'Alex Walker', isDefault: true },
  ];
}

function savePaymentMethods(methods: PaymentMethod[]) {
  localStorage.setItem('gowild_payment_methods', JSON.stringify(methods));
}

export function MyAccountPage() {
  const { user, logout, updateProfile } = useAuth();
  const { orders, wishlist, addToCart } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── 1. Profile photo ── */
  const [avatar, setAvatar] = useState(user?.avatar || '');

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      updateProfile({ avatar: base64 });
      toast.success('Profile photo updated');
    };
    reader.readAsDataURL(file);
  }

  /* ── Profile form ── */
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState(user?.name || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');

  function saveProfile() {
    const fullPhone = formPhone ? `${phoneCountryCode} ${formPhone}` : '';
    updateProfile({ name: formName, email: formEmail, phone: fullPhone });
    setEditMode(false);
    toast.success('Profile updated successfully');
  }

  /* ── 2. Order details modal + reorder ── */
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  function handleReorder(order: typeof orders[0]) {
    order.items.forEach(item => {
      addToCart({ product: item.product, quantity: item.quantity, color: item.color, size: item.size });
    });
    toast.success(`${order.items.length} item(s) added to cart`);
    setSelectedOrderId(null);
  }

  /* ── 3. Edit address ── */
  const [editAddressMode, setEditAddressMode] = useState(false);
  const [addrStreet, setAddrStreet] = useState(user?.address?.street || '');
  const [addrCity, setAddrCity] = useState(user?.address?.city || '');
  const [addrState, setAddrState] = useState(user?.address?.state || '');
  const [addrZip, setAddrZip] = useState(user?.address?.zip || '');
  const [addrCountry, setAddrCountry] = useState(user?.address?.country || 'USA');

  function saveAddress() {
    updateProfile({
      address: { street: addrStreet, city: addrCity, state: addrState, zip: addrZip, country: addrCountry },
    });
    setEditAddressMode(false);
    toast.success('Address updated');
  }

  /* ── 4, 5, 6. Payment methods ── */
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(loadPaymentMethods);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);
  const [pmName, setPmName] = useState('');
  const [pmNumber, setPmNumber] = useState('');
  const [pmExpiry, setPmExpiry] = useState('');
  const [pmCvv, setPmCvv] = useState('');

  useEffect(() => { savePaymentMethods(paymentMethods); }, [paymentMethods]);

  function startAddPayment() {
    setPmName(user?.name || '');
    setPmNumber('');
    setPmExpiry('');
    setPmCvv('');
    setEditPaymentId(null);
    setShowAddPayment(true);
  }

  function startEditPayment(pm: PaymentMethod) {
    setPmName(pm.name);
    setPmNumber('**** **** **** ' + pm.last4);
    setPmExpiry(pm.expiry);
    setPmCvv('***');
    setEditPaymentId(pm.id);
    setShowAddPayment(true);
  }

  function handleSavePayment() {
    if (!pmName || !pmNumber || !pmExpiry) { toast.error('Please fill in all fields'); return; }
    const last4 = pmNumber.replace(/\D/g, '').slice(-4);
    if (last4.length !== 4) { toast.error('Invalid card number'); return; }

    if (editPaymentId) {
      setPaymentMethods(prev => prev.map(pm => pm.id === editPaymentId ? { ...pm, name: pmName, expiry: pmExpiry, last4 } : pm));
      toast.success('Payment method updated');
    } else {
      const newPm: PaymentMethod = {
        id: 'pm' + Date.now(), type: 'visa', last4, expiry: pmExpiry, name: pmName, isDefault: false,
      };
      setPaymentMethods(prev => [...prev, newPm]);
      toast.success('Payment method added');
    }
    setShowAddPayment(false);
    setEditPaymentId(null);
  }

  function handleDeletePayment(id: string) {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    toast.success('Payment method removed');
  }

  /* ── 7. Update password ── */
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  function handleUpdatePassword() {
    if (!curPass || !newPass || !confirmPass) { toast.error('Please fill in all fields'); return; }
    if (newPass !== confirmPass) { toast.error('New passwords do not match'); return; }
    if (newPass.length < 4) { toast.error('Password must be at least 4 characters'); return; }
    setCurPass(''); setNewPass(''); setConfirmPass('');
    toast.success('Password updated successfully');
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm h-screen flex flex-col">
              {/* User Card */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-bold text-xl cursor-pointer overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || 'G'
                    )}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-[#6B7280] cursor-pointer hover:text-[#1A5A6B]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <div className="min-w-0">
                  <p className="font-semibold text-[#1A1A1A] truncate">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-[#6B7280] truncate">{user?.email || 'Not logged in'}</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="space-y-1">
                {SIDEBAR_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-[#1A5A6B]/10 text-[#1A5A6B]'
                        : 'text-[#6B7280] hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.id === 'orders' && orders.length > 0 && (
                      <span className="ml-auto text-xs bg-[#E8552A] text-white px-1.5 py-0.5 rounded-full">{orders.length}</span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <button
                onClick={() => { logout(); toast.success('Signed out successfully'); }}
                className="w-full flex items-center gap-3 px-4 py-3 mt-6 text-sm font-medium text-[#E85D4E] hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold">Profile</h2>
                    {!editMode && (
                      <Button size="sm" className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full" onClick={() => setEditMode(true)}>
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Profile
                      </Button>
                    )}
                  </div>
                  <div className="p-6">
                    {editMode ? (
                      <div className="space-y-4 w-full md:max-w-lg">
                        {/* Profile photo edit */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Profile Photo</label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-bold text-lg overflow-hidden">
                              {avatar ? (
                                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                user?.name?.charAt(0) || 'G'
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 text-sm font-medium text-[#1A5A6B] border border-[#1A5A6B] rounded-full hover:bg-[#1A5A6B] hover:text-white transition-all"
                            >
                              {avatar ? 'Change Photo' : 'Add Photo'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Full Name</label>
                          <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email</label>
                          <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Phone</label>
                          <div className="flex">
                            <select
                              value={phoneCountryCode}
                              onChange={e => setPhoneCountryCode(e.target.value)}
                              className="px-3 py-3 rounded-l-lg border border-r-0 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 min-w-[80px]"
                            >
                              <option value="+1">+1 (US)</option>
                              <option value="+961">+961 (LB)</option>
                              <option value="+44">+44 (UK)</option>
                              <option value="+1">+1 (CA)</option>
                              <option value="+61">+61 (AU)</option>
                              <option value="+33">+33 (FR)</option>
                              <option value="+49">+49 (DE)</option>
                              <option value="+971">+971 (UAE)</option>
                              <option value="+90">+90 (TR)</option>
                              <option value="+20">+20 (EG)</option>
                            </select>
                            <input
                              type="tel"
                              value={formPhone}
                              onChange={e => setFormPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="Phone number"
                              className="flex-1 px-4 py-3 rounded-r-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button onClick={saveProfile} className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full">
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditMode(false)} className="rounded-full">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 max-w-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Name</p>
                            <p className="font-medium text-[#1A1A1A]">{user?.name || 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Email</p>
                            <p className="font-medium text-[#1A1A1A]">{user?.email || 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Phone</p>
                            <p className="font-medium text-[#1A1A1A]">{user?.phone || 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Member Since</p>
                            <p className="font-medium text-[#1A1A1A]">April 2026</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-[#1A1A1A]">{orders.length}</p>
                    <p className="text-xs text-[#6B7280] mt-1">Total Orders</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-[#1A1A1A]">{wishlist.length}</p>
                    <p className="text-xs text-[#6B7280] mt-1">Wishlist Items</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-[#1A1A1A]">{orders.filter(o => o.status === 'delivered').length}</p>
                    <p className="text-xs text-[#6B7280] mt-1">Delivered</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="font-heading text-xl font-bold">Order History</h2>
                  </div>
                  {orders.length === 0 ? (
                    <div className="p-12 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-[#6B7280]">No orders yet</p>
                      <Link to="/products" className="text-[#1A5A6B] font-medium mt-2 inline-block hover:underline">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {orders.map(order => {
                        const status = STATUS_CONFIG[order.status];
                        return (
                          <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedOrderId(order.id)}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-semibold text-sm">{order.id}</span>
                                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                                    <status.icon className="w-3 h-3" />{status.label}
                                  </span>
                                </div>
                                <p className="text-xs text-[#6B7280] mt-1">{order.date} &middot; {order.items.length} item(s)</p>
                                <div className="flex gap-3 mt-3">
                                  {order.items.map(item => (
                                    <img key={item.product.id} src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-lg" />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-[#1A1A1A]">${order.total.toFixed(2)}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Order Detail Modal */}
            <AnimatePresence>
              {selectedOrder && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrderId(null)}
                    className="fixed inset-0 bg-black/50 z-50" />
                  <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                    className="fixed inset-x-4 top-[5vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50">
                    <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                      <div>
                        <h3 className="font-heading text-lg font-bold">Order {selectedOrder.id}</h3>
                        <p className="text-xs text-[#6B7280]">{selectedOrder.date}</p>
                      </div>
                      <button onClick={() => setSelectedOrderId(null)} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      {/* SHEIN-style tracking timeline */}
                      <TrackingTimeline status={selectedOrder.status} orderDate={selectedOrder.date} />

                      {selectedOrder.items.map(item => (
                        <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-xs text-[#6B7280]">Qty: {item.quantity} {item.color ? `/ ${item.color}` : ''}</p>
                          </div>
                          <span className="font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[#6B7280]">Subtotal</span><span>${selectedOrder.total.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-[#6B7280]">Delivery</span><span>Free</span></div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t"><span>Total</span><span>${selectedOrder.total.toFixed(2)}</span></div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={() => handleReorder(selectedOrder)} className="flex-1 bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full">
                          <ShoppingBag className="w-4 h-4 mr-2" /> Reorder
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedOrderId(null)} className="rounded-full px-6">Close</Button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading text-xl font-bold">Saved Addresses</h2>
                    {!editAddressMode && (
                      <Button size="sm" className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full" onClick={() => setEditAddressMode(true)}>
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Address
                      </Button>
                    )}
                  </div>
                  {editAddressMode ? (
                    <div className="space-y-4 w-full md:max-w-lg">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Street Address</label>
                        <input type="text" value={addrStreet} onChange={e => setAddrStreet(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">City</label>
                          <input type="text" value={addrCity} onChange={e => setAddrCity(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">State</label>
                          <input type="text" value={addrState} onChange={e => setAddrState(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">ZIP</label>
                          <input type="text" value={addrZip} onChange={e => setAddrZip(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Country</label>
                          <select value={addrCountry} onChange={e => setAddrCountry(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm bg-white">
                            <option value="USA">United States</option>
                            <option value="Lebanon">Lebanon</option>
                            <option value="Canada">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="Australia">Australia</option>
                            <option value="France">France</option>
                            <option value="Germany">Germany</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={saveAddress} className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full">
                          <Save className="w-4 h-4 mr-2" /> Save Address
                        </Button>
                        <Button variant="outline" onClick={() => setEditAddressMode(false)} className="rounded-full">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <div className="border rounded-xl p-5 relative">
                        <span className="absolute top-4 right-4 text-xs bg-[#1A5A6B]/10 text-[#1A5A6B] px-2 py-1 rounded-full font-medium">Default</span>
                        <p className="font-semibold text-[#1A1A1A]">{user?.name || 'Alex Walker'}</p>
                        <p className="text-sm text-[#6B7280] mt-1">
                          {user?.address?.street || addrStreet}<br />
                          {user?.address?.city || addrCity}, {user?.address?.state || addrState} {user?.address?.zip || addrZip}<br />
                          {user?.address?.country || addrCountry}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="font-heading text-xl font-bold mb-6">Payment Methods</h2>
                  <div className="space-y-4">
                    {paymentMethods.map(pm => (
                      <div key={pm.id} className="flex items-center justify-between p-4 border rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">{pm.type.toUpperCase()}</div>
                          <div>
                            <p className="font-medium text-sm">{pm.name}</p>
                            <p className="text-xs text-[#6B7280]">•••• {pm.last4} &middot; Expires {pm.expiry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {pm.isDefault && <span className="text-xs bg-[#1A5A6B]/10 text-[#1A5A6B] px-2 py-1 rounded-full font-medium">Default</span>}
                          <button onClick={() => startEditPayment(pm)} className="text-sm text-[#6B7280] hover:text-[#1A5A6B] transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeletePayment(pm.id)} className="text-sm text-[#E85D4E] hover:text-red-700 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {!showAddPayment ? (
                      <button onClick={startAddPayment} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm font-medium text-[#6B7280] hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Payment Method
                      </button>
                    ) : (
                      <div className="border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{editPaymentId ? 'Edit Card' : 'Add New Card'}</h3>
                          <button onClick={() => { setShowAddPayment(false); setEditPaymentId(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Name on Card</label>
                          <input type="text" value={pmName} onChange={e => setPmName(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Card Number</label>
                          <input type="text" value={pmNumber} onChange={e => setPmNumber(e.target.value)} placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Expiry</label>
                            <input type="text" value={pmExpiry} onChange={e => setPmExpiry(e.target.value)} placeholder="MM/YY" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">CVV</label>
                            <input type="text" value={pmCvv} onChange={e => setPmCvv(e.target.value)} placeholder="123" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handleSavePayment} className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full">
                            <Save className="w-4 h-4 mr-2" /> {editPaymentId ? 'Update' : 'Add'} Card
                          </Button>
                          <Button variant="outline" onClick={() => { setShowAddPayment(false); setEditPaymentId(null); }} className="rounded-full">Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-xl shadow-sm p-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <h2 className="font-heading text-xl font-bold mb-6">Account Settings</h2>
                  <div className="space-y-6 w-full md:max-w-lg">
                    <div>
                      <h3 className="font-semibold text-sm mb-3">Change Password</h3>
                      <div className="space-y-3">
                        <input type="password" placeholder="Current password" value={curPass} onChange={e => setCurPass(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        <input type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                        <input type="password" placeholder="Confirm new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 text-sm" />
                      </div>
                      <Button onClick={handleUpdatePassword} className="mt-3 bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full">Update Password</Button>
                    </div>
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-sm mb-3 text-[#E85D4E]">Danger Zone</h3>
                      <p className="text-sm text-[#6B7280] mb-3">Once you delete your account, there is no going back.</p>
                      <Button variant="outline" className="text-[#E85D4E] border-[#E85D4E] hover:bg-red-50 rounded-full">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
