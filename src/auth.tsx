import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  wishlist?: string[];
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
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setGuestInfo: (info: GuestInfo) => void;
  clearGuest: () => void;
  updateProfile: (data: Partial<User>) => void;
  mergeWishlistOnLogin: () => void;
}

const DEMO_USER: User = {
  id: 'u1',
  name: 'Alex Walker',
  email: 'alex@gowild.com',
  phone: '(555) 867-5309',
  wishlist: ['p14', 'n5', 's3'], // Server-side wishlist
  address: {
    street: '123 Mountain Ridge Road',
    city: 'Boulder',
    state: 'CO',
    zip: '80301',
    country: 'USA',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestInfo, setGuestInfoState] = useState<GuestInfo | null>(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (email.includes('@') && password.length >= 4) {
      const loggedInUser = { ...DEMO_USER, email };
      setUser(loggedInUser);
      setGuestInfoState(null);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      // Merge wishlist after login
      setTimeout(() => mergeWishlistOnLoginFn(loggedInUser), 100);
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    if (name.length >= 2 && email.includes('@') && password.length >= 4) {
      const newUser: User = {
        id: 'u_' + Date.now(),
        name,
        email,
        phone: '',
        address: { street: '', city: '', state: '', zip: '', country: 'USA' },
      };
      setUser(newUser);
      setGuestInfoState(null);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
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
    // Get local wishlist
    let localWishlist: string[] = [];
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (raw) localWishlist = JSON.parse(raw);
    } catch { /* ignore */ }
    // Get server wishlist
    const serverWishlist = currentUser.wishlist || [];
    // Merge (union of both)
    const merged = [...new Set([...serverWishlist, ...localWishlist])];
    // Save merged back to localStorage
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
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isGuest: !!guestInfo && !user,
        guestInfo,
        login,
        register,
        logout,
        setGuestInfo,
        clearGuest,
        updateProfile,
        mergeWishlistOnLogin: () => mergeWishlistOnLoginFn(),
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
