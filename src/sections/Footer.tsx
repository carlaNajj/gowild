import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A4A52] text-white">
      {/* Newsletter */}
      <div className="py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            <div>
              <h3 className="font-heading text-xl md:text-2xl font-bold">Join the Wild Club</h3>
              <p className="text-white/70 mt-1 text-xs md:text-sm">Get exclusive deals, new arrival alerts, and outdoor tips.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 md:px-5 py-3 rounded-l-full text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8552A] min-w-0"
              />
              <button className="bg-[#E8552A] text-white px-4 md:px-6 py-3 rounded-r-full font-medium text-sm hover:bg-[#C4451D] transition-colors whitespace-nowrap flex-shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <img src="/logo.png" alt="GoWild" className="h-8 w-auto brightness-0 invert mb-4" />
              <p className="text-white/70 text-xs md:text-sm leading-relaxed">Pins, stickers, neck warmers & essentials for the modern adventurer. Small gear with big personality.</p>
              <div className="flex gap-3 mt-4">
                {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-[#E8552A] transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-heading font-semibold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">Shop</h4>
              <ul className="space-y-2.5">
                {['All Products', 'Pins', 'Stickers', 'Neck Warmers', 'Deals'].map((item) => (
                  <li key={item}>
                    <Link to={item === 'Deals' ? '/deals' : item === 'All Products' ? '/products' : '/products'} className="text-white/70 text-xs md:text-sm hover:text-[#E8552A] transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
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
                  <span>123 Adventure Ave, Boulder, CO 80301</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Phone className="w-4 h-4 flex-shrink-0 text-[#E8552A]" />
                  <span>(555) 867-5309</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Mail className="w-4 h-4 flex-shrink-0 text-[#E8552A]" />
                  <span>hello@gowild.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs">&copy; 2026 GoWild Outdoor Store. All rights reserved.</p>
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