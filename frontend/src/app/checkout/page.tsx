'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, ShieldCheck, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { checkoutOrder, validateCoupon } from '@/lib/api';
import { Order } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loadCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address_line_1: '',
    city: 'Tunis',
    state: 'Tunis',
    postal_code: '1053',
    country: 'Tunisia',
    notes: '',
    shipping_method: 'Standard Courier',
    payment_method: 'CASH_ON_DELIVERY',
    coupon_code: '',
  });

  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: `${user.first_name} ${user.last_name}`.trim() || user.username,
        customer_email: user.email,
        customer_phone: user.phone || '',
      }));
    }
  }, [user]);

  const subtotal = Number(cart?.subtotal || 0);
  const freeThreshold = 150;
  const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : 7;
  const total = Math.max(0, subtotal - couponDiscount + shippingFee);

  const handleApplyCoupon = async () => {
    if (!formData.coupon_code.trim()) return;
    try {
      setCouponError(null);
      const res = await validateCoupon(formData.coupon_code.trim(), subtotal);
      if (res.valid) {
        setCouponDiscount(Number(res.discount_amount));
        setCouponMessage(res.message);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid promotion code');
      setCouponDiscount(0);
      setCouponMessage(null);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: {
          address_line_1: formData.address_line_1,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        coupon_code: formData.coupon_code,
        notes: formData.notes,
      };

      const order = await checkoutOrder(payload);
      setCompletedOrder(order);
      // Reload empty cart
      await loadCart();
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please check stock or details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmation Success View
  if (completedOrder) {
    return (
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-brand-light/70 via-white to-white px-4 py-14 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-lavender/10 blur-3xl" />
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-700 shadow-[0_10px_30px_-16px_rgba(21,128,61,0.5)]">
              <Check className="h-9 w-9 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-lavenderDark">
              Order Confirmation
            </span>
            <h1 className="mt-3 font-serif text-3xl font-normal leading-tight text-brand-charcoal sm:text-5xl">
              Thank you for your purchase
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-brand-secondary sm:text-base">
              Your order has been received and is being prepared. We’ll take care of the details from here.
            </p>
          </div>

          <section aria-label="Order details" className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_20px_60px_-38px_rgba(32,33,36,0.35)]">
            <div className="flex flex-col gap-3 border-b border-brand-border bg-brand-light/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-secondary">Order reference</p>
                <p className="mt-1.5 break-all font-mono text-sm font-bold tracking-wide text-brand-charcoal sm:text-base">
                  {completedOrder.order_number}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {completedOrder.status_display}
              </span>
            </div>

            <div className="space-y-0 px-5 sm:px-7">
              <div className="flex items-center justify-between gap-4 border-b border-brand-border/80 py-4">
                <span className="text-xs font-medium text-brand-secondary sm:text-sm">Customer</span>
                <span className="text-right text-xs font-semibold text-brand-charcoal sm:text-sm">{completedOrder.customer_name}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-brand-border/80 py-4">
                <span className="text-xs font-medium text-brand-secondary sm:text-sm">Payment method</span>
                <span className="text-right text-xs font-semibold text-brand-charcoal sm:text-sm">{completedOrder.payment_method_display}</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-5">
                <span className="text-sm font-semibold text-brand-charcoal">Total amount</span>
                <span className="font-serif text-xl font-semibold text-brand-charcoal sm:text-2xl">{completedOrder.total} DT</span>
              </div>
            </div>
          </section>

          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 rounded-2xl border border-brand-border/80 bg-white/70 p-4 sm:grid-cols-3 sm:p-5">
            <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700"><Check className="h-4 w-4" /></span>
              <span className="text-xs font-medium text-brand-charcoal">Order received</span>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-lavenderDark"><ShoppingBag className="h-4 w-4" /></span>
              <span className="text-xs font-medium text-brand-charcoal">Being prepared</span>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-secondary"><Truck className="h-4 w-4" /></span>
              <span className="text-xs font-medium text-brand-secondary">On its way to you</span>
            </div>
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-charcoal px-8 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-subtle transition-all hover:-translate-y-0.5 hover:bg-brand-lavenderDark sm:w-auto"
            >
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
            {isAuthenticated && (
              <Link
                href="/account"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-brand-border bg-white px-8 text-xs font-semibold uppercase tracking-[0.14em] text-brand-charcoal transition-colors hover:bg-brand-light sm:w-auto"
              >
                View Order in Account
              </Link>
            )}
          </div>
          <p className="mt-6 text-center text-[11px] text-brand-secondary">
            Thank you for choosing KleinDream.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6 sm:mb-10">
        <h1 className="font-serif text-2xl sm:text-4xl text-brand-charcoal font-normal">
          Secure Checkout
        </h1>
        <p className="text-xs text-brand-secondary mt-1">
          Complete your contact and delivery details to place your Maison order.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Details & Address Form (8 cols) */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* 1. Customer Information */}
          <div className="p-4 sm:p-6 bg-white rounded-2xl border border-brand-border space-y-4">
            <h2 className="font-serif text-base sm:text-lg font-medium text-brand-charcoal pb-2 border-b border-brand-border">
              1. Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Sophie Laurent"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="sophie@example.com"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="+216 98 000 000"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="p-4 sm:p-6 bg-white rounded-2xl border border-brand-border space-y-4">
            <h2 className="font-serif text-base sm:text-lg font-medium text-brand-charcoal pb-2 border-b border-brand-border">
              2. Delivery Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                  placeholder="Appartement, Résidence, Rue..."
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs font-medium text-brand-charcoal block mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Tunis, Sousse, Sfax..."
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-charcoal block mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="1053"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Delivery Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Gate code, landmark, or preferred delivery timing..."
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="p-4 sm:p-6 bg-white rounded-2xl border border-brand-border space-y-4">
            <h2 className="font-serif text-base sm:text-lg font-medium text-brand-charcoal pb-2 border-b border-brand-border">
              3. Payment Selection
            </h2>
            <div className="space-y-3">
              {[
                { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery (Paiement à la livraison)', desc: 'Pay in cash directly to the courier upon doorstep inspection.' },
                { id: 'BANK_TRANSFER', label: 'Bank Wire Transfer (Virement Bancaire)', desc: 'Direct bank transfer to KleinDream BIC/IBAN with immediate confirmation.' },
                { id: 'ONLINE_GATEWAY', label: 'Credit Card / Electronic Gateway', desc: 'Secure online gateway supporting local GIE and international cards.' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border cursor-pointer transition-all ${formData.payment_method === opt.id ? 'border-brand-lavender bg-brand-lavender/5 ring-1 ring-brand-lavender' : 'border-brand-border bg-brand-light/50 hover:bg-brand-light'}`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={opt.id}
                    checked={formData.payment_method === opt.id}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="mt-1 text-brand-lavender focus:ring-brand-lavender"
                  />
                  <div>
                    <span className="text-xs font-semibold text-brand-charcoal block">{opt.label}</span>
                    <span className="text-[11px] text-brand-secondary block mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Order Review & Submit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-4 sm:p-6 bg-brand-light rounded-2xl border border-brand-border space-y-5 sm:space-y-6 lg:sticky lg:top-28">
            <h3 className="font-serif text-base sm:text-lg font-medium text-brand-charcoal pb-2 border-b border-brand-border">
              Order Review ({cart?.total_items || 0} items)
            </h3>

            {/* Item Thumbnails List */}
            <div className="divide-y divide-brand-border max-h-64 overflow-y-auto pr-1">
              {cart?.items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 items-center">
                  <div className="relative h-14 w-12 bg-white rounded-lg overflow-hidden border border-brand-border flex-shrink-0">
                    <Image
                      src={item.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop"}
                      alt={item.product_name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-serif font-medium text-brand-charcoal line-clamp-1">{item.product_name}</p>
                    <p className="text-gray-500 text-[11px]">Qty: {item.quantity} · {item.variant_name}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-charcoal">
                    {item.line_total} DT
                  </span>
                </div>
              ))}
            </div>

            {/* Privilege Code Box */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  placeholder="Coupon code (KLEIN10)"
                  className="flex-1 bg-white border border-brand-border rounded-lg px-3 py-1.5 text-xs uppercase focus:outline-none focus:border-brand-lavender"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 bg-brand-charcoal text-white rounded-lg text-xs font-semibold uppercase hover:bg-brand-lavender transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponMessage && <p className="text-xs text-green-700 mt-1">{couponMessage}</p>}
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            </div>

            {/* Financial Totals */}
            <div className="space-y-2 text-xs border-t border-brand-border pt-4">
              <div className="flex justify-between text-brand-secondary">
                <span>Subtotal</span>
                <span className="text-brand-charcoal font-medium">{subtotal.toFixed(2)} DT</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Privilege Discount</span>
                  <span>-{couponDiscount.toFixed(2)} DT</span>
                </div>
              )}
              <div className="flex justify-between text-brand-secondary">
                <span>Express Courier Shipping</span>
                <span>{shippingFee === 0 ? "Complimentary" : `${shippingFee.toFixed(2)} DT`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-brand-charcoal pt-3 border-t border-brand-border">
                <span>Final Total</span>
                <span>{total.toFixed(2)} DT</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting || !cart || cart.items.length === 0}
              className="w-full py-4 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-colors shadow-float disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Confirm & Place Order · {total.toFixed(2)} DT</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              By confirming, you agree to KleinDream's Terms of Service and 14-day exchange policy.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
