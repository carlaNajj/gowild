import { useState, useEffect } from 'react';
import { MessageCircle, ChevronUp } from 'lucide-react';

const WHATSAPP_NUMBER = '96171806123';
const WHATSAPP_MESSAGE = 'Hi GoWild! I have a question about your products.';

export function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed flex flex-col items-center gap-3 right-6 z-[9999] bottom-[88px] md:bottom-6">
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 border-2 border-white w-10 h-10 md:w-14 md:h-14"
      >
        <MessageCircle
          className="text-white w-5 h-5 md:w-7 md:h-7"
          strokeWidth={2}
          fill="currentColor"
        />
      </a>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`flex items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 border-2 border-white w-10 h-10 md:w-14 md:h-14 ${
          showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ChevronUp
          className="text-white w-5 h-5 md:w-7 md:h-7"
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}
