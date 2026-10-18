'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign, ShoppingBag, Users, AlertTriangle, ArrowUpRight,
  Sparkles, TrendingUp, Package, Clock
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { fetchDashboardOverview } from '@/lib/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboardOverview(days)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const salesTrends = data?.sales_trends || [];

  return (
    <div className="space-y-8">
      
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
            Real Database Analytics
          </span>
          <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
            Business Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ai-studio"
            className="px-4 py-2 bg-brand-charcoal text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavenderDark transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-lavender" />
            <span>AI Studio</span>
          </Link>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold text-brand-charcoal focus:outline-none"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-subtle space-y-2">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center text-brand-lavenderDark">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-brand-charcoal">
            {Number(data?.total_sales || 0).toFixed(2)} DT
          </div>
          <p className="text-[11px] text-brand-secondary">
            Excludes cancelled orders · {data?.period_days} day period
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-subtle space-y-2">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center text-brand-lavenderDark">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-brand-charcoal">
            {data?.total_orders_count || 0}
          </div>
          <p className="text-[11px] text-brand-secondary">
            {data?.period_orders_count || 0} placed in this period
          </p>
        </div>

        {/* Active Products */}
        <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-subtle space-y-2">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Catalog</span>
            <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center text-brand-lavenderDark">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-brand-charcoal">
            {data?.active_products || 0}
          </div>
          <p className="text-[11px] text-brand-secondary">
            Published luxury pieces in storefront
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-subtle space-y-2">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Attention</span>
            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {data?.low_stock_count || 0}
          </div>
          <p className="text-[11px] text-brand-secondary">
            Variants below threshold · {data?.out_of_stock_count || 0} out of stock
          </p>
        </div>

      </div>

      {/* Chart: Sales Trends */}
      <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-subtle space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-lg font-normal text-brand-charcoal">Sales Trends (TND)</h3>
            <p className="text-xs text-brand-secondary">Daily sales activity across the selected {days}-day timeframe</p>
          </div>
          <span className="text-xs font-mono font-semibold text-brand-lavenderDark bg-brand-light px-3 py-1 rounded-full">
            Real Aggregation
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrends}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8975D9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8975D9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#202124', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)} DT`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#8975D9" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-brand-border shadow-subtle space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-normal text-brand-charcoal">Recent Customer Orders</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-lavenderDark hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Order Ref</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {(!data?.recent_orders || data.recent_orders.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-brand-secondary">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recent_orders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-brand-light/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-brand-charcoal">
                        {ord.order_number}
                      </td>
                      <td className="py-3 px-3 font-medium text-brand-charcoal">
                        {ord.customer_name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-light text-brand-charcoal border border-brand-border">
                          {ord.status_display}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-brand-charcoal text-right">
                        {ord.total} {ord.currency}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Distribution (1 col) */}
        <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-subtle space-y-4">
          <h3 className="font-serif text-lg font-normal text-brand-charcoal">Status Distribution</h3>
          <div className="space-y-2.5">
            {Object.entries(data?.status_counts || {}).map(([key, count]: any) => (
              <div key={key} className="flex justify-between items-center text-xs p-2.5 bg-brand-light rounded-xl">
                <span className="font-medium text-brand-charcoal capitalize">{key.toLowerCase().replace('_', ' ')}</span>
                <span className="font-bold text-brand-lavenderDark bg-white px-2 py-0.5 rounded-md shadow-sm">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
