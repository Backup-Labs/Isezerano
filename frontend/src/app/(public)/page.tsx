"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdSpace } from '@/components/AdSpace';
import { Bookmark, Clock, Eye, ChevronRight, Sparkles, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  cover_image: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
    color_accent: string;
  } | null;
  tags: { id: number; name: string; slug: string }[];
  author: { username: string; first_name: string; last_name: string; avatar: string | null };
  published_at: string;
  is_breaking: boolean;
  is_featured: boolean;
  is_premium: boolean;
  reading_time: number;
  view_count: number;
}

interface LayoutBlock {
  id: number;
  section_type: 'hero' | 'featured-grid' | 'category-rail' | 'ad-slot' | 'trending-widget';
  order: number;
  category: number | null;
  ad_slot: number | null;
  category_details?: { name: string; slug: string; color_accent: string };
}

export default function Homepage() {
  const { toggleBookmark, isBookmarked } = useApp();
  const [layout, setLayout] = useState<LayoutBlock[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [layoutRes, articlesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/v1/homepage-layout/'),
          fetch('http://127.0.0.1:8000/api/v1/articles/')
        ]);

        if (layoutRes.ok && articlesRes.ok) {
          const layoutData = await layoutRes.json();
          const articlesData = await articlesRes.json();
          
          setLayout(layoutData.sort((a: any, b: any) => a.order - b.order));
          setArticles(Array.isArray(articlesData) ? articlesData : (articlesData.results || []));
        }
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-t-2 border-r-2 border-theme-blue rounded-full animate-spin mb-4" />
        <span className="font-mono text-sm tracking-wider text-theme-gray-400">LOADING DATASTREAMS...</span>
      </div>
    );
  }

  // Segment articles for default rendering if database order isn't mapped
  const featuredArticles = articles.filter(a => a.is_featured);
  const leadArticle = featuredArticles[0] || articles[0];
  const secondaryArticles = articles.filter(a => a.id !== leadArticle?.id).slice(0, 3);
  const trendingArticles = [...articles].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col gap-16 relative">
      {/* Background ambient mesh glows */}
      <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-theme-blue/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[300px] right-1/4 w-[400px] h-[400px] bg-theme-blue-deep/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {layout.map((block) => {
        switch (block.section_type) {
          case 'hero':
            if (!leadArticle) return null;
            return (
              <section key={block.id} className="relative rounded-3xl overflow-hidden glass-panel group min-h-[450px] md:min-h-[550px] flex items-end">
                {leadArticle.cover_image && (
                  <img 
                    src={leadArticle.cover_image.startsWith('http') ? leadArticle.cover_image : `http://127.0.0.1:8000${leadArticle.cover_image}`} 
                    alt={leadArticle.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                {/* Scrim cover overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                <div className="relative z-10 p-6 md:p-12 w-full max-w-4xl flex flex-col gap-4">
                  {/* Meta tag */}
                  <div className="flex items-center gap-3">
                    {leadArticle.category && (
                      <span 
                        className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg font-mono"
                        style={{ 
                          backgroundColor: `${leadArticle.category.color_accent}20`,
                          color: leadArticle.category.color_accent,
                          border: `1px solid ${leadArticle.category.color_accent}40`
                        }}
                      >
                        {leadArticle.category.name}
                      </span>
                    )}
                    {leadArticle.is_premium && (
                      <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold font-mono rounded">
                        PREMIUM
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={`/a/${leadArticle.slug}`} className="group-hover:text-theme-blue transition-colors">
                    <h1 className="font-mono text-2xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                      {leadArticle.title}
                    </h1>
                  </Link>

                  {/* Subtitle */}
                  <p className="text-theme-gray-400 text-sm md:text-base max-w-3xl leading-relaxed">
                    {leadArticle.subtitle}
                  </p>

                  {/* Author / Time */}
                  <div className="flex flex-wrap items-center gap-6 mt-2 text-xs font-mono text-theme-gray-400">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-theme-blue" />
                      <span>{leadArticle.author.first_name || leadArticle.author.username}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{leadArticle.reading_time} MIN READ</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{leadArticle.view_count.toLocaleString()} DECODED</span>
                    </span>
                    <button 
                      onClick={() => toggleBookmark(leadArticle.slug)}
                      className="flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(leadArticle.slug) ? 'fill-theme-blue text-theme-blue' : ''}`} />
                      <span>{isBookmarked(leadArticle.slug) ? 'SECURED' : 'SECURE DISPATCH'}</span>
                    </button>
                  </div>
                </div>
              </section>
            );

          case 'featured-grid':
            if (secondaryArticles.length === 0) return null;
            return (
              <section key={block.id} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {secondaryArticles.map((art) => (
                  <article key={art.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col group hover:border-theme-blue/30 transition-all duration-300">
                    <div className="h-48 relative overflow-hidden shrink-0">
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

                    <div className="p-6 flex flex-col flex-grow gap-3">
                      <Link href={`/a/${art.slug}`} className="group-hover:text-theme-blue transition-colors">
                        <h3 className="font-mono font-bold text-lg text-white line-clamp-2 leading-snug">
                          {art.title}
                        </h3>
                      </Link>
                      <p className="text-theme-gray-400 text-xs line-clamp-3 leading-relaxed flex-grow">
                        {art.subtitle}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-[10px] font-mono text-theme-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {art.reading_time} MIN
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {art.view_count} SEC
                        </span>
                        <button 
                          onClick={() => toggleBookmark(art.slug)}
                          className="hover:text-white cursor-pointer"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(art.slug) ? 'fill-theme-blue text-theme-blue' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            );

          case 'category-rail':
            if (!block.category_details) return null;
            const catArticles = articles.filter(a => a.category?.slug === block.category_details?.slug).slice(0, 6);
            if (catArticles.length === 0) return null;

            return (
              <section key={block.id} className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-1.5 h-5 rounded-full" 
                      style={{ backgroundColor: block.category_details.color_accent }} 
                    />
                    <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-white">
                      {block.category_details.name}
                    </h2>
                  </div>
                  <Link 
                    href={`/c/${block.category_details.slug}`} 
                    className="flex items-center gap-1 text-xs font-mono text-theme-gray-400 hover:text-white transition-colors"
                  >
                    DEPLOY CHANNEL
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Horizontal Scroll Containers */}
                <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin">
                  {catArticles.map((art) => (
                    <div 
                      key={art.id} 
                      className="glass-panel w-72 shrink-0 rounded-2xl overflow-hidden group hover:border-theme-blue/30 transition-all duration-300"
                    >
                      <div className="h-40 relative">
                        {art.cover_image && (
                          <img 
                            src={art.cover_image.startsWith('http') ? art.cover_image : `http://127.0.0.1:8000${art.cover_image}`} 
                            alt={art.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-theme-black/90 to-transparent" />
                      </div>
                      <div className="p-5 flex flex-col gap-2">
                        <Link href={`/a/${art.slug}`} className="group-hover:text-theme-blue transition-colors">
                          <h4 className="font-mono font-semibold text-sm text-white line-clamp-2 leading-snug">
                            {art.title}
                          </h4>
                        </Link>
                        <p className="text-theme-gray-400 text-[11px] line-clamp-2 leading-relaxed">
                          {art.subtitle}
                        </p>
                        <div className="flex items-center justify-between mt-3 text-[9px] font-mono text-theme-gray-400">
                          <span>{art.reading_time} MIN READ</span>
                          <button onClick={() => toggleBookmark(art.slug)}>
                            <Bookmark className={`w-3 h-3 ${isBookmarked(art.slug) ? 'fill-theme-blue text-theme-blue' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'ad-slot':
            return (
              <section key={block.id} className="py-2 border-y border-white/5">
                <AdSpace placement="in-feed-native" />
              </section>
            );

          case 'trending-widget':
            if (trendingArticles.length === 0) return null;
            return (
              <section key={block.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Popular List (2/3 width on desktop) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-white">
                      High-Frequency Analytics
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4">
                    {trendingArticles.map((art, idx) => (
                      <div 
                        key={art.id}
                        className="glass-panel p-5 rounded-2xl flex gap-6 items-center group hover:border-theme-blue/30 transition-all duration-300"
                      >
                        {/* Number Index */}
                        <div className="font-mono text-3xl md:text-4xl font-extrabold text-theme-blue/20 group-hover:text-theme-blue/40 transition-colors tracking-tighter w-12 shrink-0 text-center">
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        {/* Summary details */}
                        <div className="flex-grow flex flex-col gap-1.5">
                          <Link href={`/a/${art.slug}`} className="group-hover:text-theme-blue transition-colors">
                            <h4 className="font-mono font-bold text-sm md:text-base text-white leading-snug">
                              {art.title}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-4 text-[10px] font-mono text-theme-gray-400">
                            {art.category && (
                              <span style={{ color: art.category.color_accent }}>
                                {art.category.name}
                              </span>
                            )}
                            <span>{art.reading_time} MIN READ</span>
                            <span>{art.view_count.toLocaleString()} VIEWS</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Sticky Rail ad */}
                <div className="hidden lg:block relative">
                  <div className="sticky top-28">
                    <AdSpace placement="sidebar-rail" />
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
