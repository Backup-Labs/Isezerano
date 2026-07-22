"use client";
import { API_BASE_URL, getMediaUrl } from '@/config';

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
}

export default function Homepage() {
  const { siteSettings, toggleBookmark, isBookmarked, language } = useApp();
  
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
    const loadAllData = async () => {
      try {
        const [articlesRes, announcementsRes, verseRes, layoutRes] = await Promise.all([
          fetch(API_BASE_URL + '/api/v1/articles/'),
          fetch(API_BASE_URL + '/api/v1/announcements/'),
          fetch(API_BASE_URL + '/api/v1/daily-verse/today/'),
          fetch(API_BASE_URL + '/api/v1/homepage-layout/')
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
  }, []);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[50vh] bg-theme-light-gray text-theme-black">
        <div className="w-12 h-12 border-t-2 border-r-2 border-theme-blue rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs tracking-widest uppercase font-bold text-theme-gray-400">LOADING DISPATCHES...</span>
      </div>
    );
  }

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Translations Map
  const t = {
    breakingNews: { RW: 'IBYARI BYO', EN: 'BREAKING NEWS', FR: 'DERNIÈRES INFOS' },
    featuredStory: { RW: 'Inkuru Yatoranyijwe', EN: 'Featured Story', FR: 'En Vedette' },
    editorsPick: { RW: 'Inkuru z’Umwanditsi', EN: "Editor's Pick", FR: 'Choix de l’éditeur' },
    trending: { RW: 'Izikunzwe cyane', EN: 'Trending Stories', FR: 'Tendances' },
    dailyVerseTitle: { RW: "Ijambo ry'Imana", EN: 'Daily Word of God', FR: 'Parole de Dieu' },
    latestNews: { RW: 'Inkuru Ziheruka', EN: 'Latest News', FR: 'Fils d’actualités' },
    topNews: { RW: 'Inkuru Nyamukuru', EN: 'Top News', FR: 'Principales Nouvelles' },
    announcements: { RW: 'Amatangazo n’Amasoko', EN: 'Amatangazo (Classifieds)', FR: 'Annonces & Appels d’offres' },
    tabAll: { RW: 'YOSE', EN: 'ALL', FR: 'TOUT' },
    tabTenders: { RW: 'AMASOKO', EN: 'AMASOKO', FR: 'OFFRES' },
    tabCourt: { RW: "IBYEMEZO BY'URUKIKO", EN: 'COURT DECISIONS', FR: 'JUSTICE' },
    tabJobs: { RW: 'AKAZI', EN: 'AKAZI', FR: 'EMPLOIS' },
    tabNameChange: { RW: 'GUHINDURA AMAZINA', EN: 'NAME CHANGES', FR: 'REPT. NOMS' },
    popularPosts: { RW: 'Inkuru Zikunzwe', EN: 'Inkuru Zikunzwe', FR: 'Populaires' },
    sportsVertical: { RW: 'Imikino n’Imyidagaduro', EN: 'Sports Vertical', FR: 'Sports' },
    featuredPostsSec: { RW: 'Ibyatoranyijwe Gukundwa', EN: 'Featured Posts', FR: 'Articles Recommandés' },
    youMissed: { RW: 'Izo Waba Waracikanwe', EN: 'You Missed', FR: 'Vous avez manqué' },
    readMore: { RW: 'Komeza usome →', EN: 'Continue reading →', FR: 'Lire la suite →' },
    deadline: { RW: 'Itariki ntarengwa:', EN: 'Deadline:', FR: 'Date limite:' },
    attachment: { RW: 'Gukuramo PDF', EN: 'Download PDF', FR: 'Télécharger PDF' }
  };

  const breakingArticles = articles.filter(a => a.is_breaking).slice(0, getLimitFor('hero', 5));
  const fallbackBreaking = articles.slice(5, 5 + getLimitFor('hero', 5));
  const displayBreaking = breakingArticles.length >= 4 ? breakingArticles : fallbackBreaking;

  const featuredRailArticles = articles.filter(a => a.is_featured).slice(0, getLimitFor('featured-grid', 5));

  const editorsPickLead = articles.find(a => a.is_featured && a.category?.slug !== 'sports') || articles[2];
  const editorsPickList = articles.filter(a => a.id !== editorsPickLead?.id && a.category?.slug !== 'sports').slice(0, getLimitFor('trending-widget', 5));

  const trendingArticles = [...articles].sort((a, b) => b.view_count - a.view_count).slice(0, getLimitFor('trending-widget', 5));

  const latestNewsDesk = articles.filter(a => a.category?.slug !== 'sports' && a.category?.slug !== 'faith').slice(0, getLimitFor('news-desk', 5));
  const topNewsDesk = articles.filter(a => a.is_featured).slice(0, getLimitFor('news-desk', 5));

  const filteredAnnouncements = announcements.filter(ann => {
    if (announcementTab === 'all') return true;
    return ann.announcement_type === announcementTab;
  });

  const announcementLimit = getLimitFor('announcements', 4);
  const totalAnnouncementPages = Math.ceil(filteredAnnouncements.length / announcementLimit);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (announcementPage - 1) * announcementLimit,
    announcementPage * announcementLimit
  );

  const sportsLimit = getLimitFor('sports-grid', 4);
  const sportsArticles = articles.filter(a => a.category?.slug === 'sports');
  const fallbackSports = articles.slice(4, 4 + sportsLimit);
  const displaySports = (sportsArticles.length > 0 ? sportsArticles : fallbackSports).slice(0, sportsLimit);

  const lifestyleLead = articles.find(a => a.category?.slug === 'culture' || a.category?.slug === 'fashion') || articles[3];
  const lifestyleQuickLinks = articles.filter(a => a.id !== lifestyleLead?.id).slice(0, getLimitFor('lifestyle', 5));

  const popularArticles = [...articles].sort((a, b) => a.id - b.id).slice(0, getLimitFor('lifestyle', 5));

  const grid1Articles = articles.filter(a => a.category?.slug === 'design' || a.category?.slug === 'technology');
  const grid1Lead = grid1Articles[0] || articles[1];
  const grid1List = grid1Articles.filter(a => a.id !== grid1Lead?.id).slice(0, getLimitFor('category-rail', 5));

  const grid2Articles = articles.filter(a => a.category?.slug === 'business' || a.category?.slug === 'nature');
  const grid2Lead = grid2Articles[0] || articles[0];
  const grid2List = grid2Articles.filter(a => a.id !== grid2Lead?.id).slice(0, getLimitFor('category-rail', 5));

  const featuredSecLead = articles.find(a => a.category?.slug === 'health') || articles[4];
  const featuredSecList = articles.filter(a => a.id !== featuredSecLead?.id).slice(0, getLimitFor('featured-secondary', 5));

  const youMissedArticles = [...articles].reverse().slice(0, getLimitFor('you-missed', 5));

  const defaultLayout = [
    { section_type: 'hero', is_visible: true },
    { section_type: 'featured-grid', is_visible: true },
    { section_type: 'trending-widget', is_visible: true },
    { section_type: 'news-desk', is_visible: true },
    { section_type: 'announcements', is_visible: true },
    { section_type: 'lifestyle', is_visible: true },
    { section_type: 'sports-grid', is_visible: true },
    { section_type: 'featured-secondary', is_visible: true },
    { section_type: 'category-rail', is_visible: true },
    { section_type: 'flyers', is_visible: true },
    { section_type: 'you-missed', is_visible: true }
  ];
  
  const activeLayout = layout.length > 0 ? layout : defaultLayout;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 bg-theme-white text-theme-black">
      {activeLayout.map((block, blockIdx) => {
        if (!block.is_visible) return null;

        switch (block.section_type) {
          case 'hero':
            return (
              <section key="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-theme-blue-deep items-start animate-fade-in">
                {/* Left Column (Slideshow - ~55% width -> col-span-7) */}
                <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-theme-blue-deep pb-6 lg:pb-0 lg:pr-6">
                  {heroArticles.length > 0 && (
                    <div className="relative w-full aspect-[16/9] overflow-hidden group rounded-md shadow-sm border border-theme-blue-deep">
                      {/* Slideshow image */}
                      <Link href={`/a/${heroArticles[heroSlideIndex].slug}`} className="block w-full h-full relative">
                        {heroArticles[heroSlideIndex].cover_image && (
                          <img 
                            src={getMediaUrl(heroArticles[heroSlideIndex].cover_image)} 
                            alt={heroArticles[heroSlideIndex].title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-101"
                          />
                        )}
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        
                        {/* Slide content overlay */}
                        <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            {heroArticles[heroSlideIndex].category && (
                              <span className="px-2 py-0.5 bg-theme-blue text-white text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm">
                                {heroArticles[heroSlideIndex].category.name}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-300 font-mono">
                              {new Date(heroArticles[heroSlideIndex].published_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h2 className="serif-title text-2xl sm:text-4xl font-extrabold uppercase leading-tight tracking-tight hover:text-theme-blue transition-colors">
                            {heroArticles[heroSlideIndex].title}
                          </h2>
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 font-sans">
                            {heroArticles[heroSlideIndex].subtitle}
                          </p>
                        </div>
                      </Link>

                      {/* Prev / Next buttons */}
                      <button 
                        onClick={() => setHeroSlideIndex((prev) => (prev - 1 + heroArticles.length) % heroArticles.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white border border-white/20 flex items-center justify-center hover:bg-theme-blue transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setHeroSlideIndex((prev) => (prev + 1) % heroArticles.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white border border-white/20 flex items-center justify-center hover:bg-theme-blue transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Slide indicators */}
                      <div className="absolute top-4 right-4 flex gap-1.5 bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/10 z-10">
                        {heroArticles.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setHeroSlideIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${heroSlideIndex === idx ? 'bg-theme-blue w-4' : 'bg-gray-400 hover:bg-white'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Middle Column (Breaking News - ~25% width -> col-span-3) */}
                <div className="lg:col-span-3 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-theme-blue-deep pb-6 lg:pb-0 lg:pr-6">
                  <div className="flex items-center justify-between border-b border-theme-blue-deep pb-3">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      {t.breakingNews[language]}
                    </span>
                  </div>

                  <div className="flex flex-col divide-y divide-theme-gray-100">
                    {displayBreaking.map((art) => (
                      <div key={art.id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3 items-start group">
                        <div className="flex-grow flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {art.category && (
                              <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-wider">
                                {art.category.name}
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-theme-gray-400">
                              {new Date(art.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                            <h3 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2">
                              {art.title}
                            </h3>
                          </Link>
                        </div>
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="w-14 h-14 shrink-0 overflow-hidden border border-theme-blue-deep/20 rounded">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column (Hero Sidebar Ad - col-span-2) */}
                <div className="lg:col-span-2 flex justify-center">
                  <AdSpace placement="hero_sidebar" />
                </div>
              </section>
            );

          case 'featured-grid':
            return (
              <section key="featured-grid" className="bg-theme-light-gray/40 border border-theme-gray-100 rounded-md p-6 text-theme-black shadow-sm animate-fade-in">
                <div className="flex items-center justify-between border-b border-theme-gray-100 pb-4 mb-6">
                  <span className="px-3 py-1 bg-theme-blue text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                    {t.featuredStory[language]}
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

                {/* Horizontal scroll container */}
                <div 
                  ref={featuredRailRef}
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-theme-blue scrollbar-track-theme-light-gray"
                >
                  {featuredRailArticles.map((art) => (
                    <div 
                      key={art.id}
                      className="flex-shrink-0 w-72 bg-white border border-theme-gray-100 rounded-md p-3.5 flex flex-col justify-between gap-4 group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        {art.cover_image && (
                          <div className="relative aspect-[16/10] overflow-hidden rounded mb-3 border border-theme-blue-deep/20">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                            {/* Video play icon overlay if article has video */}
                            {art.has_video && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-theme-blue text-white flex items-center justify-center shadow-lg border border-white/20">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-1.5">
                          {art.category && (
                            <span className="text-[8px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                              {art.category.name}
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

          case 'trending-widget':
            return (
              <section key="trending-widget" className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-y border-theme-gray-100 bg-white text-theme-black rounded-md animate-fade-in">
                {/* Col 1: Editor's Pick (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8">
                  <div>
                    <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-4">
                      <span className="px-2 py-0.5 bg-theme-blue text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                        {t.editorsPick[language]}
                      </span>
                    </div>

                    {editorsPickLead && (
                      <div className="flex flex-col gap-3 group">
                        {editorsPickLead.cover_image && (
                          <Link href={`/a/${editorsPickLead.slug}`} className="block overflow-hidden border border-theme-blue-deep/30 rounded">
                            <img 
                              src={getMediaUrl(editorsPickLead.cover_image)} 
                              alt={editorsPickLead.title}
                              className="w-full aspect-[16/10] object-cover group-hover:scale-101 transition-all"
                            />
                          </Link>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {editorsPickLead.category && (
                            <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                              {editorsPickLead.category.name}
                            </span>
                          )}
                          <span className="text-[9px] text-theme-gray-400 font-mono">
                            {new Date(editorsPickLead.published_at).toLocaleDateString()}
                          </span>
                        </div>

                        <Link href={`/a/${editorsPickLead.slug}`} className="hover:text-theme-blue transition-colors">
                          <h3 className="serif-title text-xl font-bold uppercase text-theme-black leading-snug group-hover:text-theme-blue transition-colors">
                            {editorsPickLead.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-2">
                          {editorsPickLead.subtitle}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* List items below lead */}
                  <div className="flex flex-col divide-y divide-theme-gray-100 mt-4 pt-4 border-t border-theme-gray-100">
                    {editorsPickList.map((art) => (
                      <div key={art.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1 group/item">
                        <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors font-sans text-xs font-semibold text-theme-black leading-snug line-clamp-2">
                          {art.title}
                        </Link>
                        <span className="text-[8px] text-theme-gray-400 font-mono">
                          {new Date(art.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Trending (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:px-8">
                  <div>
                    <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-4">
                      <span className="px-2 py-0.5 bg-theme-charcoal text-theme-light-gray border border-theme-blue font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm">
                        {t.trending[language]}
                      </span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {trendingArticles.map((art, idx) => (
                        <div key={art.id} className="flex gap-4 items-start group">
                          <span className="serif-title text-3xl font-black text-theme-blue/30 group-hover:text-theme-blue transition-colors w-8 text-right">
                            0{idx + 1}
                          </span>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[8px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">
                              {art.category?.name || 'Latest'}
                            </span>
                            <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                              <h4 className="serif-title text-xs font-bold uppercase text-theme-black leading-tight line-clamp-2">
                                {art.title}
                              </h4>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Col 3: Daily Verse (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col gap-4 lg:pl-8">
                  <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-2">
                    <span className="px-2 py-0.5 bg-theme-blue text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {t.dailyVerseTitle[language]}
                    </span>
                  </div>

                  {dailyVerse ? (
                    <div className="flex-1 flex flex-col justify-between border-2 border-theme-blue-deep bg-theme-light-gray p-6 rounded-md shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-theme-blue/5 rounded-full translate-x-8 -translate-y-8" />
                      <div className="flex flex-col gap-4 z-10">
                        <p className="serif-title text-base italic leading-relaxed text-theme-black">
                          "{language === 'RW' ? dailyVerse.verse_text_kinyarwanda : dailyVerse.verse_text_english}"
                        </p>
                        <span className="font-mono text-xs font-bold text-theme-blue uppercase tracking-wider block border-t border-theme-blue-deep/20 pt-2 w-max">
                          — {dailyVerse.verse_reference}
                        </span>
                      </div>
                      <div className="mt-8 pt-4 border-t border-theme-gray-100">
                        <AdSpace placement="daily_verse_sidebar" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6 bg-theme-light-gray text-xs font-mono text-theme-gray-400 uppercase">
                      Daily Verse Loading...
                    </div>
                  )}
                </div>
              </section>
            );

          case 'news-desk':
            return (
              <section key="news-desk" className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep animate-fade-in">
                {/* Col 1: Latest News (lg:col-span-6) */}
                <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8">
                  <div className="flex items-center justify-between border-b border-theme-gray-100 pb-3 mb-6">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue border-b-2 border-theme-blue pb-3 -mb-3.5">
                      {t.latestNews[language]}
                    </span>
                  </div>

                  <div className="flex flex-col divide-y divide-theme-gray-100">
                    {latestNewsDesk.map((art) => (
                      <div key={art.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start group">
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="w-24 h-24 shrink-0 overflow-hidden border border-theme-gray-100 rounded">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          </Link>
                        )}
                        <div className="flex-grow flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
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
                            <h3 className="serif-title text-base font-bold uppercase text-theme-black leading-snug group-hover:text-theme-blue transition-colors line-clamp-2">
                              {art.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-2">
                            {art.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Middle Ad Slot banner (lg:col-span-2) */}
                <div className="lg:col-span-2 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:px-4 items-center justify-start">
                  <AdSpace placement="news_desk_sidebar" />
                </div>

                {/* Col 3: Top News (lg:col-span-4) */}
                <div className="lg:col-span-4 lg:pl-4">
                  <div className="flex items-center justify-between border-b border-theme-gray-100 pb-3 mb-6">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-black">
                      {t.topNews[language]}
                    </span>
                  </div>

                  <div className="flex flex-col gap-5">
                    {topNewsDesk.map((art) => (
                      <div key={art.id} className="flex gap-3.5 items-start group">
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="w-16 h-16 shrink-0 overflow-hidden border border-theme-gray-100 rounded">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                            />
                          </Link>
                        )}
                        <div className="flex-grow flex flex-col gap-1 min-w-0">
                          <span className="text-[8px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">
                            {art.category?.name || 'Latest'}
                          </span>
                          <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                            <h4 className="serif-title text-xs font-bold uppercase text-theme-black leading-tight line-clamp-2">
                              {art.title}
                            </h4>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
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
                            <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2">
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
                {/* Col 1: Lifestyle Feature (lg:col-span-8) */}
                <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-6">
                      <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue border-b-2 border-theme-blue pb-3 -mb-3.5">
                        Lifestyle & Culture
                      </span>
                    </div>

                    {lifestyleLead && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 group">
                        {lifestyleLead.cover_image && (
                          <Link href={`/a/${lifestyleLead.slug}`} className="block overflow-hidden border border-theme-gray-100 rounded">
                            <img 
                              src={getMediaUrl(lifestyleLead.cover_image)} 
                              alt={lifestyleLead.title}
                              className="w-full aspect-[4/3] object-cover group-hover:scale-101 transition-transform"
                            />
                          </Link>
                        )}
                        <div className="flex flex-col justify-between gap-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {lifestyleLead.category && (
                                <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                                  {lifestyleLead.category.name}
                                </span>
                              )}
                              <span className="text-[9px] text-theme-gray-400 font-mono">
                                {new Date(lifestyleLead.published_at).toLocaleDateString()}
                              </span>
                            </div>
                            <Link href={`/a/${lifestyleLead.slug}`} className="hover:text-theme-blue transition-colors">
                              <h3 className="serif-title text-xl font-bold uppercase text-theme-black leading-snug group-hover:text-theme-blue transition-colors">
                                {lifestyleLead.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-4">
                              {lifestyleLead.subtitle}
                            </p>
                          </div>
                          <Link href={`/a/${lifestyleLead.slug}`} className="text-xs text-theme-blue font-mono font-bold uppercase tracking-wider hover:underline">
                            {t.readMore[language]}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bullet quick links below lifestyle lead */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-theme-gray-100">
                    {lifestyleQuickLinks.slice(0, 4).map((art) => (
                      <div key={art.id} className="flex gap-2.5 items-start group/item">
                        <ChevronRight className="w-4 h-4 text-theme-blue shrink-0 mt-0.5 group-hover/item:translate-x-0.5 transition-transform" />
                        <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors text-xs font-bold text-theme-black font-sans leading-snug line-clamp-2">
                          {art.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Popular Posts (lg:col-span-4) */}
                <div className="lg:col-span-4 lg:pl-4">
                  <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-6">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-black">
                      {t.popularPosts[language]}
                    </span>
                  </div>

                  <div className="flex flex-col divide-y divide-theme-gray-100">
                    {popularArticles.slice(0, 4).map((art, idx) => (
                      <div key={art.id} className="py-3 first:pt-0 last:pb-0 flex gap-4 items-start group">
                        <span className="font-mono text-lg font-black text-theme-gray-400/30 group-hover:text-theme-blue transition-colors w-6">
                          0{idx + 1}
                        </span>
                        <div className="flex flex-col gap-1 min-w-0">
                          <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors text-xs font-bold uppercase text-theme-black leading-snug line-clamp-2 font-mono">
                            {art.title}
                          </Link>
                          <span className="text-[8px] text-theme-gray-400 font-mono">
                            {new Date(art.published_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'category-rail':
            return (
              <section key={`category-rail-${block.id || blockIdx}`} className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep animate-fade-in">
                {/* Grid Col A: Left (lg:col-span-5) */}
                <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8">
                  <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-6">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-black">
                      {block.category_details?.name || 'Design & Architecture'}
                    </span>
                  </div>

                  {grid1Lead && (
                    <div className="flex flex-col gap-3 group mb-4">
                      {grid1Lead.cover_image && (
                        <Link href={`/a/${grid1Lead.slug}`} className="block overflow-hidden border border-theme-gray-100 rounded">
                          <img 
                            src={getMediaUrl(grid1Lead.cover_image)} 
                            alt={grid1Lead.title}
                            className="w-full aspect-[16/10] object-cover group-hover:scale-101 transition-transform"
                          />
                        </Link>
                      )}
                      <div className="flex items-center gap-2">
                        {grid1Lead.category && (
                          <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                            {grid1Lead.category.name}
                          </span>
                        )}
                        <span className="text-[9px] text-theme-gray-400 font-mono">
                          {new Date(grid1Lead.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/a/${grid1Lead.slug}`} className="hover:text-theme-blue transition-colors">
                        <h3 className="serif-title text-base font-bold uppercase text-theme-black leading-snug group-hover:text-theme-blue transition-colors">
                          {grid1Lead.title}
                        </h3>
                      </Link>
                    </div>
                  )}

                  <div className="flex flex-col divide-y divide-theme-gray-100">
                    {grid1List.map((art) => (
                      <div key={art.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1 group">
                        <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors text-xs font-semibold text-theme-black leading-snug line-clamp-2">
                          {art.title}
                        </Link>
                        <span className="text-[8px] text-theme-gray-400 font-mono">
                          {new Date(art.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grid Col B: Ad Space Stack (lg:col-span-2) */}
                <div className="lg:col-span-2 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:px-4 items-center">
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue pb-2.5 border-b border-theme-blue-deep w-full text-center lg:text-left">
                    OFFICIAL CAMPAIGNS
                  </h3>
                  <div className="flex flex-col gap-4 w-full justify-center">
                    <AdSpace placement="grid_sidebar_stack_1" />
                    <AdSpace placement="grid_sidebar_stack_2" />
                    <AdSpace placement="grid_sidebar_stack_3" />
                  </div>
                </div>

                {/* Grid Col C: Right (lg:col-span-5) */}
                <div className="lg:col-span-5 lg:pl-8">
                  <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-6">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-black">
                      Business & Innovation
                    </span>
                  </div>

                  {grid2Lead && (
                    <div className="flex flex-col gap-3 group mb-4">
                      {grid2Lead.cover_image && (
                        <Link href={`/a/${grid2Lead.slug}`} className="block overflow-hidden border border-theme-gray-100 rounded">
                          <img 
                            src={getMediaUrl(grid2Lead.cover_image)} 
                            alt={grid2Lead.title}
                            className="w-full aspect-[16/10] object-cover group-hover:scale-101 transition-transform"
                          />
                        </Link>
                      )}
                      <div className="flex items-center gap-2">
                        {grid2Lead.category && (
                          <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                            {grid2Lead.category.name}
                          </span>
                        )}
                        <span className="text-[9px] text-theme-gray-400 font-mono">
                          {new Date(grid2Lead.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/a/${grid2Lead.slug}`} className="hover:text-theme-blue transition-colors">
                        <h3 className="serif-title text-base font-bold uppercase text-theme-black leading-snug group-hover:text-theme-blue transition-colors">
                          {grid2Lead.title}
                        </h3>
                      </Link>
                    </div>
                  )}

                  <div className="flex flex-col divide-y divide-theme-gray-100">
                    {grid2List.map((art) => (
                      <div key={art.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1 group">
                        <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors text-xs font-semibold text-theme-black leading-snug line-clamp-2">
                          {art.title}
                        </Link>
                        <span className="text-[8px] text-theme-gray-400 font-mono">
                          {new Date(art.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'sports-grid':
            return (
              <section key="sports-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep animate-fade-in">
                {/* Left sports col: Main feed (lg:col-span-8) */}
                <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8">
                  <div className="flex items-center justify-between border-b border-theme-gray-100 pb-3 mb-6">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue border-b-2 border-theme-blue pb-3 -mb-3.5">
                      {t.sportsVertical[language]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displaySports.slice(0, 4).map((art) => (
                      <div key={art.id} className="flex flex-col gap-3 group">
                        {art.cover_image && (
                          <Link href={`/a/${art.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded border border-theme-gray-100">
                            <img 
                              src={getMediaUrl(art.cover_image)} 
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-101 transition-transform"
                            />
                            {art.has_video && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-theme-blue text-white flex items-center justify-center shadow-lg border border-white/20">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                              </div>
                            )}
                          </Link>
                        )}
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-mono font-bold text-theme-blue uppercase tracking-widest">{art.category?.name || 'Sports'}</span>
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

                {/* Right sports ad slot banner skyscraper (lg:col-span-4) */}
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

                {/* Horizontal scroll container */}
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
                              {art.category.name}
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

                {/* Horizontal scroll container */}
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
                            {art.has_video && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-theme-blue text-white flex items-center justify-center shadow-lg border border-white/20">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                            )}
                          </Link>
                        )}
                        
                        <div className="flex items-center gap-2 mb-1.5">
                          {art.category && (
                            <span className="text-[8px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                              {art.category.name}
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

          default:
            return null;
        }
      })}
    </div>
  );
}
