"use client";

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
  has_video?: boolean; // Mock or computed helper
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
  const { toggleBookmark, isBookmarked, language } = useApp();
  
  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
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
        const [articlesRes, announcementsRes, verseRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/v1/articles/'),
          fetch('http://127.0.0.1:8000/api/v1/announcements/'),
          fetch('http://127.0.0.1:8000/api/v1/daily-verse/today/')
        ]);

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          // Seed script marks Rayon Sports as breaking, etc. Add video flag mock-up to some articles.
          const processedArticles = (Array.isArray(data) ? data : (data.results || [])).map((art: Article, index: number) => ({
            ...art,
            has_video: index % 3 === 0 // mock 1/3 stories as video stories for visual overlays
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
      } catch (err) {
        console.error("Failed to load page data", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Hero slideshow auto-advance logic
  const heroArticles = articles.slice(0, 5); // top 5 stories as hero slides
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

  const getMediaUrl = (path: string | null) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
  };

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
    tabTenders: { RW: 'AMASOKO', EN: 'TENDERS', FR: 'OFFRES' },
    tabCourt: { RW: "IBYEMEZO BY'URUKIKO", EN: 'COURT DECISIONS', FR: 'JUSTICE' },
    tabJobs: { RW: 'AKAZI', EN: 'JOBS', FR: 'EMPLOIS' },
    tabNameChange: { RW: 'GUHINDURA AMAZINA', EN: 'NAME CHANGES', FR: 'REPT. NOMS' },
    popularPosts: { RW: 'Inkuru Zikunzwe', EN: 'Popular Posts', FR: 'Populaires' },
    sportsVertical: { RW: 'Imikino n’Imyidagaduro', EN: 'Sports Vertical', FR: 'Sports' },
    featuredPostsSec: { RW: 'Ibyatoranyijwe Gukundwa', EN: 'Featured Posts', FR: 'Articles Recommandés' },
    youMissed: { RW: 'Izo Waba Waracikanwe', EN: 'You Missed', FR: 'Vous avez manqué' },
    readMore: { RW: 'Komeza usome →', EN: 'Continue reading →', FR: 'Lire la suite →' },
    deadline: { RW: 'Itariki ntarengwa:', EN: 'Deadline:', FR: 'Date limite:' },
    attachment: { RW: 'Gukuramo PDF', EN: 'Download PDF', FR: 'Télécharger PDF' }
  };

  // 1. Hero filter: slideshow is heroArticles (0-5).
  // 2. Breaking: filter articles with `is_breaking === true` or top news.
  const breakingArticles = articles.filter(a => a.is_breaking).slice(0, 4);
  const fallbackBreaking = articles.slice(5, 9);
  const displayBreaking = breakingArticles.length >= 4 ? breakingArticles : fallbackBreaking;

  // 3. Featured Story Rail articles: fallback to featured articles or next slice
  const featuredRailArticles = articles.filter(a => a.is_featured).slice(0, 5);

  // 4. Editor's Pick story (1 large + 3 text items)
  const editorsPickLead = articles.find(a => a.is_featured && a.category?.slug !== 'sports') || articles[2];
  const editorsPickList = articles.filter(a => a.id !== editorsPickLead?.id && a.category?.slug !== 'sports').slice(0, 3);

  // 5. Trending list (exactly 5 items ranked by views)
  const trendingArticles = [...articles].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

  // 6. News Desk Row:
  // Col 1: Latest News (chronological, non-sports, non-announcements)
  const latestNewsDesk = articles.filter(a => a.category?.slug !== 'sports' && a.category?.slug !== 'faith').slice(0, 5);
  // Col 3: Top News (headline only, larger thumbs)
  const topNewsDesk = articles.filter(a => a.is_featured).slice(0, 4);

  // 7. Amatangazo announcements list filtered by tab
  const filteredAnnouncements = announcements.filter(ann => {
    if (announcementTab === 'all') return true;
    return ann.announcement_type === announcementTab;
  });

  const announcementLimit = 4;
  const totalAnnouncementPages = Math.ceil(filteredAnnouncements.length / announcementLimit);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (announcementPage - 1) * announcementLimit,
    announcementPage * announcementLimit
  );

  // Sports list for Amatangazo sidebar & Section 9 Sports Grid
  const sportsArticles = articles.filter(a => a.category?.slug === 'sports');
  const fallbackSports = articles.slice(4, 9);
  const displaySports = sportsArticles.length > 0 ? sportsArticles : fallbackSports;

  // 8. Lifestyle block (Category 'culture' or 'fashion')
  const lifestyleLead = articles.find(a => a.category?.slug === 'culture' || a.category?.slug === 'fashion') || articles[3];
  const lifestyleQuickLinks = articles.filter(a => a.id !== lifestyleLead?.id).slice(0, 5);

  // 9. Popular Posts (numbered list 1-4, long term trending)
  const popularArticles = [...articles].sort((a, b) => a.id - b.id).slice(0, 4); // alternate view metrics

  // 10. Featured Post Grid A & B (Category configured)
  // Grid 1 = Design / Tech
  const grid1Articles = articles.filter(a => a.category?.slug === 'design' || a.category?.slug === 'technology');
  const grid1Lead = grid1Articles[0] || articles[1];
  const grid1List = grid1Articles.filter(a => a.id !== grid1Lead?.id).slice(0, 4);

  // Grid 2 = Business / Nature
  const grid2Articles = articles.filter(a => a.category?.slug === 'business' || a.category?.slug === 'nature');
  const grid2Lead = grid2Articles[0] || articles[0];
  const grid2List = grid2Articles.filter(a => a.id !== grid2Lead?.id).slice(0, 4);

  // 11. Featured Posts Row (second instance)
  const featuredSecLead = articles.find(a => a.category?.slug === 'health') || articles[4];
  const featuredSecList = articles.filter(a => a.id !== featuredSecLead?.id).slice(0, 5);

  // 12. You Missed Rail articles
  const youMissedArticles = [...articles].reverse().slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-12 bg-theme-white text-theme-black">
      
      {/* =======================================================================
          SECTION 2: HERO SECTION
          ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-theme-blue-deep">
        {/* Left Column (Slideshow - ~55% width -> col-span-7) */}
        <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-theme-blue-deep pb-6 lg:pb-0 lg:pr-8">
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
        <div className="lg:col-span-3 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-theme-blue-deep pb-6 lg:pb-0 lg:pr-8">
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

        {/* Right Column (Hero Sidebar Ad - ~20% width -> col-span-2) */}
        <div className="lg:col-span-2 flex justify-center items-start">
          <AdSpace placement="hero_sidebar" />
        </div>
      </section>

      {/* =======================================================================
          SECTION 3: FEATURED STORY RAIL
          ======================================================================= */}
      <section className="bg-theme-light-gray/40 border border-theme-gray-100 rounded-md p-6 text-theme-black shadow-sm">
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

      {/* Ad Space below rail */}
      <div className="flex justify-center py-2">
        <AdSpace placement="full_width_1" />
      </div>

      {/* =======================================================================
          SECTION 4: EDITOR'S PICK / TRENDING / DAILY VERSE ROW
          ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-y border-theme-gray-100 bg-white text-theme-black rounded-md">
        
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
        <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8">
          <div>
            <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-4">
              <span className="px-2 py-0.5 bg-theme-blue text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                {t.trending[language]}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-theme-gray-100">
              {trendingArticles.map((art, index) => (
                <div key={art.id} className="py-3 first:pt-0 last:pb-0 flex gap-4 items-start group hover:bg-theme-light-gray/20 p-2 rounded transition-all duration-200">
                  <div className="font-mono text-xl font-extrabold text-theme-blue/30 group-hover:text-theme-blue transition-colors tracking-tighter w-6 shrink-0 text-center">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-grow flex flex-col gap-1 min-w-0">
                    <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                      <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-snug line-clamp-2">
                        {art.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-3 text-[8px] font-mono text-theme-gray-400">
                      {art.category && <span className="text-theme-blue font-bold">{art.category.name}</span>}
                      <span>{art.view_count.toLocaleString()} VIEWS</span>
                    </div>
                  </div>
                  {art.cover_image && (
                    <Link href={`/a/${art.slug}`} className="w-12 h-12 shrink-0 border border-theme-gray-100 rounded overflow-hidden">
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
        </div>

        {/* Col 3: Daily Verse & Sidebar Ad (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-theme-light-gray/60 border border-theme-blue rounded p-5 flex flex-col gap-3 relative shadow-sm text-theme-black animate-fade-in">
            <div className="flex items-center gap-2 border-b border-theme-blue/20 pb-2 mb-1">
              <Award className="w-4 h-4 text-theme-blue" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-theme-blue">
                {t.dailyVerseTitle[language]}
              </span>
            </div>
            
            {dailyVerse ? (
              <div className="flex flex-col gap-2">
                <p className="font-serif italic text-lg leading-relaxed text-theme-black text-center px-2">
                  " {language === 'RW' ? dailyVerse.verse_text_kinyarwanda : dailyVerse.verse_text_english} "
                </p>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-theme-blue text-right block mt-2">
                  — {dailyVerse.verse_reference}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="font-serif italic text-lg leading-relaxed text-theme-black text-center px-2">
                  " Kuko ibyo kwerekwa bifite igihe byabariwe, kandi bizagera ku ndunduro yabyo ntibizabeshya. "
                </p>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-theme-blue text-right block mt-2">
                  — Habakuki 2:3
                </span>
              </div>
            )}
          </div>

          {/* Ad slot below verse */}
          <div className="flex justify-center">
            <AdSpace placement="daily_verse_sidebar" />
          </div>
        </div>
      </section>

      {/* =======================================================================
          SECTION 5: NEWS DESK ROW
          ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep">
        
        {/* Col 1: Inkuru Ziheruka / Latest News (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-theme-blue-deep/30 pb-6 lg:pb-0 lg:pr-8">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue pb-2.5 border-b border-theme-blue-deep">
            {t.latestNews[language]}
          </h3>
          
          <div className="flex flex-col divide-y divide-theme-gray-100">
            {latestNewsDesk.map((art) => (
              <div key={art.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 group">
                <div className="flex-grow flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-theme-blue/80 font-bold uppercase">
                      {new Date(art.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {art.category && (
                      <span className="text-[9px] font-mono text-theme-gray-400 font-medium">
                        {art.category.name}
                      </span>
                    )}
                  </div>
                  <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                    <h4 className="font-sans text-xs font-semibold text-theme-black leading-snug line-clamp-2">
                      {art.title}
                    </h4>
                  </Link>
                </div>
                {art.cover_image && (
                  <Link href={`/a/${art.slug}`} className="w-12 h-12 shrink-0 border border-theme-blue-deep/10 rounded overflow-hidden">
                    <img 
                      src={getMediaUrl(art.cover_image)} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105"
                    />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Embedded Promo/Video Box (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col border-b lg:border-b-0 lg:border-r border-theme-blue-deep/30 pb-6 lg:pb-0 lg:pr-8">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue pb-2.5 border-b border-theme-blue-deep mb-4">
            PARTNER DISPATCH
          </h3>
          <AdSpace placement="sponsored_content" />
        </div>

        {/* Col 3: Inkuru Nyamukuru / Top News (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-theme-blue-deep/30 pb-6 lg:pb-0 lg:pr-8">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue pb-2.5 border-b border-theme-blue-deep">
            {t.topNews[language]}
          </h3>

          <div className="flex flex-col gap-4">
            {topNewsDesk.map((art) => (
              <div key={art.id} className="flex gap-3 group items-start">
                {art.cover_image && (
                  <Link href={`/a/${art.slug}`} className="w-16 h-12 shrink-0 border border-theme-blue-deep/10 rounded overflow-hidden">
                    <img 
                      src={getMediaUrl(art.cover_image)} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </Link>
                )}
                <div className="flex-grow min-w-0">
                  <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                    <h4 className="serif-title text-sm font-bold uppercase text-theme-black leading-tight line-clamp-2">
                      {art.title}
                    </h4>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 4: Skyscraper Ad (lg:col-span-2) */}
        <div className="lg:col-span-2 flex justify-center items-start">
          <AdSpace placement="news_desk_sidebar" />
        </div>
      </section>

      {/* =======================================================================
          SECTION 6: AMATANGAZO (ANNOUNCEMENTS / CLASSIFIEDS)
          ======================================================================= */}
      <section className="bg-white border-2 border-theme-blue-deep rounded-md p-6 shadow-sm">
        {/* Title Header with tabs */}
        <div className="flex flex-col lg:flex-row items-center justify-between border-b-2 border-theme-blue-deep pb-4 mb-6 gap-4">
          <span className="px-3 py-1 bg-theme-blue text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm self-start">
            {t.announcements[language]}
          </span>

          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] font-bold">
            {(['all', 'amasoko', 'ibyemezo_by_urukiko', 'akazi', 'guhindura_amazina'] as const).map((tab) => {
              const labelMap = {
                all: t.tabAll[language],
                amasoko: t.tabTenders[language],
                ibyemezo_by_urukiko: t.tabCourt[language],
                akazi: t.tabJobs[language],
                guhindura_amazina: t.tabNameChange[language]
              };
              const isActive = announcementTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setAnnouncementTab(tab);
                    setAnnouncementPage(1);
                  }}
                  className={`px-3 py-1.5 border rounded cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-theme-dark-blue text-white border-theme-dark-blue' 
                      : 'bg-transparent text-theme-gray-400 border-theme-gray-100 hover:border-theme-blue hover:text-theme-blue'
                  }`}
                >
                  {labelMap[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid Layout (Announcements vs Sports Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Announcements dated list (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              {paginatedAnnouncements.length > 0 ? (
                paginatedAnnouncements.map((ann) => (
                  <div 
                    key={ann.id}
                    className="border border-theme-gray-100 hover:border-theme-blue p-4 rounded-md transition-all flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-theme-light-gray/40 group"
                  >
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-mono font-black text-theme-blue bg-theme-blue/10 px-2 py-0.5 rounded uppercase border border-theme-blue/20">
                          {ann.announcement_type.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-theme-black uppercase tracking-tight line-clamp-1">
                          {ann.organization_name}
                        </span>
                      </div>
                      
                      <h4 className="serif-title text-base font-extrabold uppercase text-theme-black group-hover:text-theme-blue transition-colors line-clamp-1">
                        {ann.title}
                      </h4>
                      
                      <p className="text-xs text-theme-gray-400 font-sans line-clamp-2 mt-1 pr-6 leading-relaxed">
                        {ann.body}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-[9px] font-mono text-theme-gray-400 mt-2">
                        {ann.reference_number && <span>REF: {ann.reference_number}</span>}
                        {ann.deadline_date && (
                          <span className="text-red-500 font-bold">
                            {t.deadline[language]} {new Date(ann.deadline_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
                      <span className="text-[10px] font-mono text-theme-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ann.published_date).toLocaleDateString()}
                      </span>
                      
                      {ann.attachment && (
                        <a 
                          href={getMediaUrl(ann.attachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-theme-blue bg-theme-blue text-white text-[9px] font-mono font-bold uppercase tracking-widest rounded hover:bg-theme-blue-glow transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>{t.attachment[language]}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-theme-gray-400 font-mono text-xs">
                  No listings found in this category.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalAnnouncementPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 font-mono text-xs">
                <button
                  onClick={() => setAnnouncementPage(p => Math.max(1, p - 1))}
                  disabled={announcementPage === 1}
                  className="px-3 py-1.5 border border-theme-gray-100 rounded disabled:opacity-40 cursor-pointer font-bold"
                >
                  ← Prev
                </button>
                <span className="font-bold">Page {announcementPage} of {totalAnnouncementPages}</span>
                <button
                  onClick={() => setAnnouncementPage(p => Math.min(totalAnnouncementPages, p + 1))}
                  disabled={announcementPage === totalAnnouncementPages}
                  className="px-3 py-1.5 border border-theme-gray-100 rounded disabled:opacity-40 cursor-pointer font-bold"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Right: Sports sidebar and Ad (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-theme-blue-deep/30 pt-6 lg:pt-0 lg:pl-8">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue pb-2.5 border-b border-theme-blue-deep">
              {t.sportsVertical[language]}
            </h3>
            
            {/* Quick list of Sports stories */}
            <div className="flex flex-col divide-y divide-theme-gray-100">
              {displaySports.slice(0, 3).map((art) => (
                <div key={art.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 group">
                  {art.cover_image && (
                    <Link href={`/a/${art.slug}`} className="w-14 h-14 shrink-0 rounded border border-theme-blue-deep/10 overflow-hidden">
                      <img 
                        src={getMediaUrl(art.cover_image)} 
                        alt={art.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>
                  )}
                  <div className="flex-grow min-w-0">
                    <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors font-sans text-xs font-semibold text-theme-black leading-snug line-clamp-2">
                      {art.title}
                    </Link>
                    <span className="text-[8px] text-theme-gray-400 font-mono">
                      {new Date(art.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Ad */}
            <div className="flex justify-center mt-2">
              <AdSpace placement="sports_sidebar" />
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          SECTION 7: LIFESTYLE FEATURE + POPULAR POSTS ROW
          ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep">
        {/* Col 1: Lifestyle Feature (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-theme-blue-deep/30 pb-6 lg:pb-0 lg:pr-8">
          <div className="flex items-center border-b border-theme-blue-deep/30 pb-3">
            <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue">
              LIFESTYLE & CULTURE
            </span>
          </div>

          {lifestyleLead && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 group">
              <div className="relative aspect-[16/10] sm:aspect-square overflow-hidden rounded border border-theme-blue-deep/30">
                {lifestyleLead.cover_image && (
                  <img 
                    src={getMediaUrl(lifestyleLead.cover_image)} 
                    alt={lifestyleLead.title} 
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500" 
                  />
                )}
                {lifestyleLead.has_video && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-theme-blue text-white flex items-center justify-center shadow-lg border border-white/20">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between">
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
                    <h3 className="serif-title text-2xl font-bold uppercase text-theme-black leading-tight">
                      {lifestyleLead.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-theme-gray-400 font-sans leading-relaxed">
                    {lifestyleLead.subtitle}
                  </p>
                </div>
                <Link href={`/a/${lifestyleLead.slug}`} className="text-theme-blue text-xs font-mono font-bold uppercase hover:underline mt-4">
                  {t.readMore[language]}
                </Link>
              </div>
            </div>
          )}

          {/* Quick links list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-theme-gray-100">
            {lifestyleQuickLinks.slice(0, 4).map((art) => (
              <div key={art.id} className="flex gap-3 items-start group">
                <div className="flex-grow min-w-0">
                  <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors font-sans text-xs font-semibold text-theme-black leading-tight line-clamp-2">
                    {art.title}
                  </Link>
                  <span className="text-[8px] text-theme-gray-400 font-mono block mt-1">
                    {new Date(art.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Popular Posts (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center border-b border-theme-gray-100 pb-3">
            <span className="px-2.5 py-0.5 bg-theme-blue text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
              {t.popularPosts[language]}
            </span>
          </div>

          <div className="flex flex-col bg-theme-light-gray/40 border border-theme-gray-100 rounded-md p-5 text-theme-black gap-4 shadow-sm">
            {popularArticles.map((art, index) => (
              <div key={art.id} className="flex gap-4 items-start group hover:bg-white p-2.5 rounded transition-all duration-200">
                <div className="font-mono text-2xl font-black text-theme-blue/30 group-hover:text-theme-blue tracking-tighter w-8 text-center shrink-0">
                  {index + 1}
                </div>
                <div className="flex-grow min-w-0 flex flex-col gap-0.5">
                  <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors font-sans text-xs font-bold text-theme-black leading-snug line-clamp-2">
                    {art.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[8px] font-mono text-theme-gray-400">
                    {art.category && <span className="text-theme-blue uppercase font-bold">{art.category.name}</span>}
                    <span>{new Date(art.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full width ad 2 */}
      <div className="flex justify-center py-2">
        <AdSpace placement="full_width_2" />
      </div>

      {/* =======================================================================
          SECTION 8: FEATURED POST GRID (x2 columns) + AD STACK
          ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep">
        {/* Grid Column 1: Configured Category A (e.g. Design/Tech) */}
        <div className="lg:col-span-4 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-theme-blue-deep/30 pb-6 lg:pb-0 lg:pr-8">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue pb-2.5 border-b border-theme-blue-deep">
            GRID // DESIGN & TECHNOLOGY
          </h3>
          
          {grid1Lead && (
            <div className="flex flex-col gap-3 group">
              {grid1Lead.cover_image && (
                <Link href={`/a/${grid1Lead.slug}`} className="block overflow-hidden border border-theme-blue-deep/20 rounded">
                  <img 
                    src={getMediaUrl(grid1Lead.cover_image)} 
                    alt={grid1Lead.title} 
                    className="w-full aspect-[16/10] object-cover group-hover:scale-101 transition-all" 
                  />
                </Link>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[9px] font-mono text-theme-gray-400">
                  {grid1Lead.category && <span className="font-bold text-theme-blue uppercase">{grid1Lead.category.name}</span>}
                  <span>{new Date(grid1Lead.published_at).toLocaleDateString()}</span>
                </div>
                <Link href={`/a/${grid1Lead.slug}`} className="hover:text-theme-blue transition-colors">
                  <h4 className="serif-title text-lg font-bold uppercase text-theme-black leading-snug line-clamp-2">
                    {grid1Lead.title}
                  </h4>
                </Link>
                <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-2">
                  {grid1Lead.subtitle}
                </p>
                <Link href={`/a/${grid1Lead.slug}`} className="text-theme-blue text-[10px] font-mono font-bold uppercase mt-2">
                  {t.readMore[language]}
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col divide-y divide-theme-gray-100 mt-4">
            {grid1List.map((art) => (
              <div key={art.id} className="py-2.5 flex gap-3 group items-center">
                {art.cover_image && (
                  <Link href={`/a/${art.slug}`} className="w-12 h-12 shrink-0 border border-theme-blue-deep/10 rounded overflow-hidden">
                    <img src={getMediaUrl(art.cover_image)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105" />
                  </Link>
                )}
                <div className="flex-grow min-w-0">
                  <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors font-sans text-xs font-semibold text-theme-black line-clamp-2">
                    {art.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Column 2: Configured Category B (e.g. Business/Nature) */}
        <div className="lg:col-span-4 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-theme-blue-deep/30 pb-6 lg:pb-0 lg:pr-8">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue pb-2.5 border-b border-theme-blue-deep">
            GRID // BUSINESS & LOGISTICS
          </h3>

          {grid2Lead && (
            <div className="flex flex-col gap-3 group">
              {grid2Lead.cover_image && (
                <Link href={`/a/${grid2Lead.slug}`} className="block overflow-hidden border border-theme-blue-deep/20 rounded">
                  <img 
                    src={getMediaUrl(grid2Lead.cover_image)} 
                    alt={grid2Lead.title} 
                    className="w-full aspect-[16/10] object-cover group-hover:scale-101 transition-all" 
                  />
                </Link>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[9px] font-mono text-theme-gray-400">
                  {grid2Lead.category && <span className="font-bold text-theme-blue uppercase">{grid2Lead.category.name}</span>}
                  <span>{new Date(grid2Lead.published_at).toLocaleDateString()}</span>
                </div>
                <Link href={`/a/${grid2Lead.slug}`} className="hover:text-theme-blue transition-colors">
                  <h4 className="serif-title text-lg font-bold uppercase text-theme-black leading-snug line-clamp-2">
                    {grid2Lead.title}
                  </h4>
                </Link>
                <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-2">
                  {grid2Lead.subtitle}
                </p>
                <Link href={`/a/${grid2Lead.slug}`} className="text-theme-blue text-[10px] font-mono font-bold uppercase mt-2">
                  {t.readMore[language]}
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col divide-y divide-theme-gray-100 mt-4">
            {grid2List.map((art) => (
              <div key={art.id} className="py-2.5 flex gap-3 group items-center">
                {art.cover_image && (
                  <Link href={`/a/${art.slug}`} className="w-12 h-12 shrink-0 border border-theme-blue-deep/10 rounded overflow-hidden">
                    <img src={getMediaUrl(art.cover_image)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105" />
                  </Link>
                )}
                <div className="flex-grow min-w-0">
                  <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors font-sans text-xs font-semibold text-theme-black line-clamp-2">
                    {art.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Stack of 3 Ads (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6 items-center">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue pb-2.5 border-b border-theme-blue-deep w-full text-center lg:text-left">
            OFFICIAL CAMPAIGNS
          </h3>
          <div className="flex flex-col gap-4 w-full justify-center">
            <AdSpace placement="grid_sidebar_stack_1" />
            <AdSpace placement="grid_sidebar_stack_2" />
            <AdSpace placement="grid_sidebar_stack_3" />
          </div>
        </div>
      </section>

      {/* =======================================================================
          SECTION 9: SPORTS VERTICAL
          ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b border-theme-blue-deep">
        {/* Left Column (Sports articles - lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-theme-blue-deep/30 pb-6 lg:pb-0 lg:pr-8">
          <div className="flex items-center justify-between border-b border-theme-blue-deep/30 pb-3">
            <span className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue">
              {t.sportsVertical[language]}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displaySports.slice(0, 4).map((art) => (
              <div key={art.id} className="flex flex-col justify-between border border-theme-gray-100 hover:border-theme-blue p-4 rounded-md bg-white transition-all group">
                <div>
                  {art.cover_image && (
                    <Link href={`/a/${art.slug}`} className="block overflow-hidden rounded mb-3 border border-theme-blue-deep/10">
                      <img 
                        src={getMediaUrl(art.cover_image)} 
                        alt={art.title} 
                        className="w-full aspect-[16/10] object-cover group-hover:scale-101 transition-all" 
                      />
                    </Link>
                  )}
                  <span className="text-[8px] text-theme-gray-400 font-mono block mb-1">
                    {new Date(art.published_at).toLocaleDateString()}
                  </span>
                  <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors">
                    <h4 className="serif-title text-base font-extrabold uppercase text-theme-black leading-snug line-clamp-2">
                      {art.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-theme-gray-400 font-sans leading-relaxed mt-1 line-clamp-2">
                    {art.subtitle}
                  </p>
                </div>
                <Link href={`/a/${art.slug}`} className="text-theme-blue text-[10px] font-mono font-bold uppercase mt-4 block">
                  {t.readMore[language]}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Sports Ad - lg:col-span-4) */}
        <div className="lg:col-span-4 flex justify-center items-start">
          <AdSpace placement="sports_sidebar" />
        </div>
      </section>

      {/* Full width ad 3 */}
      <div className="flex justify-center py-2">
        <AdSpace placement="full_width_3" />
      </div>

      {/* =======================================================================
          SECTION 10: FEATURED POSTS ROW (second instance)
          ======================================================================= */}
      <section className="bg-theme-light-gray/40 border border-theme-gray-100 rounded-md p-6 text-theme-black shadow-sm">
        <div className="flex items-center border-b border-theme-gray-100 pb-3 mb-6">
          <span className="px-3 py-1 bg-theme-blue text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
            {t.featuredPostsSec[language]}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Lead story (lg:col-span-8) */}
          {featuredSecLead && (
            <div className="lg:col-span-8 flex flex-col md:flex-row gap-6 border-b lg:border-b-0 lg:border-r border-theme-gray-100 pb-6 lg:pb-0 lg:pr-8 group">
              {featuredSecLead.cover_image && (
                <Link href={`/a/${featuredSecLead.slug}`} className="block overflow-hidden border border-theme-gray-100 rounded w-full md:w-1/2 shrink-0">
                  <img 
                    src={getMediaUrl(featuredSecLead.cover_image)} 
                    alt={featuredSecLead.title} 
                    className="w-full aspect-[16/10] md:h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                </Link>
              )}
              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {featuredSecLead.category && (
                      <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-widest">
                        {featuredSecLead.category.name}
                      </span>
                    )}
                    <span className="text-[9px] text-theme-gray-400 font-mono">
                      {new Date(featuredSecLead.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link href={`/a/${featuredSecLead.slug}`} className="hover:text-theme-blue transition-colors">
                    <h3 className="serif-title text-2xl font-bold uppercase text-theme-black leading-tight group-hover:text-theme-blue transition-colors">
                      {featuredSecLead.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-3">
                    {featuredSecLead.subtitle}
                  </p>
                </div>
                <Link href={`/a/${featuredSecLead.slug}`} className="text-theme-blue text-xs font-mono font-bold uppercase mt-4 block hover:underline">
                  {t.readMore[language]}
                </Link>
              </div>
            </div>
          )}

          {/* Right vertical list (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col divide-y divide-theme-gray-100">
            {featuredSecList.map((art) => (
              <div key={art.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 group items-center hover:bg-white px-2 rounded transition-all duration-200">
                {art.cover_image && (
                  <Link href={`/a/${art.slug}`} className="w-12 h-12 shrink-0 border border-theme-gray-100 rounded overflow-hidden">
                    <img src={getMediaUrl(art.cover_image)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </Link>
                )}
                <div className="flex-grow min-w-0">
                  <Link href={`/a/${art.slug}`} className="hover:text-theme-blue transition-colors font-sans text-xs font-semibold text-theme-black line-clamp-2">
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

      {/* =======================================================================
          SECTION 11: FLYERS ROW
          ======================================================================= */}
      <section className="flex flex-col gap-4 py-8 border-b border-theme-blue-deep">
        <h3 className="font-mono text-xs font-black uppercase tracking-widest text-theme-blue text-center pb-2.5 border-b border-theme-blue-deep">
          LOCAL PARTNER FLYERS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
          <AdSpace placement="flyer_1" />
          <AdSpace placement="flyer_2" />
          <AdSpace placement="flyer_3" />
        </div>
      </section>

      {/* =======================================================================
          SECTION 12: "YOU MISSED" RAIL
          ======================================================================= */}
      <section className="bg-theme-light-gray/40 border border-theme-gray-100 rounded-md p-6 text-theme-black shadow-sm">
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
                  <div className="relative aspect-[16/10] overflow-hidden rounded mb-3 border border-theme-gray-100">
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

      {/* Bottom leaderboard banner ad */}
      <div className="flex justify-center py-2">
        <AdSpace placement="full_width_4" />
      </div>

    </div>
  );
}
