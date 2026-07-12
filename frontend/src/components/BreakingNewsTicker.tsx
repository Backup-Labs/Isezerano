"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
}

export const BreakingNewsTicker: React.FC = () => {
  const [breakingArticles, setBreakingArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/articles/?is_breaking=true');
        if (res.ok) {
          const data = await res.json();
          // The API might be paginated, check results or direct array
          const articles = Array.isArray(data) ? data : (data.results || []);
          setBreakingArticles(articles);
        }
      } catch (err) {
        console.error("Failed to load breaking news", err);
      }
    };
    fetchBreaking();
  }, []);

  const defaultMessages = [
    "THE PULSE QUANTUM CORE IS ACTIVE — MULTIPLE FEED DATA STREAMS DECODED IN REALTIME",
    "MARKET REPORT: NEO-TOKYO METASHELL SHARES UP 14.2% FOLLOWING CORTICAL CHIP MERGER",
    "SPACE AGENCY EXPEDITION FOUR DEPARTS MARS ORBITAL STATION HEADED FOR GANYMEDE",
    "GRID BROADCAST SYSTEM: STATUS 200 OK — READ FROM ELEVATED SENSORY BUFFERS"
  ];

  const tickerItems = breakingArticles.length > 0
    ? breakingArticles.map(art => ({
        text: art.title,
        link: `/a/${art.slug}`
      }))
    : defaultMessages.map(msg => ({
        text: msg,
        link: "#"
      }));

  // Duplicate items to ensure smooth infinite loop scroll
  const scrollItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="w-full px-4 mb-6 md:px-8">
      <div className="glass-panel w-full max-w-7xl mx-auto rounded-xl py-2.5 px-4 flex items-center overflow-hidden gap-4">
        {/* Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono font-bold uppercase rounded-lg tracking-wider shrink-0 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>BREAKING</span>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative flex-grow overflow-hidden h-5">
          <div className="animate-marquee flex items-center gap-16 font-mono text-xs font-semibold tracking-wider text-theme-gray-400">
            {scrollItems.map((item, idx) => (
              <span key={idx} className="flex items-center shrink-0">
                {item.link !== "#" ? (
                  <Link href={item.link} className="hover:text-theme-blue transition-colors hover:underline">
                    {item.text}
                  </Link>
                ) : (
                  <span>{item.text}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
