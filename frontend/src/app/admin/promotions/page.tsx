'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check, X, Trash2, Calendar } from 'lucide-react';

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: '15.00',
    min_order_amount: '100.00',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCoupons = () => {
    setLoading(true);
    fetch('/api/v1/promotions/coupons/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCoupons(data.results || data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/v1/promotions/coupons/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase().trim(),
          discount_value: Number(formData.discount_value),
          min_order_amount: Number(formData.min_order_amount),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }

      setModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      setError(err.message || 'Failed to create coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await fetch(`/api/v1/promotions/coupons/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
        },
      });
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
            Marketing & Privileges
          </span>
          <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
            Promotions & Coupon Codes
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Configure promotional codes, percentage discounts, and minimum order requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({
              code: '',
              description: '',
              discount_type: 'PERCENTAGE',
              discount_value: '15.00',
              min_order_amount: '100.00',
              is_active: true,
            });
            setError(null);
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-subtle flex items-center gap-2 self-start"
        >
          <Plus className="h-4 w-4" />
          <span>New Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Minimum Order</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-secondary animate-pulse">
                    Loading promotional campaigns...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-secondary">
                    No active coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-brand-charcoal">
                      {c.code}
                      {c.description && <span className="block text-[11px] font-sans font-normal text-brand-secondary mt-0.5">{c.description}</span>}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-lavenderDark">
                      {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `${c.discount_value} DT OFF`}
                    </td>
                    <td className="py-3.5 px-4 text-brand-secondary">
                      {Number(c.min_order_amount) > 0 ? `${c.min_order_amount} DT` : 'None'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brand-charcoal">
                      {c.times_used} times used
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h3 className="font-serif text-xl font-normal text-brand-charcoal pb-3 border-b border-brand-border">
              Create Privilege Coupon
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. VIP25"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Exclusive invitation for autumn preview"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (DT)</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Minimum Order Amount (DT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cpn_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-brand-lavender"
                />
                <label htmlFor="cpn_active" className="cursor-pointer font-medium text-brand-charcoal">
                  Coupon is Active Immediately
                </label>
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
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-charcoal hover:bg-brand-lavenderDark text-white rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
