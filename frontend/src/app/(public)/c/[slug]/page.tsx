"use client";
import { API_BASE_URL, getMediaUrl } from '@/config';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdSpace } from '@/components/AdSpace';
import { Clock, Eye, Bookmark } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  cover_image: string | null;
  category: { name: string; slug: string; color_accent: string } | null;
  published_at: string;
  reading_time: number;
  view_count: number;
}

interface Category {
  name: string;
  slug: string;
  color_accent: string;
}

export default function CategoryArchive() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const { toggleBookmark, isBookmarked } = useApp();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, artsRes] = await Promise.all([
          fetch(API_BASE_URL + '/api/v1/categories/'),
          fetch(`${API_BASE_URL}/api/v1/articles/?category=${slug}`)
        ]);

        if (catsRes.ok && artsRes.ok) {
          const catsData = await catsRes.json();
          const targetCat = catsData.find((c: any) => c.slug === slug) || 
                            catsData.flatMap((c: any) => c.subcategories || []).find((c: any) => c.slug === slug);
          setCategory(targetCat || { name: slug.toString().toUpperCase(), slug: slug.toString(), color_accent: '#1B3B6F' });

          const artsData = await artsRes.json();
          setArticles(Array.isArray(artsData) ? artsData : (artsData.results || []));
        }
      } catch (err) {
        console.error("Failed to load category feed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-t-2 border-r-2 border-theme-blue rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs tracking-widest text-theme-gray-400 uppercase font-bold">LOADING CATEGORY...</span>
      </div>
    );
  }

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'views') {
      return b.view_count - a.view_count;
    }
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-10 bg-theme-white text-theme-black animate-fade-in">
      {/* Category Header */}
      {category && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-theme-gray-100">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-theme-blue uppercase font-bold tracking-widest">Category</span>
            <div className="flex items-center gap-3">
              <span className="w-2 h-8" style={{ backgroundColor: category.color_accent }} />
              <h1 className="serif-title text-3xl md:text-5xl font-black uppercase text-theme-black">
                {category.name}
              </h1>
            </div>
          </div>

          {/* Sort bar */}
          <div className="flex gap-2 p-1 border border-theme-gray-100 bg-theme-light-gray shrink-0 self-start md:self-end">
            <button 
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                sortBy === 'latest' ? 'bg-theme-blue text-white' : 'text-theme-gray-400 hover:text-theme-black'
              }`}
            >
              Latest Releases
            </button>
            <button 
              onClick={() => setSortBy('views')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                sortBy === 'views' ? 'bg-theme-blue text-white' : 'text-theme-gray-400 hover:text-theme-black'
              }`}
            >
              Popular Feed
            </button>
          </div>
        </div>
      )}

      {/* Main Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedArticles.map((art) => (
              <article key={art.id} className="border border-theme-gray-100 bg-white overflow-hidden flex flex-col group hover:border-theme-blue transition-all duration-300">
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
                <div className="p-5 flex flex-col flex-grow gap-3 justify-between">
                  <div>
                    <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                      <h3 className="serif-title font-bold text-lg text-theme-black line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                    </Link>
                    <p className="text-theme-gray-400 text-xs line-clamp-2 leading-relaxed mt-2 font-sans">
                      {art.subtitle}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-theme-gray-100 text-[9px] font-mono text-theme-black uppercase font-bold tracking-widest">
                    <span className="flex items-center gap-1 text-theme-gray-400">
                      <Clock className="w-3.5 h-3.5 text-theme-blue" />
                      {art.reading_time} MIN READ
                    </span>
                    <span className="flex items-center gap-1 text-theme-gray-400">
                      <Eye className="w-3.5 h-3.5 text-theme-blue" />
                      {art.view_count} VIEWS
                    </span>
                    <button 
                      onClick={() => toggleBookmark(art.slug)}
                      className="hover:text-theme-blue cursor-pointer"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(art.slug) ? 'fill-theme-blue text-theme-blue' : 'text-theme-gray-400'}`} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {sortedArticles.length === 0 && (
            <div className="text-center py-20 border border-theme-gray-100 font-mono text-xs uppercase tracking-widest text-theme-gray-400 bg-theme-light-gray/40">
              No articles registered in this channel.
            </div>
          )}
        </div>

        {/* Sidebar Banner */}
        <div className="relative">
          <div className="sticky top-28">
            <AdSpace placement="sidebar-rail" />
          </div>
        </div>
      </div>
    </div>
  );
}
