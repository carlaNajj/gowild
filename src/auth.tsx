import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

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
const USERS_KEY = 'gowild_users';

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
};

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [DEMO_USER, DEMO_ADMIN, DEMO_STAFF];
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestInfo, setGuestInfoState] = useState<GuestInfo | null>(null);
  const [users, setUsers] = useState<User[]>(loadUsers);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
  }, []);

  // Persist users array whenever it changes
  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (email.includes('@') && password.length >= 4) {
      // Check if user exists in users array
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser && existingUser.status === 'inactive') {
        return false;
      }
      const loggedInUser = existingUser ? { ...existingUser, email } : { ...DEMO_USER, email };
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
      // Check for admin user
      const adminUser = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && (u.role === 'admin' || u.role === 'staff')
      );
      if (adminUser && adminUser.status === 'active') {
        setUser(adminUser);
        setGuestInfoState(null);
        localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
        return true;
      }
      // Fallback: allow admin@gowild.com with any valid password
      if (email.toLowerCase() === 'admin@gowild.com') {
        const fallbackAdmin = users.find(u => u.email.toLowerCase() === 'admin@gowild.com') || DEMO_ADMIN;
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
      };
      setUser(newUser);
      setGuestInfoState(null);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      // Add to users array
      setUsers(prev => {
        const exists = prev.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return prev;
        return [...prev, newUser];
      });
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
      // Also update in users array
      setUsers(usersPrev => usersPrev.map(u => u.id === prev.id ? updated : u));
      return updated;
    });
  }, []);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, status: (u.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' };
        // If toggling current user, update session too
        if (user?.id === id) {
          setUser(updated);
          localStorage.setItem(USER_KEY, JSON.stringify(updated));
        }
        return updated;
      }
      return u;
    }));
  }, [user]);

  const updateUserRole = useCallback((id: string, role: 'admin' | 'staff' | 'customer') => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
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
