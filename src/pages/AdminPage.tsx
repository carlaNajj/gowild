import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings,
  Search, Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, DollarSign, Boxes, LogOut, Menu, X,
  FileText, Navigation, Tag, Percent, Globe, MessageCircle, Printer,
  Upload, Download, Gift
} from 'lucide-react';
import { useStore, type Product, type Order } from '@/store';
import { useAuth } from '@/auth';
import { useSiteSettings } from '@/lib/settings-context';


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

import { ProductFormDialog } from '@/components/admin/ProductFormDialog';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { NavigationEditor } from '@/components/admin/NavigationEditor';
import { CategoriesEditor } from '@/components/admin/CategoriesEditor';
import { PromotionsEditor } from '@/components/admin/PromotionsEditor';
import { PromoCodesEditor } from '@/components/admin/PromoCodesEditor';
import { AboutEditor } from '@/components/admin/AboutEditor';
import { SettingsEditor } from '@/components/admin/SettingsEditor';
import { ReviewsEditor } from '@/components/admin/ReviewsEditor';
import { BundleTextsEditor } from '@/components/admin/BundleTextsEditor';
import { BundlesEditor } from '@/components/admin/BundlesEditor';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ADMIN_NAV_SECTIONS = [
  {
    label: 'Store',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'users', label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { id: 'promotions', label: 'Promotions', icon: Percent },
      { id: 'promoCodes', label: 'Promo Codes', icon: Tag },
      { id: 'bundleTexts', label: 'Bundle Texts', icon: Gift },
      { id: 'bundles', label: 'Product Bundles', icon: Package },
    ],
  },
  {
    label: 'Community',
    items: [
      { id: 'reviews', label: 'Reviews', icon: MessageCircle },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'homepage', label: 'Homepage', icon: FileText },
      { id: 'categories', label: 'Categories', icon: Tag },
      { id: 'about', label: 'About Page', icon: Globe },
      { id: 'navigation', label: 'Navigation', icon: Navigation },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
};

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    products, orders, updateProduct, deleteProduct, toggleProductStatus,
    addProduct, updateOrderStatus, cancelOrder, refundOrder
  } = useStore();
  const { settings } = useSiteSettings();
  const { user, logout, users, toggleUserStatus, updateUserRole } = useAuth();

  // Product dialog state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const productFileRef = useRef<HTMLInputElement>(null);

  // Product pagination
  const PRODUCTS_PER_PAGE = 15;
  const [productPage, setProductPage] = useState(1);
  const [mobileProductLimit, setMobileProductLimit] = useState(PRODUCTS_PER_PAGE);

  // Order filter state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All Status');
  const [orderPage, setOrderPage] = useState(1);
  const [mobileOrderLimit, setMobileOrderLimit] = useState(PRODUCTS_PER_PAGE);

  // User search
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [mobileUserLimit, setMobileUserLimit] = useState(PRODUCTS_PER_PAGE);

  const allFilteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const totalProductPages = Math.ceil(allFilteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * PRODUCTS_PER_PAGE;
    return allFilteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [allFilteredProducts, productPage]);

  const mobileProducts = useMemo(() => {
    return allFilteredProducts.slice(0, mobileProductLimit);
  }, [allFilteredProducts, mobileProductLimit]);

  const allFilteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customerName || '').toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'All Status' || o.status === orderStatusFilter.toLowerCase();
      if (orderStatusFilter === 'All Status' && o.status === 'refunded') return false;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const totalOrderPages = Math.ceil(allFilteredOrders.length / PRODUCTS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * PRODUCTS_PER_PAGE;
    return allFilteredOrders.slice(start, start + PRODUCTS_PER_PAGE);
  }, [allFilteredOrders, orderPage]);

  const mobileOrders = useMemo(() => {
    return allFilteredOrders.slice(0, mobileOrderLimit);
  }, [allFilteredOrders, mobileOrderLimit]);

  const allFilteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const totalUserPages = Math.ceil(allFilteredUsers.length / PRODUCTS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * PRODUCTS_PER_PAGE;
    return allFilteredUsers.slice(start, start + PRODUCTS_PER_PAGE);
  }, [allFilteredUsers, userPage]);

  const mobileUsers = useMemo(() => {
    return allFilteredUsers.slice(0, mobileUserLimit);
  }, [allFilteredUsers, mobileUserLimit]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const customers = users.filter(u => u.role === 'customer').length;
    return [
      { label: 'Total Revenue', value: `$${revenue.toFixed(2)}`, change: '+12.5%', up: true, icon: DollarSign },
      { label: 'Total Orders', value: String(totalOrders), change: '+8.2%', up: true, icon: ShoppingBag },
      { label: 'Products', value: String(totalProducts), change: '+3.1%', up: true, icon: Boxes },
      { label: 'Customers', value: String(customers), change: '+15.3%', up: true, icon: Users },
    ];
  }, [orders, products, users]);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  // Reset pagination when search/filter changes
  useEffect(() => {
    setProductPage(1);
    setMobileProductLimit(PRODUCTS_PER_PAGE);
  }, [productSearch]);

  useEffect(() => {
    setOrderPage(1);
    setMobileOrderLimit(PRODUCTS_PER_PAGE);
  }, [orderSearch, orderStatusFilter]);

  useEffect(() => {
    setUserPage(1);
    setMobileUserLimit(PRODUCTS_PER_PAGE);
  }, [userSearch]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Product updated successfully');
    } else {
      addProduct(productData as Omit<Product, 'id'>);
      toast.success('Product added successfully');
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      toast.success('Product deleted');
      setProductToDelete(null);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const getUserOrderCount = (userId: string) => {
    return orders.filter(o => o.customerEmail && users.find(u => u.id === userId)?.email === o.customerEmail).length;
  };

  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.product.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1A1A1A; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            .subtitle { color: #6B7280; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid #1A5A6B; color: #1A5A6B; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 24px; padding-top: 16px; border-top: 2px solid #1A5A6B; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .info-box { background: #f9f9f9; padding: 12px; border-radius: 8px; }
            .info-box strong { display: block; margin-bottom: 4px; color: #1A5A6B; }
          </style>
        </head>
        <body>
          <h1>GoWild Outdoor Store</h1>
          <p class="subtitle">Invoice #${order.id}</p>
          <div class="info">
            <div class="info-box">
              <strong>Bill To</strong>
              ${order.customerName || 'Guest'}<br>
              ${order.customerEmail || ''}
            </div>
            <div class="info-box">
              <strong>Order Info</strong>
              Date: ${order.date}<br>
              Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
          ${order.shippingAddress ? `<div class="info-box" style="margin-bottom:24px;"><strong>Shipping Address</strong>${order.shippingAddress}</div>` : ''}
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total">Total: $${order.total.toFixed(2)}</div>
          <script>window.onload = () => { setTimeout(() => window.print(), 200); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 5px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>

      {/* Mobile sidebar overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-[#1A4A52] text-white flex-shrink-0 transition-all duration-300 fixed h-full z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="p-4 flex items-center justify-between h-16">
          {!sidebarCollapsed && <img src={settings.logo} alt={settings.storeName} className="h-8 w-auto brightness-0 invert" />}
          <div className="flex items-center gap-2">
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-white/10 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Desktop collapse button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded hover:bg-white/10 hidden lg:block"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <nav className="mt-2 px-2 overflow-y-auto scrollbar-thin" style={{ maxHeight: sidebarCollapsed ? 'calc(100vh - 5rem)' : 'calc(100vh - 12rem)' }}>
          {ADMIN_NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-4">
              {!sidebarCollapsed && (
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-[#E8552A]/90 text-white shadow-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/10 rounded-lg">
            <p className="text-xs text-white/70">Logged in as</p>
            <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
            <button
              onClick={logout}
              className="mt-2 flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
            >
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={cn('flex-1 transition-all duration-300 ml-0', sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-[#1A1A1A] capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="text-xs sm:text-sm text-[#1A5A6B] font-medium hover:underline hidden sm:block">View Store</Link>
            <button
              onClick={logout}
              className="text-xs sm:text-sm text-[#E85D4E] font-medium hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1A5A6B] text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading font-bold mb-4">Sales Overview</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orders.map(o => ({ date: o.date, total: o.total })).slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Bar dataKey="total" fill="#1A5A6B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading font-bold mb-4">Orders by Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#1A5A6B' },
                            { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#E8552A' },
                            { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#52796F' },
                            { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#9CA3AF' },
                            { name: 'Refunded', value: orders.filter(o => o.status === 'refunded').length, color: '#A855F7' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {[
                            { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#1A5A6B' },
                            { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#E8552A' },
                            { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#52796F' },
                            { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#9CA3AF' },
                            { name: 'Refunded', value: orders.filter(o => o.status === 'refunded').length, color: '#A855F7' },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="font-heading font-bold">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-[#1A5A6B] font-medium hover:underline">View All</button>
                </div>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
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
                          <TableCell>{order.customerName || 'Guest'}</TableCell>
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
                {/* Mobile Cards */}
                <div className="block md:hidden divide-y">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-sm">{order.id}</span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B7280]">{order.customerName || 'Guest'}</span>
                        <span className="font-semibold">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-[#6B7280]">{order.date}</div>
                    </div>
                  ))}
                </div>
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
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const headers = ['name','category','price','originalPrice','stock','image','description','badge','isPin','isBundle','status','colors','sizes','createdAt'];
                        const rows = products.map(p => [
                          p.name, p.category, p.price, p.originalPrice ?? '', p.stock, p.image, p.description,
                          p.badge ?? '', p.isPin ? '1' : '0', p.isBundle ? '1' : '0', p.status ?? 'active',
                          (p.colors || []).join('|'), (p.sizes || []).join('|'), p.createdAt ?? ''
                        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
                        const csv = [headers.join(','), ...rows].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'gowild-products.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Products exported');
                      }}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Export
                    </button>
                    <button
                      onClick={() => productFileRef.current?.click()}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 hover:border-[#1A5A6B] hover:text-[#1A5A6B] transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Import
                    </button>
                    <input
                      ref={productFileRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => {
                          const text = String(ev.target?.result || '');
                          const lines = text.split('\n').filter(l => l.trim());
                          if (lines.length < 2) { toast.error('CSV is empty'); return; }
                          const imported: Omit<Product, 'id'>[] = [];
                          for (let i = 1; i < lines.length; i++) {
                            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                            if (cols.length < 6) continue;
                            const [name, category, price, originalPrice, stock, image, description, badge, isPin, isBundle, status, colors, sizes, createdAt] = cols;
                            if (!name || !price || !stock) continue;
                            imported.push({
                              name,
                              category: category || 'Accessories',
                              price: parseFloat(price) || 0,
                              originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
                              stock: parseInt(stock) || 0,
                              image: image || '/placeholder.jpg',
                              description: description || '',
                              badge: badge || undefined,
                              isPin: isPin === '1' || isPin === 'true',
                              isBundle: isBundle === '1' || isBundle === 'true',
                              status: (status as 'active' | 'inactive') || 'active',
                              colors: colors ? colors.split('|').filter(Boolean) : [],
                              sizes: sizes ? sizes.split('|').filter(Boolean) : [],
                              specs: [],
                              rating: 4.5,
                              reviewCount: 0,
                              createdAt: createdAt || new Date().toISOString().split('T')[0],
                            });
                          }
                          imported.forEach(p => addProduct(p));
                          toast.success(`${imported.length} products imported`);
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                    />
                    <button
                      onClick={handleAddProduct}
                      className="bg-[#1A5A6B] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1A8DA3] transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>
                </div>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Best Seller</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map(product => (
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
                            <button
                              onClick={() => toggleProductStatus(product.id)}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${STATUS_COLORS[product.status || 'active']}`}
                            >
                              {(product.status || 'active').charAt(0).toUpperCase() + (product.status || 'active').slice(1)}
                            </button>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <button
                              onClick={() => updateProduct(product.id, { isBestSeller: !product.isBestSeller })}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                                product.isBestSeller ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {product.isBestSeller ? '★ Best Seller' : '—'}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6B7280]"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(product.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#E85D4E]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Product Cards */}
                <div className="block md:hidden divide-y">
                  {mobileProducts.map(product => (
                    <div key={product.id} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-xs text-[#6B7280]">{product.category}</p>
                        </div>
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${STATUS_COLORS[product.status || 'active']}`}
                        >
                          {(product.status || 'active').charAt(0).toUpperCase() + (product.status || 'active').slice(1)}
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-[#6B7280]">Price</p>
                          <p className="font-semibold">${product.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280]">Stock</p>
                          <p className="font-semibold">{product.stock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280]">Best Seller</p>
                          <button
                            onClick={() => updateProduct(product.id, { isBestSeller: !product.isBestSeller })}
                            className={`text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              product.isBestSeller ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {product.isBestSeller ? '★' : '—'}
                          </button>
                        </div>
                        <div className="flex items-end justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-[#E85D4E]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop Pagination */}
                <div className="hidden md:flex p-4 border-t items-center justify-between">
                  <span className="text-sm text-[#6B7280]">
                    Showing {paginatedProducts.length} of {allFilteredProducts.length} products
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProductPage(p => Math.max(1, p - 1))}
                      disabled={productPage === 1}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setProductPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium ${
                          productPage === page
                            ? 'bg-[#1A5A6B] text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))}
                      disabled={productPage === totalProductPages}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Show More */}
                <div className="block md:hidden p-4 border-t text-center">
                  <span className="text-sm text-[#6B7280]">
                    Showing {mobileProducts.length} of {allFilteredProducts.length} products
                  </span>
                  {mobileProducts.length < allFilteredProducts.length && (
                    <button
                      onClick={() => setMobileProductLimit(l => l + PRODUCTS_PER_PAGE)}
                      className="mt-2 w-full bg-[#1A5A6B] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1A8DA3] transition-all"
                    >
                      Show More
                    </button>
                  )}
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
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                    />
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border rounded-lg text-sm focus:outline-none"
                  >
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                    <option>Refunded</option>
                  </select>
                </div>
                {/* Desktop Orders Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="hidden sm:table-cell">Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">{order.id}</TableCell>
                        <TableCell>{order.customerName || 'Guest'}</TableCell>
                        <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.items.length}</TableCell>
                        <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1A5A6B]"><Eye className="w-4 h-4" /></button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="font-heading">Order {order.id}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 space-y-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                                      <div><span className="text-[#6B7280]">Customer:</span> {order.customerName || 'Guest'}</div>
                                      <div><span className="text-[#6B7280]">Date:</span> {order.date}</div>
                                      <div><span className="text-[#6B7280]">Status:</span>
                                        <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                                          {order.status}
                                        </span>
                                      </div>
                                      <div><span className="text-[#6B7280]">Total:</span> <span className="font-bold">${order.total.toFixed(2)}</span></div>
                                    </div>
                                    <button
                                      onClick={() => printInvoice(order)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1A5A6B] text-white hover:bg-[#1A8DA3] transition-colors flex-shrink-0"
                                    >
                                      <Printer className="w-3.5 h-3.5" /> Print
                                    </button>
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
                                  {order.shippingAddress && (
                                    <div className="text-sm">
                                      <span className="text-[#6B7280]">Shipping:</span> {order.shippingAddress}
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            {order.status !== 'cancelled' && order.status !== 'refunded' && (
                              <button
                                onClick={() => {
                                  cancelOrder(order.id);
                                  toast.success('Order cancelled');
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#E85D4E]"
                                title="Cancel Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {(order.status === 'delivered' || order.status === 'shipped') && (
                              <button
                                onClick={() => {
                                  refundOrder(order.id);
                                  toast.success('Order refunded');
                                }}
                                className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600"
                                title="Refund Order"
                              >
                                <TrendingDown className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Desktop Order Pagination */}
                <div className="hidden md:flex p-4 border-t items-center justify-between">
                  <span className="text-sm text-[#6B7280]">
                    Showing {paginatedOrders.length} of {allFilteredOrders.length} orders
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setOrderPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium ${
                          orderPage === page
                            ? 'bg-[#1A5A6B] text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))}
                      disabled={orderPage === totalOrderPages}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Order Cards */}
                <div className="block md:hidden divide-y">
                  {mobileOrders.map(order => (
                    <div key={order.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-sm">{order.id}</span>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B7280]">{order.customerName || 'Guest'}</span>
                        <span className="font-semibold">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#6B7280]">
                        <span>{order.date}</span>
                        <span>{order.items.length} items</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1A5A6B]"><Eye className="w-4 h-4" /></button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="font-heading">Order {order.id}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                                  <div><span className="text-[#6B7280]">Customer:</span> {order.customerName || 'Guest'}</div>
                                  <div><span className="text-[#6B7280]">Date:</span> {order.date}</div>
                                  <div><span className="text-[#6B7280]">Status:</span>
                                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <div><span className="text-[#6B7280]">Total:</span> <span className="font-bold">${order.total.toFixed(2)}</span></div>
                                </div>
                                <button
                                  onClick={() => printInvoice(order)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1A5A6B] text-white hover:bg-[#1A8DA3] transition-colors flex-shrink-0"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Print
                                </button>
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
                              {order.shippingAddress && (
                                <div className="text-sm">
                                  <span className="text-[#6B7280]">Shipping:</span> {order.shippingAddress}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {order.status !== 'cancelled' && order.status !== 'refunded' && (
                          <button
                            onClick={() => {
                              cancelOrder(order.id);
                              toast.success('Order cancelled');
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#E85D4E]"
                            title="Cancel Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {(order.status === 'delivered' || order.status === 'shipped') && (
                          <button
                            onClick={() => {
                              refundOrder(order.id);
                              toast.success('Order refunded');
                            }}
                            className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600"
                            title="Refund Order"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Order Show More */}
                <div className="block md:hidden p-4 border-t text-center">
                  <span className="text-sm text-[#6B7280]">
                    Showing {mobileOrders.length} of {allFilteredOrders.length} orders
                  </span>
                  {mobileOrders.length < allFilteredOrders.length && (
                    <button
                      onClick={() => setMobileOrderLimit(l => l + PRODUCTS_PER_PAGE)}
                      className="mt-2 w-full bg-[#1A5A6B] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1A8DA3] transition-all"
                    >
                      Show More
                    </button>
                  )}
                </div>
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
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30"
                    />
                  </div>
                </div>
                {/* Desktop Users Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="hidden sm:table-cell">Orders</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <select
                            value={u.role}
                            onChange={e => updateUserRole(u.id, e.target.value as 'admin' | 'staff' | 'customer')}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${u.role === 'admin' ? 'bg-[#1A5A6B]/15 text-[#1A5A6B]' : u.role === 'staff' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{getUserOrderCount(u.id)}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${STATUS_COLORS[u.status]}`}
                          >
                            {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1A5A6B]"><Eye className="w-4 h-4" /></button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="font-heading">User Details</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 space-y-3 text-sm">
                                  <div><span className="text-[#6B7280]">Name:</span> {u.name}</div>
                                  <div><span className="text-[#6B7280]">Email:</span> {u.email}</div>
                                  <div><span className="text-[#6B7280]">Phone:</span> {u.phone || 'N/A'}</div>
                                  <div><span className="text-[#6B7280]">Role:</span> {u.role}</div>
                                  <div><span className="text-[#6B7280]">Status:</span>
                                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[u.status]}`}>
                                      {u.status}
                                    </span>
                                  </div>
                                  <div><span className="text-[#6B7280]">Address:</span> {u.address ? `${u.address.street}, ${u.address.city}, ${u.address.state} ${u.address.zip}` : 'N/A'}</div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Desktop User Pagination */}
                <div className="hidden md:flex p-4 border-t items-center justify-between">
                  <span className="text-sm text-[#6B7280]">
                    Showing {paginatedUsers.length} of {allFilteredUsers.length} users
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setUserPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium ${
                          userPage === page
                            ? 'bg-[#1A5A6B] text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                      disabled={userPage === totalUserPages}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile User Cards */}
                <div className="block md:hidden divide-y">
                  {mobileUsers.map(u => (
                    <div key={u.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-[#6B7280]">{u.email}</p>
                        </div>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${STATUS_COLORS[u.status]}`}
                        >
                          {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-xs text-[#6B7280]">{getUserOrderCount(u.id)} orders</span>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1A5A6B]"><Eye className="w-4 h-4" /></button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="font-heading">User Details</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 space-y-3 text-sm">
                                <div><span className="text-[#6B7280]">Name:</span> {u.name}</div>
                                <div><span className="text-[#6B7280]">Email:</span> {u.email}</div>
                                <div><span className="text-[#6B7280]">Phone:</span> {u.phone || 'N/A'}</div>
                                <div><span className="text-[#6B7280]">Role:</span> {u.role}</div>
                                <div><span className="text-[#6B7280]">Status:</span>
                                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[u.status]}`}>
                                    {u.status}
                                  </span>
                                </div>
                                <div><span className="text-[#6B7280]">Address:</span> {u.address ? `${u.address.street}, ${u.address.city}, ${u.address.state} ${u.address.zip}` : 'N/A'}</div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <select
                            value={u.role}
                            onChange={e => updateUserRole(u.id, e.target.value as 'admin' | 'staff' | 'customer')}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${u.role === 'admin' ? 'bg-[#1A5A6B]/15 text-[#1A5A6B]' : u.role === 'staff' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile User Show More */}
                <div className="block md:hidden p-4 border-t text-center">
                  <span className="text-sm text-[#6B7280]">
                    Showing {mobileUsers.length} of {allFilteredUsers.length} users
                  </span>
                  {mobileUsers.length < allFilteredUsers.length && (
                    <button
                      onClick={() => setMobileUserLimit(l => l + PRODUCTS_PER_PAGE)}
                      className="mt-2 w-full bg-[#1A5A6B] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1A8DA3] transition-all"
                    >
                      Show More
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading font-bold mb-4">Revenue Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={orders.map(o => ({ date: o.date, total: o.total })).slice(0, 15)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Area type="monotone" dataKey="total" stroke="#1A5A6B" fill="#1A5A6B" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading font-bold mb-4">Top Selling Products</h3>
                  <div className="space-y-4">
                    {useMemo(() => {
                      const salesMap = new Map<string, { product: Product; qty: number; revenue: number }>();
                      orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').forEach(order => {
                        order.items.forEach(item => {
                          const existing = salesMap.get(item.product.id);
                          if (existing) {
                            existing.qty += item.quantity;
                            existing.revenue += item.product.price * item.quantity;
                          } else {
                            salesMap.set(item.product.id, {
                              product: item.product,
                              qty: item.quantity,
                              revenue: item.product.price * item.quantity,
                            });
                          }
                        });
                      });
                      return Array.from(salesMap.values())
                        .sort((a, b) => b.qty - a.qty)
                        .slice(0, 5);
                    }, [orders]).map((item, i) => (
                      <div key={item.product.id} className="flex items-center gap-4">
                        <span className="text-lg font-bold text-[#6B7280] w-6 flex-shrink-0">#{i + 1}</span>
                        <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">{item.qty} sold · ${item.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No sales data yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Content */}
          {activeTab === 'homepage' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ContentEditor onNavigateToPromotions={() => setActiveTab('promotions')} />
            </motion.div>
          )}

          {/* Navigation */}
          {activeTab === 'navigation' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <NavigationEditor />
            </motion.div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CategoriesEditor />
            </motion.div>
          )}

          {/* Promotions */}
          {activeTab === 'promotions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PromotionsEditor />
            </motion.div>
          )}

          {/* Promo Codes */}
          {activeTab === 'promoCodes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PromoCodesEditor />
            </motion.div>
          )}

          {/* About Page */}
          {activeTab === 'about' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AboutEditor />
            </motion.div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ReviewsEditor />
            </motion.div>
          )}

          {/* Bundle Texts */}
          {activeTab === 'bundleTexts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BundleTextsEditor />
            </motion.div>
          )}

          {/* Product Bundles */}
          {activeTab === 'bundles' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BundlesEditor />
            </motion.div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SettingsEditor />
            </motion.div>
          )}
        </div>
      </main>

      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
