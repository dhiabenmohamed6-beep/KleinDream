'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Plus, Check, ShoppingBag, Box, Sparkles, Scissors, ShieldCheck, Truck } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';

interface EditorialShowcaseProps {
  products: Product[];
  categories: Category[];
}

export default function EditorialShowcase({ products, categories }: EditorialShowcaseProps) {
  const [selectedAudience, setSelectedAudience] = useState<'ALL' | 'MEN' | 'WOMEN' | 'SHOES' | 'NEW'>('ALL');
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);
  const { addItem, openCart } = useCartStore();

  // Quick Add helper
  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const variant = product.variants?.find((v) => v.is_active && v.is_in_stock) || product.variants?.[0];
    if (!variant) return;

    try {
      setAddingId(product.id);
      await addItem(variant.id, 1);
      setAddedId(product.id);
      openCart();
      setTimeout(() => setAddedId(null), 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  // Curated 5 products for the architectural Bestseller grid (matching reference image)
  const bestsellerGridProducts = useMemo(() => {
    // Pick specific archetypes: T-shirt, Watch/Accessories, Tote/Bag, Blazer/Coat, Sneaker
    const list: Product[] = [];
    
    const tshirt = products.find(p => p.name.toLowerCase().includes('t-shirt') || p.name.toLowerCase().includes('tee'));
    if (tshirt) list.push(tshirt);

    const watchOrAccessory = products.find(p => p.name.toLowerCase().includes('watch') || p.name.toLowerCase().includes('ceramic'));
    if (watchOrAccessory) list.push(watchOrAccessory);

    const bag = products.find(p => p.name.toLowerCase().includes('tote') || p.name.toLowerCase().includes('bag') || p.name.toLowerCase().includes('leather tote'));
    if (bag) list.push(bag);

    const jacketOrCoat = products.find(p => p.name.toLowerCase().includes('coat') || p.name.toLowerCase().includes('blazer'));
    if (jacketOrCoat) list.push(jacketOrCoat);

    const sneaker = products.find(p => p.name.toLowerCase().includes('sneaker') || p.name.toLowerCase().includes('shoe'));
    if (sneaker) list.push(sneaker);

    // Fallback if some aren't found
    for (const p of products) {
      if (list.length >= 5) break;
      if (!list.some(item => item.id === p.id)) {
        list.push(p);
      }
    }
    return list;
  }, [products]);

  // Filtered products for the Live Scrolling Catalog section
  const visibleProducts = useMemo(() => {
    if (selectedAudience === 'ALL') return products;
    if (selectedAudience === 'MEN') return products.filter(p => p.audience === 'MEN' || p.audience === 'UNISEX' || p.audience === 'ALL');
    if (selectedAudience === 'WOMEN') return products.filter(p => p.audience === 'WOMEN' || p.audience === 'UNISEX' || p.audience === 'ALL');
    if (selectedAudience === 'SHOES') return products.filter(p => p.name.toLowerCase().includes('sneaker') || p.categories?.some(c => c.name.toLowerCase().includes('shoes')));
    if (selectedAudience === 'NEW') return products.filter(p => p.is_new);
    return products;
  }, [products, selectedAudience]);

  return (
    <div className="w-full space-y-16 sm:space-y-24">
      
      {/* ─── MARQUEE TICKER 1: ABOUT THE BRAND ─── */}
      <div className="relative w-full overflow-hidden bg-brand-charcoal text-white py-2.5 sm:py-3 border-y border-white/10 select-none">
        <div className="animate-marquee whitespace-nowrap text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] flex items-center gap-6">
          <span>/ ABOUT THE BRAND</span>
          <span className="text-brand-lavender">•</span>
          <span>HAUTE COUTURE ATELIER</span>
          <span className="text-brand-lavender">•</span>
          <span>HANDCRAFTED IN TUNISIA</span>
          <span className="text-brand-lavender">•</span>
          <span>LIMITED ATELIER RUNS</span>
          <span className="text-brand-lavender">•</span>
          <span>BESPOKE CUSTOMIZATION</span>
          <span className="text-brand-lavender">•</span>
          <span>ABOUT THE BRAND</span>
          <span className="text-brand-lavender">•</span>
          <span>HAUTE COUTURE ATELIER</span>
          <span className="text-brand-lavender">•</span>
          <span>HANDCRAFTED IN TUNISIA</span>
          <span className="text-brand-lavender">•</span>
          <span>LIMITED ATELIER RUNS</span>
          <span className="text-brand-lavender">•</span>
          <span>BESPOKE CUSTOMIZATION</span>
        </div>
      </div>

      {/* ─── ATELIER BRAND STORY SECTION (Matching "VLOM.CUST" Atmosphere) ─── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#18191c] via-[#202124] to-[#121316] text-white p-6 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
          {/* Subtle noise/texture overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Large Watermark Typography in Background */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center pointer-events-none select-none opacity-10">
            <span className="font-sans font-black text-6xl sm:text-9xl md:text-[14rem] tracking-tighter text-white uppercase whitespace-nowrap">
              KLEINDREAM
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Brand Statement */}
            <div className="lg:col-span-4 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs uppercase tracking-widest text-brand-lavender font-semibold">
                <Sparkles className="h-3 w-3" />
                <span>Atelier Philosophy</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl text-white font-medium leading-tight">
                About The Maison
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                KleinDream is an artisanal luxury house fusing high-couture tailoring with contemporary architectural streetwear. Each garment is drafted, cut, and hand-finished in our Mediterranean atelier.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white hover:text-brand-lavender transition-colors group"
                >
                  <span>Explore Atelier Archive</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Center Column: Centerpiece Atelier Visual */}
            <div className="lg:col-span-5 relative flex justify-center items-center py-4 sm:py-0">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-neutral-900/60 backdrop-blur-md">
                <Image
                  src={products[0]?.primary_image?.image_url || products[0]?.primary_image?.image || "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop"}
                  alt="KleinDream Atelier Piece"
                  fill
                  className="object-cover object-center brightness-90 hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute bottom-4 inset-x-4 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-brand-lavender font-semibold block mb-0.5">
                    Signature Silhouette
                  </span>
                  <p className="font-serif text-sm sm:text-base text-white font-medium">
                    {products[0]?.name || "Atelier Custom Creation"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Custom Callout */}
            <div className="lg:col-span-3 text-left lg:text-right space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-mono block">
                01 / BESPOKE CRAFT
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">
                Each piece is hand-tailored by our master artisans, guaranteeing uncompromised fit and sculptural drape.
              </p>
              <div className="pt-2">
                <p className="font-sans font-bold text-base sm:text-lg text-white uppercase tracking-tight">
                  Create your own unique look
                </p>
                <p className="text-[11px] text-brand-lavender mt-0.5">
                  Custom sizing & monogramming on demand
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE TICKER 2: BESTSELLER RIBBON ─── */}
      <div className="relative w-full overflow-hidden bg-brand-charcoal text-white py-2.5 sm:py-3 border-y border-white/10 select-none">
        <div className="animate-marquee whitespace-nowrap text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-6">
          <span>/ BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
          <span className="text-brand-lavender">/</span>
          <span>BESTSELLER</span>
        </div>
      </div>

      {/* ─── 3. THE ARCHITECTURAL BESTSELLER GRID (Direct Reference Layout) ─── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="border border-brand-charcoal/20 sm:border-brand-charcoal/30 bg-white rounded-2xl overflow-hidden shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-brand-charcoal/20">
            
            {/* Left Column: Massive Vertical "BESTSELLER" Side Banner */}
            <div className="lg:col-span-3 bg-[#18191c] text-white flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden group">
              {/* Background decorative watermark */}
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-5 select-none pointer-events-none">
                <span className="font-mono text-9xl font-black">KD</span>
              </div>

              {/* Top Tag */}
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-gray-400 uppercase">
                <span>MAISON KLEINDREAM</span>
                <span className="text-brand-lavender">EDITION 2026</span>
              </div>

              {/* Stylized Vertical BESTSELLER Typography */}
              <div className="my-8 sm:my-auto py-4 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Street-couture tape label background */}
                  <div className="absolute -inset-x-3 -inset-y-1 bg-white/10 rounded backdrop-blur-sm transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                  <h3 className="relative font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase text-white lg:[writing-mode:vertical-rl] lg:rotate-180 select-none leading-none text-center">
                    BESTSELLER
                  </h3>
                </div>
              </div>

              {/* Bottom Tag & Quick Action */}
              <div className="space-y-3 z-10">
                <div className="border-t border-white/20 pt-3">
                  <p className="text-[11px] font-mono text-gray-300 tracking-wider uppercase">
                    CURATED ATELIER ARCHIVE
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    High-demand pieces crafted in strictly limited batches.
                  </p>
                </div>
                <Link
                  href="/shop?sort=bestseller"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-lavender hover:text-white transition-colors"
                >
                  <span>View All Bestsellers</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Section: Modular 3-Column Product Grid */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-brand-charcoal/20">
              
              {/* 5 Product Cells */}
              {bestsellerGridProducts.map((product, idx) => {
                const img = product.primary_image?.image_url || product.primary_image?.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
                const isAddingThis = addingId === product.id;
                const isAddedThis = addedId === product.id;
                const regularPrice = Number(product.regular_price || 0);
                const salePrice = product.sale_price ? Number(product.sale_price) : null;
                const hasDiscount = salePrice && salePrice < regularPrice;
                const discountPercent = hasDiscount ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;

                // Add modular right border for grid layout
                const isRightCol = (idx + 1) % 3 === 0;
                const isBottomRow = idx >= 3;

                return (
                  <div
                    key={product.id}
                    className={`relative p-5 sm:p-6 flex flex-col justify-between bg-white hover:bg-neutral-50/70 transition-all duration-300 group ${
                      !isRightCol ? 'sm:border-r border-brand-charcoal/20' : ''
                    } ${
                      !isBottomRow ? 'border-b border-brand-charcoal/20' : ''
                    }`}
                  >
                    {/* Top Row: Badges & Quick-Add (+) Button */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {discountPercent > 0 && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-charcoal text-white uppercase tracking-wider">
                            {discountPercent}% OFF
                          </span>
                        )}
                        {product.is_new && discountPercent === 0 && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-lavender text-white uppercase tracking-wider">
                            NEW
                          </span>
                        )}
                        {Boolean(product.model_3d || product.model_3d_url) && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-light text-brand-charcoal border border-brand-border flex items-center gap-0.5">
                            <Box className="h-2.5 w-2.5" />
                            <span>3D</span>
                          </span>
                        )}
                      </div>

                      {/* The Quick-Add (+) Button styled like reference */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        disabled={isAddingThis}
                        title="Quick Add to Bag"
                        className="h-7 w-7 rounded-full border border-brand-charcoal/30 flex items-center justify-center text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all transform active:scale-95"
                      >
                        {isAddedThis ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Centered Product Image */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative w-full aspect-square my-2 flex items-center justify-center overflow-hidden rounded-lg bg-neutral-50/50"
                    >
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain object-center p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </Link>

                    {/* Product Metadata at Bottom */}
                    <div className="text-center pt-3 border-t border-brand-charcoal/10 space-y-1">
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-sans font-bold text-xs sm:text-sm text-brand-charcoal hover:text-brand-lavender uppercase tracking-wider line-clamp-1 block transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[11px] text-brand-secondary font-mono">
                        {product.categories?.[0]?.name || product.audience || "Atelier"}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-0.5">
                        {hasDiscount ? (
                          <>
                            <span className="text-xs sm:text-sm font-bold text-brand-charcoal font-mono">
                              {salePrice?.toFixed(2)} DT
                            </span>
                            <span className="text-[11px] text-gray-400 line-through font-mono">
                              {regularPrice.toFixed(2)} DT
                            </span>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm font-bold text-brand-charcoal font-mono">
                            {regularPrice.toFixed(2)} DT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 6th Cell: "VIEW LOOKS →" Dark Hero Call-to-Action Tile */}
              <div className="p-6 sm:p-8 bg-brand-charcoal text-white flex flex-col justify-between items-center text-center group hover:bg-[#151618] transition-colors">
                <div className="w-full flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase">
                  <span>ATELIER</span>
                  <span>LOOKBOOK</span>
                </div>

                <div className="my-6 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-brand-lavender group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h4 className="font-serif text-lg sm:text-xl font-medium text-white">
                    Discover The Full Atelier
                  </h4>
                  <p className="text-xs text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                    Explore all archival silhouettes, customized sneakers, and leather goods.
                  </p>
                </div>

                <Link
                  href="/shop"
                  className="w-full py-3 px-4 bg-white text-brand-charcoal hover:bg-brand-lavender hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <span>View Looks</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── MARQUEE TICKER 3: LIVE CATALOG RIBBON ─── */}
      <div className="relative w-full overflow-hidden bg-brand-light text-brand-charcoal py-2.5 sm:py-3 border-y border-brand-border select-none">
        <div className="animate-marquee whitespace-nowrap text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-6">
          <span>/ COMPLETE ATELIER COLLECTION</span>
          <span className="text-brand-lavender">/</span>
          <span>DISCOVER NEW RELEASES</span>
          <span className="text-brand-lavender">/</span>
          <span>HANDCRAFTED LUXURY</span>
          <span className="text-brand-lavender">/</span>
          <span>INTERACTIVE 3D PREVIEW</span>
          <span className="text-brand-lavender">/</span>
          <span>COMPLIMENTARY DELIVERY OVER 150 DT</span>
          <span className="text-brand-lavender">/</span>
          <span>COMPLETE ATELIER COLLECTION</span>
          <span className="text-brand-lavender">/</span>
          <span>DISCOVER NEW RELEASES</span>
          <span className="text-brand-lavender">/</span>
          <span>HANDCRAFTED LUXURY</span>
          <span className="text-brand-lavender">/</span>
          <span>INTERACTIVE 3D PREVIEW</span>
        </div>
      </div>

      {/* ─── 4. LIVE PRODUCT CATALOG SECTION (Products Visible While Scrolling) ─── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header with Category Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-brand-lavender font-semibold block mb-1">
              Shop KleinDream
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-charcoal font-normal">
              Continuous Atelier Collection
            </h2>
          </div>

          {/* Instant Client-side Filter Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Pieces' },
              { id: 'MEN', label: 'Men' },
              { id: 'WOMEN', label: 'Women' },
              { id: 'SHOES', label: 'Shoes & 3D' },
              { id: 'NEW', label: 'New Releases' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedAudience(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedAudience === tab.id
                    ? 'bg-brand-charcoal text-white shadow-sm'
                    : 'bg-brand-light text-brand-secondary hover:text-brand-charcoal hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Product Cards Visible on Scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {visibleProducts.map((product) => {
            const img = product.primary_image?.image_url || product.primary_image?.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
            const regularPrice = Number(product.regular_price || 0);
            const salePrice = product.sale_price ? Number(product.sale_price) : null;
            const hasDiscount = salePrice && salePrice < regularPrice;
            const discountPercent = hasDiscount ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
            const isAddingThis = addingId === product.id;
            const isAddedThis = addedId === product.id;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-brand-border/60 hover:shadow-card transition-all duration-300"
              >
                {/* Image */}
                <Link
                  href={`/product/${product.slug}`}
                  className="relative block aspect-[3/4] w-full overflow-hidden bg-brand-light"
                >
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {discountPercent > 0 && (
                      <span className="luxury-badge bg-brand-lavender text-white px-1.5 py-0.5 rounded shadow-sm">
                        -{discountPercent}%
                      </span>
                    )}
                    {product.is_new && discountPercent === 0 && (
                      <span className="luxury-badge bg-brand-charcoal text-white px-1.5 py-0.5 rounded shadow-sm">
                        New
                      </span>
                    )}
                    {Boolean(product.model_3d || product.model_3d_url) && (
                      <span className="luxury-badge bg-brand-lavenderDark text-white px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Box className="h-2.5 w-2.5" />
                        <span>3D</span>
                      </span>
                    )}
                  </div>

                  {/* Desktop Quick-Add Hover Pill */}
                  <div className="hidden sm:block absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      disabled={isAddingThis}
                      className="w-full py-2 bg-brand-charcoal/90 hover:bg-brand-charcoal backdrop-blur text-white text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      {isAddedThis ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-400" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Quick Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-brand-secondary uppercase tracking-widest font-mono">
                      {product.categories?.[0]?.name || product.audience || "KleinDream"}
                    </span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-serif text-xs sm:text-sm font-medium text-brand-charcoal hover:text-brand-lavender block mt-1 line-clamp-1 transition-colors"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-brand-border/40">
                    <div className="flex items-center gap-1.5 font-mono">
                      {hasDiscount ? (
                        <>
                          <span className="text-xs sm:text-sm font-bold text-brand-charcoal">
                            {salePrice?.toFixed(2)} DT
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            {regularPrice.toFixed(2)} DT
                          </span>
                        </>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-brand-charcoal">
                          {regularPrice.toFixed(2)} DT
                        </span>
                      )}
                    </div>

                    {/* Mobile quick add button */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="sm:hidden p-1.5 rounded-full bg-brand-light text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-colors"
                    >
                      {isAddedThis ? <Check className="h-3 w-3 text-green-600" /> : <Plus className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── MARQUEE TICKER 4: CUSTOM - WHAT IS IT? ─── */}
      <div className="relative w-full overflow-hidden bg-brand-charcoal text-white py-2.5 sm:py-3 border-y border-white/10 select-none">
        <div className="animate-marquee whitespace-nowrap text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-6">
          <span>/ CUSTOM - WHAT IS IT?</span>
          <span className="text-brand-lavender">/</span>
          <span>ATELIER BESPOKE CRAFT</span>
          <span className="text-brand-lavender">/</span>
          <span>DIGITAL 3D FITTING</span>
          <span className="text-brand-lavender">/</span>
          <span>CUSTOM - WHAT IS IT?</span>
          <span className="text-brand-lavender">/</span>
          <span>ATELIER BESPOKE CRAFT</span>
          <span className="text-brand-lavender">/</span>
          <span>DIGITAL 3D FITTING</span>
          <span className="text-brand-lavender">/</span>
          <span>CUSTOM - WHAT IS IT?</span>
        </div>
      </div>

      {/* ─── 5. "CUSTOM - WHAT IS IT?" SECTION (Direct Match to Bottom of Reference) ─── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="space-y-8 sm:space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-brand-lavender font-mono font-semibold">
              // ATELIER PROCESS
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-brand-charcoal tracking-tight uppercase">
              Custom — What is it?
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary">
              We reject mass overproduction. Every KleinDream custom piece is manufactured on demand to preserve rarity, artisanal integrity, and individual identity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Step 1 */}
            <div className="p-6 sm:p-8 bg-brand-light rounded-2xl border border-brand-border/80 space-y-4 hover:border-brand-lavender/50 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-brand-charcoal text-white flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h3 className="font-serif text-base sm:text-lg font-semibold text-brand-charcoal">
                Bespoke Tailoring & Cut
              </h3>
              <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                Choose custom silhouette adjustments, hand-applied distressing, and individualized monogramming sewn by Mediterranean master craftsmen.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 sm:p-8 bg-brand-light rounded-2xl border border-brand-border/80 space-y-4 hover:border-brand-lavender/50 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-brand-lavender text-white flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h3 className="font-serif text-base sm:text-lg font-semibold text-brand-charcoal">
                Interactive 3D Inspection
              </h3>
              <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                Rotate footwear and garments in real-time 3D neural reconstruction before buying. Inspect textures, stitching density, and materials.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 sm:p-8 bg-brand-light rounded-2xl border border-brand-border/80 space-y-4 hover:border-brand-lavender/50 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-brand-charcoal text-white flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h3 className="font-serif text-base sm:text-lg font-semibold text-brand-charcoal">
                Archival Materials & Fit Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                Premium heavyweight Italian cottons and vegetable-tanned leathers backed by our 14-day complimentary doorstep size exchange.
              </p>
            </div>

          </div>

          {/* Bottom Action Bar */}
          <div className="p-6 sm:p-8 bg-brand-charcoal text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif text-base sm:text-lg font-medium">Ready to create your own unique look?</h4>
              <p className="text-xs text-gray-400">Discover all available silhouettes and customize your wardrobe today.</p>
            </div>
            <Link
              href="/shop"
              className="px-6 py-3 bg-brand-lavender hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-float flex items-center gap-2 whitespace-nowrap"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
