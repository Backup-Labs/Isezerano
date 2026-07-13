"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Bookmark, LogIn, LogOut, LayoutGrid, Menu, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  color_accent: string;
}

export const Navbar: React.FC = () => {
  const { user, logout, bookmarks } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Generate date client-side only to prevent hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

    const fetchCategories = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/categories/');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header className="w-full bg-[#FAF8F6] border-b border-[#262626]">
      {/* 1. Newspaper Top Metadata Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-1.5 border-b border-[#262626] flex items-center justify-between text-[10px] font-mono tracking-widest text-[#666] uppercase">
        <div className="hidden sm:block">{currentDate || 'MONDAY, JULY 13, 2026'}</div>
        <div className="text-center mx-auto sm:mx-0">THE DIGITAL EDITION // VOL. II // ISSUE IX</div>
        <div className="hidden sm:block">PRICE $2.50</div>
      </div>

      {/* 2. Main Large Centered Serif Logo (Masthead) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 border-b border-[#262626] flex items-center justify-between">
        {/* Empty left block to center the logo on desktop */}
        <div className="w-24 hidden md:block"></div>

        {/* Logo */}
        <Link href="/" className="mx-auto text-center group">
          <h1 className="serif-title text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#161616] group-hover:text-theme-blue transition-colors leading-none">
            THE PULSE
          </h1>
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#666] block mt-1">
            Your daily source of independent journalism
          </span>
        </Link>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 border border-[#262626] rounded text-[#161616] cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Quick Action links (Desktop right side) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Bookmarks */}
          <Link 
            href="/bookmarks" 
            className="p-2 border border-[#262626] hover:bg-theme-charcoal/10 transition-all rounded relative text-[#161616]"
            title="Reading List"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-theme-blue text-white text-[9px] font-bold flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </Link>

          {/* User Session details */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role !== 'reader' && (
                <Link 
                  href="/newsroom" 
                  className="px-3 py-1.5 border border-[#262626] text-xs font-mono font-bold uppercase tracking-wider text-[#161616] hover:bg-theme-blue hover:text-[#FAF8F6] hover:border-theme-blue transition-all"
                >
                  Console
                </Link>
              )}
              <button 
                onClick={logout}
                className="p-2 border border-[#262626] hover:bg-red-500/10 hover:text-red-500 transition-all rounded text-[#161616] cursor-pointer"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-4 py-1.5 bg-[#161616] hover:bg-theme-blue text-[#FAF8F6] font-mono text-xs uppercase font-bold tracking-widest transition-all"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* 3. Horizontal Navigation Links bar */}
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Categories Rail */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={`text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
              pathname === '/' ? 'text-theme-blue' : 'text-[#161616] hover:text-theme-blue'
            }`}
          >
            Latest News
          </Link>
          {categories.map((cat) => {
            const isActive = pathname === `/c/${cat.slug}`;
            return (
              <Link 
                key={cat.id} 
                href={`/c/${cat.slug}`}
                className={`text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
                  isActive ? 'text-theme-blue' : 'text-[#161616] hover:text-theme-blue'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Subscribe banner trigger (Desktop right) */}
        <div className="hidden md:block">
          <a 
            href="#newsletter-signup"
            className="px-4 py-1.5 bg-[#161616] hover:bg-theme-blue text-[#FAF8F6] font-mono text-xs uppercase font-bold tracking-widest transition-all"
          >
            Subscribe
          </a>
        </div>
      </nav>

      {/* Mobile menu block */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#262626] bg-[#FAF8F6] px-4 py-6 flex flex-col gap-6 font-mono text-xs uppercase tracking-widest">
          <div className="flex flex-col gap-4 border-b border-[#262626] pb-6">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`font-bold ${pathname === '/' ? 'text-theme-blue' : 'text-[#161616]'}`}
            >
              Latest News
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/c/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-bold ${pathname === `/c/${cat.slug}` ? 'text-theme-blue' : 'text-[#161616]'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/bookmarks" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-bold text-[#161616]"
            >
              <Bookmark className="w-4 h-4" />
              <span>Bookmarks ({bookmarks.length})</span>
            </Link>
            
            {user ? (
              <>
                {user.role !== 'reader' && (
                  <Link 
                    href="/newsroom"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1 border border-[#262626] font-bold"
                  >
                    Console
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 border border-red-500/20 text-red-500 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-1.5 bg-[#161616] text-[#FAF8F6] font-bold text-center w-full"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
