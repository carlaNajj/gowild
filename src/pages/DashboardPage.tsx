import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Heart, MapPin, CreditCard, User, LogOut,
  Star, Clock, Truck, CheckCircle, XCircle, Eye
} from 'lucide-react';
import { useStore, ALL_PRODUCTS } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const SIDEBAR_ITEMS = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'profile', label: 'Profile Settings', icon: User },
];

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const { orders, wishlist, toggleWishlist } = useStore();
  const wishlistProducts = ALL_PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-12 h-12 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-bold text-lg">
                  JD
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">John Doe</p>
                  <p className="text-xs text-[#6B7280]">john@example.com</p>
                </div>
              </div>

              <nav className="space-y-1">
                {SIDEBAR_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-[#1A5A6B]/10 text-[#1A5A6B] border-l-3 border-[#1A5A6B]'
                        : 'text-[#6B7280] hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <button className="w-full flex items-center gap-3 px-4 py-3 mt-6 text-sm font-medium text-[#E85D4E] hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Orders', value: orders.length },
                    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length },
                    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
                    { label: 'Total Spent', value: `$${orders.reduce((s, o) => s + o.total, 0).toFixed(2)}` },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="font-heading text-lg font-bold">Recent Orders</h2>
                  </div>
                  <div className="divide-y">
                    {orders.map(order => {
                      const status = STATUS_CONFIG[order.status];
                      return (
                        <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-semibold text-sm">{order.id}</span>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                                  <status.icon className="w-3 h-3" />
                                  {status.label}
                                </span>
                              </div>
                              <p className="text-xs text-[#6B7280] mt-1">{order.date} &middot; {order.items.length} item(s)</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-[#1A1A1A]">${order.total.toFixed(2)}</span>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="text-[#1A5A6B] text-sm font-medium hover:underline flex items-center gap-1">
                                    <Eye className="w-4 h-4" /> View
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle className="font-heading">Order Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="mt-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-semibold">{order.id}</span>
                                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                                        {status.label}
                                      </span>
                                    </div>
                                    <div className="space-y-3">
                                      {order.items.map(item => (
                                        <div key={item.product.id} className="flex items-center gap-3">
                                          <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                                          <div className="flex-1">
                                            <p className="text-sm font-medium">{item.product.name}</p>
                                            <p className="text-xs text-[#6B7280]">Qty: {item.quantity}</p>
                                          </div>
                                          <span className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="pt-4 border-t space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-[#6B7280]">Subtotal</span>
                                        <span>${order.total.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-[#6B7280]">Shipping</span>
                                        <span className="text-[#52796F]">Free</span>
                                      </div>
                                      <div className="flex justify-between font-bold pt-2 border-t">
                                        <span>Total</span>
                                        <span>${order.total.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-heading text-xl font-bold mb-6">My Wishlist ({wishlistProducts.length})</h2>
                {wishlistProducts.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-[#6B7280]">Your wishlist is empty</p>
                    <Link to="/products" className="text-[#1A5A6B] font-medium mt-2 inline-block hover:underline">Browse Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm group">
                        <Link to={`/product/${product.id}`} className="block aspect-[4/5] overflow-hidden bg-gray-100">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </Link>
                        <div className="p-4">
                          <Link to={`/product/${product.id}`} className="font-heading font-semibold text-sm hover:text-[#1A5A6B]">{product.name}</Link>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold">${product.price.toFixed(2)}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-[#E8552A] text-[#E8552A]" />
                              <span className="text-xs text-[#6B7280]">{product.rating}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Link to={`/product/${product.id}`} className="flex-1 bg-[#1A5A6B] text-white text-center py-2 rounded-full text-sm font-medium hover:bg-[#1A8DA3] transition-all">
                              View Product
                            </Link>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="w-10 border rounded-full flex items-center justify-center text-[#E85D4E] hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-bold">Saved Addresses</h2>
                  <button className="bg-[#1A5A6B] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#1A8DA3] transition-all">
                    + Add New
                  </button>
                </div>
                <div className="grid gap-4">
                  {[
                    { id: 1, name: 'John Doe', address: '123 Mountain Road, Denver, CO 80202', phone: '(555) 123-4567', default: true },
                    { id: 2, name: 'John Doe', address: '456 Forest Ave, Boulder, CO 80301', phone: '(555) 987-6543', default: false },
                  ].map(addr => (
                    <div key={addr.id} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{addr.name}</p>
                            {addr.default && (
                              <span className="text-xs bg-[#1A5A6B]/10 text-[#1A5A6B] px-2 py-0.5 rounded-full font-medium">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-[#6B7280] mt-1">{addr.address}</p>
                          <p className="text-sm text-[#6B7280]">{addr.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-sm text-[#1A5A6B] hover:underline">Edit</button>
                          {!addr.default && <button className="text-sm text-[#E85D4E] hover:underline">Delete</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-heading text-xl font-bold mb-6">Payment Methods</h2>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                      <div>
                        <p className="font-medium text-sm">Visa ending in 4242</p>
                        <p className="text-xs text-[#6B7280]">Expires 12/28</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-[#1A5A6B]/10 text-[#1A5A6B] px-2 py-0.5 rounded-full font-medium">Default</span>
                      <button className="text-sm text-[#6B7280] hover:text-[#1A1A1A]">Edit</button>
                    </div>
                  </div>
                  <button className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm font-medium text-[#6B7280] hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-colors">
                    + Add Payment Method
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-heading text-xl font-bold mb-6">Profile Settings</h2>
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-bold text-xl">
                      JD
                    </div>
                    <button className="text-sm text-[#1A5A6B] font-medium hover:underline">Change Avatar</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">First Name</label>
                      <input type="text" defaultValue="John" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Last Name</label>
                      <input type="text" defaultValue="Doe" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <input type="email" defaultValue="john@example.com" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <input type="tel" defaultValue="(555) 123-4567" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                  </div>
                  <button className="bg-[#1A5A6B] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1A8DA3] transition-all hover:scale-[1.02]">
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
