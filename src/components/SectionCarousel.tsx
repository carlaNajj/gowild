import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionCarouselProps {
  children: ReactNode[];
  itemsPerView?: { mobile?: number; tablet?: number; desktop?: number };
  showCounter?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  gap?: number;
  className?: string;
}

function useViewportItemsPerView(itemsPerView: { mobile?: number; tablet?: number; desktop?: number }) {
  const [n, setN] = useState(itemsPerView.desktop || 4);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setN(itemsPerView.mobile ?? 1.15);
      } else if (w < 1024) {
        setN(itemsPerView.tablet ?? 2);
      } else {
        setN(itemsPerView.desktop ?? 4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView.mobile, itemsPerView.tablet, itemsPerView.desktop]);

  return n;
}

export function SectionCarousel({
  children,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 4 },
  showCounter = true,
  showDots = true,
  showArrows = true,
  gap = 24,
  className,
}: SectionCarouselProps) {
  const n = useViewportItemsPerView(itemsPerView);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const totalSlides = Math.max(1, Math.ceil(children.length - n + 1));
  const canScrollPrev = selectedIndex > 0;
  const canScrollNext = selectedIndex < totalSlides - 1;

  const scrollTo = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const slideWidth = container.scrollWidth / children.length;
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    container.scrollTo({ left: clamped * slideWidth, behavior: 'smooth' });
    setSelectedIndex(clamped);
  }, [children.length, totalSlides]);

  const scrollPrev = useCallback(() => scrollTo(selectedIndex - 1), [scrollTo, selectedIndex]);
  const scrollNext = useCallback(() => scrollTo(selectedIndex + 1), [scrollTo, selectedIndex]);

  // Track scroll position for dot sync
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const slideWidth = container.scrollWidth / children.length;
      const idx = Math.round(container.scrollLeft / slideWidth);
      setSelectedIndex(Math.min(idx, totalSlides - 1));
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [children.length, totalSlides]);

  // Re-snap on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const slideWidth = container.scrollWidth / children.length;
    container.scrollTo({ left: selectedIndex * slideWidth, behavior: 'auto' });
  }, [n, children.length, selectedIndex]);

  if (children.length === 0) return null;

  const slideWidth = `calc(${100 / n}% - ${(n - 1) * gap / n}px)`;
  const currentSlide = Math.min(selectedIndex + 1, totalSlides);

  return (
    <div className={cn('relative', className)}>
      {/* Counter Badge */}
      {showCounter && totalSlides > 1 && (
        <div className="absolute -top-2 right-0 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          {currentSlide}/{totalSlides}
        </div>
      )}

      {/* Carousel Track */}
      <div
        ref={containerRef}
        className="flex items-stretch overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{
          gap: `${gap}px`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="snap-start flex-shrink-0 flex-grow-0 h-full"
            style={{ width: slideWidth }}
          >
            <div className="w-full h-full">{child}</div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(
              'absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[#1A1A1A] transition-all hover:scale-110',
              canScrollPrev ? 'opacity-100' : 'opacity-30 cursor-not-allowed'
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(
              'absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[#1A1A1A] transition-all hover:scale-110',
              canScrollNext ? 'opacity-100' : 'opacity-30 cursor-not-allowed'
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Pagination */}
      {showDots && totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                'rounded-full transition-all duration-300',
                index === selectedIndex
                  ? 'w-6 h-2.5 bg-[#e94924]'
                  : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
