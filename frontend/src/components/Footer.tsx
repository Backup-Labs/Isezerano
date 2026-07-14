"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Send } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  published_at: string;
  cover_image: string | null;
}

export const Footer: React.FC = () => {
  const { siteSettings, language } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [recentPosts, setRecentPosts] = useState<Article[]>([]);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes, artRes] = await Promise.all([
          fetch(API_BASE_URL + '/api/v1/categories/'),
          fetch(API_BASE_URL + '/api/v1/tags/'),
          fetch(API_BASE_URL + '/api/v1/articles/?limit=3')
        ]);
        
        if (catRes.ok) setCategories(await catRes.json());
        if (tagRes.ok) setTags(await tagRes.json());
        if (artRes.ok) {
          const data = await artRes.json();
          setRecentPosts(Array.isArray(data) ? data : (data.results || []));
        }
      } catch (err) {
        console.error("Failed to load footer data", err);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/newsletter/subscribe/', {
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

  const getMediaUrl = (path: string | null) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  };

  // Translations
  const t = {
    newsletterTitle: {
      RW: 'Iyandikishe ku makuru yacu',
      EN: 'Subscribe to our newsletter',
      FR: 'Abonnez-vous à notre newsletter'
    },
    newsletterDesc: {
      RW: 'Yakira amakuru mu gitondo n’ubusesenguzi bugezweho.',
      EN: 'Receive morning editions and daily editorial updates.',
      FR: 'Recevez les éditions du matin et les mises à jour éditoriales quotidiennes.'
    },
    subscribeBtn: {
      RW: 'Iyandikishe',
      EN: 'Subscribe',
      FR: "S'abonner"
    },
    aboutTitle: {
      RW: 'Ibitwerekeye',
      EN: 'About Us',
      FR: 'À propos de nous'
    },
    aboutDesc: {
      RW: 'Isezerano.com ni ikinyamakuru gikorera mu mucyo kigamije kugeza ku banyarwanda amakuru yizewe, imikino, ubucuruzi ndetse n’iyobokamana.',
      EN: 'Isezerano.com is an independent news portal delivering reliable reporting, sports updates, business insights, and faith-inspired content to Rwanda.',
      FR: 'Isezerano.com est un portail indépendant offrant des informations fiables, du sport, de l’économie et du contenu confessionnel au Rwanda.'
    },
    getQuote: {
      RW: 'Habwa quotes / Serivisi',
      EN: 'Get a Quote',
      FR: 'Demander un devis'
    },
    linksTitle: {
      RW: 'Imirongo Ifite Akamaro',
      EN: 'Useful Links',
      FR: 'Liens Utiles'
    },
    tagsTitle: {
      RW: 'Ibipimo Bikunzwe',
      EN: 'Tag Cloud',
      FR: 'Mots-clés'
    },
    recentTitle: {
      RW: 'Inkuru Nshya',
      EN: 'Recent Posts',
      FR: 'Articles Récents'
    }
  };

  return (
    <footer className="w-full bg-theme-light-gray border-t border-theme-gray-100 mt-16 text-theme-black select-none">
      {/* 1. Newsletter Form Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-b border-theme-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <h3 className="serif-title text-2xl md:text-3xl font-bold uppercase tracking-tight text-theme-black">
            {t.newsletterTitle[language]}
          </h3>
          <p className="text-xs text-theme-gray-400 font-mono uppercase tracking-wider">
            {t.newsletterDesc[language]}
          </p>
        </div>
        
        <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2 max-w-md shrink-0">
          <input 
            type="email"
            placeholder="ENTER YOUR EMAIL..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full md:w-64 bg-white border border-theme-gray-100 px-4 py-2.5 text-xs font-mono placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue text-theme-black"
            required
          />
          <button 
            type="submit"
            className="px-5 py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono text-xs uppercase font-bold tracking-widest transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>{t.subscribeBtn[language]}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 2. Grid Columns */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-theme-gray-100">
        {/* Column 1: About Us & Get a Quote */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-theme-blue border-b border-theme-gray-100 pb-2">
            {t.aboutTitle[language]}
          </h4>
          <p className="text-xs leading-relaxed text-theme-gray-400 font-sans">
            {t.aboutDesc[language]}
          </p>
          <a 
            href="mailto:ads@isezerano.com?subject=Ad%20Packages%20/%20Web%20Services%20Inquiry"
            className="px-4 py-2.5 mt-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-widest transition-all text-center self-start shadow-sm"
          >
            {t.getQuote[language]} →
          </a>
        </div>

        {/* Column 2: Useful Links (Categories) */}
        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-theme-blue border-b border-theme-gray-100 pb-2 mb-6">
            {t.linksTitle[language]}
          </h4>
          <ul className="flex flex-col gap-3 text-xs font-mono uppercase tracking-wider text-theme-gray-400">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link href={`/c/${cat.slug}`} className="hover:text-theme-blue transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Tag Cloud */}
        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-theme-blue border-b border-theme-gray-100 pb-2 mb-6">
            {t.tagsTitle[language]}
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 15).map((tag) => (
              <Link 
                key={tag.id}
                href={`/c/news?tag=${tag.slug}`} 
                className="px-2 py-1 bg-white border border-theme-gray-100 text-[9px] font-mono uppercase tracking-wider text-theme-gray-400 hover:text-theme-black hover:border-theme-blue transition-all"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 4: Recent Posts */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-theme-blue border-b border-theme-gray-100 pb-2">
            {t.recentTitle[language]}
          </h4>
          <div className="flex flex-col gap-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex gap-3">
                {post.cover_image && (
                  <Link href={`/a/${post.slug}`} className="w-12 h-12 shrink-0 overflow-hidden border border-theme-gray-100">
                    <img 
                      src={getMediaUrl(post.cover_image)} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform" 
                    />
                  </Link>
                )}
                <div className="flex flex-col justify-between">
                  <Link href={`/a/${post.slug}`} className="hover:text-theme-blue transition-colors line-clamp-2 text-xs font-sans font-semibold text-theme-black leading-tight">
                    {post.title}
                  </Link>
                  <span className="text-[9px] text-theme-gray-400 font-mono">
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-theme-gray-400 tracking-widest uppercase gap-4">
        <span>© {new Date().getFullYear()} Isezerano.com. All Rights Reserved.</span>
        
        {/* Social Icons row */}
        <div className="flex items-center gap-4 text-theme-gray-400">
          <a href="#" className="hover:text-theme-blue transition-colors" title="Facebook">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
            </svg>
          </a>
          <a href="#" className="hover:text-theme-blue transition-colors" title="Instagram">
            <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          <a href="#" className="hover:text-theme-blue transition-colors" title="Twitter/X">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="#" className="hover:text-theme-blue transition-colors" title="TikTok">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .77.1v-3.5a6.39 6.39 0 0 0-3.08.77 6.4 6.4 0 0 0-3.32 5.59 6.4 6.4 0 0 0 10.9 4.54 6.4 6.4 0 0 0 4.63-6.27V9a8.27 8.27 0 0 0 4.14 1.2V6.69z"/>
            </svg>
          </a>
          <a href="/api/v1/articles/?format=rss" className="hover:text-theme-blue transition-colors" title="RSS Feed">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <circle cx="5" cy="19" r="1"/>
              <path d="M4 4a16 16 0 0 1 16 16h-4a12 12 0 0 0-12-12V4z"/>
              <path d="M4 11a9 9 0 0 1 9 9h-4a5 5 0 0 0-5-5v-4z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};
