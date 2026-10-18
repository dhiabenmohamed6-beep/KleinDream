'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, isLoading } = useCartStore();

  if (!isOpen) return null;

  const subtotal = Number(cart?.subtotal || 0);
  const freeThreshold = 150;
  const progressPercent = Math.min((subtotal / freeThreshold) * 100, 100);
  const remainingForFree = Math.max(freeThreshold - subtotal, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-charcoal/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between h-full">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand-charcoal" />
              <h2 className="font-serif text-base sm:text-lg font-medium text-brand-charcoal">
                Shopping Bag ({cart?.total_items || 0})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-brand-secondary hover:text-brand-charcoal transition-colors rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress Bar */}
          <div className="bg-brand-light px-4 sm:px-6 py-3 border-b border-brand-border">
            <div className="flex justify-between items-center text-xs font-medium text-brand-charcoal mb-1.5">
              <span>
                {remainingForFree === 0
                  ? "✓ Complimentary delivery unlocked!"
                  : `Add ${remainingForFree.toFixed(2)} DT more for complimentary delivery`}
              </span>
              <span className="text-brand-secondary">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-lavender h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-brand-border">
            {!cart || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="h-16 w-16 rounded-full bg-brand-light flex items-center justify-center text-brand-secondary">
                  <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
                </div>
                <div>
                  <p className="font-serif text-lg text-brand-charcoal">Your bag is empty</p>
                  <p className="text-xs text-brand-secondary mt-1">Discover our latest Maison arrivals and atelier pieces.</p>
                </div>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-brand-charcoal text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavender transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3 sm:gap-4">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-16 sm:h-24 sm:w-20 bg-brand-light rounded-lg overflow-hidden flex-shrink-0 border border-brand-border/60">
                    <Image
                      src={item.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop"}
                      alt={item.product_name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <Link
                          href={`/product/${item.product_slug}`}
                          onClick={closeCart}
                          className="font-serif text-xs sm:text-sm font-medium text-brand-charcoal hover:text-brand-lavender transition-colors line-clamp-1"
                        >
                          {item.product_name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] sm:text-xs text-brand-secondary mt-0.5 truncate">
                        {item.variant_name}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2 sm:mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-brand-border rounded-lg overflow-hidden bg-brand-light">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          className="px-2 py-1 text-brand-secondary hover:text-brand-charcoal disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-brand-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= item.stock_quantity}
                          className="px-2 py-1 text-brand-secondary hover:text-brand-charcoal disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs sm:text-sm font-semibold text-brand-charcoal">
                        {item.line_total} DT
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart && cart.items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-brand-border bg-white space-y-3 sm:space-y-4">
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-brand-secondary">
                  <span>Subtotal</span>
                  <span className="text-brand-charcoal font-medium">{subtotal.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between text-brand-secondary">
                  <span>Estimated Delivery</span>
                  <span>{remainingForFree === 0 ? "Free" : "7.00 DT"}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-semibold text-brand-charcoal pt-2 border-t border-brand-border/60">
                  <span>Estimated Total</span>
                  <span>{(subtotal + (remainingForFree === 0 ? 0 : 7)).toFixed(2)} DT</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 sm:py-3.5 bg-brand-charcoal text-white hover:bg-brand-lavenderDark rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-subtle flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
