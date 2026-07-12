"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Bookmark, Clock, Eye, Trash2 } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  cover_image: string | null;
  category: { name: string; slug: string; color_accent: string } | null;
  reading_time: number;
  view_count: number;
}

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkedArticles = async () => {
      if (bookmarks.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/articles/');
        if (res.ok) {
          const data = await res.json();
          const allArticles = Array.isArray(data) ? data : (data.results || []);
          // Filter to only bookmarked ones
          const bookmarked = allArticles.filter((a: any) => bookmarks.includes(a.slug));
          setArticles(bookmarked);
        }
      } catch (err) {
        console.error("Failed to load bookmarked articles", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedArticles();
  }, [bookmarks]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-r-2 border-theme-blue rounded-full animate-spin mb-4" />
        <span className="font-mono text-sm tracking-wider text-theme-gray-400 font-semibold font-mono">RETRIEVING ENCRYPTED DATA...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 relative">
      <div className="absolute top-[-50px] left-1/4 w-[300px] h-[300px] bg-theme-blue/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-white/5">
        <span className="text-xs font-mono text-theme-gray-400 uppercase tracking-widest">Secured Memory Files</span>
        <div className="flex items-center gap-3">
          <Bookmark className="w-6 h-6 text-theme-blue" />
          <h1 className="font-mono text-3xl md:text-5xl font-extrabold uppercase text-white">
            Reading Dispatch List ({articles.length})
          </h1>
        </div>
      </div>

      {/* Feed list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div key={art.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col group hover:border-theme-blue/30 transition-all duration-300">
            <div className="h-44 relative overflow-hidden">
              {art.cover_image && (
                <img 
                  src={art.cover_image.startsWith('http') ? art.cover_image : `http://127.0.0.1:8000${art.cover_image}`} 
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-theme-black/90 to-transparent" />
              {art.category && (
                <span 
                  className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase font-mono rounded"
                  style={{ 
                    backgroundColor: `${art.category.color_accent}20`,
                    color: art.category.color_accent,
                    border: `1px solid ${art.category.color_accent}40`
                  }}
                >
                  {art.category.name}
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-grow gap-3">
              <Link href={`/a/${art.slug}`} className="group-hover:text-theme-blue transition-colors">
                <h3 className="font-mono font-bold text-base text-white line-clamp-2 leading-snug">
                  {art.title}
                </h3>
              </Link>
              <p className="text-theme-gray-400 text-xs line-clamp-2 leading-relaxed flex-grow">
                {art.subtitle}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-[9px] font-mono text-theme-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {art.reading_time} MIN
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {art.view_count} SEC
                </span>
                <button 
                  onClick={() => toggleBookmark(art.slug)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer flex items-center gap-1"
                  title="Purge Bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>PURGE</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-24 glass-panel rounded-2xl font-mono text-sm tracking-wider text-theme-gray-400 uppercase">
          Your bookmarked memory archives are empty.
        </div>
      )}
    </div>
  );
}
