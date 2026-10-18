'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { API_BASE } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Set username from email if not set
      const payload = {
        ...formData,
        username: formData.username || formData.email.split('@')[0],
      };

      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errStr = 'Registration failed.';
        try {
          const err = await res.json();
          errStr = Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ');
        } catch {}
        throw new Error(errStr);
      }

      // Automatically sign in
      const loginRes = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        login(loginData.user, loginData.access);
        router.push('/account');
      } else {
        router.push('/auth/login');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-5 sm:p-8 bg-white border border-brand-border rounded-2xl shadow-card">
        
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-serif text-xl sm:text-2xl tracking-[0.25em] font-medium text-brand-charcoal uppercase">
              KleinDream
            </span>
          </Link>
          <h2 className="font-serif text-lg sm:text-xl font-normal text-brand-charcoal">
            Create an Atelier Account
          </h2>
          <p className="text-xs text-brand-secondary">
            Join the Maison to unlock order tracking, saved addresses, and private offers.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-brand-charcoal block mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Sophie"
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-brand-charcoal block mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Laurent"
                className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-brand-charcoal block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-brand-secondary absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sophie@example.com"
                className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-brand-charcoal block mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="h-4 w-4 text-brand-secondary absolute left-3 top-3" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+216 98 000 000"
                className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-brand-charcoal block mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-brand-secondary absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-brand-charcoal block mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-brand-secondary absolute left-3 top-3" />
              <input
                type="password"
                required
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                placeholder="Repeat password"
                className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Creating Account...</span> : (
              <>
                <span>Register</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-brand-secondary">
          Already a client?{' '}
          <Link href="/auth/login" className="font-semibold text-brand-lavenderDark hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
