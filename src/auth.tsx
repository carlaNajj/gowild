import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import * as api from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'staff' | 'customer';
  status: 'active' | 'inactive';
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  wishlist?: string[];
  createdAt?: string;
  password?: string;
  paymentMethods?: string[];
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const WISHLIST_KEY = 'gowild_wishlist';
const USER_KEY = 'gowild_user';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  guestInfo: GuestInfo | null;
  users: User[];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setGuestInfo: (info: GuestInfo) => void;
  clearGuest: () => void;
  updateProfile: (data: Partial<User>) => void;
  updatePassword: (currentPassword: string, newPassword: string) => boolean;
  mergeWishlistOnLogin: () => void;
  toggleUserStatus: (id: string) => void;
  updateUserRole: (id: string, role: 'admin' | 'staff' | 'customer') => void;
}

const DEMO_USER: User = {
  id: 'u1',
  name: 'Alex Walker',
  email: 'alex@gowild.com',
  phone: '(555) 867-5309',
  role: 'customer',
  status: 'active',
  wishlist: ['p14', 'n5', 's3'],
  address: {
    street: '123 Mountain Ridge Road',
    city: 'Boulder',
    state: 'CO',
    zip: '80301',
    country: 'USA',
  },
  createdAt: '2026-01-01',
  password: 'demo1234',
  paymentMethods: ['Visa •••• 4242'],
};

const DEMO_ADMIN: User = {
  id: 'admin1',
  name: 'Admin User',
  email: 'admin@gowild.com',
  phone: '(555) 000-0000',
  role: 'admin',
  status: 'active',
  address: {
    street: '456 Admin Blvd',
    city: 'Denver',
    state: 'CO',
    zip: '80201',
    country: 'USA',
  },
  createdAt: '2026-01-01',
  password: 'admin1234',
};

const DEMO_STAFF: User = {
  id: 'staff1',
  name: 'Staff User',
  email: 'staff@gowild.com',
  phone: '(555) 111-1111',
  role: 'staff',
  status: 'active',
  address: {
    street: '789 Staff Lane',
    city: 'Denver',
    state: 'CO',
    zip: '80201',
    country: 'USA',
  },
  createdAt: '2026-01-01',
  password: 'staff1234',
};

const DEFAULT_USERS = [DEMO_USER, DEMO_ADMIN, DEMO_STAFF];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestInfo, setGuestInfoState] = useState<GuestInfo | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);

  // Load auth state from localStorage + API on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
    api.getUsers().then(setUsers).catch(() => setUsers(DEFAULT_USERS));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (email.includes('@') && password.length >= 4) {
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        if (existingUser.status === 'inactive') return false;
        if (existingUser.password && existingUser.password !== password) return false;
        const loggedInUser = { ...existingUser };
        setUser(loggedInUser);
        setGuestInfoState(null);
        localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
        setTimeout(() => mergeWishlistOnLoginFn(loggedInUser), 100);
        return true;
      }
      // Fallback for users not in array (legacy)
      const loggedInUser = { ...DEMO_USER, email };
      setUser(loggedInUser);
      setGuestInfoState(null);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      setTimeout(() => mergeWishlistOnLoginFn(loggedInUser), 100);
      return true;
    }
    return false;
  }, [users]);

  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (email.includes('@') && password.length >= 4) {
      const adminUser = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && (u.role === 'admin' || u.role === 'staff')
      );
      if (adminUser && adminUser.status === 'active') {
        if (adminUser.password && adminUser.password !== password) return false;
        setUser(adminUser);
        setGuestInfoState(null);
        localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
        return true;
      }
      if (email.toLowerCase() === 'admin@gowild.com') {
        const fallbackAdmin = users.find(u => u.email.toLowerCase() === 'admin@gowild.com') || DEMO_ADMIN;
        if (fallbackAdmin.password && fallbackAdmin.password !== password) return false;
        setUser(fallbackAdmin);
        setGuestInfoState(null);
        localStorage.setItem(USER_KEY, JSON.stringify(fallbackAdmin));
        return true;
      }
    }
    return false;
  }, [users]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    if (name.length >= 2 && email.includes('@') && password.length >= 4) {
      const newUser: User = {
        id: 'u_' + Date.now(),
        name,
        email,
        phone: '',
        role: 'customer',
        status: 'active',
        address: { street: '', city: '', state: '', zip: '', country: 'USA' },
        createdAt: new Date().toISOString().split('T')[0],
        password,
      };
      setUser(newUser);
      setGuestInfoState(null);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUsers(prev => {
        const exists = prev.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return prev;
        return [...prev, newUser];
      });
      api.createUser(newUser).catch(() => {});
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setGuestInfoState(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const mergeWishlistOnLoginFn = useCallback((loggedInUser?: User | null) => {
    const currentUser = loggedInUser || user;
    if (!currentUser) return;
    let localWishlist: string[] = [];
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (raw) localWishlist = JSON.parse(raw);
    } catch { /* ignore */ }
    const serverWishlist = currentUser.wishlist || [];
    const merged = [...new Set([...serverWishlist, ...localWishlist])];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(merged));
  }, [user]);

  const setGuestInfo = useCallback((info: GuestInfo) => {
    setGuestInfoState(info);
  }, []);

  const clearGuest = useCallback(() => {
    setGuestInfoState(null);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      setUsers(usersPrev => usersPrev.map(u => u.id === prev.id ? updated : u));
      api.updateUser(prev.id, data).catch(() => {});
      return updated;
    });
  }, []);

  const updatePassword = useCallback((currentPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    if (user.password && user.password !== currentPassword) return false;
    if (newPassword.length < 4) return false;
    const updated = { ...user, password: newPassword };
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    api.updateUser(user.id, { password: newPassword }).catch(() => {});
    return true;
  }, [user]);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, status: (u.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' };
        if (user?.id === id) {
          setUser(updated);
          localStorage.setItem(USER_KEY, JSON.stringify(updated));
        }
        api.updateUser(id, { status: updated.status }).catch(() => {});
        return updated;
      }
      return u;
    }));
  }, [user]);

  const updateUserRole = useCallback((id: string, role: 'admin' | 'staff' | 'customer') => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    api.updateUser(id, { role }).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isGuest: !!guestInfo && !user,
        guestInfo,
        users,
        isAdmin,
        login,
        adminLogin,
        register,
        logout,
        setGuestInfo,
        clearGuest,
        updateProfile,
        updatePassword,
        mergeWishlistOnLogin: () => mergeWishlistOnLoginFn(),
        toggleUserStatus,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
