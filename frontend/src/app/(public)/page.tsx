"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdSpace } from '@/components/AdSpace';
import { Bookmark, Clock, Eye, ChevronRight } from 'lucide-react';
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
        <span className="font-mono text-xs tracking-widest text-theme-gray-400 uppercase font-bold">LOADING LATEST DISPATCHES...</span>
      </div>
    );
  }

  // Segment articles
  const featuredArticles = articles.filter(a => a.is_featured);
  const leadArticle = featuredArticles[0] || articles[0];
  const sideArticles = articles.filter(a => a.id !== leadArticle?.id).slice(0, 4);
  const featuredGridArticles = articles.filter(a => a.id !== leadArticle?.id).slice(0, 3);
  const trendingArticles = [...articles].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

  const getMediaUrl = (path: string | null) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-12 relative bg-theme-black text-theme-light-gray animate-fade-in">
      {layout.map((block) => {
        switch (block.section_type) {
          case 'hero':
            if (!leadArticle) return null;
            return (
              <section key={block.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10 border-b border-theme-blue-deep">
                {/* Left Side: Lead Featured Card (65% width) */}
                <div className="lg:col-span-2 flex flex-col justify-between pr-0 lg:pr-8 border-r-0 lg:border-r border-theme-blue-deep">
                  <div>
                    {leadArticle.cover_image && (
                      <Link href={`/a/${leadArticle.slug}`} className="block overflow-hidden mb-5">
                        <img 
                          src={getMediaUrl(leadArticle.cover_image)} 
                          alt={leadArticle.title}
                          className="w-full aspect-[16/9] object-cover hover:scale-[1.01] transition-transform duration-500"
                        />
                      </Link>
                    )}
                    
                    <div className="flex items-center gap-3 mb-2.5">
                      {leadArticle.category && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-theme-blue">
                          {leadArticle.category.name}
                        </span>
                      )}
                      <span className="text-[10px] text-theme-gray-400 font-mono font-semibold">
                        {new Date(leadArticle.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <Link href={`/a/${leadArticle.slug}`} className="hover:text-theme-blue transition-colors">
                      <h2 className="serif-title text-3xl md:text-5xl font-bold uppercase tracking-tight text-theme-light-gray leading-tight mb-4">
                        {leadArticle.title}
                      </h2>
                    </Link>

                    <p className="text-sm text-theme-gray-400 leading-relaxed mb-6 font-sans">
                      {leadArticle.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-theme-gray-100 text-[10px] font-mono text-theme-light-gray uppercase font-bold tracking-widest">
                    <span>BY {leadArticle.author.first_name || leadArticle.author.username}</span>
                    <div className="flex items-center gap-4">
                      <span>{leadArticle.reading_time} MIN READ</span>
                      <button 
                        onClick={() => toggleBookmark(leadArticle.slug)}
                        className="p-1 hover:text-theme-blue cursor-pointer"
                        title="Bookmark"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(leadArticle.slug) ? 'fill-theme-blue text-theme-blue' : 'text-theme-light-gray'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Vertical List Column (35% width) */}
                <div className="flex flex-col gap-6">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-theme-light-gray pb-3 border-b border-theme-blue-deep">
                    Latest Stories
                  </h3>
                  <div className="flex flex-col divide-y divide-theme-gray-100">
                    {sideArticles.map((art) => (
                      <div key={art.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="w-20 h-20 shrink-0 overflow-hidden">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        )}
                        <div className="flex flex-col justify-between flex-grow">
                          <div className="flex flex-col gap-1">
                            {art.category && (
                              <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-wider">
                                {art.category.name}
                              </span>
                            )}
                            <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                              <h4 className="serif-title text-sm font-semibold uppercase text-theme-light-gray leading-snug line-clamp-2">
                                {art.title}
                              </h4>
                            </Link>
                          </div>
                          <span className="text-[9px] text-theme-gray-400 font-mono mt-1">
                            {new Date(art.published_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'featured-grid':
            if (featuredGridArticles.length === 0) return null;
            return (
              <section key={block.id} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-theme-blue-deep">
                {featuredGridArticles.map((art) => (
                  <article key={art.id} className="flex flex-col justify-between pr-0 md:pr-4 md:border-r border-theme-gray-100 last:border-r-0 last:pr-0">
                    <div>
                      {art.cover_image && (
                        <Link href={`/a/${art.slug}`} className="block overflow-hidden mb-4">
                          <img 
                            src={getMediaUrl(art.cover_image)} 
                            alt={art.title}
                            className="w-full aspect-[16/10] object-cover hover:scale-[1.01] transition-transform duration-300"
                          />
                        </Link>
                      )}
                      
                      <div className="flex items-center gap-2 mb-2">
                        {art.category && (
                          <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                            {art.category.name}
                          </span>
                        )}
                        <span className="text-[9px] text-theme-gray-400 font-mono">
                          {new Date(art.published_at).toLocaleDateString()}
                        </span>
                      </div>

                      <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                        <h3 className="serif-title text-xl font-bold uppercase tracking-tight text-theme-light-gray leading-snug mb-2">
                          {art.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-theme-gray-400 leading-relaxed mb-4 line-clamp-3">
                        {art.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-theme-gray-100 text-[9px] font-mono text-theme-light-gray uppercase font-bold tracking-widest mt-2">
                      <span>BY {art.author.first_name || art.author.username}</span>
                      <button onClick={() => toggleBookmark(art.slug)}>
                        <Bookmark className={`w-3 h-3 ${isBookmarked(art.slug) ? 'fill-theme-blue text-theme-blue' : 'text-theme-light-gray'}`} />
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            );

          case 'category-rail':
            if (!block.category_details) return null;
            const catArticles = articles.filter(a => a.category?.slug === block.category_details?.slug).slice(0, 4);
            if (catArticles.length === 0) return null;

            return (
              <section key={block.id} className="pb-10 border-b border-theme-blue-deep flex flex-col gap-6">
                {/* Header title bar */}
                <div className="border-y border-theme-blue-deep py-2 flex items-center justify-between text-theme-light-gray">
                  <h2 className="font-mono text-sm font-black uppercase tracking-widest">
                    {block.category_details.name} RAILWAY
                  </h2>
                  <Link 
                    href={`/c/${block.category_details.slug}`} 
                    className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase hover:text-theme-blue transition-colors"
                  >
                    <span>View Section</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* 4 Column Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {catArticles.map((art) => (
                    <div key={art.id} className="flex flex-col justify-between">
                      <div>
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="block overflow-hidden mb-3">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full aspect-[4/3] object-cover hover:scale-[1.01] transition-transform duration-300"
                            />
                          </Link>
                        )}
                        <span className="text-[8px] text-theme-gray-400 font-mono block mb-1">
                          {new Date(art.published_at).toLocaleDateString()}
                        </span>
                        <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                          <h4 className="serif-title text-sm font-bold uppercase text-theme-light-gray leading-snug line-clamp-2">
                            {art.title}
                          </h4>
                        </Link>
                        <p className="text-[11px] text-theme-gray-400 leading-relaxed mt-1 line-clamp-2">
                          {art.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-theme-gray-100 text-[8px] font-mono text-theme-light-gray uppercase mt-2">
                        <span>{art.reading_time} MIN READ</span>
                        <button onClick={() => toggleBookmark(art.slug)}>
                          <Bookmark className={`w-3 h-3 ${isBookmarked(art.slug) ? 'fill-theme-blue text-theme-blue' : 'text-theme-light-gray'}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'ad-slot':
            return (
              <section key={block.id} className="py-6 border-b border-theme-blue-deep flex justify-center w-full bg-theme-charcoal/40">
                <AdSpace placement="in-feed-native" />
              </section>
            );

          case 'trending-widget':
            if (trendingArticles.length === 0) return null;
            return (
              <section key={block.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10 border-b border-theme-blue-deep">
                {/* Popular List (2/3 width) */}
                <div className="lg:col-span-2 flex flex-col gap-6 pr-0 lg:pr-8 border-r-0 lg:border-r border-theme-blue-deep">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-theme-light-gray pb-3 border-b border-theme-blue-deep">
                    Trending Stories
                  </h3>

                  <div className="flex flex-col divide-y divide-theme-gray-100">
                    {trendingArticles.map((art, idx) => (
                      <div key={art.id} className="py-4 first:pt-0 last:pb-0 flex gap-6 items-start group">
                        <div className="font-mono text-2xl md:text-3xl font-extrabold text-theme-blue/20 group-hover:text-theme-blue transition-colors tracking-tighter w-10 text-center shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        <div className="flex-grow flex flex-col gap-1">
                          <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                            <h4 className="serif-title text-base font-bold uppercase text-theme-light-gray leading-snug">
                              {art.title}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-4 text-[9px] font-mono text-theme-gray-400 uppercase">
                            {art.category && (
                              <span className="font-bold text-theme-blue">
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

                {/* Sidebar Sticky Rail ad (1/3 width) */}
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
