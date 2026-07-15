"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
        const res = await fetch(API_BASE_URL + '/api/v1/articles/?is_breaking=true');
        if (res.ok) {
          const data = await res.json();
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
    "LOCAL DESIGN TEAMS REDESIGN WORKSPACES TO FACILITATE COLLABORATION",
    "BUSINESSES ADOPT ELECTRIC VEHICLES TO OPTIMIZE URBAN DELIVERY LOGISTICS",
    "ORGANIC TEXTILES AND NATURAL DYES DEFINE MODERN WARDROBE TRENDS",
    "UPSTATE PARK FOREST RECOVERY EFFORTS SHOW TWELVE PERCENT BIODIVERSITY INCREASE"
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
    <div className="w-full bg-theme-blue border-b border-theme-blue-glow py-2 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center overflow-hidden gap-4">
        {/* Badge */}
        <div className="px-3 py-1 bg-white text-theme-blue text-[10px] font-mono font-bold uppercase tracking-widest shrink-0 animate-pulse">
          BREAKING NEWS
        </div>

        {/* Marquee Wrapper */}
        <div className="relative grow overflow-hidden h-5">
          <div className="animate-marquee flex items-center gap-16 font-mono text-xs tracking-wider text-white font-semibold">
            {scrollItems.map((item, idx) => (
              <span key={idx} className="flex items-center shrink-0">
                {item.link !== "#" ? (
                  <Link href={item.link} className="hover:underline hover:text-white/80 transition-colors">
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
