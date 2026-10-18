'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Check, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setError(null);
      await subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Subscription failed');
    }
  };

  return (
    <footer className="bg-brand-charcoal text-white pt-12 sm:pt-16 pb-8 sm:pb-12 border-t border-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-16 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-xl sm:text-2xl tracking-[0.25em] font-medium text-white uppercase">
                KleinDream
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed">
              KleinDream is a modern luxury fashion and lifestyle maison. Discover meticulously tailored garments, architectural leather goods, and refined essentials designed for everyday elegance.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-lavenderDark transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-lavenderDark transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation Column 1: Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavender mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/shop?audience=WOMEN" className="hover:text-white transition-colors">
                  Women's Wardrobe
                </Link>
              </li>
              <li>
                <Link href="/shop?audience=MEN" className="hover:text-white transition-colors">
                  Men's Tailoring
                </Link>
              </li>
              <li>
                <Link href="/shop?audience=KIDS" className="hover:text-white transition-colors">
                  Kids & Playwear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=shoes" className="hover:text-white transition-colors">
                  Footwear & 3D Models
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bags" className="hover:text-white transition-colors">
                  Handcrafted Leather
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Client Care */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavender mb-4">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Concierge & Contact
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Order Tracking & Status
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Complimentary Shipping over 150 DT</span>
              </li>
              <li>
                <span className="text-gray-400">14-Day Returns & Exchanges</span>
              </li>
              <li>
                <span className="text-gray-400">Official Currency: TND (Tunisian Dinar)</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavender mb-4">
              Newsletter
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Receive private collection previews, seasonal invitations, and exclusive privilege codes.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-white/5 border border-brand-lavender/40 rounded-lg text-xs text-brand-lavender font-medium">
                <Check className="h-4 w-4" />
                <span>You are subscribed to KleinDream Privileges.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-lavender"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1.5 rounded-md bg-brand-lavender text-white hover:bg-brand-lavenderDark transition-colors"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                {error && <p className="text-[11px] text-red-400">{error}</p>}
              </form>
            )}
          </div>

        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3 sm:gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} KleinDream Maison. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span>Tunis · Paris · Milan</span>
            <span>Secure Checkout</span>
            <span>TND / DT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
