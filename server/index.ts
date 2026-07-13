import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import db from './db';

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'gowild-dev-secret-change-me';

// --- Security Middleware ---

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
});

app.use(generalLimiter);

// --- Auth Helpers ---

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded as { id: string; email: string; role: string };
    next();
  });
}

function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function generateToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

function toUserPublic(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    avatar: row.avatar ?? undefined,
    role: row.role,
    status: row.status,
    address: row.address ? JSON.parse(row.address) : undefined,
    wishlist: row.wishlist ? JSON.parse(row.wishlist) : undefined,
    createdAt: row.createdAt,
  };
}

// --- Health ---

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// --- Auth Routes ---

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  let valid = false;
  if (user.password && user.password.startsWith('$2')) {
    // Bcrypt-hashed password
    valid = bcrypt.compareSync(password, user.password);
  } else {
    // Legacy plaintext password fallback
    valid = user.password === password;
    // Auto-migrate to hashed password on successful login
    if (valid) {
      const hashed = bcrypt.hashSync(password, 12);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id);
    }
  }

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: toUserPublic(user),
  });
});

app.post('/api/auth/register', authLimiter, (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const id = `u${Date.now()}`;
  const hashedPassword = bcrypt.hashSync(password, 12);

  try {
    db.prepare(`
      INSERT INTO users (id, name, email, phone, avatar, role, status, address, wishlist, createdAt, password, paymentMethods)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, null, null, 'customer', 'active', null, null, new Date().toISOString(), hashedPassword, null);

    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user: toUserPublic(user) });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    throw e;
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(toUserPublic(user));
});

// --- Products ---

function parseProduct(row: any) {
  return {
    ...row,
    images: row.images ? JSON.parse(row.images) : undefined,
    colorImages: row.colorImages ? JSON.parse(row.colorImages) : undefined,
    colors: row.colors ? JSON.parse(row.colors) : undefined,
    sizes: row.sizes ? JSON.parse(row.sizes) : undefined,
    specs: row.specs ? JSON.parse(row.specs) : undefined,
    isBundle: row.isBundle === 1,
    isPin: row.isPin === 1,
    isBestSeller: row.isBestSeller === 1,
    originalPrice: row.originalPrice ?? undefined,
  };
}

app.get('/api/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products').all();
  res.json(rows.map(parseProduct));
});

app.get('/api/products/:id', (req, res) => {
  const row: any = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(parseProduct(row));
});

app.post('/api/products', authenticateToken, requireRole('admin', 'staff'), (req: AuthenticatedRequest, res) => {
  const p = req.body;
  const id = p.id || `p${Date.now()}`;
  db.prepare(`
    INSERT INTO products (id, name, category, price, originalPrice, image, images, colorImages, rating, reviewCount, badge, description, stock, colors, sizes, specs, isBundle, bundleSize, isPin, isBestSeller, createdAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, p.name, p.category, p.price, p.originalPrice ?? null, p.image,
    p.images ? JSON.stringify(p.images) : null,
    p.colorImages ? JSON.stringify(p.colorImages) : null,
    p.rating ?? 0, p.reviewCount ?? 0, p.badge ?? null, p.description, p.stock ?? 0,
    p.colors ? JSON.stringify(p.colors) : null,
    p.sizes ? JSON.stringify(p.sizes) : null,
    p.specs ? JSON.stringify(p.specs) : null,
    p.isBundle ? 1 : 0, p.bundleSize ?? null,
    p.isPin ? 1 : 0, p.isBestSeller ? 1 : 0,
    p.createdAt ?? new Date().toISOString().split('T')[0], p.status ?? 'active'
  );
  res.status(201).json({ id });
});

app.put('/api/products/:id', authenticateToken, requireRole('admin', 'staff'), (req: AuthenticatedRequest, res) => {
  const p = req.body;
  const fields: string[] = [];
  const values: any[] = [];

  const map: Record<string, any> = {
    name: p.name, category: p.category, price: p.price, originalPrice: p.originalPrice,
    image: p.image, rating: p.rating, reviewCount: p.reviewCount, badge: p.badge,
    description: p.description, stock: p.stock, bundleSize: p.bundleSize,
    createdAt: p.createdAt, status: p.status,
  };

  for (const [key, val] of Object.entries(map)) {
    if (val !== undefined) { fields.push(`${key} = ?`); values.push(val); }
  }
  if (p.images !== undefined) { fields.push('images = ?'); values.push(JSON.stringify(p.images)); }
  if (p.colorImages !== undefined) { fields.push('colorImages = ?'); values.push(JSON.stringify(p.colorImages)); }
  if (p.colors !== undefined) { fields.push('colors = ?'); values.push(JSON.stringify(p.colors)); }
  if (p.sizes !== undefined) { fields.push('sizes = ?'); values.push(JSON.stringify(p.sizes)); }
  if (p.specs !== undefined) { fields.push('specs = ?'); values.push(JSON.stringify(p.specs)); }
  if (p.isBundle !== undefined) { fields.push('isBundle = ?'); values.push(p.isBundle ? 1 : 0); }
  if (p.isPin !== undefined) { fields.push('isPin = ?'); values.push(p.isPin ? 1 : 0); }
  if (p.isBestSeller !== undefined) { fields.push('isBestSeller = ?'); values.push(p.isBestSeller ? 1 : 0); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);

  db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

app.delete('/api/products/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Orders ---

app.get('/api/orders', authenticateToken, requireRole('admin', 'staff'), (_req, res) => {
  const orders: any[] = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
  for (const order of orders) {
    order.items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
  }
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const o = req.body;
  const id = o.id || `GW-${Date.now()}`;
  db.prepare(`
    INSERT INTO orders (id, date, total, status, shippingAddress, customerName, customerEmail)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, o.date, o.total, o.status || 'pending', o.shippingAddress ?? null, o.customerName ?? null, o.customerEmail ?? null);

  if (o.items?.length) {
    const insertItem = db.prepare(`
      INSERT INTO order_items (orderId, productId, productName, productImage, price, quantity, color, size, bundlePrice)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of o.items) {
      insertItem.run(id, item.productId || item.product?.id, item.productName || item.product?.name, item.productImage || item.product?.image, item.price || item.product?.price, item.quantity, item.color ?? null, item.size ?? null, item.bundlePrice ?? null);
    }
  }
  res.status(201).json({ id });
});

app.put('/api/orders/:id/status', authenticateToken, requireRole('admin', 'staff'), (req: AuthenticatedRequest, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/orders/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Reviews ---

app.get('/api/reviews', (_req, res) => {
  const rows = db.prepare('SELECT * FROM reviews ORDER BY date DESC').all();
  res.json(rows.map((r: any) => ({ ...r, approved: r.approved === 1 })));
});

app.get('/api/reviews/product/:productId', (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews WHERE productId = ? ORDER BY date DESC').all(req.params.productId);
  res.json(rows.map((r: any) => ({ ...r, approved: r.approved === 1 })));
});

app.post('/api/reviews', (req, res) => {
  const r = req.body;
  const id = r.id || `r${Date.now()}`;
  db.prepare(`
    INSERT INTO reviews (id, productId, productName, userName, date, rating, text, photo, approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, r.productId, r.productName, r.userName, r.date, r.rating, r.text, r.photo ?? null, r.approved ? 1 : 0);
  res.status(201).json({ id });
});

app.put('/api/reviews/:id/approve', authenticateToken, requireRole('admin', 'staff'), (req: AuthenticatedRequest, res) => {
  db.prepare('UPDATE reviews SET approved = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.put('/api/reviews/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const r = req.body;
  db.prepare('UPDATE reviews SET text = ?, rating = ? WHERE id = ?').run(r.text, r.rating, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/reviews/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Users ---

app.get('/api/users', authenticateToken, requireRole('admin', 'staff'), (_req, res) => {
  const rows = db.prepare('SELECT id, name, email, phone, avatar, role, status, address, wishlist, createdAt FROM users').all();
  res.json(rows.map((u: any) => ({
    ...u,
    address: u.address ? JSON.parse(u.address) : undefined,
    wishlist: u.wishlist ? JSON.parse(u.wishlist) : undefined,
  })));
});

app.get('/api/users/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user!.id !== req.params.id && req.user!.role !== 'admin' && req.user!.role !== 'staff') {
    return res.status(403).json({ error: 'Cannot view another user\'s profile' });
  }
  const u: any = db.prepare('SELECT id, name, email, phone, avatar, role, status, address, wishlist, createdAt FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({
    ...u,
    address: u.address ? JSON.parse(u.address) : undefined,
    wishlist: u.wishlist ? JSON.parse(u.wishlist) : undefined,
  });
});

app.post('/api/users', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const u = req.body;
  const id = u.id || `u${Date.now()}`;
  const hashedPassword = u.password ? bcrypt.hashSync(u.password, 12) : null;

  try {
    db.prepare(`
      INSERT INTO users (id, name, email, phone, avatar, role, status, address, wishlist, createdAt, password, paymentMethods)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, u.name, u.email, u.phone ?? null, u.avatar ?? null, u.role ?? 'customer', u.status ?? 'active', u.address ? JSON.stringify(u.address) : null, u.wishlist ? JSON.stringify(u.wishlist) : null, u.createdAt ?? new Date().toISOString(), hashedPassword, u.paymentMethods ? JSON.stringify(u.paymentMethods) : null);
    res.status(201).json({ id });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    throw e;
  }
});

app.put('/api/users/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  // Users can only update themselves unless they're admin
  if (req.user!.id !== req.params.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Cannot update another user\'s profile' });
  }

  const u = req.body;
  const fields: string[] = [];
  const values: any[] = [];

  const selfUpdatable = ['name', 'email', 'phone', 'avatar'];
  const adminUpdatable = ['role', 'status'];

  for (const key of selfUpdatable) {
    if (u[key] !== undefined) { fields.push(`${key} = ?`); values.push(u[key]); }
  }
  for (const key of adminUpdatable) {
    if (u[key] !== undefined && req.user!.role === 'admin') { fields.push(`${key} = ?`); values.push(u[key]); }
  }
  if (u.password !== undefined) {
    fields.push('password = ?');
    values.push(bcrypt.hashSync(u.password, 12));
  }
  if (u.address !== undefined) { fields.push('address = ?'); values.push(JSON.stringify(u.address)); }
  if (u.wishlist !== undefined) { fields.push('wishlist = ?'); values.push(JSON.stringify(u.wishlist)); }
  if (u.paymentMethods !== undefined) { fields.push('paymentMethods = ?'); values.push(JSON.stringify(u.paymentMethods)); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

app.put('/api/users/:id/password', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }

  const user: any = db.prepare('SELECT password FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Only require current password if updating own account
  if (req.user!.id !== req.params.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Cannot change another user\'s password' });
  }

  if (req.user!.id === req.params.id) {
    const valid = bcrypt.compareSync(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hashed = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.params.id);
  res.json({ ok: true });
});

// --- Settings ---

app.get('/api/settings', (_req, res) => {
  const row: any = db.prepare('SELECT data FROM settings WHERE id = 1').get();
  if (!row) return res.json({});
  res.json(JSON.parse(row.data));
});

app.put('/api/settings', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const data = JSON.stringify(req.body);
  const existing: any = db.prepare('SELECT id FROM settings WHERE id = 1').get();
  if (existing) {
    db.prepare('UPDATE settings SET data = ? WHERE id = 1').run(data);
  } else {
    db.prepare('INSERT INTO settings (id, data) VALUES (1, ?)').run(data);
  }
  res.json({ ok: true });
});

// --- Static Files & SPA Fallback ---

const distPath = path.resolve(process.cwd(), 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: '1y', immutable: true }));

  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({ message: 'GoWild API Server', status: 'dist folder not found — run npm run build' });
  });
}

// --- Error Handler ---

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server] error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// --- Start ---

app.listen(PORT, () => {
  console.log(`[server] GoWild API listening on port ${PORT}`);
  console.log(`[server] Database: ${process.env.DB_DIR || './data'}/gowild.db`);
});
