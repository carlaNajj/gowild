/* ------------------------------------------------------------------ */
/*  API client for GoWild SQLite backend                               */
/* ------------------------------------------------------------------ */

import type { Product, Review, Order } from '@/store';
import type { User } from '@/auth';
import type { SiteSettings } from '@/lib/settings-context';

const API_BASE = '/api';
const TOKEN_KEY = 'gowild_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/* ---- Auth ---- */

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return fetchJson<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return fetchJson<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getMe(): Promise<User> {
  return fetchJson<User>('/auth/me');
}

/* ---- Products ---- */

export async function getProducts(): Promise<Product[]> {
  return fetchJson<Product[]>('/products');
}

export async function getProduct(id: string): Promise<Product> {
  return fetchJson<Product>(`/products/${id}`);
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<{ id: string }> {
  return fetchJson<{ id: string }>('/products', { method: 'POST', body: JSON.stringify(product) });
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  await fetchJson(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchJson(`/products/${id}`, { method: 'DELETE' });
}

/* ---- Orders ---- */

export async function getOrders(): Promise<Order[]> {
  return fetchJson<Order[]>('/orders');
}

export async function createOrder(order: Order): Promise<{ id: string }> {
  return fetchJson<{ id: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      ...order,
      items: order.items.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        productImage: i.product.image,
        price: i.product.price,
        quantity: i.quantity,
        color: i.color,
        size: i.size,
        bundlePrice: i.bundlePrice,
      })),
    }),
  });
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  await fetchJson(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

export async function deleteOrder(id: string): Promise<void> {
  await fetchJson(`/orders/${id}`, { method: 'DELETE' });
}

/* ---- Reviews ---- */

export async function getReviews(): Promise<Review[]> {
  return fetchJson<Review[]>('/reviews');
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  return fetchJson<Review[]>(`/reviews/product/${productId}`);
}

export async function createReview(review: Omit<Review, 'id'>): Promise<{ id: string }> {
  return fetchJson<{ id: string }>('/reviews', { method: 'POST', body: JSON.stringify(review) });
}

export async function approveReview(id: string): Promise<void> {
  await fetchJson(`/reviews/${id}/approve`, { method: 'PUT' });
}

export async function updateReview(id: string, text: string, rating: number): Promise<void> {
  await fetchJson(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify({ text, rating }) });
}

export async function deleteReview(id: string): Promise<void> {
  await fetchJson(`/reviews/${id}`, { method: 'DELETE' });
}

/* ---- Users ---- */

export async function getUsers(): Promise<User[]> {
  return fetchJson<User[]>('/users');
}

export async function getUser(id: string): Promise<User> {
  return fetchJson<User>(`/users/${id}`);
}

export async function createUser(user: Omit<User, 'id'> & { id?: string; password?: string }): Promise<{ id: string }> {
  return fetchJson<{ id: string }>('/users', { method: 'POST', body: JSON.stringify(user) });
}

export async function updateUser(id: string, updates: Partial<User> & { password?: string }): Promise<void> {
  await fetchJson(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function updateUserPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  await fetchJson(`/users/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/* ---- Settings ---- */

export async function getSettings(): Promise<SiteSettings> {
  return fetchJson<SiteSettings>('/settings');
}

export async function updateSettings(settings: SiteSettings): Promise<void> {
  await fetchJson('/settings', { method: 'PUT', body: JSON.stringify(settings) });
}
