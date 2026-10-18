'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Check, Archive, Eye, X } from 'lucide-react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  const loadMessages = () => {
    setLoading(true);
    fetch('/api/v1/contact/admin/messages/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data.results || data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/v1/contact/admin/messages/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
        },
        body: JSON.stringify({ status, is_read: true }),
      });
      loadMessages();
      if (selectedMsg && selectedMsg.id === id) {
        setSelectedMsg((prev: any) => ({ ...prev, status, is_read: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
          Concierge Communications
        </span>
        <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
          Client Messages & Inquiries
        </h1>
        <p className="text-xs text-brand-secondary mt-1">
          Client appointments, bespoke inquiries, and customer service requests.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-secondary animate-pulse">
                    Loading inquiries...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-secondary">
                    No messages received yet.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id} className={`hover:bg-brand-light/40 transition-colors ${!m.is_read ? 'bg-brand-lavender/5 font-semibold' : ''}`}>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-brand-charcoal block">{m.name}</span>
                      <span className="text-[11px] text-brand-secondary font-mono">{m.email}</span>
                    </td>
                    <td className="py-3 px-4 text-brand-charcoal max-w-xs truncate">
                      {m.subject}
                    </td>
                    <td className="py-3 px-4 text-brand-secondary">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : m.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-brand-light text-brand-charcoal'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMsg(m)}
                        className="px-3 py-1 bg-brand-light hover:bg-brand-charcoal hover:text-white rounded text-[11px] font-medium text-brand-charcoal transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Read</span>
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
      {selectedMsg && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start pb-3 border-b border-brand-border">
              <div>
                <span className="text-[11px] text-brand-secondary block">{new Date(selectedMsg.created_at).toLocaleString()}</span>
                <h3 className="font-serif text-lg font-medium text-brand-charcoal">{selectedMsg.subject}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMsg(null)}
                className="text-gray-400 hover:text-brand-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-brand-light rounded-xl text-xs space-y-1">
              <p><strong className="text-brand-charcoal">From:</strong> {selectedMsg.name} ({selectedMsg.email})</p>
            </div>

            <div className="text-xs text-brand-charcoal leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-xl border border-brand-border">
              {selectedMsg.message}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-brand-border text-xs">
              <span className="text-brand-secondary font-medium">Mark Inquiry:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedMsg.id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-semibold"
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedMsg.id, 'RESOLVED')}
                  className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-semibold"
                >
                  Resolved
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedMsg.id, 'ARCHIVED')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
