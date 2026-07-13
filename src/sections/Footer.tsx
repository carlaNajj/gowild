import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone, Music2 } from 'lucide-react';
import { useSiteSettings } from '@/lib/settings-context';

export function Footer() {
  const { settings } = useSiteSettings();

  const socials = [
    { icon: Instagram, url: settings.socialLinks.instagram, label: 'Instagram' },
    { icon: Facebook, url: settings.socialLinks.facebook, label: 'Facebook' },
    { icon: Twitter, url: settings.socialLinks.twitter, label: 'Twitter' },
    { icon: Youtube, url: settings.socialLinks.youtube, label: 'YouTube' },
    { icon: Music2, url: settings.socialLinks.tiktok, label: 'TikTok' },
  ].filter(s => s.url);

  return (
    <footer className="bg-[#1A4A52] text-white pb-16 md:pb-0">
      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <img src={settings.logo} alt={settings.storeName} className="h-8 w-auto brightness-0 invert mb-4" />
              <p className="text-white/70 text-xs md:text-sm leading-relaxed">{settings.footerTagline}</p>
              {socials.length > 0 && (
                <div className="flex gap-3 mt-4">
                  {socials.map(({ icon: Icon, url, label }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-[#E8552A] transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Shop */}
            <div className="hidden md:block">
              <h4 className="font-heading font-semibold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">Shop</h4>
              <ul className="space-y-2.5">
                <li><Link to="/products" className="text-white/70 text-xs md:text-sm hover:text-[#E8552A] transition-colors">All Products</Link></li>
                {settings.categories.filter(c => c.visible && c.productCount > 0).map(cat => (
                  <li key={cat.id}>
                    <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="text-white/70 text-xs md:text-sm hover:text-[#E8552A] transition-colors">{cat.name}</Link>
                  </li>
                ))}
                {settings.navLinks.filter(l => l.visible && l.href !== '/products').map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-white/70 text-xs md:text-sm hover:text-[#E8552A] transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="hidden md:block">
              <h4 className="font-heading font-semibold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About Us', 'Contact', 'Shipping Info', 'Returns', 'FAQ'].map((item) => (
                  <li key={item}>
                    <Link to={item === 'About Us' ? '/about' : '#'} className="text-white/70 text-xs md:text-sm hover:text-[#E8552A] transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading font-semibold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-white/70">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#E8552A]" />
                  <span>{settings.contactAddress}</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Phone className="w-4 h-4 flex-shrink-0 text-[#E8552A]" />
                  <span>{settings.contactPhone}</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Mail className="w-4 h-4 flex-shrink-0 text-[#E8552A]" />
                  <span>{settings.contactEmail}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs">&copy; 2026 {settings.storeName} Outdoor Store. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white/50 text-xs hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/50 text-xs hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-white/50 text-xs hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
