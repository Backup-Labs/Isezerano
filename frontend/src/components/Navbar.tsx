"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Sun, Moon, Bookmark, LogIn, LogOut, LayoutGrid, Terminal } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  color_accent: string;
}

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, user, logout, bookmarks } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();

  useEffect(() => {
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
    <header className="sticky top-0 z-50 w-full px-4 py-3 md:px-8">
      <nav className="glass-panel w-full max-w-7xl mx-auto rounded-2xl px-6 py-4 flex items-center justify-between transition-all duration-300">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Terminal className="w-6 h-6 text-theme-blue animate-pulse" />
          <span className="font-mono text-xl font-bold tracking-tighter text-white uppercase group-hover:text-theme-blue transition-colors">
            THE<span className="text-theme-blue">.</span>PULSE
          </span>
        </Link>

        {/* Categories Rail */}
        <div className="hidden md:flex items-center gap-6">
          {categories.map((cat) => {
            const isActive = pathname === `/c/${cat.slug}`;
            return (
              <Link 
                key={cat.id} 
                href={`/c/${cat.slug}`}
                className={`text-sm font-semibold transition-all hover:text-white relative py-1 ${
                  isActive ? 'text-white font-bold' : 'text-theme-gray-400'
                }`}
              >
                {cat.name}
                <span 
                  className="absolute bottom-0 left-0 w-full h-[2px] rounded-full scale-x-0 transition-transform origin-left hover:scale-x-100 duration-300"
                  style={{ 
                    backgroundColor: cat.color_accent,
                    transform: isActive ? 'scale-x-100' : undefined 
                  }}
                />
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Bookmark Counter */}
          <Link href="/bookmarks" className="relative p-2 rounded-lg text-theme-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Bookmark className="w-5 h-5" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-theme-blue text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {bookmarks.length}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-theme-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Auth Session / Console Access */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <span className="hidden sm:inline text-xs font-mono text-theme-gray-400">
                {user.first_name || user.username}
              </span>
              
              {/* If staff, show Newsroom Link */}
              {user.role !== 'reader' && (
                <Link 
                  href="/newsroom" 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-blue/10 border border-theme-blue/40 text-theme-blue hover:bg-theme-blue/20 rounded-lg text-xs font-semibold tracking-wide transition-all"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Console
                </Link>
              )}
              
              <button 
                onClick={logout}
                className="p-2 rounded-lg text-theme-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-1.5 px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_15px_rgba(47,109,246,0.4)] text-white rounded-xl text-sm font-semibold transition-all"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
