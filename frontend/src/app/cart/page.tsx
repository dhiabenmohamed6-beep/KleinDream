'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowRight, Check, Tag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { validateCoupon } from '@/lib/api';

export default function CartPage() {
  const { cart, loadCart, updateQuantity, removeItem, isLoading } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const subtotal = Number(cart?.subtotal || 0);
  const freeThreshold = 150;
  const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : 7;
  const total = Math.max(0, subtotal - appliedDiscount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      setValidatingCoupon(true);
      setCouponError(null);
      const res = await validateCoupon(couponCode.trim(), subtotal);
      if (res.valid) {
        setAppliedDiscount(Number(res.discount_amount));
        setCouponMessage(res.message);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid promotion code');
      setAppliedDiscount(0);
      setCouponMessage(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl sm:text-4xl text-brand-charcoal font-normal">
          Your Shopping Bag
        </h1>
        <p className="text-xs text-brand-secondary mt-1">
          Review your chosen pieces before entering secure checkout.
        </p>
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="py-16 sm:py-20 text-center bg-brand-light rounded-2xl border border-brand-border space-y-4 px-4">
          <ShoppingBag className="h-12 w-12 text-brand-secondary mx-auto stroke-[1.5]" />
          <h2 className="font-serif text-xl text-brand-charcoal">Your bag is currently empty</h2>
          <p className="text-xs text-brand-secondary max-w-sm mx-auto">
            Explore our curated collections of luxury coats, leather goods, and footwear.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-brand-charcoal text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavender transition-colors"
          >
            Explore the Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          
          {/* Items Table */}
          <div className="lg:col-span-2 divide-y divide-brand-border border-t border-b border-brand-border">
            {cart.items.map((item) => (
              <div key={item.id} className="py-4 sm:py-6 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="relative h-20 w-16 sm:h-28 sm:w-24 bg-brand-light rounded-xl overflow-hidden flex-shrink-0 border border-brand-border">
                    <Image
                      src={item.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop"}
                      alt={item.product_name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      href={`/product/${item.product_slug}`}
                      className="font-serif text-sm sm:text-base text-brand-charcoal hover:text-brand-lavender font-medium transition-colors block line-clamp-1"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-brand-secondary truncate">
                      Variant: {item.variant_name}
                    </p>
                    <p className="text-xs font-semibold text-brand-charcoal pt-0.5">
                      {item.unit_price} DT each
                    </p>
                  </div>
                </div>

                {/* Quantity and Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                  <div className="flex items-center border border-brand-border rounded-lg bg-brand-light">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={isLoading || item.quantity <= 1}
                      className="px-2.5 py-1 text-xs text-brand-secondary hover:text-brand-charcoal disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-semibold text-brand-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isLoading || item.quantity >= item.stock_quantity}
                      className="px-2.5 py-1 text-xs text-brand-secondary hover:text-brand-charcoal disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs sm:text-sm font-semibold text-brand-charcoal min-w-[70px] text-right">
                    {item.line_total} DT
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Coupon Card */}
          <div className="p-4 sm:p-6 bg-brand-light rounded-2xl border border-brand-border space-y-5 sm:space-y-6">
            <h3 className="font-serif text-lg font-medium text-brand-charcoal">
              Order Summary
            </h3>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label htmlFor="coupon-input" className="text-xs font-medium text-brand-charcoal uppercase tracking-wider block">
                Privilege Code
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon-input"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. KLEIN10, DREAM20"
                  className="flex-1 bg-white border border-brand-border rounded-lg px-3 py-2 text-xs uppercase text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-brand-charcoal text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavender transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>{couponMessage}</span>
                </p>
              )}
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs border-t border-brand-border pt-4">
              <div className="flex justify-between text-brand-secondary">
                <span>Subtotal</span>
                <span className="text-brand-charcoal font-medium">{subtotal.toFixed(2)} DT</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Privilege Discount</span>
                  <span>-{appliedDiscount.toFixed(2)} DT</span>
                </div>
              )}
              <div className="flex justify-between text-brand-secondary">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? "Complimentary" : `${shippingFee.toFixed(2)} DT`}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-brand-charcoal pt-3 border-t border-brand-border">
                <span>Total Amount</span>
                <span>{total.toFixed(2)} DT</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-colors shadow-float flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="text-[11px] text-brand-secondary text-center">
              All transactions are secured and processed in Tunisian Dinars (TND).
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
