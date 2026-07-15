"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Bookmark, LogIn, LogOut, Menu, X } from 'lucide-react';
import { AdSpace } from './AdSpace';

interface Category {
  id: number;
  name: string;
  slug: string;
  color_accent: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  published_at: string;
}

export const Navbar: React.FC = () => {
  const { user, logout, bookmarks, language, setLanguage } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    // Client-side date generation
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch(API_BASE_URL + '/api/v1/categories/');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    // Fetch latest articles for ticker
    const fetchLatestArticles = async () => {
      try {
        const res = await fetch(API_BASE_URL + '/api/v1/articles/?limit=5');
        if (res.ok) {
          const data = await res.json();
          const articles = Array.isArray(data) ? data : (data.results || []);
          setLatestArticles(articles);
        }
      } catch (err) {
        console.error("Failed to load ticker articles", err);
      }
    };

    fetchCategories();
    fetchLatestArticles();
  }, []);

  // Ticker rotation
  useEffect(() => {
    if (latestArticles.length <= 1) return;
    const timer = setInterval(() => {
      setTickerIndex((prevIndex) => (prevIndex + 1) % latestArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [latestArticles]);

  const activeArticle = latestArticles[tickerIndex];

  // Translations
  const t = {
    latestStory: {
      RW: 'INKURU ZIHERUKA',
      EN: 'LATEST STORY',
      FR: 'DERNIÈRE HEURE'
    },
    login: {
      RW: 'Kwinjira',
      EN: 'Login',
      FR: 'Connexion'
    },
    console: {
      RW: 'Console',
      EN: 'Console',
      FR: 'Console'
    },
    latestNews: {
      RW: 'Inkuru nshya',
      EN: 'Latest News',
      FR: 'Actualités'
    }
  };

  return (
    <header className="w-full bg-theme-white text-theme-black z-50 relative border-b border-theme-gray-100 shadow-sm">
      {/* ================= ROW 1: Logo, Ad, Socials + Phone (White-Gray Background) ================= */}
      <div className="w-full bg-theme-light-gray border-b border-theme-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex flex-col items-center md:items-start group shrink-0 select-none">
            <h1 className="serif-title text-4xl sm:text-5xl font-black uppercase tracking-tight text-theme-black group-hover:text-theme-blue transition-colors leading-none">
              ISEZERANO
            </h1>
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-theme-gray-400 block mt-1">
              Isezerano.com
            </span>
          </Link>

          {/* Center: Leaderboard Ad */}
          <div className="w-full max-w-[728px] lg:max-w-[970px] overflow-hidden flex justify-center">
            <AdSpace placement="header_banner" />
          </div>

          {/* Right: Phone & Socials */}
          <div className="flex flex-col items-center md:items-end gap-1.5 shrink-0">
            <a 
              href="tel:+250788000000" 
              className="text-xs font-mono font-bold text-theme-black hover:text-theme-blue transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-theme-blue fill-current" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.28 1.11l-2.2 2.2z" />
              </svg>
              <span>+250 788 000 000</span>
            </a>
            <div className="flex items-center gap-3 text-theme-gray-400">
              <a href="#" className="hover:text-theme-blue transition-colors" title="Facebook">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href="#" className="hover:text-theme-blue transition-colors" title="Twitter/X">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="hover:text-theme-blue transition-colors" title="Instagram">
                <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="hover:text-theme-blue transition-colors" title="TikTok">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .77.1v-3.5a6.39 6.39 0 0 0-3.08.77 6.4 6.4 0 0 0-3.32 5.59 6.4 6.4 0 0 0 10.9 4.54 6.4 6.4 0 0 0 4.63-6.27V9a8.27 8.27 0 0 0 4.14 1.2V6.69z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROW 2: Primary Nav Menu & Language Switcher (Pure White Background) ================= */}
      <div className="bg-theme-white text-theme-black border-b border-theme-gray-100 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
                pathname === '/' ? 'text-theme-blue' : 'text-theme-black hover:text-theme-blue'
              }`}
            >
              {t.latestNews[language]}
            </Link>
            {categories.map((cat) => {
              const isActive = pathname === `/c/${cat.slug}`;
              return (
                <Link 
                  key={cat.id} 
                  href={`/c/${cat.slug}`}
                  className={`text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
                    isActive ? 'text-theme-blue' : 'text-theme-black hover:text-theme-blue'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 border border-theme-gray-100 rounded text-theme-black cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Right Section: Language Switcher & Bookmarks */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-theme-light-gray border border-theme-gray-100 p-0.5 rounded gap-0.5">
              {(['RW', 'EN', 'FR'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 font-mono text-[9px] font-bold rounded transition-all cursor-pointer ${
                    language === lang 
                      ? 'bg-theme-blue text-white shadow' 
                      : 'bg-transparent text-theme-gray-400 hover:text-theme-black'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Quick Actions (Bookmarks & Auth) */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                href="/bookmarks" 
                className="p-2 border border-theme-gray-100 hover:bg-theme-light-gray transition-all rounded relative text-theme-black"
                title="Reading List"
              >
                <Bookmark className="w-4 h-4" />
                {bookmarks.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-theme-blue text-white text-[9px] font-bold flex items-center justify-center">
                    {bookmarks.length}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  {user.role !== 'reader' && (
                    <Link 
                      href="/newsroom" 
                      className="px-3 py-1.5 border border-theme-blue text-xs font-mono font-bold uppercase tracking-wider text-theme-blue hover:bg-theme-blue hover:text-white transition-all rounded"
                    >
                      {t.console[language]}
                    </Link>
                  )}
                  <button 
                    onClick={logout}
                    className="p-2 border border-theme-gray-100 hover:bg-red-500/10 hover:text-red-500 transition-all rounded text-theme-black cursor-pointer"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="px-4 py-1.5 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono text-xs uppercase font-bold tracking-widest transition-all rounded"
                >
                  {t.login[language]}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROW 3: Latest Story Ticker (Blue Ribbon) ================= */}
      <div className="w-full bg-theme-dark-blue py-2.5 px-4 md:px-8 text-white shadow-inner select-none">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="px-2.5 py-0.5 bg-white text-theme-blue text-[9px] font-mono font-bold uppercase tracking-widest shrink-0 shadow-sm animate-pulse rounded-sm">
            {t.latestStory[language]}
          </div>

          <div className="grow overflow-hidden h-5 relative flex items-center">
            {activeArticle ? (
              <Link 
                href={`/a/${activeArticle.slug}`}
                className="font-mono text-xs text-white hover:text-white/80 hover:underline transition-all tracking-wider line-clamp-1 block"
                key={activeArticle.id}
              >
                {activeArticle.title}
              </Link>
            ) : (
              <span className="font-mono text-xs text-white/60">Loading dispatches...</span>
            )}
          </div>

          <div className="hidden sm:block text-[10px] font-mono text-white/60">
            {currentDate}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-theme-gray-100 bg-theme-white px-4 py-6 flex flex-col gap-6 font-mono text-xs uppercase tracking-widest text-theme-black">
          <div className="flex flex-col gap-4 border-b border-theme-gray-100 pb-6">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`font-bold ${pathname === '/' ? 'text-theme-blue' : 'text-theme-black'}`}
            >
              {t.latestNews[language]}
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/c/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-bold ${pathname === `/c/${cat.slug}` ? 'text-theme-blue' : 'text-theme-black'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Link 
              href="/bookmarks" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-bold text-theme-black hover:text-theme-blue"
            >
              <Bookmark className="w-4 h-4 text-theme-blue" />
              <span>Bookmarks ({bookmarks.length})</span>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                {user.role !== 'reader' && (
                  <Link 
                    href="/newsroom"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1 border border-theme-blue text-theme-blue font-bold rounded"
                  >
                    {t.console[language]}
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 border border-red-500/20 text-red-500 font-bold rounded cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 bg-theme-blue text-white font-bold text-center w-full rounded"
              >
                {t.login[language]}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
