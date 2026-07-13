"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { 
  LayoutGrid, BookOpen, Layers, Megaphone, 
  MessageSquare, Settings, LogOut, Globe, Notebook 
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
        <span className="font-mono text-xs tracking-widest text-theme-gray-400 font-bold uppercase">LOADING NEWSROOM...</span>
      </div>
    );
  }

  const sidebarLinks = [
    { name: 'Dashboard Analytics', icon: <LayoutGrid className="w-4 h-4" />, href: '/newsroom' },
    { name: 'Manage Articles', icon: <BookOpen className="w-4 h-4" />, href: '/newsroom/articles' },
    { name: 'Homepage Layout', icon: <Layers className="w-4 h-4" />, href: '/newsroom/homepage', roles: ['editor', 'admin'] },
    { name: 'Ad Campaigns', icon: <Megaphone className="w-4 h-4" />, href: '/newsroom/ads', roles: ['admin'] },
    { name: 'Moderate Comments', icon: <MessageSquare className="w-4 h-4" />, href: '/newsroom/comments', roles: ['editor', 'admin'] },
    { name: 'General Settings', icon: <Settings className="w-4 h-4" />, href: '/newsroom/settings', roles: ['admin'] },
  ];

  const allowedLinks = sidebarLinks.filter(
    link => !link.roles || link.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-theme-black text-theme-light-gray flex flex-col md:flex-row">
      {/* Sidebar Frame */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-theme-gray-100 bg-theme-charcoal/20 flex flex-col justify-between shrink-0 p-6">
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2 pb-4 border-b border-theme-gray-100">
            <Notebook className="w-5 h-5 text-theme-blue" />
            <span className="serif-title text-xl font-bold tracking-tight text-theme-light-gray uppercase">
              NEWSROOM
            </span>
          </div>

          {/* User details summary */}
          <div className="border border-theme-blue-deep p-4 flex flex-col gap-1 bg-theme-charcoal/40">
            <div className="text-xs font-bold text-theme-light-gray font-mono uppercase">{user.first_name || user.username}</div>
            <div className="text-[9px] text-theme-blue font-mono font-bold uppercase tracking-wider">Role: {user.role}</div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {allowedLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-theme-gray-400 hover:text-theme-blue hover:bg-theme-charcoal/60 transition-all border border-transparent hover:border-theme-blue-deep"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 mt-8 pt-4 border-t border-theme-gray-100">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-theme-gray-400 hover:text-theme-blue transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>View Public Site</span>
          </Link>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 hover:text-red-800 transition-all cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content frame */}
      <main className="flex-grow p-6 md:p-10 max-h-screen overflow-y-auto bg-theme-black text-theme-light-gray">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
