'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Package, MapPin, LogOut, Sparkles, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchMyOrders } from '@/lib/api';
import { Order } from '@/lib/types';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isStoreAdmin, initialize } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders()
        .then((res) => setOrders(res.results || []))
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    } else {
      setLoadingOrders(false);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated && !loadingOrders) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl text-brand-charcoal">Account Authentication</h2>
        <p className="text-sm text-brand-secondary">Please sign in to view your orders and manage your account.</p>
        <Link
          href="/auth/login"
          className="inline-block px-8 py-3 bg-brand-charcoal text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavender transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Account Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 sm:pb-8 border-b border-brand-border gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-brand-light border border-brand-border flex items-center justify-center text-brand-lavenderDark flex-shrink-0">
            <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 stroke-[1.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-xl sm:text-3xl text-brand-charcoal font-normal truncate">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-xs text-brand-secondary font-mono truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {isStoreAdmin && (
            <Link
              href="/admin/dashboard"
              className="px-3.5 py-2 bg-brand-charcoal text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavenderDark transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-lavender" />
              <span>Admin Studio</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 border border-brand-border rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-brand-light text-brand-charcoal transition-colors flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 pt-6 sm:pt-8">
        
        {/* Navigation Tabs (Horizontal on mobile, vertical on desktop) */}
        <aside className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'bg-brand-charcoal text-white md:bg-brand-light md:text-brand-charcoal' : 'text-brand-secondary hover:text-brand-charcoal bg-brand-light/50 md:bg-transparent'}`}
          >
            <Package className="h-4 w-4" />
            <span>My Orders ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-brand-charcoal text-white md:bg-brand-light md:text-brand-charcoal' : 'text-brand-secondary hover:text-brand-charcoal bg-brand-light/50 md:bg-transparent'}`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Client Profile</span>
          </button>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-normal text-brand-charcoal">Order History</h3>
              
              {loadingOrders ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center bg-brand-light rounded-xl border border-brand-border space-y-3">
                  <Package className="h-8 w-8 text-brand-secondary mx-auto stroke-[1.5]" />
                  <p className="text-sm font-medium text-brand-charcoal">No orders yet</p>
                  <p className="text-xs text-brand-secondary">When you place an order, its real-time tracking will appear here.</p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-2 bg-brand-charcoal text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavender transition-colors mt-2"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-4 sm:p-5 bg-white rounded-xl border border-brand-border shadow-subtle space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-brand-border">
                        <div>
                          <span className="text-xs font-mono font-bold text-brand-charcoal">{ord.order_number}</span>
                          <span className="text-xs text-brand-secondary ml-2 sm:ml-3">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {ord.status_display}
                          </span>
                          <span className="text-xs font-bold text-brand-charcoal">
                            {ord.total} {ord.currency}
                          </span>
                        </div>
                      </div>

                      {/* Items snapshot in this order */}
                      <div className="space-y-2">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-brand-charcoal pr-2">
                              {item.quantity}x {item.product_name} ({item.variant_name})
                            </span>
                            <span className="font-semibold text-brand-charcoal flex-shrink-0">{item.line_total} {ord.currency}</span>
                          </div>
                        ))}
                      </div>

                      {ord.tracking_number && (
                        <div className="pt-2 text-xs text-brand-lavenderDark font-medium flex flex-wrap items-center gap-1.5 border-t border-brand-border/40">
                          <span>Carrier: {ord.shipping_carrier || 'Standard Courier'}</span>
                          <span>·</span>
                          <span>Tracking: {ord.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-brand-border space-y-4 sm:space-y-6">
              <h3 className="font-serif text-lg sm:text-xl font-normal text-brand-charcoal">Client Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-brand-secondary font-medium block">Name</span>
                  <span className="text-brand-charcoal font-semibold mt-0.5 block">{user?.first_name} {user?.last_name}</span>
                </div>
                <div>
                  <span className="text-brand-secondary font-medium block">Email</span>
                  <span className="text-brand-charcoal font-semibold mt-0.5 block">{user?.email}</span>
                </div>
                <div>
                  <span className="text-brand-secondary font-medium block">Phone</span>
                  <span className="text-brand-charcoal font-semibold mt-0.5 block">{user?.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-brand-secondary font-medium block">Privilege Status</span>
                  <span className="text-brand-lavenderDark font-bold mt-0.5 block">{user?.role || 'Customer'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
