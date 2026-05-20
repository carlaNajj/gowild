---
name: admin-store-section
description: Reference for the GoWild admin panel Store section covering Dashboard, Products, Orders, and Users management. Use when working on store operations, product CRUD, order lifecycle, user management, or any admin page tab under the Store sidebar section.
---

# Admin Store Section

The Store section is the core operational hub of the GoWild admin panel. It contains four tabs: Dashboard, Products, Orders, and Users. All UI is rendered inline in `src/pages/AdminPage.tsx` via `activeTab` state.

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/AdminPage.tsx` | Main admin page. Renders all Store tabs (dashboard, products, orders, users) inline |
| `src/components/admin/ProductFormDialog.tsx` | Add/Edit product modal dialog |
| `src/components/admin/ConfirmDialog.tsx` | Reusable confirmation dialog (used for product delete) |
| `src/store.tsx` | Source of truth for `Product`, `Order` types and store actions |
| `src/auth.tsx` | Source of truth for `User` type and auth actions |

## Dashboard Tab (`activeTab === 'dashboard'`)

- **Stats cards**: Total Revenue (delivered orders only), Total Orders, Products count, Customers count
- **Charts**: Sales Overview (BarChart of last 10 orders), Orders by Status (PieChart)
- **Recent Orders table**: Last 5 orders with quick link to full Orders tab
- **Data sources**: `useStore()` → `products`, `orders`; `useAuth()` → `users`

## Products Tab (`activeTab === 'products'`)

- **Table columns**: Product (image + name), Category, Price, Stock, Status, Best Seller, Actions
- **Search**: Filters by product name or category
- **Pagination**: 15 per page on desktop; "Show More" on mobile
- **Actions**:
  - Add Product → opens `ProductFormDialog`
  - Edit → opens `ProductFormDialog` with product pre-filled
  - Delete → `ConfirmDialog` → `deleteProduct(id)`
  - Toggle Status → `toggleProductStatus(id)` (active/inactive)
  - Toggle Best Seller → `updateProduct(id, { isBestSeller: !isBestSeller })`
- **CSV Import/Export**: Export generates `gowild-products.csv`; Import parses CSV and calls `addProduct()` for each row
- **ProductFormDialog fields**: name, category (select from `CATEGORIES`), price, originalPrice, stock, image (via `ImageUploader`), description, badge (select), isPin checkbox, isBundle checkbox, colors (tag input), sizes (tag input), specs (label/value pairs)

### Product Type (from `src/store.tsx`)

```ts
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  colorImages?: Record<string, string[]>;
  rating: number;
  reviewCount: number;
  badge?: string;
  description: string;
  stock: number;
  colors?: string[];
  sizes?: string[];
  specs?: { label: string; value: string }[];
  isBundle?: boolean;
  bundleSize?: number;
  isPin?: boolean;
  isBestSeller?: boolean;
  status?: 'active' | 'inactive';
  createdAt?: string;
}
```

## Orders Tab (`activeTab === 'orders'`)

- **Table columns**: Order ID, Customer, Date, Items count, Total, Status, Actions
- **Search**: By order ID or customer name
- **Filter**: Status dropdown (All Status, Pending, Shipped, Delivered, Cancelled, Refunded)
- **Pagination**: Same 15/page pattern as Products
- **Actions**:
  - View → Dialog with order details, item list, shipping address, Print Invoice button
  - Cancel → `cancelOrder(id)` (only if not cancelled/refunded)
  - Refund → `refundOrder(id)` (only if delivered or shipped)
  - Status change → Dropdown directly in table → `updateOrderStatus(id, newStatus)`
- **Print Invoice**: Opens a new window with styled HTML invoice and auto-triggers `window.print()`

### Order Type (from `src/store.tsx`)

```ts
interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress?: string;
  customerName?: string;
  customerEmail?: string;
}
```

### Status Colors

| Status | Color Class |
|--------|-------------|
| pending | `bg-amber-100 text-amber-700` |
| shipped | `bg-blue-100 text-blue-700` |
| delivered | `bg-green-100 text-green-700` |
| cancelled | `bg-red-100 text-red-700` |
| refunded | `bg-purple-100 text-purple-700` |

## Users Tab (`activeTab === 'users'`)

- **Table columns**: Name, Email, Phone, Role, Orders, Status, Actions
- **Search**: By name or email
- **Pagination**: Same 15/page pattern
- **Actions**:
  - View Details → Dialog showing full user profile: avatar, contact info, role, status, member since, orders count, delivered count, wishlist count, address, payment methods
  - Toggle Status → `toggleUserStatus(id)` (active/inactive)
  - Change Role → Dropdown (customer / staff / admin) → `updateUserRole(id, role)`
- **Order counts**: Computed by matching `user.email` against `order.customerEmail`

### User Roles & Styles

| Role | Badge Style |
|------|-------------|
| admin | `bg-[#1A5A6B]/15 text-[#1A5A6B]` |
| staff | `bg-purple-100 text-purple-700` |
| customer | `bg-gray-100 text-gray-600` |

## Common Patterns

- All tables have both desktop (`<Table>`) and mobile (card list) views
- All tabs use `motion.div` with `initial={{ opacity: 0 }}` for enter animation
- Actions that mutate data show `toast.success()` via sonner
