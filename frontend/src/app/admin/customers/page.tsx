'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Search } from 'lucide-react';
import { User } from '@/lib/types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/auth/admin/customers/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCustomers(data.results || data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
          Clientele Directory
        </span>
        <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
          Customer Management
        </h1>
        <p className="text-xs text-brand-secondary mt-1">
          View registered clients, contact details, and account standing.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 text-brand-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name or email..."
              className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
            />
          </div>
          <span className="text-xs text-brand-secondary font-medium">
            {filtered.length} client(s) registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-secondary animate-pulse">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-secondary">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-brand-charcoal">
                      {c.first_name} {c.last_name || c.username}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brand-secondary">
                      {c.email}
                    </td>
                    <td className="py-3.5 px-4 text-brand-secondary">
                      {c.phone || 'Not provided'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                        Active Client
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-secondary text-right">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
