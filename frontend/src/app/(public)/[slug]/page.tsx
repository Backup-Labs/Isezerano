"use client";
import { API_BASE_URL, getMediaUrl, translateCategory } from '@/config';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { AdSpace } from '@/components/AdSpace';
import { Bookmark, Clock, Eye, ChevronRight, ChevronLeft, Play, Download, Calendar, Tag as TagIcon, Award } from 'lucide-react';
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
  has_video?: boolean;
}

interface Announcement {
  id: number;
  title: string;
  body: string;
  announcement_type: 'amasoko' | 'akazi' | 'ibyemezo_by_urukiko' | 'guhindura_amazina' | 'other';
  organization_name: string;
  reference_number: string | null;
  published_date: string;
  deadline_date: string | null;
  attachment: string | null;
}

interface DailyVerse {
  id: number;
  date: string;
  verse_reference: string;
  verse_text_kinyarwanda: string;
  verse_text_english: string;
  verse_text_french?: string;
}

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function CustomDynamicPage({ params }: PageProps) {
  const { siteSettings, toggleBookmark, isBookmarked, language } = useApp();
  
  // Unwrap params using React.use compatibility helper
  const resolvedParams = React.use ? (React.use(params as any) as any) : params;
  const slug = resolvedParams.slug;

  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [layout, setLayout] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction State
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [announcementTab, setAnnouncementTab] = useState<'all' | 'amasoko' | 'ibyemezo_by_urukiko' | 'akazi' | 'guhindura_amazina'>('all');
  const [announcementPage, setAnnouncementPage] = useState(1);

  // Refs for scroll rails
  const featuredRailRef = useRef<HTMLDivElement>(null);
  const youMissedRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    const loadAllData = async () => {
      try {
        const [articlesRes, announcementsRes, verseRes, layoutRes] = await Promise.all([
          fetch(API_BASE_URL + '/api/v1/articles/'),
          fetch(API_BASE_URL + '/api/v1/announcements/'),
          fetch(API_BASE_URL + '/api/v1/daily-verse/today/'),
          fetch(`${API_BASE_URL}/api/v1/homepage-layout/?page=${slug}`)
        ]);

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          const processedArticles = (Array.isArray(data) ? data : (data.results || [])).map((art: Article, index: number) => ({
            ...art,
            has_video: index % 3 === 0
          }));
          setArticles(processedArticles);
        }

        if (announcementsRes.ok) {
          const data = await announcementsRes.json();
          setAnnouncements(Array.isArray(data) ? data : (data.results || []));
        }

        if (verseRes.ok) {
          const data = await verseRes.json();
          setDailyVerse(data);
        }

        if (layoutRes && layoutRes.ok) {
          const data = await layoutRes.json();
          setLayout(data.sort((a: any, b: any) => a.order - b.order));
        }
      } catch (err) {
        console.error("Failed to load page data", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [slug]);

  const getLimitFor = (type: string, defaultVal: number = 5) => {
    const block = layout.find(b => b.section_type === type);
    return block && block.article_limit !== undefined && block.article_limit !== null ? block.article_limit : defaultVal;
  };

  // Hero slideshow auto-advance logic
  const heroArticles = articles.slice(0, getLimitFor('hero', 5));
  useEffect(() => {
    if (heroArticles.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroArticles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroArticles]);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Translations
  const t = {
    breakingNews: { RW: 'INKURU ZIHUTIRWA', EN: 'BREAKING NEWS', FR: 'DERNIÈRES INFOS' },
    announcements: { RW: 'AMATANGAZO', EN: 'CLASSIFIEDS', FR: 'ANNONCES' },
    dailyVerse: { RW: 'ISOMO RY\'UMUNSI', EN: 'DAILY VERSE', FR: 'VERSET DU JOUR' },
    trending: { RW: 'IZIKUNZWE CYANE', EN: 'TRENDING STORIES', FR: 'TENDANCES' },
    recentTitle: { RW: 'INKURU NSHYA', EN: 'RECENT STORIES', FR: 'RÉCENTES' },
    readMore: { RW: 'Soma Ibindi', EN: 'Read More', FR: 'Lire Plus' },
    bookmarkAdded: { RW: 'Yabitswe', EN: 'Bookmarked', FR: 'Enregistré' },
    bookmarkAdd: { RW: 'Bika', EN: 'Bookmark', FR: 'Enregistrer' },
    readingTime: { RW: 'IMINOTA', EN: 'MIN READ', FR: 'MIN LECTURE' },
    views: { RW: 'Abasomye', EN: 'VIEWS', FR: 'VUES' },
    deadline: { RW: 'Itariki ntarengwa:', EN: 'DEADLINE:', FR: 'DATE LIMITE:' },
    attachment: { RW: 'Kumanura dosiye', EN: 'DOWNLOAD ATTACHMENT', FR: 'TÉLÉCHARGER' },
    tabAll: { RW: 'Byose', EN: 'All Classifieds', FR: 'Tout' },
    tabTenders: { RW: 'Amasoko', EN: 'Tenders', FR: 'Appels d\'offres' },
    tabJobs: { RW: 'Akazi', EN: 'Jobs', FR: 'Emplois' },
    tabCourt: { RW: 'Ibyemezo by\'Urukiko', EN: 'Court Decisions', FR: 'Décisions Judiciaires' },
    tabNameChange: { RW: 'Guhindura Amazina', EN: 'Name Changes', FR: 'Changement de Noms' },
    youMissed: { RW: 'Izo ushobora kuba utarasomye', EN: 'YOU MIGHT HAVE MISSED', FR: 'VOUS AVEZ PEUT-ÊTRE MANQUÉ' },
    featuredPostsSec: { RW: 'INKURU ZATORANYIJWE', EN: 'FEATURED STORIES', FR: 'ARTICLES VEDETTES' }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 bg-theme-white text-theme-black animate-fade-in">
        <div className="w-full h-24 bg-theme-light-gray animate-pulse border border-theme-gray-100 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 items-start">
          <div className="lg:col-span-8 aspect-[16/9] bg-theme-light-gray animate-pulse rounded border border-theme-gray-100" />
          <div className="lg:col-span-4 h-96 bg-theme-light-gray animate-pulse rounded border border-theme-gray-100" />
        </div>
      </div>
    );
  }

  // 404 Fallback if no layout sections are registered for the slug
  if (layout.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 flex flex-col items-center justify-center text-center gap-6 animate-fade-in text-theme-black">
        <h1 className="serif-title text-7xl font-bold uppercase tracking-wider text-theme-blue">404</h1>
        <div className="flex flex-col gap-2">
          <h2 className="serif-title text-2xl font-bold uppercase tracking-wider">Page Not Found</h2>
          <p className="text-sm text-theme-gray-400 font-mono max-w-md mx-auto">
            The page you are looking for does not exist or has been moved. Use the main navigation bar to browse categories or return home.
          </p>
        </div>
        <Link 
          href="/" 
          className="px-6 py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-widest text-xs transition-all rounded shadow-md cursor-pointer"
        >
          Return Home
        </Link>
      </div>
    );
  }

  // Filtered lists
  const breakingArticles = articles.filter(a => a.is_breaking);
  const trendingArticles = [...articles].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
  const featuredArticles = articles.filter(a => a.is_featured);
  const featuredSecList = articles.filter(a => a.is_featured && !heroArticles.includes(a)).slice(0, 5);
  const lifestyleArticles = articles.filter(a => a.category?.slug === 'lifestyle');
  const sportsArticles = articles.filter(a => a.category?.slug === 'sports');
  const youMissedArticles = articles.filter(a => !heroArticles.includes(a) && !featuredArticles.includes(a)).slice(0, 8);

  const filteredAnnouncements = announcementTab === 'all' 
    ? announcements 
    : announcements.filter(a => a.announcement_type === announcementTab);

  const announcementLimit = 4;
  const totalAnnouncementPages = Math.ceil(filteredAnnouncements.length / announcementLimit) || 1;
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (announcementPage - 1) * announcementLimit,
    announcementPage * announcementLimit
  );

  const displaySports = sportsArticles.slice(0, getLimitFor('sports-grid', 5));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-8 bg-theme-white text-theme-black">
      {/* Top Banner space */}
      <div className="w-full flex justify-center border-b border-theme-gray-100 pb-6">
        <AdSpace placement="header_banner" />
      </div>

      {/* Render layouts sequentially */}
      {layout.map((block, blockIdx) => {
        if (!block.is_visible) return null;

        switch (block.section_type) {
          case 'hero':
            return (
              <section key="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-theme-blue-deep items-start animate-fade-in">
                {/* 1. Primary Slideshow Lead (lg:col-span-5) */}
                <div className="lg:col-span-5 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] bg-theme-charcoal text-white relative group overflow-hidden border border-theme-blue-deep rounded-sm">
                  {heroArticles.length > 0 && (
                    <>
                      {heroArticles[heroSlideIndex].cover_image && (
                        <img 
                          src={getMediaUrl(heroArticles[heroSlideIndex].cover_image)} 
                          alt={heroArticles[heroSlideIndex].title} 
                          className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-700 ease-out" 
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-6 gap-3">
                        <div className="flex gap-2 items-center">
                          {heroArticles[heroSlideIndex].category && (
                            <span 
                              className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest text-white border"
                              style={{ borderColor: heroArticles[heroSlideIndex].category?.color_accent, backgroundColor: heroArticles[heroSlideIndex].category?.color_accent }}
                            >
                              {heroArticles[heroSlideIndex].category?.name}
                            </span>
                          )}
                          <span className="text-[8px] font-mono text-theme-gray-400">
                            {new Date(heroArticles[heroSlideIndex].published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Link href={`/a/${heroArticles[heroSlideIndex].slug}`}>
                          <h2 className="serif-title text-xl sm:text-2xl font-extrabold uppercase text-white hover:text-theme-blue transition-colors line-clamp-3 leading-tight tracking-wider">
                            {heroArticles[heroSlideIndex].title}
                          </h2>
                        </Link>
                        <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-2">
                          {heroArticles[heroSlideIndex].subtitle}
                        </p>
                      </div>

                      {/* Slideshow dots controls */}
                      {heroArticles.length > 1 && (
                        <div className="absolute top-4 right-4 flex gap-1.5 z-10 bg-black/40 backdrop-blur-sm p-1 rounded-sm">
                          {heroArticles.map((_, i) => (
                            <button 
                              key={i} 
                              onClick={() => setHeroSlideIndex(i)} 
                              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${heroSlideIndex === i ? 'bg-theme-blue scale-125' : 'bg-white/40 hover:bg-white/70'}`} 
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 2. Breaking news checklist (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col gap-4 lg:border-r lg:border-theme-blue-deep lg:pr-6 pb-6 lg:pb-0">
                  <div className="flex items-center border-b border-theme-gray-100 pb-2.5 mb-1">
                    <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm">
                      {t.breakingNews[language]}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 divide-y divide-theme-gray-100">
                    {breakingArticles.slice(0, 4).map((art) => (
                      <div key={art.id} className="pt-3.5 first:pt-0 flex gap-3.5 items-start group">
                        <div className="flex-grow min-w-0 flex flex-col gap-1">
                          <span className="text-[8px] font-mono font-bold text-theme-blue uppercase tracking-widest">{art.category?.name}</span>
                          <Link href={`/a/${art.slug}`}>
                            <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2 hover:text-theme-blue transition-colors">
                              {art.title}
                            </h4>
                          </Link>
                          <span className="text-[8px] font-mono text-theme-gray-400">{new Date(art.published_at).toLocaleDateString()}</span>
                        </div>
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="w-16 h-16 shrink-0 border border-theme-gray-100 overflow-hidden rounded relative">
                            <img src={getMediaUrl(art.cover_image)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Daily verse widget (lg:col-span-3) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="flex items-center border-b border-theme-gray-100 pb-2.5 mb-1">
                    <span className="px-2 py-0.5 bg-theme-blue text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm">
                      {t.dailyVerse[language]}
                    </span>
                  </div>
                  {dailyVerse ? (
                    <div className="border border-theme-blue/20 bg-theme-light-gray/30 p-5 rounded-md text-theme-black flex flex-col gap-3.5">
                      <p className="serif-title text-sm italic font-medium leading-relaxed">
                        "{language === 'RW' ? dailyVerse.verse_text_kinyarwanda : dailyVerse.verse_text_english}"
                      </p>
                      <span className="font-mono text-[10px] font-black uppercase text-theme-blue tracking-wider text-right block">
                        — {dailyVerse.verse_reference}
                      </span>
                    </div>
                  ) : (
                    <div className="p-5 border border-theme-gray-100 text-center text-xs font-mono text-theme-gray-400 uppercase rounded">
                      Daily Verse loading...
                    </div>
                  )}
                  
                  {/* Sidebar small ad banner */}
                  <div className="mt-2 flex justify-center">
                    <AdSpace placement="daily_verse_sidebar" />
                  </div>
                </div>
              </section>
            );

          case 'featured-grid':
            return (
              <section key="featured-grid" className="bg-theme-light-gray/40 border border-theme-gray-100 rounded-md p-6 text-theme-black shadow-sm animate-fade-in">
                <div className="flex items-center justify-between border-b border-theme-gray-100 pb-4 mb-6">
                  <span className="px-3 py-1 bg-theme-blue text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                    {t.trending[language]}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleScroll(featuredRailRef, 'left')}
                      className="w-8 h-8 rounded-full border border-theme-gray-100 bg-white text-theme-black hover:bg-theme-blue hover:text-white transition-all flex items-center justify-center cursor-pointer hover:scale-105"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleScroll(featuredRailRef, 'right')}
                      className="w-8 h-8 rounded-full border border-theme-gray-100 bg-white text-theme-black hover:bg-theme-blue hover:text-white transition-all flex items-center justify-center cursor-pointer hover:scale-105"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div 
                  ref={featuredRailRef}
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-theme-blue scrollbar-track-theme-light-gray"
                >
                  {trendingArticles.map((art) => (
                    <div 
                      key={art.id}
                      className="flex-shrink-0 w-80 bg-white border border-theme-gray-100 rounded-md p-4 flex flex-col justify-between gap-4 group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded mb-3.5 border border-theme-gray-100">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            {art.is_premium && (
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-yellow-500 text-white font-mono text-[8px] font-bold uppercase tracking-wider rounded-sm shadow">
                                PREMIUM
                              </span>
                            )}
                          </Link>
                        )}
                        
                        <div className="flex items-center gap-2 mb-1.5">
                          {art.category && (
                            <span className="text-[8px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                              {translateCategory(art.category.name, art.category.slug, language)}
                            </span>
                          )}
                          <span className="text-[8px] text-theme-gray-400 font-mono">
                            {new Date(art.published_at).toLocaleDateString()}
                          </span>
                        </div>

                        <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                          <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2 group-hover:text-theme-blue transition-colors">
                            {art.title}
                          </h4>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-theme-gray-100 text-[9px] font-mono text-theme-gray-400 mt-2">
                        <span className="font-bold text-theme-black uppercase">BY {art.author.first_name || art.author.username}</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" />{art.view_count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'category-rail':
            const categoryArticles = articles.filter(a => a.category?.id === block.category);
            return (
              <section key={`category-rail-${block.id}`} className="flex flex-col gap-6 py-6 border-b border-theme-blue-deep animate-fade-in">
                <div className="flex justify-between items-center border-b border-theme-gray-100 pb-3">
                  <span className="px-3 py-1 bg-theme-blue text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                    {block.title || block.category_details?.name || 'Category Grid'}
                  </span>
                  {block.category_details && (
                    <Link href={`/c/${block.category_details.slug}`} className="text-xs font-mono font-bold text-theme-blue hover:underline uppercase tracking-wider flex items-center gap-1">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryArticles.slice(0, block.article_limit || 4).map((art) => (
                    <div key={art.id} className="flex flex-col gap-3 group">
                      {art.cover_image && (
                        <Link href={`/a/${art.slug}`} className="block aspect-[16/10] overflow-hidden rounded border border-theme-gray-100">
                          <img src={getMediaUrl(art.cover_image)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </Link>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <Link href={`/a/${art.slug}`}>
                          <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2 hover:text-theme-blue transition-colors">
                            {art.title}
                          </h4>
                        </Link>
                        <span className="text-[8px] font-mono text-theme-gray-400 uppercase tracking-widest">{new Date(art.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'announcements':
            return (
              <section key="announcements" className="bg-white border-2 border-theme-blue-deep rounded-md p-6 shadow-sm animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left part: Announcements feed (lg:col-span-8) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-theme-gray-100 pb-4 gap-4">
                      <span className="px-3 py-1 bg-theme-blue text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm self-start">
                        {t.announcements[language]}
                      </span>
                      
                      {/* Tab filtering */}
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono font-bold uppercase">
                        {(['all', 'amasoko', 'akazi', 'ibyemezo_by_urukiko', 'guhindura_amazina'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => { setAnnouncementTab(tab); setAnnouncementPage(1); }}
                            className={`px-2.5 py-1 border transition-all cursor-pointer ${
                              announcementTab === tab 
                                ? 'bg-theme-blue text-white border-theme-blue' 
                                : 'bg-transparent text-theme-gray-400 border-transparent hover:border-theme-gray-100 hover:text-theme-black'
                            }`}
                          >
                            {tab === 'all' ? t.tabAll[language] : 
                             tab === 'amasoko' ? t.tabTenders[language] :
                             tab === 'akazi' ? t.tabJobs[language] :
                             tab === 'ibyemezo_by_urukiko' ? t.tabCourt[language] :
                             t.tabNameChange[language]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {paginatedAnnouncements.map((ann) => (
                        <div key={ann.id} className="p-5 border border-theme-gray-100 rounded-md bg-theme-light-gray/25 hover:bg-theme-light-gray/60 transition-colors flex flex-col gap-3 relative group">
                          <span className="absolute top-4 right-4 px-2 py-0.5 bg-theme-blue/10 border border-theme-blue/20 text-theme-blue font-mono text-[8px] font-bold uppercase tracking-wider rounded-sm">
                            {ann.announcement_type.replace('_', ' ')}
                          </span>
                          <div className="flex flex-col gap-1 pr-24">
                            <span className="text-[9px] font-mono text-theme-gray-400 uppercase font-black tracking-widest">
                              {ann.organization_name}
                            </span>
                            <h4 className="serif-title text-base font-bold uppercase text-theme-black leading-tight">
                              {ann.title}
                            </h4>
                          </div>
                          <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-3">
                            {ann.body}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-theme-gray-100 mt-2 text-[10px] font-mono">
                            <div className="flex gap-4 text-theme-gray-400">
                              <span>PUBLISHED: {new Date(ann.published_date).toLocaleDateString()}</span>
                              {ann.deadline_date && (
                                <span className="text-red-600 font-bold uppercase">
                                  {t.deadline[language]} {new Date(ann.deadline_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {ann.attachment && (
                              <a 
                                href={getMediaUrl(ann.attachment)} 
                                download 
                                className="flex items-center gap-1 text-theme-blue hover:underline font-bold uppercase tracking-wider"
                              >
                                <Download className="w-3.5 h-3.5" />
                                {t.attachment[language]}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}

                      {paginatedAnnouncements.length === 0 && (
                        <div className="text-center py-16 text-[10px] font-mono text-theme-gray-400 uppercase tracking-widest">
                          No classifieds found.
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {totalAnnouncementPages > 1 && (
                      <div className="flex justify-between items-center border-t border-theme-gray-100 pt-4 mt-2">
                        <button
                          onClick={() => setAnnouncementPage(prev => Math.max(1, prev - 1))}
                          disabled={announcementPage === 1}
                          className="px-3.5 py-1.5 border border-theme-gray-100 text-xs font-mono font-bold uppercase tracking-wider hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          Previous Page
                        </button>
                        <span className="text-xs font-mono font-semibold text-theme-gray-400 uppercase">
                          Page {announcementPage} of {totalAnnouncementPages}
                        </span>
                        <button
                          onClick={() => setAnnouncementPage(prev => Math.min(totalAnnouncementPages, prev + 1))}
                          disabled={announcementPage === totalAnnouncementPages}
                          className="px-3.5 py-1.5 border border-theme-gray-100 text-xs font-mono font-bold uppercase tracking-wider hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          Next Page
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right part: Announcements sidebar (lg:col-span-4) */}
                  <div className="lg:col-span-4 flex flex-col gap-6 lg:border-l lg:border-theme-gray-100 lg:pl-8">
                    <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-2">
                      <span className="px-2 py-0.5 bg-theme-blue text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                        Amatangazo Sidebar
                      </span>
                    </div>

                    <div className="flex flex-col divide-y divide-theme-gray-100">
                      {displaySports.slice(0, 3).map((art) => (
                        <div key={art.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-1.5 group">
                          <span className="text-[8px] font-mono font-bold text-theme-blue uppercase tracking-widest">{art.category?.name || 'Sports'}</span>
                          <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                            <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2 group-hover:text-theme-blue transition-colors">
                              {art.title}
                            </h4>
                          </Link>
                          <span className="text-[8px] font-mono text-theme-gray-400">{new Date(art.published_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </section>
            );

          case 'lifestyle':
            return (
              <section key="lifestyle" className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep animate-fade-in">
                <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-6">
                      <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue border-b-2 border-theme-blue pb-3 -mb-3.5">
                        Lifestyle & Culture
                      </span>
                    </div>
                    {lifestyleArticles.length > 0 && (
                      <div className="flex flex-col gap-4 group">
                        {lifestyleArticles[0].cover_image && (
                          <Link href={`/a/${lifestyleArticles[0].slug}`} className="block aspect-[16/9] overflow-hidden rounded border border-theme-gray-100">
                            <img src={getMediaUrl(lifestyleArticles[0].cover_image)} alt={lifestyleArticles[0].title} className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300" />
                          </Link>
                        )}
                        <div className="flex flex-col gap-2">
                          <Link href={`/a/${lifestyleArticles[0].slug}`}>
                            <h3 className="serif-title text-lg sm:text-xl font-bold uppercase hover:text-theme-blue transition-colors">
                              {lifestyleArticles[0].title}
                            </h3>
                          </Link>
                          <p className="text-xs text-theme-gray-400 leading-relaxed font-sans">{lifestyleArticles[0].subtitle}</p>
                          <span className="text-[8px] font-mono text-theme-gray-400 uppercase tracking-widest">{new Date(lifestyleArticles[0].published_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-2">
                    <span className="px-2 py-0.5 bg-theme-blue text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                      Lifestyle Feed
                    </span>
                  </div>
                  <div className="flex flex-col divide-y divide-theme-gray-100">
                    {lifestyleArticles.slice(1, 4).map((art) => (
                      <div key={art.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-1.5 group">
                        <Link href={`/a/${art.slug}`}>
                          <h4 className="serif-title text-sm font-bold uppercase leading-snug hover:text-theme-blue transition-colors">
                            {art.title}
                          </h4>
                        </Link>
                        <span className="text-[8px] font-mono text-theme-gray-400">{new Date(art.published_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'sports-grid':
            return (
              <section key="sports-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep animate-fade-in">
                <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8 flex flex-col gap-6">
                  <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-2">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue">
                      Sports Arena
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {displaySports.map((art) => (
                      <div key={art.id} className="flex flex-col gap-3 group">
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="block aspect-[16/10] overflow-hidden rounded border border-theme-gray-100">
                            <img src={getMediaUrl(art.cover_image)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </Link>
                        )}
                        <div className="flex flex-col gap-2">
                          <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                            <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2">
                              {art.title}
                            </h4>
                          </Link>
                          <span className="text-[8px] font-mono text-theme-gray-400">{new Date(art.published_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 lg:pl-4 flex justify-center items-start">
                  <AdSpace placement="sports_sidebar" />
                </div>
              </section>
            );

          case 'featured-secondary':
            return (
              <section key="featured-secondary" className="bg-theme-light-gray/40 border border-theme-gray-100 rounded-md p-6 text-theme-black shadow-sm animate-fade-in">
                <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-6">
                  <span className="px-3 py-1 bg-theme-blue text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                    {t.featuredPostsSec[language]}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {featuredSecList.slice(0, 5).map((art) => (
                    <div 
                      key={art.id}
                      className="bg-white border border-theme-gray-100 rounded-md p-3.5 flex flex-col justify-between gap-4 group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        {art.cover_image && (
                          <div className="relative aspect-[16/10] overflow-hidden rounded mb-3 border border-theme-gray-100">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1.5">
                          {art.category && (
                            <span className="text-[8px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                              {translateCategory(art.category.name, art.category.slug, language)}
                            </span>
                          )}
                          <span className="text-[8px] text-theme-gray-400 font-mono">
                            {new Date(art.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                          <h4 className="serif-title text-xs font-bold uppercase text-theme-black leading-snug line-clamp-3 group-hover:text-theme-blue transition-colors">
                            {art.title}
                          </h4>
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 pt-2.5 border-t border-theme-gray-100 text-[8px] font-mono text-theme-gray-400 mt-2">
                        <span className="font-bold text-theme-black uppercase truncate">BY {art.author.first_name || art.author.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'flyers':
            return (
              <section key="flyers" className="flex flex-col gap-4 py-8 border-b border-theme-blue-deep animate-fade-in">
                <div className="flex justify-between items-center border-b border-theme-gray-100 pb-3">
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue">
                    Partner Flyers & Announcements
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                  <AdSpace placement="flyer_1" />
                  <AdSpace placement="flyer_2" />
                  <AdSpace placement="flyer_3" />
                </div>
              </section>
            );

          case 'you-missed':
            return (
              <section key="you-missed" className="bg-theme-light-gray/40 border border-theme-gray-100 rounded-md p-6 text-theme-black shadow-sm animate-fade-in">
                <div className="flex items-center justify-between border-b border-theme-gray-100 pb-4 mb-6">
                  <span className="px-3 py-1 bg-theme-blue text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                    {t.youMissed[language]}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleScroll(youMissedRailRef, 'left')}
                      className="w-8 h-8 rounded-full border border-theme-gray-100 bg-white text-theme-black hover:bg-theme-blue hover:text-white transition-all flex items-center justify-center cursor-pointer hover:scale-105"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleScroll(youMissedRailRef, 'right')}
                      className="w-8 h-8 rounded-full border border-theme-gray-100 bg-white text-theme-black hover:bg-theme-blue hover:text-white transition-all flex items-center justify-center cursor-pointer hover:scale-105"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div 
                  ref={youMissedRailRef}
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-theme-blue scrollbar-track-theme-light-gray"
                >
                  {youMissedArticles.map((art) => (
                    <div 
                      key={art.id}
                      className="flex-shrink-0 w-72 bg-white border border-theme-gray-100 rounded-md p-3.5 flex flex-col justify-between gap-4 group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded mb-3 border border-theme-gray-100">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                          </Link>
                        )}
                        
                        <div className="flex items-center gap-2 mb-1.5">
                          {art.category && (
                            <span className="text-[8px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                              {translateCategory(art.category.name, art.category.slug, language)}
                            </span>
                          )}
                          <span className="text-[8px] text-theme-gray-400 font-mono">
                            {new Date(art.published_at).toLocaleDateString()}
                          </span>
                        </div>

                        <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                          <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2 group-hover:text-theme-blue transition-colors">
                            {art.title}
                          </h4>
                        </Link>
                      </div>

                      <div className="flex items-center gap-3.5 pt-3 border-t border-theme-gray-100 text-[9px] font-mono text-theme-gray-400 mt-2">
                        <span className="font-bold text-theme-black uppercase">BY {art.author.first_name || art.author.username}</span>
                        <span>•</span>
                        <span>{art.reading_time} MIN READ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'ad-slot':
            return (
              <div key={block.id || `ad-slot-${blockIdx}`} className="flex justify-center py-2 animate-fade-in">
                <AdSpace placement={(block.ad_slot_details?.placement as any) || 'full_width_1'} />
              </div>
            );

          case 'rich-text':
            return (
              <section key={block.id || `rich-text-${blockIdx}`} className="bg-white border border-theme-gray-100 rounded-md p-8 text-theme-black shadow-sm animate-fade-in">
                {block.title && (
                  <h2 className="serif-title text-xl font-bold uppercase tracking-wider text-theme-black border-b border-theme-gray-100 pb-3 mb-6">
                    {block.title}
                  </h2>
                )}
                <div 
                  className="text-sm font-sans leading-relaxed text-theme-black prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content || '' }}
                />
              </section>
            );

          case 'contact-form':
            return (
              <section key={block.id || `contact-${blockIdx}`} className="bg-white border border-theme-gray-100 rounded-md p-8 text-theme-black shadow-sm animate-fade-in max-w-2xl mx-auto w-full">
                {block.title && (
                  <h2 className="serif-title text-xl font-bold uppercase tracking-wider text-theme-black border-b border-theme-gray-100 pb-3 mb-6 text-center">
                    {block.title}
                  </h2>
                )}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Thank you! Your inquiry has been submitted successfully.");
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Your Name</label>
                      <input type="text" required className="bg-theme-light-gray/40 border border-theme-gray-100 px-3 py-2 text-xs rounded focus:outline-none focus:border-theme-blue" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Your Email</label>
                      <input type="email" required className="bg-theme-light-gray/40 border border-theme-gray-100 px-3 py-2 text-xs rounded focus:outline-none focus:border-theme-blue" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Message Subject</label>
                    <input type="text" required className="bg-theme-light-gray/40 border border-theme-gray-100 px-3 py-2 text-xs rounded focus:outline-none focus:border-theme-blue" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Message Content</label>
                    <textarea rows={5} required className="bg-theme-light-gray/40 border border-theme-gray-100 px-3 py-2 text-xs rounded focus:outline-none focus:border-theme-blue" />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-wider rounded cursor-pointer">
                    Send Inquiry
                  </button>
                </form>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
