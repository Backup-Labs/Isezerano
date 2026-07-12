"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Terminal, Send } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const Footer: React.FC = () => {
  const { siteSettings } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/newsletter/subscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setEmail('');
        setSubStatus('success');
      } else {
        setSubStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSubStatus('error');
    }
  };

  const socialLinks = [
    { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>, 
      url: siteSettings?.facebook_url || '#' 
    },
    { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, 
      url: siteSettings?.twitter_url || '#' 
    },
    { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, 
      url: siteSettings?.instagram_url || '#' 
    },
    { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, 
      url: siteSettings?.youtube_url || '#' 
    },
  ];

  return (
    <footer className="w-full bg-theme-black border-t border-white/5 mt-auto pt-16 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand Info */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Terminal className="w-6 h-6 text-theme-blue" />
            <span className="font-mono text-xl font-bold tracking-tighter text-white uppercase">
              THE<span className="text-theme-blue">.</span>PULSE
            </span>
          </Link>
          <p className="text-sm text-theme-gray-400 leading-relaxed">
            Next-generation digital journalism focusing on the bleeding edges of quantum computing, high-frontier aerospace, synthetic biology, and network culture.
          </p>
          <div className="flex items-center gap-4 mt-2">
            {socialLinks.map((social, idx) => (
              <a 
                key={idx} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-theme-gray-400 flex items-center justify-center hover:bg-theme-blue/10 hover:text-theme-blue hover:border-theme-blue/30 transition-all"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Categories list */}
        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white mb-6">Channels</h4>
          <ul className="flex flex-col gap-3.5 text-sm text-theme-gray-400">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/c/${cat.slug}`} className="hover:text-theme-blue transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Pages */}
        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white mb-6">Directives</h4>
          <ul className="flex flex-col gap-3.5 text-sm text-theme-gray-400">
            <li><Link href="/about" className="hover:text-theme-blue transition-colors">About Mission</Link></li>
            <li><Link href="/advertise" className="hover:text-theme-blue transition-colors">Sponsorship Kit</Link></li>
            <li><Link href="/privacy" className="hover:text-theme-blue transition-colors">Data Privacy Protocols</Link></li>
            <li><Link href="/terms" className="hover:text-theme-blue transition-colors">Terms of Operations</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white mb-6">Sychronize Feeds</h4>
          <p className="text-sm text-theme-gray-400">
            Subscribe to our weekly dispatch of high-frequency editorial alerts delivered straight to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 mt-2">
            <input 
              type="email" 
              placeholder="operator@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow glass-panel px-4 py-2 rounded-xl text-sm text-white placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue/60"
              required
            />
            <button 
              type="submit" 
              className="p-3 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_12px_rgba(47,109,246,0.3)] text-white rounded-xl transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {subStatus === 'success' && (
            <span className="text-xs text-green-400 font-semibold font-mono">✓ Synchronization active. Welcome.</span>
          )}
          {subStatus === 'error' && (
            <span className="text-xs text-red-400 font-semibold font-mono">✕ Connection timeout. Try again.</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 text-center md:flex md:justify-between md:items-center text-xs text-theme-gray-400">
        <span className="font-mono uppercase tracking-wider">
          {siteSettings?.footer_text || "© 2026 THE PULSE. Glassmorphic Editorial Networks."}
        </span>
        <span className="block mt-2 md:mt-0 font-mono text-[10px]">
          ENCRYPTED TRANSMISSION // CORE_v1.0.4
        </span>
      </div>
    </footer>
  );
};
