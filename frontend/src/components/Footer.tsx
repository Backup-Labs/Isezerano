"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Send } from 'lucide-react';

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

  return (
    <footer id="newsletter-signup" className="w-full bg-[#FAF8F6] border-t border-[#262626] mt-12 text-[#161616]">
      {/* 1. Newsletter Form Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-b border-[#262626] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <h3 className="serif-title text-2xl md:text-3xl font-bold uppercase tracking-tight">
            Subscribe to our newsletter
          </h3>
          <p className="text-xs text-[#666] font-mono uppercase tracking-wider">
            Receive morning editions and daily editorial updates.
          </p>
        </div>
        
        <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2 max-w-md shrink-0">
          <input 
            type="email"
            placeholder="ENTER YOUR EMAIL..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full md:w-64 bg-transparent border border-theme-blue-deep px-4 py-2.5 text-xs font-mono placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue text-theme-light-gray"
            required
          />
          <button 
            type="submit"
            className="px-5 py-3 bg-theme-blue-deep hover:bg-theme-blue text-theme-black font-mono text-xs uppercase font-bold tracking-widest transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Subscribe</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 2. Secondary Marquee News Ticker */}
      <div className="w-full border-b border-theme-blue-deep py-2.5 overflow-hidden bg-theme-charcoal">
        <div className="animate-marquee flex items-center gap-16 font-mono text-[10px] tracking-widest text-theme-light-gray font-bold uppercase">
          <span>THE PULSE GAZETTE</span>
          <span>•</span>
          <span>LATEST STORIES • GLOBAL BUSINESS TRENDS • NATURE CONSERVATION REPORTS • URBAN CULTURE NEWS</span>
          <span>•</span>
          <span>THE PULSE GAZETTE</span>
          <span>•</span>
          <span>LATEST STORIES • GLOBAL BUSINESS TRENDS • NATURE CONSERVATION REPORTS • URBAN CULTURE NEWS</span>
        </div>
      </div>

      {/* 3. Grid Columns */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Column 1: Brand Info */}
        <div className="flex flex-col gap-4">
          <h2 className="serif-title text-3xl font-black uppercase tracking-tighter">THE PULSE</h2>
          <p className="text-xs leading-relaxed text-theme-gray-400">
            Elegant newspaper layouts reinterpreting digital headlines with classic print density.
          </p>
        </div>

        {/* Column 2: Channels */}
        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-theme-light-gray mb-6">Channels</h4>
          <ul className="flex flex-col gap-3 text-xs font-mono uppercase tracking-wider text-theme-gray-400">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/c/${cat.slug}`} className="hover:text-theme-blue transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Site Navigation */}
        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-theme-light-gray mb-6">Navigation</h4>
          <ul className="flex flex-col gap-3 text-xs font-mono uppercase tracking-wider text-theme-gray-400">
            <li><Link href="/" className="hover:text-theme-blue transition-colors">Homepage</Link></li>
            <li><Link href="/bookmarks" className="hover:text-theme-blue transition-colors">Saved Articles</Link></li>
            <li><Link href="/login" className="hover:text-theme-blue transition-colors">Staff Portal</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact / Office */}
        <div className="flex flex-col gap-4 text-xs text-[#666]">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#161616]">Headquarters</h4>
          <p className="leading-relaxed">
            Metropolis Hub Center, Suite 104<br />
            New York, NY 10001
          </p>
          <p className="font-mono">
            TEL: +1 (555) 238-1990<br />
            MAIL: newsroom@thepulse.com
          </p>
        </div>
      </div>

      {/* 4. Bottom copyright */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#666] tracking-widest uppercase gap-4">
        <span>© {new Date().getFullYear()} The Pulse. All Rights Reserved.</span>
        <span>{siteSettings?.footer_text || "Powered by Webflow & Next.js Core."}</span>
      </div>
    </footer>
  );
};
