'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye, Box, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';
import { resolveProductImage } from '@/lib/image-resolver';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const primaryImage = resolveProductImage(product.primary_image, product.name);
  const has3D = Boolean(product.model_3d || product.model_3d_url);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the first active in-stock variant
    const variant = product.variants?.find((v) => v.is_active && v.is_in_stock) || product.variants?.[0];
    if (!variant) return;

    try {
      setIsAdding(true);
      await addItem(variant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-brand-border/60 hover:shadow-card transition-all duration-300">
      
      {/* Product Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] w-full overflow-hidden bg-brand-light">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10">
          {product.discount_percent > 0 && (
            <span className="luxury-badge bg-brand-lavender text-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm text-[9px] sm:text-[10px]">
              -{product.discount_percent}%
            </span>
          )}
          {product.is_new && (
            <span className="luxury-badge bg-brand-charcoal text-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm text-[9px] sm:text-[10px]">
              New
            </span>
          )}
          {product.is_bestseller && (
            <span className="luxury-badge bg-amber-600 text-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm text-[9px] sm:text-[10px]">
              Bestseller
            </span>
          )}
          {has3D && (
            <span className="luxury-badge bg-brand-lavenderDark text-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm flex items-center gap-1 text-[9px] sm:text-[10px]">
              <Box className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span>3D</span>
            </span>
          )}
        </div>

        {/* Mobile Quick Add floating button (touch screens) */}
        <div className="sm:hidden absolute bottom-2 right-2 z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdding || product.total_stock <= 0}
            className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-md shadow-card flex items-center justify-center text-brand-charcoal active:scale-95 transition-transform"
            aria-label="Add to bag"
          >
            {added ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Desktop Quick Add overlay button */}
        <div className="hidden sm:block absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdding || product.total_stock <= 0}
            className="w-full py-2.5 px-4 bg-white/95 backdrop-blur-md text-brand-charcoal hover:bg-brand-charcoal hover:text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-subtle transition-colors flex items-center justify-center gap-2"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span>Added to Bag</span>
              </>
            ) : product.total_stock <= 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between space-y-1.5 sm:space-y-2">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand-secondary font-medium block truncate">
            {product.audience} · {product.categories?.[0]?.name || 'Collection'}
          </span>
          <Link href={`/product/${product.slug}`} className="block mt-0.5 sm:mt-1">
            <h3 className="font-serif text-xs sm:text-base font-normal text-brand-charcoal group-hover:text-brand-lavender transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Color Swatches if available */}
        {product.available_colors && product.available_colors.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
            {product.available_colors.slice(0, 5).map((color, idx) => (
              <span
                key={idx}
                title={color.name}
                style={{ backgroundColor: color.hex }}
                className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border border-gray-300 transition-transform ${selectedColor === color.hex ? 'scale-125 ring-1 ring-brand-lavender' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(color.hex);
                }}
              />
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 pt-1 border-t border-brand-border/40">
          <span className="text-xs sm:text-sm font-semibold text-brand-charcoal">
            {product.current_price} DT
          </span>
          {product.sale_price && Number(product.sale_price) < Number(product.regular_price) && (
            <span className="text-[10px] sm:text-xs text-brand-secondary line-through">
              {product.regular_price} DT
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
