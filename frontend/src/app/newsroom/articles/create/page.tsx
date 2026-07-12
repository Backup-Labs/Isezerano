"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Terminal, Send, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function CreateArticle() {
  const { token, user } = useApp();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [status, setStatus] = useState('draft');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/v1/categories/'),
          fetch('http://127.0.0.1:8000/api/v1/tags/')
        ]);
        if (catRes.ok && tagRes.ok) {
          const catsData = await catRes.json();
          const tagsData = await tagRes.json();
          setCategories(catsData);
          setTags(tagsData);
          
          if (catsData.length > 0) {
            setCategory(catsData[0].id.toString());
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOptions();
  }, []);

  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body || submitting) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('body', body);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }
    formData.append('category', category);
    formData.append('status', status);
    formData.append('is_breaking', String(isBreaking));
    formData.append('is_featured', String(isFeatured));
    formData.append('is_premium', String(isPremium));
    formData.append('seo_title', seoTitle || title);
    formData.append('seo_description', seoDescription || subtitle);
    
    // Django M2M needs separate appends for lists
    selectedTags.forEach(id => {
      formData.append('tags', id.toString());
    });

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cms/articles/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        router.push('/newsroom/articles');
      } else {
        alert("Failed to transmit article data. Check fields.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/newsroom/articles" className="flex items-center gap-1 text-xs font-mono text-theme-gray-400 hover:text-white transition-colors mr-auto">
        <ArrowLeft className="w-4 h-4" />
        RETURN TERMINAL
      </Link>

      <div className="flex items-center gap-2 pb-4 border-b border-white/5">
        <Terminal className="w-5 h-5 text-theme-blue animate-pulse" />
        <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-white">
          Transmit New dispatch
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor columns (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6 glass-panel p-6 rounded-2xl">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-theme-gray-400 uppercase">Headline Title</label>
            <input 
              type="text"
              placeholder="e.g. Quantum Singularity Whispers..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSeoTitle(e.target.value);
              }}
              className="bg-theme-black/50 border border-white/10 px-4 py-2.5 rounded-xl text-base text-white placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue/50"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-theme-gray-400 uppercase">Subtitle / Deck</label>
            <textarea 
              rows={2}
              placeholder="Provide a quick editorial summary description..."
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
                setSeoDescription(e.target.value);
              }}
              className="bg-theme-black/50 border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue/50"
            />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-theme-gray-400 uppercase">Article Corpus Body</label>
            <textarea 
              rows={15}
              placeholder="Write long form editorial body here. Use markdown style headings to organize content..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-theme-black/50 border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder-theme-gray-400 font-sans focus:outline-none focus:border-theme-blue/50"
              required
            />
          </div>
        </div>

        {/* Sidebar Controls column */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5">
            {/* Status Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-theme-gray-400 uppercase">Index State</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-theme-blue/50"
              >
                <option value="draft">Draft File (Private)</option>
                <option value="in_review">Submit for review</option>
                {user?.role !== 'journalist' && <option value="published">Publish instantly</option>}
              </select>
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-theme-gray-400 uppercase">Publishing Channel</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono text-white focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Checkbox settings */}
            <div className="flex flex-col gap-3 py-2 border-y border-white/5">
              <label className="flex items-center gap-2 text-xs font-mono text-theme-gray-400 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded border-white/10 text-theme-blue focus:ring-0 cursor-pointer"
                />
                <span>BREAKING NEWS FLASH</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-theme-gray-400 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-white/10 text-theme-blue focus:ring-0 cursor-pointer"
                />
                <span>HOMEPAGE HERO FEATURED</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-theme-gray-400 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded border-white/10 text-theme-blue focus:ring-0 cursor-pointer"
                />
                <span>SECURED CODES (PREMIUM)</span>
              </label>
            </div>

            {/* Image upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-theme-gray-400 uppercase">Cover graphic upload</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono cursor-pointer hover:bg-white/10 hover:text-white transition-all text-theme-gray-400">
                  <ImageIcon className="w-4 h-4" />
                  Select File
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-theme-gray-400 font-mono truncate max-w-[150px]">
                  {coverImage ? coverImage.name : 'No file loaded'}
                </span>
              </div>
            </div>

            {/* Tags Multiple Grid */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-theme-gray-400 uppercase">Dispatched Tags</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto scrollbar-thin p-1 border border-white/5 rounded-xl">
                {tags.map((tag) => {
                  const isChecked = selectedTags.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-2 py-1 text-[10px] font-mono text-left rounded transition-all cursor-pointer ${
                        isChecked ? 'bg-theme-blue/20 text-theme-blue border border-theme-blue/40' : 'bg-white/2 text-theme-gray-400 border border-transparent'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_15px_rgba(47,109,246,0.3)] text-white font-mono font-bold uppercase rounded-xl tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'TRANSMITTING...' : 'TRANSMIT BROADCAST'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
