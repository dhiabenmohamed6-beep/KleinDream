'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroBannerData } from '@/lib/types';

interface HeroSectionProps {
  banners?: HeroBannerData[] | null;
  banner?: HeroBannerData | null;
}

const DEFAULT_SLIDES: HeroBannerData[] = [
  {
    id: 1,
    title: "Find Your Style. Live Your Dream.",
    subtitle: "Discover fashion, accessories, and everyday essentials curated for every style, every age, and every moment.",
    cta_text: "Shop Women",
    cta_link: "/shop?audience=WOMEN",
    secondary_cta_text: "Shop Men",
    secondary_cta_link: "/shop?audience=MEN",
    image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    display_order: 0,
    is_active: true,
  },
  {
    id: 2,
    title: "The Atelier Sneaker Series",
    subtitle: "Architectural comfort meets artisanal craftsmanship in our latest monochrome release.",
    cta_text: "Explore 3D Shoes",
    cta_link: "/shop?category=shoes",
    secondary_cta_text: "View Lookbook",
    secondary_cta_link: "/shop",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    display_order: 1,
    is_active: true,
  },
  {
    id: 3,
    title: "Haute Horlogerie & Timeless Accessories",
    subtitle: "Engineered precision in ceramic, sapphire crystal, and sculpted Italian leather.",
    cta_text: "Discover Watches",
    cta_link: "/shop?category=accessories",
    secondary_cta_text: "Explore Collection",
    secondary_cta_link: "/shop",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2070&auto=format&fit=crop",
    display_order: 2,
    is_active: true,
  },
];

export default function HeroSection({ banners, banner }: HeroSectionProps) {
  // Determine slides from banners prop, fallback to single banner or defaults
  const slides: HeroBannerData[] = React.useMemo(() => {
    if (banners && banners.length > 0) {
      return banners;
    }
    if (banner) {
      return [banner, ...DEFAULT_SLIDES.slice(1)];
    }
    return DEFAULT_SLIDES;
  }, [banners, banner]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartXRef = React.useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Touch swipe support for mobile phones
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  // Automatic slide rotation every 3 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length, currentIndex, nextSlide]);

  // Reset transition flag
  useEffect(() => {
    const t = setTimeout(() => setIsTransitioning(false), 600);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <>
      <style jsx global>{`
        @keyframes heroProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .hero-progress-active {
          animation: heroProgress 3s linear forwards;
        }
      `}</style>

      <section
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[76vh] min-h-[460px] sm:min-h-[580px] sm:h-[82vh] flex items-center justify-center overflow-hidden bg-brand-charcoal select-none group"
        aria-label="Featured Collection Carousel"
      >
        {/* Background Images Crossfade Layer */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.image_url}
                alt={slide.title || 'KleinDream Maison'}
                fill
                priority={idx === 0}
                sizes="100vw"
                className={`object-cover object-center opacity-65 transition-transform duration-[4000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/40 to-transparent" />
              <div className="absolute inset-0 bg-brand-charcoal/25" />
            </div>
          );
        })}

        {/* Content Container with Animated Key */}
        <div
          key={`content-${currentIndex}`}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white space-y-4 sm:space-y-6 transition-all duration-700 ease-out"
        >
          {/* Subtle Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-medium text-white/90 shadow-sm animate-fade-in">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-lavender animate-pulse" />
            <span>Maison Collection 2026</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight sm:leading-[1.1] drop-shadow-md">
            {currentSlide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base md:text-lg text-white/85 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm line-clamp-3 sm:line-clamp-none">
            {currentSlide.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href={currentSlide.cta_link || '/shop'}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-brand-lavender text-white font-medium text-xs sm:text-sm tracking-wider uppercase rounded-full hover:bg-brand-lavenderDark transition-all duration-200 shadow-float flex items-center justify-center gap-2 group/btn"
            >
              <span>{currentSlide.cta_text || 'Explore Shop'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
            {currentSlide.secondary_cta_text && (
              <Link
                href={currentSlide.secondary_cta_link || '/shop'}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-white/15 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm tracking-wider uppercase rounded-full hover:bg-white hover:text-brand-charcoal transition-all duration-200 flex items-center justify-center"
              >
                <span>{currentSlide.secondary_cta_text}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Carousel Arrow Controls (Visible on medium+ screens so phones enjoy clean swipe) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous Banner"
              className="hidden md:flex absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next Banner"
              className="hidden md:flex absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Interactive Progress Indicators (3-Second Active Timer Bar) */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 sm:bottom-14 left-0 right-0 z-20 flex justify-center items-center gap-2.5 sm:gap-3">
            {slides.map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="group/pill relative py-2 px-1 focus:outline-none"
                >
                  <div
                    className={`h-1 rounded-full transition-all duration-300 overflow-hidden ${
                      isActive ? 'w-12 bg-white/30' : 'w-6 bg-white/20 hover:bg-white/40'
                    }`}
                  >
                    {isActive ? (
                      <div
                        key={`bar-${currentIndex}`}
                        className="h-full bg-brand-lavender rounded-full hero-progress-active"
                      />
                    ) : (
                      <div className="h-full w-0 bg-transparent" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Slide Counter (e.g. 01 / 03) */}
        {slides.length > 1 && (
          <div className="absolute top-8 right-8 z-20 hidden sm:flex items-center gap-1.5 text-xs font-mono tracking-widest text-white/60 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full">
            <span className="text-white font-semibold">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span>/</span>
            <span>{String(slides.length).padStart(2, '0')}</span>
          </div>
        )}

        {/* Subtle Bottom Trust Badges */}
        <div className="absolute bottom-5 left-0 right-0 z-10 hidden sm:flex justify-center items-center gap-8 text-[11px] tracking-widest uppercase font-medium text-white/60">
          <span>Handcrafted Materials</span>
          <span>·</span>
          <span>3D Virtual Fitting</span>
          <span>·</span>
          <span>Express Delivery in Tunisia</span>
        </div>
      </section>
    </>
  );
}
