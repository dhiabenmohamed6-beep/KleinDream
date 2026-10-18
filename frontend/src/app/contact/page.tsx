'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import { submitContact } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await submitContact(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="max-w-2xl mx-auto text-center space-y-2 sm:space-y-3 mb-8 sm:mb-16">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-brand-lavender font-semibold">
          Client Care & Concierge
        </span>
        <h1 className="font-serif text-2xl sm:text-5xl text-brand-charcoal font-normal">
          Connect with the Maison
        </h1>
        <p className="text-xs sm:text-sm text-brand-secondary">
          For styling appointments, private collection orders, or delivery inquiries, our client concierge is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-5xl mx-auto">
        
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8 bg-brand-light p-5 sm:p-8 rounded-2xl border border-brand-border">
          <h3 className="font-serif text-lg sm:text-xl font-normal text-brand-charcoal">
            Atelier Contact
          </h3>

          <div className="space-y-6 text-xs text-brand-charcoal">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-brand-lavender mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block">Maison Flagship</span>
                <span className="text-brand-secondary mt-0.5 block leading-relaxed">
                  Les Berges du Lac II<br />Tunis, Tunisia
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-brand-lavender mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block">Concierge Desk</span>
                <span className="text-brand-secondary mt-0.5 block">concierge@kleindream.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-brand-lavender mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block">Direct Telephone</span>
                <span className="text-brand-secondary mt-0.5 block">+216 71 890 123</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-brand-border text-xs text-brand-secondary leading-relaxed">
            <span className="font-semibold text-brand-charcoal block mb-1">Operating Hours</span>
            Monday through Saturday: 09:30 – 19:30 CET<br />
            Private fittings by appointment.
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-8 rounded-2xl border border-brand-border shadow-card">
          {submitted ? (
            <div className="py-16 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                <Check className="h-6 w-6 stroke-[2.5]" />
              </div>
              <h3 className="font-serif text-xl font-normal text-brand-charcoal">Message Delivered</h3>
              <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                Thank you for reaching out. A KleinDream client advisor will respond within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-brand-charcoal text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavender transition-colors"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sophie Laurent"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sophie@example.com"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Order Inquiry, Styling Appointment, Custom Atelier Request..."
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-brand-charcoal block mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message here..."
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Message to Concierge</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
