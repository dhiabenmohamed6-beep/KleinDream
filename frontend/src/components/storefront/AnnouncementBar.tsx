'use client';

import React, { useEffect, useState } from 'react';
import { fetchAnnouncement } from '@/lib/api';
import { AnnouncementBarData } from '@/lib/types';

const DEFAULT_MESSAGES = [
  '✦  Complimentary delivery across Tunisia on orders over 150 DT',
  '✦  New Arrivals — Maison Collection 2026 is now live',
  '✦  Private Sale · Up to 40% off selected pieces',
  '✦  3D Virtual Fitting available on all Shoes & Footwear',
  '✦  Handcrafted in limited quantities — Shop before it sells out',
  '✦  Express delivery in Tunisia · Order before 2 PM',
  '✦  KleinDream Atelier & Maison · Est. Tunisia',
];

export default function AnnouncementBar() {
  const [data, setData] = useState<AnnouncementBarData | null>(null);

  useEffect(() => {
    fetchAnnouncement().then((res) => {
      if (res && res.is_active) setData(res);
    }).catch(() => {});
  }, []);

  const messages = data?.is_active && data.text
    ? [data.text, ...DEFAULT_MESSAGES]
    : DEFAULT_MESSAGES;

  const bgColor = data?.background_color ?? '#0f0f1a';
  const textColor = data?.text_color ?? '#d4c5f0';

  // Duplicate for seamless loop
  const ticker = [...messages, ...messages];

  return (
    <div
      className="overflow-hidden relative"
      style={{ backgroundColor: bgColor, color: textColor }}
      aria-label="Announcements"
    >
      {/* Fade edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
        style={{ background: `linear-gradient(to right, ${bgColor}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
        style={{ background: `linear-gradient(to left, ${bgColor}, transparent)` }}
      />

      {/* Scrolling track */}
      <div
        className="flex items-center py-2 whitespace-nowrap"
        style={{
          animation: 'marquee 50s linear infinite',
          willChange: 'transform',
        }}
      >
        {ticker.map((msg, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 px-6 text-[11px] sm:text-xs tracking-widest font-light"
          >
            {msg}
            <span className="opacity-25 text-[8px]">◆</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

