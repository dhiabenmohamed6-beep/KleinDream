'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, ArrowUpDown, Plus, Minus, Search, RefreshCw, Check } from 'lucide-react';
import { fetchAdminInventory, adjustInventory } from '@/lib/api';

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(5);
  const [adjustmentType, setAdjustmentType] = useState<'RESTOCK' | 'MANUAL_ADJUSTMENT'>('RESTOCK');
  const [reason, setReason] = useState('New shipment restock');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = () => {
    setLoading(true);
    fetchAdminInventory(search, statusFilter === 'all' ? undefined : statusFilter)
      .then((res) => setVariants(res.results || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, [search, statusFilter]);

  const handleOpenAdjust = (variant: any, type: 'RESTOCK' | 'MANUAL_ADJUSTMENT') => {
    setSelectedVariant(variant);
    setAdjustmentType(type);
    setAdjustmentAmount(type === 'RESTOCK' ? 10 : 1);
    setReason(type === 'RESTOCK' ? 'Workshop restock shipment' : 'Inventory audit adjustment');
    setError(null);
    setSuccessMessage(null);
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await adjustInventory(selectedVariant.id, adjustmentAmount, reason);
      setSuccessMessage(`Stock updated successfully for ${selectedVariant.sku}`);
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMessage(null);
      }, 1500);
      loadInventory();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
            Real-Time Logistics
          </span>
          <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
            Inventory & Stock Auditing
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Monitor variant availability, audit stock movements, and execute atomic restock transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInventory}
          className="px-4 py-2 border border-brand-border rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-white text-brand-charcoal transition-colors flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        
        <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 text-brand-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by SKU, variant name, or product..."
              className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
            />
          </div>

          <div className="flex items-center gap-1 bg-brand-light p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${statusFilter === 'all' ? 'bg-white text-brand-charcoal shadow-sm' : 'text-brand-secondary hover:text-brand-charcoal'}`}
            >
              All Variants
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('low_stock')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${statusFilter === 'low_stock' ? 'bg-white text-amber-700 shadow-sm' : 'text-brand-secondary hover:text-brand-charcoal'}`}
            >
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              <span>Low Stock</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('out_of_stock')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${statusFilter === 'out_of_stock' ? 'bg-white text-red-600 shadow-sm' : 'text-brand-secondary hover:text-brand-charcoal'}`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Variant SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Color</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-secondary animate-pulse">
                    Auditing live inventory database...
                  </td>
                </tr>
              ) : variants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-secondary">
                    No variants match the criteria.
                  </td>
                </tr>
              ) : (
                variants.map((v) => {
                  const isLow = v.stock_quantity <= v.low_stock_threshold && v.stock_quantity > 0;
                  const isOut = v.stock_quantity <= 0;
                  return (
                    <tr key={v.id} className="hover:bg-brand-light/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-charcoal">
                        {v.sku}
                      </td>
                      <td className="py-3 px-4 font-serif font-medium text-brand-charcoal">
                        {v.product_name}
                      </td>
                      <td className="py-3 px-4 font-medium text-brand-secondary">
                        {v.size || 'One Size'}
                      </td>
                      <td className="py-3 px-4 text-brand-secondary">
                        {v.color_name || 'Standard'}
                      </td>
                      <td className="py-3 px-4 font-bold text-sm text-brand-charcoal">
                        {v.stock_quantity}
                      </td>
                      <td className="py-3 px-4 font-mono text-brand-secondary">
                        {v.low_stock_threshold}
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                            Optimal Level
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(v, 'RESTOCK')}
                          className="px-2.5 py-1 bg-brand-charcoal hover:bg-brand-lavender text-white rounded text-[11px] font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Restock</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(v, 'MANUAL_ADJUSTMENT')}
                          className="px-2.5 py-1 border border-brand-border hover:bg-brand-light text-brand-charcoal rounded text-[11px] font-medium transition-colors"
                        >
                          Audit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Adjust Modal */}
      {modalOpen && selectedVariant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h3 className="font-serif text-xl font-normal text-brand-charcoal pb-3 border-b border-brand-border">
              {adjustmentType === 'RESTOCK' ? 'Restock Variant' : 'Stock Adjustment Audit'}
            </h3>

            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-brand-light rounded-xl space-y-1">
                <p className="font-semibold text-brand-charcoal">{selectedVariant.product_name}</p>
                <p className="text-brand-secondary font-mono">SKU: {selectedVariant.sku}</p>
                <p className="text-brand-charcoal">
                  Current Stock: <span className="font-bold">{selectedVariant.stock_quantity} units</span>
                </p>
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">
                  Quantity Adjustment (positive to add, negative to deduct)
                </label>
                <input
                  type="number"
                  required
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-bold text-sm"
                />
                <span className="text-[11px] text-brand-secondary block mt-1">
                  New resulting stock: {selectedVariant.stock_quantity + adjustmentAmount} units
                </span>
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Audit Reason *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Shipment batch #891 received"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-brand-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || adjustmentAmount === 0}
                  className="px-6 py-2 bg-brand-charcoal hover:bg-brand-lavenderDark text-white rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Commit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
