'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ShoppingBag, Box, Check, Star, Shield, Truck, RotateCcw, ChevronRight } from 'lucide-react';
import ThreeDViewer from '@/components/ThreeDViewer';
import ProductCard from '@/components/storefront/ProductCard';
import { fetchProductBySlug, fetchRelatedProducts } from '@/lib/api';
import { Product, ProductVariant } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'gallery' | '3d'>('gallery');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const firstInStock = data.variants.find((v) => v.is_active && v.is_in_stock) || data.variants[0];
          setSelectedVariant(firstInStock);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    fetchRelatedProducts(slug)
      .then((res) => setRelated(res))
      .catch(() => {});
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4 space-y-4">
        <h2 className="font-serif text-2xl text-brand-charcoal">Piece Not Found</h2>
        <p className="text-sm text-brand-secondary">The requested product could not be found or has been archived.</p>
        <Link href="/shop" className="inline-block px-6 py-2.5 bg-brand-charcoal text-white rounded-full text-xs font-semibold uppercase tracking-wider">
          Return to Shop
        </Link>
      </div>
    );
  }

  const has3D = Boolean(product.model_3d || product.model_3d_url);
  const model3dUrl = product.model_3d_url || (product.model_3d ? (product.model_3d.startsWith('http') ? product.model_3d : `http://127.0.0.1:8001${product.model_3d}`) : '');

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 0, image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop", is_primary: true, is_ai_generated: false, display_order: 0, created_at: '' }];

  const currentPrice = selectedVariant?.price_override ?? product.current_price;
  const isOutOfStock = selectedVariant ? !selectedVariant.is_in_stock : product.total_stock <= 0;

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock) return;
    try {
      setIsAdding(true);
      await addItem(selectedVariant.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-brand-secondary">
        <Link href="/" className="hover:text-brand-charcoal">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-brand-charcoal">Shop</Link>
        {product.categories?.[0] && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/shop?category=${product.categories[0].slug}`} className="hover:text-brand-charcoal">
              {product.categories[0].name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-charcoal font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase: Media & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Media Gallery or 3D Interactive View */}
        <div className="space-y-4">
          
          {/* View Mode Tabs (if 3D available) */}
          {has3D && (
            <div className="flex items-center gap-2 border-b border-brand-border pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'gallery' ? 'bg-brand-charcoal text-white' : 'text-brand-secondary hover:text-brand-charcoal'}`}
              >
                Photography Gallery
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('3d')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === '3d' ? 'bg-brand-lavenderDark text-white' : 'text-brand-secondary hover:text-brand-charcoal'}`}
              >
                <Box className="h-3.5 w-3.5" />
                <span>Interactive 3D Model</span>
              </button>
            </div>
          )}

          {activeTab === '3d' && has3D ? (
            <div className="space-y-2">
              <ThreeDViewer modelUrl={model3dUrl} className="h-[300px] sm:h-[420px] lg:h-[520px] w-full" />
              <p className="text-xs text-brand-secondary text-center">
                Interactive real-time 3D model. Drag to rotate 360°, scroll to zoom, toggle wireframe.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Main Active Image */}
              <div className="relative aspect-[3/4] w-full bg-brand-light rounded-2xl overflow-hidden border border-brand-border/60">
                <Image
                  src={images[activeImageIdx]?.image_url || images[activeImageIdx]?.image || ''}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                {images[activeImageIdx]?.is_ai_generated && (
                  <span className="absolute top-3 right-3 text-[10px] uppercase font-mono tracking-wider px-2 py-1 bg-brand-charcoal/70 backdrop-blur-md text-white rounded">
                    AI Studio Visual
                  </span>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative h-16 w-14 sm:h-20 sm:w-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImageIdx === idx ? 'border-brand-lavender scale-105' : 'border-brand-border/60 opacity-70 hover:opacity-100'}`}
                    >
                      <Image
                        src={img.image_url || img.image || ''}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Purchase Actions */}
        <div className="space-y-6 sm:space-y-8">
          
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-lavender font-semibold mb-1">
              <span>{product.audience}</span>
              <span>·</span>
              <span>{product.categories?.[0]?.name || 'Collection'}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-charcoal font-normal leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-brand-secondary font-mono mt-1">Ref: {selectedVariant?.sku || product.sku}</p>
          </div>

          {/* Pricing & Stock Banner */}
          <div className="flex items-center justify-between pb-5 sm:pb-6 border-b border-brand-border">
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-semibold text-brand-charcoal">
                {currentPrice} DT
              </span>
              {product.sale_price && Number(product.sale_price) < Number(product.regular_price) && (
                <>
                  <span className="text-xs sm:text-sm text-brand-secondary line-through">
                    {product.regular_price} DT
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white bg-brand-lavender px-1.5 sm:px-2 py-0.5 rounded">
                    -{product.discount_percent}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="text-right">
              {isOutOfStock ? (
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Out of Stock</span>
              ) : selectedVariant && selectedVariant.stock_quantity <= 5 ? (
                <span className="text-[11px] sm:text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Only {selectedVariant.stock_quantity} left
                </span>
              ) : (
                <span className="text-[11px] sm:text-xs font-semibold text-green-700 uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-ping" />
                  In Stock & Ready
                </span>
              )}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
            {product.description || product.short_description}
          </p>

          {/* Variant Selectors */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center text-xs font-medium text-brand-charcoal mb-2">
                  <span className="uppercase tracking-wider font-semibold">Select Size:</span>
                  <span className="text-brand-secondary">{selectedVariant?.size}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.is_in_stock}
                      onClick={() => setSelectedVariant(v)}
                      className={`min-w-10 sm:min-w-12 h-9 sm:h-10 px-3 rounded-lg text-xs font-medium transition-all border ${selectedVariant?.id === v.id ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm' : v.is_in_stock ? 'bg-white text-brand-charcoal border-brand-border hover:border-brand-lavender' : 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60'}`}
                    >
                      {v.size || v.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Details if any */}
              {selectedVariant?.color_name && (
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-brand-charcoal block mb-2">
                    Color: <span className="font-normal text-brand-secondary">{selectedVariant.color_name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: selectedVariant.color_hex }}
                      className="h-6 w-6 rounded-full border border-gray-300 shadow-sm ring-2 ring-brand-lavender ring-offset-2"
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Quantity and Add to Bag */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
            
            <div className="flex items-center border border-brand-border rounded-xl bg-brand-light p-1 w-full sm:w-32 justify-between">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-4 sm:px-3 py-1.5 text-brand-secondary hover:text-brand-charcoal disabled:opacity-40"
              >
                -
              </button>
              <span className="text-sm font-semibold text-brand-charcoal">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                disabled={selectedVariant ? quantity >= selectedVariant.stock_quantity : false}
                className="px-4 sm:px-3 py-1.5 text-brand-secondary hover:text-brand-charcoal disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className="w-full sm:flex-1 py-3.5 sm:py-4 px-6 sm:px-8 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all duration-200 shadow-float disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Added to Shopping Bag</span>
                </>
              ) : isOutOfStock ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Bag · {(Number(currentPrice) * quantity).toFixed(2)} DT</span>
                </>
              )}
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-5 sm:pt-6 border-t border-brand-border/60 grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="space-y-1">
              <Truck className="h-4 w-4 text-brand-lavender mx-auto" />
              <p className="text-[10px] sm:text-[11px] font-medium text-brand-charcoal">Express Delivery</p>
              <p className="text-[9px] sm:text-[10px] text-brand-secondary">Across Tunisia</p>
            </div>
            <div className="space-y-1">
              <Shield className="h-4 w-4 text-brand-lavender mx-auto" />
              <p className="text-[10px] sm:text-[11px] font-medium text-brand-charcoal">Authenticity</p>
              <p className="text-[9px] sm:text-[10px] text-brand-secondary">Certified Luxury</p>
            </div>
            <div className="space-y-1">
              <RotateCcw className="h-4 w-4 text-brand-lavender mx-auto" />
              <p className="text-[10px] sm:text-[11px] font-medium text-brand-charcoal">14-Day Exchanges</p>
              <p className="text-[9px] sm:text-[10px] text-brand-secondary">Doorstep Care</p>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Sticky Bottom Add to Bag Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-brand-border z-30 flex items-center justify-between gap-3 shadow-2xl">
        <div className="truncate">
          <p className="font-serif text-xs font-semibold text-brand-charcoal truncate">{product.name}</p>
          <p className="text-xs font-bold text-brand-lavenderDark">{currentPrice} DT</p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          className="flex-shrink-0 px-5 py-2.5 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {added ? <Check className="h-3.5 w-3.5 text-green-400" /> : <ShoppingBag className="h-3.5 w-3.5" />}
          <span>{added ? 'Added' : 'Add to Bag'}</span>
        </button>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-8 sm:pt-12 border-t border-brand-border">
          <div className="mb-6 sm:mb-8">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-brand-lavender font-semibold block mb-0.5 sm:mb-1">
              Complete the Look
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-brand-charcoal font-normal">
              You May Also Admire
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
