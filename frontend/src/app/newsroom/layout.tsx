"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { 
  LayoutGrid, BookOpen, Layers, Megaphone, 
  MessageSquare, Settings, LogOut, Globe, Terminal 
} from 'lucide-react';

export default function NewsroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role === 'reader') {
        router.push('/login');
      }
    }
  }, [user, loading]);

  if (loading || !user || user.role === 'reader') {
    return (
      <div className="min-h-screen bg-theme-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-r-2 border-theme-blue rounded-full animate-spin mb-4" />
        <span className="font-mono text-sm tracking-wider text-theme-gray-400 font-semibold uppercase">Securing Console Corridor...</span>
      </div>
    );
  }

  const sidebarLinks = [
    { name: 'Analytics Board', icon: <LayoutGrid className="w-4 h-4" />, href: '/newsroom' },
    { name: 'Articles Manager', icon: <BookOpen className="w-4 h-4" />, href: '/newsroom/articles' },
    { name: 'Homepage Builder', icon: <Layers className="w-4 h-4" />, href: '/newsroom/homepage', roles: ['editor', 'admin'] },
    { name: 'Ad slots manager', icon: <Megaphone className="w-4 h-4" />, href: '/newsroom/ads', roles: ['admin'] },
    { name: 'Comments moderator', icon: <MessageSquare className="w-4 h-4" />, href: '/newsroom/comments', roles: ['editor', 'admin'] },
    { name: 'Site Configurations', icon: <Settings className="w-4 h-4" />, href: '/newsroom/settings', roles: ['admin'] },
  ];

  const allowedLinks = sidebarLinks.filter(
    link => !link.roles || link.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-theme-black text-white flex flex-col md:flex-row">
      {/* Sidebar Frame */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-theme-charcoal/30 flex flex-col justify-between shrink-0 p-6">
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Terminal className="w-6 h-6 text-theme-blue" />
            <span className="font-mono text-lg font-bold tracking-tight text-white uppercase">
              NEWSROOM<span className="text-theme-blue">.</span>HUD
            </span>
          </div>

          {/* User details summary */}
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-1">
            <div className="text-sm font-bold text-white font-mono uppercase">{user.first_name || user.username}</div>
            <div className="text-[10px] text-theme-blue font-mono font-bold uppercase tracking-wider">{user.role} console active</div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {allowedLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-theme-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 mt-8 pt-4 border-t border-white/5">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-theme-gray-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Public Main Grid</span>
          </Link>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Console</span>
          </button>
        </div>
      </aside>

      {/* Main Content frame */}
      <main className="flex-grow p-6 md:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
