'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAnnouncement } from '@/lib/api';
import { AnnouncementBarData } from '@/lib/types';

export default function AnnouncementBar() {
  const [data, setData] = useState<AnnouncementBarData | null>(null);

  useEffect(() => {
    fetchAnnouncement().then((res) => {
      if (res && res.is_active) {
        setData(res);
      }
    });
  }, []);

  if (!data || !data.is_active) {
    return (
      <div className="bg-brand-charcoal text-white text-[10px] sm:text-xs py-1.5 sm:py-2 px-2 sm:px-4 text-center tracking-wide sm:tracking-wider font-light flex items-center justify-center gap-1.5">
        <span className="truncate sm:whitespace-normal">Complimentary delivery across Tunisia on orders over 150 DT | KleinDream</span>
      </div>
    );
  }

  const content = (
    <div
      style={{ backgroundColor: data.background_color, color: data.text_color }}
      className="text-[10px] sm:text-xs py-1.5 sm:py-2 px-2 sm:px-4 text-center tracking-wide sm:tracking-wider font-light flex items-center justify-center gap-1.5 transition-colors"
    >
      <span className="truncate sm:whitespace-normal">{data.text}</span>
    </div>
  );

  if (data.link) {
    return <Link href={data.link} className="block hover:opacity-95">{content}</Link>;
  }

  return content;
}
