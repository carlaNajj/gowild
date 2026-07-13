import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, Search } from 'lucide-react';
import { useMobileNav } from '@/lib/mobile-nav-context';



export function MobileBottomNav() {
  const { setSearchOpen, setMobileMenuOpen } = useMobileNav();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  const isActive = (path: string) => location.pathname === path;


  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] h-16">
      <div className="grid grid-cols-3 h-full">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 ${isActive('/') ? 'text-[#1A5A6B]' : 'text-gray-400'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-gray-400"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-gray-400"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
