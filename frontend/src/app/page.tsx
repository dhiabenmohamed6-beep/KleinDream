import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Box, ShieldCheck, Sparkles, RefreshCw, Truck } from 'lucide-react';
import HeroSection from '@/components/storefront/HeroSection';
import ProductCard from '@/components/storefront/ProductCard';
import EditorialShowcase from '@/components/storefront/EditorialShowcase';
import { fetchProducts, fetchCategories, fetchHeroBanners } from '@/lib/api';
import { Product, Category, HeroBannerData } from '@/lib/types';

export const revalidate = 0; // Fresh dynamic rendering

export default async function HomePage() {
  let heroBanners: HeroBannerData[] = [];
  let categories: Category[] = [];
  let allProducts: Product[] = [];

  // Fetch all data in parallel for instantaneous page load
  const [bannersResult, catResult, productsResult] = await Promise.allSettled([
    fetchHeroBanners(),
    fetchCategories(),
    fetchProducts({ page_size: 24 }),
  ]);

  if (bannersResult.status === 'fulfilled' && bannersResult.value?.length > 0) {
    heroBanners = bannersResult.value;
  }
  if (catResult.status === 'fulfilled') {
    categories = catResult.value.results || [];
  }
  if (productsResult.status === 'fulfilled') {
    allProducts = productsResult.value.results || [];
  }

  return (
    <div className="space-y-12 sm:space-y-20 pb-12 sm:pb-20">
      
      {/* 1. Hero Section Carousel (Auto-switches every 3 seconds) */}
      <HeroSection banners={heroBanners} />

      {/* 2. Shop by Category Discovery Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-1.5 sm:space-y-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-brand-lavender font-semibold">
            Maison Curation
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-charcoal font-normal">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-brand-secondary px-4">
            Explore meticulously handcrafted pieces designed for timeless modern lifestyles.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative flex flex-col items-center text-center space-y-2 sm:space-y-3"
            >
              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-brand-light border border-brand-border/60 group-hover:shadow-card transition-all duration-300">
                <Image
                  src={cat.image_url || cat.image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop"}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-2.5 sm:bottom-3 inset-x-1.5 sm:inset-x-2 text-center">
                  <h3 className="font-serif text-xs sm:text-sm md:text-base font-medium text-white tracking-wide">
                    {cat.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. The Editorial Showcase: Bestseller Architectural Grid, Tickers, Live Catalog & Custom What Is It */}
      <EditorialShowcase products={allProducts} categories={categories} />


      {/* 6. Customer Trust Badges */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-8 bg-brand-light rounded-2xl border border-brand-border/60">
          
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white flex items-center justify-center text-brand-lavender shadow-subtle flex-shrink-0">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-semibold text-brand-charcoal">Complimentary Delivery</h4>
              <p className="text-[11px] sm:text-xs text-brand-secondary mt-0.5 sm:mt-1">Free express shipping on all orders over 150 DT across Tunisia.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white flex items-center justify-center text-brand-lavender shadow-subtle flex-shrink-0">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-semibold text-brand-charcoal">Artisanal Authenticity</h4>
              <p className="text-[11px] sm:text-xs text-brand-secondary mt-0.5 sm:mt-1">Hand-finished garments and certified Italian leathers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white flex items-center justify-center text-brand-lavender shadow-subtle flex-shrink-0">
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-semibold text-brand-charcoal">14-Day Exchanges</h4>
              <p className="text-[11px] sm:text-xs text-brand-secondary mt-0.5 sm:mt-1">Hassle-free doorstep exchanges and returns for size adjustments.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white flex items-center justify-center text-brand-lavender shadow-subtle flex-shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-semibold text-brand-charcoal">Dedicated Concierge</h4>
              <p className="text-[11px] sm:text-xs text-brand-secondary mt-0.5 sm:mt-1">Personal client care available Sunday through Saturday.</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
