'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Sparkles, ShoppingBag, FolderTree, Boxes,
  ClipboardList, Users, Tag, Mail, Settings, ChevronLeft,
  ExternalLink, LogOut, Menu, X, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isStoreAdmin, initialize, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    initialize();
    setAuthChecked(true);
  }, [initialize]);

  useEffect(() => {
    if (authChecked && (!isAuthenticated || !isStoreAdmin)) {
      // Allow a brief moment or redirect
      const timer = setTimeout(() => {
        if (!isAuthenticated || !isStoreAdmin) {
          router.push('/auth/login');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authChecked, isAuthenticated, isStoreAdmin, router]);

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'AI Creative Studio', href: '/admin/ai-studio', icon: Sparkles, highlight: true },
    { label: 'Products', href: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons & Promos', href: '/admin/promotions', icon: Tag },
    { label: 'Inbox Messages', href: '/admin/messages', icon: Mail },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col lg:flex-row antialiased">
      
      {/* Mobile Top Header for Admin */}
      <header className="lg:hidden bg-brand-charcoal text-white h-16 px-4 flex items-center justify-between z-30">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-gray-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="font-serif text-lg tracking-[0.2em] uppercase font-medium">
          KleinDream <span className="text-xs text-brand-lavender font-sans tracking-normal">Admin</span>
        </div>
        <Link href="/" target="_blank" className="p-1.5 text-gray-300 hover:text-white" title="View Store">
          <ExternalLink className="h-5 w-5" />
        </Link>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-brand-charcoal text-white flex flex-col justify-between transition-all duration-300 lg:static ${sidebarCollapsed ? 'w-20' : 'w-64'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Brand Wordmark & Collapse Button */}
          <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.25em] font-medium uppercase text-white">
                  KleinDream
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-brand-lavender font-mono font-medium">
                  Executive Suite
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-white/15 text-white shadow-sm font-semibold' : item.highlight ? 'text-brand-lavender hover:bg-white/5 font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={item.label}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${item.highlight ? 'text-brand-lavender' : ''}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {!sidebarCollapsed && item.highlight && (
                    <span className="ml-auto text-[9px] bg-brand-lavender/30 text-brand-lavender px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                      Studio
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Info */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <ExternalLink className="h-4 w-4" />
            {!sidebarCollapsed && <span>Live Storefront</span>}
          </Link>

          {!sidebarCollapsed && (
            <div className="px-3 py-2 bg-white/5 rounded-xl flex items-center justify-between text-xs">
              <div className="truncate">
                <p className="text-white font-medium truncate">{user?.first_name || 'Admin'}</p>
                <p className="text-[10px] text-gray-400 font-mono truncate">{user?.email || 'admin@kleindream.com'}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-gray-400 hover:text-red-400 p-1"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
