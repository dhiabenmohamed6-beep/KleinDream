'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    store_name: 'KleinDream',
    tagline: 'Modern Fashion & Lifestyle Maison',
    contact_email: 'concierge@kleindream.com',
    contact_phone: '+216 71 890 123',
    address: 'Les Berges du Lac II, Tunis, Tunisia',
    currency: 'TND',
    currency_symbol: 'DT',
    free_shipping_threshold: 150.00,
    flat_shipping_rate: 7.00,
    social_instagram: 'https://instagram.com/kleindream',
    social_facebook: 'https://facebook.com/kleindream',
    social_tiktok: 'https://tiktok.com/@kleindream',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/settings/admin/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.store_name) {
          setFormData(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/v1/settings/admin/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
          Store Configuration
        </span>
        <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
          Maison Settings & Currency
        </h1>
        <p className="text-xs text-brand-secondary mt-1">
          Configure official store currency, free delivery thresholds, contact info, and branding.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-medium flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Maison settings saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-brand-border shadow-subtle text-xs">
        
        {/* Brand Information */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-medium text-brand-charcoal pb-2 border-b border-brand-border">
            1. Brand Identity & Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-brand-charcoal block mb-1">Store Name</label>
              <input
                type="text"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
              />
            </div>
            <div>
              <label className="font-medium text-brand-charcoal block mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
              />
            </div>
            <div>
              <label className="font-medium text-brand-charcoal block mb-1">Concierge Email</label>
              <input
                type="email"
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
              />
            </div>
            <div>
              <label className="font-medium text-brand-charcoal block mb-1">Telephone</label>
              <input
                type="text"
                required
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-medium text-brand-charcoal block mb-1">Atelier Flagship Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
              />
            </div>
          </div>
        </div>

        {/* Currency & Logistics */}
        <div className="space-y-4 pt-4 border-t border-brand-border">
          <h3 className="font-serif text-base font-medium text-brand-charcoal pb-2 border-b border-brand-border">
            2. Currency & Shipping Calculations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-brand-charcoal block mb-1">Store Currency Code</label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-bold"
              />
            </div>
            <div>
              <label className="font-medium text-brand-charcoal block mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={formData.currency_symbol}
                onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-bold"
              />
            </div>
            <div>
              <label className="font-medium text-brand-charcoal block mb-1">Complimentary Delivery Threshold (DT)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.free_shipping_threshold}
                onChange={(e) => setFormData({ ...formData, free_shipping_threshold: Number(e.target.value) })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-bold"
              />
            </div>
            <div>
              <label className="font-medium text-brand-charcoal block mb-1">Standard Flat Shipping Fee (DT)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.flat_shipping_rate}
                onChange={(e) => setFormData({ ...formData, flat_shipping_rate: Number(e.target.value) })}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-bold"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-brand-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-brand-charcoal hover:bg-brand-lavenderDark text-white font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-subtle flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
