import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings,
  Search, Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, DollarSign, Boxes
} from 'lucide-react';
import { ALL_PRODUCTS, useStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const STATS = [
  { label: 'Total Revenue', value: '$128,450', change: '+12.5%', up: true, icon: DollarSign },
  { label: 'Total Orders', value: '1,284', change: '+8.2%', up: true, icon: ShoppingBag },
  { label: 'Products', value: '342', change: '+3.1%', up: true, icon: Boxes },
  { label: 'Customers', value: '5,672', change: '+15.3%', up: true, icon: Users },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
};

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { orders } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#1A4A52] text-white flex-shrink-0 transition-all duration-300 fixed h-full z-50`}>
        <div className="p-4 flex items-center justify-between h-16">
          {!sidebarCollapsed && <img src="/logo.png" alt="GoWild" className="h-8 w-auto brightness-0 invert" />}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded hover:bg-white/10">
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-1">
          {ADMIN_NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-[#1A5A6B]/40 border-l-3 border-[#E8552A]'
                  : 'hover:bg-white/10'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/10 rounded-lg">
            <p className="text-xs text-white/70">Logged in as</p>
            <p className="text-sm font-medium">Admin User</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="font-heading text-xl font-bold text-[#1A1A1A] capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-[#1A5A6B] font-medium hover:underline">View Store</Link>
            <div className="w-8 h-8 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-bold text-sm">A</div>
          </div>
        </header>

        <div className="p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#1A5A6B]/15 flex items-center justify-center text-[#1A5A6B]">
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-xs font-medium flex items-center gap-1 ${stat.up ? 'text-[#52796F]' : 'text-[#E85D4E]'}`}>
                        {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#1A1A1A] mt-4">{stat.value}</p>
                    <p className="text-sm text-[#6B7280] mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading font-bold mb-4">Sales Overview</h3>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-[#1A5A6B] rounded-t-sm transition-all hover:bg-[#1A8DA3]"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[10px] text-[#6B7280]">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading font-bold mb-4">Orders by Status</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1A5A6B" strokeWidth="12"
                          strokeDasharray={`${65 * 2.51} ${100 * 2.51}`} strokeDashoffset="0" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#E8552A" strokeWidth="12"
                          strokeDasharray={`${20 * 2.51} ${100 * 2.51}`} strokeDashoffset={`-${65 * 2.51}`} />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#52796F" strokeWidth="12"
                          strokeDasharray={`${15 * 2.51} ${100 * 2.51}`} strokeDashoffset={`-${85 * 2.51}`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{orders.length}</span>
                      </div>
                    </div>
                    <div className="ml-8 space-y-3">
                      {[
                        { label: 'Pending', color: 'bg-[#1A5A6B]', value: '65%' },
                        { label: 'Shipped', color: 'bg-[#E8552A]', value: '20%' },
                        { label: 'Delivered', color: 'bg-[#52796F]', value: '15%' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-sm text-[#6B7280]">{item.label}</span>
                          <span className="text-sm font-medium ml-auto">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="font-heading font-bold">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-[#1A5A6B] font-medium hover:underline">View All</button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">{order.id}</TableCell>
                        <TableCell>John Doe</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                  </div>
                  <button className="bg-[#1A5A6B] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1A8DA3] transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ALL_PRODUCTS.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                              <span className="font-medium text-sm">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{product.category}</TableCell>
                          <TableCell className="font-semibold">${product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{product.stock}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS.active}`}>
                              Active
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6B7280]"><Pencil className="w-4 h-4" /></button>
                              <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E85D4E]"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Showing {ALL_PRODUCTS.length} products</span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg border hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-lg bg-[#1A5A6B] text-white text-sm font-medium">1</button>
                    <button className="p-2 rounded-lg border hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                  </div>
                  <select className="px-4 py-2.5 border rounded-lg text-sm focus:outline-none">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">{order.id}</TableCell>
                        <TableCell>John Doe</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1A5A6B]"><Eye className="w-4 h-4" /></button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="font-heading">Order {order.id}</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div><span className="text-[#6B7280]">Customer:</span> John Doe</div>
                                  <div><span className="text-[#6B7280]">Date:</span> {order.date}</div>
                                  <div><span className="text-[#6B7280]">Status:</span>
                                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <div><span className="text-[#6B7280]">Total:</span> <span className="font-bold">${order.total.toFixed(2)}</span></div>
                                </div>
                                <div className="space-y-2">
                                  {order.items.map(item => (
                                    <div key={item.product.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                      <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded" />
                                      <div className="flex-1"><p className="text-sm font-medium">{item.product.name}</p></div>
                                      <span className="text-sm">x{item.quantity}</span>
                                      <span className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: 'John Doe', email: 'john@example.com', role: 'Customer', orders: 12, status: 'active' },
                      { name: 'Sarah Smith', email: 'sarah@example.com', role: 'Customer', orders: 8, status: 'active' },
                      { name: 'Mike Johnson', email: 'mike@example.com', role: 'Admin', orders: 0, status: 'active' },
                      { name: 'Emily Brown', email: 'emily@example.com', role: 'Customer', orders: 3, status: 'inactive' },
                      { name: 'Chris Wilson', email: 'chris@example.com', role: 'Customer', orders: 15, status: 'active' },
                    ].map((user, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.role === 'Admin' ? 'bg-[#1A5A6B]/15 text-[#1A5A6B]' : 'bg-gray-100 text-gray-600'}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{user.orders}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[user.status]}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1A5A6B]"><Eye className="w-4 h-4" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6B7280]"><Pencil className="w-4 h-4" /></button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading font-bold mb-4">Revenue Trend</h3>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[30, 45, 35, 60, 50, 75, 65, 80, 55, 70, 60, 85].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-[#1A5A6B] rounded-t-sm" style={{ height: `${h}%` }} />
                        <span className="text-[10px] text-[#6B7280]">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading font-bold mb-4">Top Products</h3>
                  <div className="space-y-4">
                    {ALL_PRODUCTS.slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-4">
                        <span className="text-lg font-bold text-[#6B7280] w-6">#{i + 1}</span>
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p></div>
                        <span className="text-sm font-bold">{[245, 189, 156, 134, 112][i]} sold</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="max-w-2xl bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-heading font-bold text-lg mb-6">Store Settings</h2>
                <Tabs defaultValue="general">
                  <TabsList className="w-full justify-start mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Store Name</label>
                      <input type="text" defaultValue="GoWild Outdoor Store" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Contact Email</label>
                      <input type="email" defaultValue="hello@gowild.com" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Currency</label>
                      <select className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                    <Button className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full px-8">Save Settings</Button>
                  </TabsContent>
                  <TabsContent value="shipping" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Free Shipping Threshold</label>
                      <input type="number" defaultValue="100" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Standard Shipping Rate</label>
                      <input type="number" defaultValue="9.99" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <Button className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full px-8">Save Settings</Button>
                  </TabsContent>
                  <TabsContent value="payment" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Payment Gateway</label>
                      <select className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30">
                        <option>Stripe</option>
                        <option>PayPal</option>
                        <option>Square</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">API Key</label>
                      <input type="password" defaultValue="sk_test_4242424242" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30" />
                    </div>
                    <Button className="bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full px-8">Save Settings</Button>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
