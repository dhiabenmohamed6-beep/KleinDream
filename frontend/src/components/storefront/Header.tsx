'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User as UserIcon, Menu, X, ShieldAlert, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { fetchCategories } from '@/lib/api';
import { Category } from '@/lib/types';

export default function Header() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { cart, toggleCart, loadCart } = useCartStore();
  const { user, isAuthenticated, isStoreAdmin, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    loadCart();
    fetchCategories().then((res) => {
      if (res && res.results) {
        setCategories(res.results);
      }
    }).catch(() => {});
  }, [initialize, loadCart]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const totalItems = cart?.total_items || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border" id="main-header">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggle & Desktop Navigation */}
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 -ml-1 text-brand-charcoal hover:text-brand-lavender focus:outline-none rounded-lg active:bg-brand-light transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <Link href="/shop" className="text-brand-charcoal hover:text-brand-lavender transition-colors">
              Shop All
            </Link>
            <Link href="/shop?audience=WOMEN" className="text-brand-charcoal hover:text-brand-lavender transition-colors">
              Women
            </Link>
            <Link href="/shop?audience=MEN" className="text-brand-charcoal hover:text-brand-lavender transition-colors">
              Men
            </Link>
            <Link href="/shop?audience=KIDS" className="text-brand-charcoal hover:text-brand-lavender transition-colors">
              Kids
            </Link>
            <Link href="/shop?category=shoes" className="text-brand-charcoal hover:text-brand-lavender transition-colors flex items-center gap-1">
              <span>Shoes</span>
              <span className="text-[10px] bg-brand-light px-1.5 py-0.5 rounded text-brand-lavenderDark font-semibold">3D</span>
            </Link>
            <Link href="/shop?category=bags" className="text-brand-charcoal hover:text-brand-lavender transition-colors">
              Bags
            </Link>
            <Link href="/shop?on_sale=true" className="text-brand-lavenderDark font-semibold hover:opacity-80 transition-opacity">
              Private Sale
            </Link>
          </nav>
        </div>

        {/* Center: KleinDream Typographic Wordmark */}
        <div className="flex-1 flex justify-center lg:flex-initial px-2">
          <Link href="/" className="group flex flex-col items-center">
            <span className="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.2em] sm:tracking-[0.25em] font-medium text-brand-charcoal uppercase group-hover:text-brand-lavender transition-colors">
              KleinDream
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.35em] sm:tracking-[0.4em] text-brand-secondary font-sans">
              Atelier & Maison
            </span>
          </Link>
        </div>

        {/* Right: Search, Account, Admin Studio, Cart */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 sm:p-2.5 text-brand-charcoal hover:text-brand-lavender transition-colors rounded-lg"
            title="Search products"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Admin Studio Quick Badge (Visible for Admin) */}
          {isStoreAdmin && (
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-brand-charcoal text-white hover:bg-brand-lavenderDark transition-colors shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-lavender" />
              <span>Admin Studio</span>
            </Link>
          )}

          {/* Customer Account */}
          <Link
            href={isAuthenticated ? "/account" : "/auth/login"}
            className="p-2 sm:p-2.5 text-brand-charcoal hover:text-brand-lavender transition-colors rounded-lg flex items-center"
            title={isAuthenticated ? `Account: ${user?.first_name || user?.email}` : "Sign In"}
            aria-label="Account"
          >
            <UserIcon className="h-5 w-5" />
          </Link>

          {/* Shopping Cart Button */}
          <button
            type="button"
            onClick={toggleCart}
            className="relative p-2 sm:p-2.5 text-brand-charcoal hover:text-brand-lavender transition-colors rounded-lg"
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-0.5 inline-flex items-center justify-center min-w-4 h-4 sm:min-w-5 sm:h-5 px-1 text-[10px] sm:text-[11px] font-bold text-white bg-brand-lavender rounded-full shadow-sm animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {searchOpen && (
        <div className="bg-brand-light/95 border-b border-brand-border px-4 py-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-brand-secondary flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search atelier coats, leather bags, sneakers..."
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-brand-charcoal placeholder-brand-secondary focus:outline-none min-w-0"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 bg-brand-charcoal text-white text-[11px] sm:text-xs uppercase tracking-wider rounded-lg hover:bg-brand-lavender transition-colors flex-shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 text-brand-secondary hover:text-brand-charcoal"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in Panel */}
          <div
            className="fixed top-0 left-0 h-screen z-[9999] w-4/5 max-w-sm bg-white shadow-2xl flex flex-col"
            style={{
              animation: 'slideInLeft 0.25s cubic-bezier(0.4,0,0.2,1)',
              animationFillMode: 'forwards',
            }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
              <span className="font-serif text-lg tracking-[0.2em] font-medium text-gray-900 uppercase">
                KleinDream
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-700 hover:text-purple-600 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="mx-4 mt-4 mb-2 flex items-center gap-2 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200 flex-shrink-0"
            >
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pieces..."
                className="w-full bg-transparent border-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </form>

            {/* Nav Links — scrollable */}
            <nav className="flex-1 overflow-y-auto px-4 py-3">
              <div className="divide-y divide-gray-100">
                {[
                  { href: '/shop', label: 'Shop All Collection' },
                  { href: '/shop?audience=WOMEN', label: "Women's Wardrobe" },
                  { href: '/shop?audience=MEN', label: "Men's Wardrobe" },
                  { href: '/shop?audience=KIDS', label: 'Kids & Baby' },
                  { href: '/shop?category=bags', label: 'Leather Goods & Bags' },
                  { href: '/shop?on_sale=true', label: 'Seasonal Private Sale', accent: true },
                ].map(({ href, label, accent }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3.5 text-base font-serif transition-colors ${
                      accent ? 'text-purple-700 font-medium' : 'text-gray-800 hover:text-purple-600'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/shop?category=shoes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3.5 text-base font-serif text-gray-800 hover:text-purple-600 transition-colors"
                >
                  <span>Shoes & Footwear</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-purple-700 font-sans font-semibold">3D</span>
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                {isStoreAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 bg-gray-900 text-white rounded-xl font-medium text-xs uppercase tracking-wider"
                  >
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Admin Studio</span>
                  </Link>
                )}
                <Link
                  href={isAuthenticated ? '/account' : '/auth/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-xs uppercase tracking-wider font-semibold text-gray-800 hover:text-purple-600"
                >
                  {isAuthenticated ? 'My Account & Orders' : 'Sign In / Register'}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-xs uppercase tracking-wider font-semibold text-gray-400 hover:text-gray-800"
                >
                  Concierge & Client Care
                </Link>
              </div>
            </nav>
          </div>

          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to   { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </header>
  );
}
