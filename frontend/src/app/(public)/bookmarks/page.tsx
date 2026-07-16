"use client";
import { API_BASE_URL, getMediaUrl } from '@/config';

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
        const res = await fetch(API_BASE_URL + '/api/v1/articles/');
        if (res.ok) {
          const data = await res.json();
          const allArticles = Array.isArray(data) ? data : (data.results || []);
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
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-t-2 border-r-2 border-theme-blue rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs tracking-widest text-theme-gray-400 uppercase font-bold">LOADING BOOKMARKS...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 bg-theme-white text-theme-black animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-theme-gray-100">
        <span className="text-[10px] font-mono text-theme-blue uppercase font-bold tracking-widest">Saved Articles</span>
        <div className="flex items-center gap-3">
          <Bookmark className="w-6 h-6 text-theme-blue" />
          <h1 className="serif-title text-3xl md:text-5xl font-black uppercase text-theme-black">
            My Bookmarks ({articles.length})
          </h1>
        </div>
      </div>

      {/* Feed list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div key={art.id} className="border border-theme-gray-100 overflow-hidden flex flex-col justify-between group hover:border-theme-blue transition-all duration-300 bg-white">
            <div>
              <div className="h-44 relative overflow-hidden">
                {art.cover_image && (
                  <Link href={`/a/${art.slug}`}>
                    <img 
                      src={getMediaUrl(art.cover_image)} 
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    />
                  </Link>
                )}
              </div>
              <div className="p-5 flex flex-col gap-2">
                {art.category && (
                  <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-wider">
                    {art.category.name}
                  </span>
                )}
                <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                  <h3 className="serif-title font-bold text-base text-theme-black line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                </Link>
                <p className="text-theme-gray-400 text-xs line-clamp-2 leading-relaxed mt-1 font-sans">
                  {art.subtitle}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="flex items-center justify-between pt-4 border-t border-theme-gray-100 text-[9px] font-mono text-theme-black uppercase font-bold tracking-widest">
                <span className="flex items-center gap-1 text-theme-gray-400">
                  <Clock className="w-3.5 h-3.5 text-theme-blue" />
                  {art.reading_time} MIN
                </span>
                <span className="flex items-center gap-1 text-theme-gray-400">
                  <Eye className="w-3.5 h-3.5 text-theme-blue" />
                  {art.view_count} VIEWS
                </span>
                <button 
                  onClick={() => toggleBookmark(art.slug)}
                  className="p-1 text-red-600 hover:text-red-800 transition-all cursor-pointer flex items-center gap-1 font-bold"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>REMOVE</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-20 border border-theme-gray-100 font-mono text-xs uppercase tracking-widest text-theme-gray-400 bg-theme-light-gray/40">
          Your bookmark list is empty.
        </div>
      )}
    </div>
  );
}
