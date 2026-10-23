'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { API_BASE } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Support fallback ports in case backend was started on default 8000 instead of 8001
      const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
      const candidateUrls = [
        API_BASE,
        `http://${host}:8001/api/v1`,
        `http://${host}:8000/api/v1`,
        '/api/v1',
      ];
      const urlsToTry = Array.from(new Set(candidateUrls));

      let res: Response | null = null;

      for (const baseUrl of urlsToTry) {
        try {
          const attempt = await fetch(`${baseUrl}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password }),
          });
           res = attempt;
           if (attempt.status === 404) {
             // Not a backend on this URL, try next candidate
             continue;
           }
           if (typeof window !== 'undefined') {
             localStorage.setItem('klein_api_base', baseUrl);
           }
           break;
        } catch {
          // Try next candidate URL
        }
      }

      if (!res) {
        throw new Error(
          'Cannot connect to the backend server. Please make sure the Django server is running (run: .\\venv\\Scripts\\python.exe backend/manage.py runserver 8001).'
        );
      }

      if (!res.ok) {
        let errMsg = 'Invalid email or password.';
        try {
          const err = await res.json();
          if (typeof err.detail === 'string') {
            errMsg = err.detail;
          } else if (typeof err.error === 'string') {
            errMsg = err.error;
          } else if (Array.isArray(err.non_field_errors)) {
            errMsg = err.non_field_errors.join(' ');
          } else if (Array.isArray(err.email)) {
            errMsg = err.email.join(' ');
          } else if (Array.isArray(err.password)) {
            errMsg = err.password.join(' ');
          } else if (typeof err === 'object') {
            const firstVal = Object.values(err)[0];
            errMsg = Array.isArray(firstVal) ? firstVal.join(' ') : String(firstVal);
          }
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      login(data.user, data.access);

      if (data.user.is_store_admin || data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('admin@kleindream.com');
      setPassword('KleinDream2026!');
    } else {
      setEmail('customer@kleindream.com');
      setPassword('Customer2026!');
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
            Welcome to the Maison
          </h2>
          <p className="text-xs text-brand-secondary">
            Sign in to access your privileges, order history, and concierge.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-brand-charcoal block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-brand-secondary absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-brand-charcoal">Password</label>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 text-brand-secondary absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Signing In...</span> : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Autofill */}
        <div className="p-3.5 sm:p-4 bg-brand-light rounded-xl border border-brand-border/60 space-y-2.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-secondary block">
            Demo Credentials
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-2 px-2 bg-white hover:bg-brand-lavender hover:text-white text-brand-charcoal rounded text-[11px] font-medium border border-brand-border transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-brand-lavender" />
              <span>Admin Studio</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('customer')}
              className="py-2 px-2 bg-white hover:bg-brand-lavender hover:text-white text-brand-charcoal rounded text-[11px] font-medium border border-brand-border transition-colors text-center"
            >
              Demo Customer
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-brand-secondary">
          Don't have an account yet?{' '}
          <Link href="/auth/register" className="font-semibold text-brand-lavenderDark hover:underline">
            Register now
          </Link>
        </div>

      </div>
    </div>
  );
}
