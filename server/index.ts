import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import db from './db';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// --- Health ---
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// --- Products ---

app.get('/api/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products').all();
  const products = rows.map((row: any) => ({
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
  }));
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const row: any = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json({
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
  });
});

app.post('/api/products', (req, res) => {
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

app.put('/api/products/:id', (req, res) => {
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

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Orders ---

app.get('/api/orders', (_req, res) => {
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

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/orders/:id', (req, res) => {
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

app.put('/api/reviews/:id/approve', (req, res) => {
  db.prepare('UPDATE reviews SET approved = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.put('/api/reviews/:id', (req, res) => {
  const r = req.body;
  db.prepare('UPDATE reviews SET text = ?, rating = ? WHERE id = ?').run(r.text, r.rating, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/reviews/:id', (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Users ---

app.get('/api/users', (_req, res) => {
  const rows = db.prepare('SELECT id, name, email, phone, avatar, role, status, address, wishlist, createdAt FROM users').all();
  res.json(rows.map((u: any) => ({
    ...u,
    address: u.address ? JSON.parse(u.address) : undefined,
    wishlist: u.wishlist ? JSON.parse(u.wishlist) : undefined,
  })));
});

app.get('/api/users/:id', (req, res) => {
  const u: any = db.prepare('SELECT id, name, email, phone, avatar, role, status, address, wishlist, createdAt FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({
    ...u,
    address: u.address ? JSON.parse(u.address) : undefined,
    wishlist: u.wishlist ? JSON.parse(u.wishlist) : undefined,
  });
});

app.post('/api/users', (req, res) => {
  const u = req.body;
  const id = u.id || `u${Date.now()}`;
  try {
    db.prepare(`
      INSERT INTO users (id, name, email, phone, avatar, role, status, address, wishlist, createdAt, password, paymentMethods)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, u.name, u.email, u.phone ?? null, u.avatar ?? null, u.role ?? 'customer', u.status ?? 'active', u.address ? JSON.stringify(u.address) : null, u.wishlist ? JSON.stringify(u.wishlist) : null, u.createdAt ?? new Date().toISOString(), u.password ?? null, u.paymentMethods ? JSON.stringify(u.paymentMethods) : null);
    res.status(201).json({ id });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    throw e;
  }
});

app.put('/api/users/:id', (req, res) => {
  const u = req.body;
  const fields: string[] = [];
  const values: any[] = [];

  const simple = ['name', 'email', 'phone', 'avatar', 'role', 'status', 'password'];
  for (const key of simple) {
    if (u[key] !== undefined) { fields.push(`${key} = ?`); values.push(u[key]); }
  }
  if (u.address !== undefined) { fields.push('address = ?'); values.push(JSON.stringify(u.address)); }
  if (u.wishlist !== undefined) { fields.push('wishlist = ?'); values.push(JSON.stringify(u.wishlist)); }
  if (u.paymentMethods !== undefined) { fields.push('paymentMethods = ?'); values.push(JSON.stringify(u.paymentMethods)); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

// --- Settings ---

app.get('/api/settings', (_req, res) => {
  const row: any = db.prepare('SELECT data FROM settings WHERE id = 1').get();
  if (!row) return res.json({});
  res.json(JSON.parse(row.data));
});

app.put('/api/settings', (req, res) => {
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

// --- Start ---

app.listen(PORT, () => {
  console.log(`[server] GoWild API listening on port ${PORT}`);
  console.log(`[server] Database: ${process.env.DB_DIR || './data'}/gowild.db`);
});
