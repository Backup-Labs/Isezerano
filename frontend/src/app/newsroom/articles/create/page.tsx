"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Send, ArrowLeft, Image as ImageIcon, Notebook, Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Quote, Link2, List } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const insertFormat = (type: 'bold' | 'italic' | 'underline' | 'h2' | 'h3' | 'quote' | 'link' | 'list') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);

    let formatted = '';
    switch (type) {
      case 'bold':
        formatted = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        formatted = `*${selected || 'italic text'}*`;
        break;
      case 'underline':
        formatted = `<u>${selected || 'underlined text'}</u>`;
        break;
      case 'h2':
        formatted = `\n## ${selected || 'Heading 2'}\n`;
        break;
      case 'h3':
        formatted = `\n### ${selected || 'Heading 3'}\n`;
        break;
      case 'quote':
        formatted = `\n> ${selected || 'Blockquote'}\n`;
        break;
      case 'link':
        formatted = `[${selected || 'Link Text'}](https://example.com)`;
        break;
      case 'list':
        formatted = `\n- ${selected || 'List item'}\n`;
        break;
    }

    const newValue = text.substring(0, start) + formatted + text.substring(end);
    setBody(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + formatted.length);
    }, 10);
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
        alert("Failed to create article. Please check input fields.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Sort tags alphabetically in ascending order
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6 text-theme-light-gray animate-fade-in">
      <Link href="/newsroom/articles" className="flex items-center gap-1 text-xs font-mono text-theme-gray-400 hover:text-theme-blue transition-colors mr-auto uppercase font-bold tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        Return to Articles List
      </Link>

      <div className="flex items-center gap-2 pb-4 border-b border-theme-blue-deep">
        <Notebook className="w-5 h-5 text-theme-blue" />
        <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-light-gray">
          Write New Article
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor columns (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6 border border-theme-blue-deep p-6 bg-theme-charcoal/20">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Headline Title</label>
            <input 
              type="text"
              placeholder="e.g. Modern Office Collaboration Designs..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSeoTitle(e.target.value);
              }}
              className="bg-theme-black border border-theme-blue-deep px-4 py-2.5 text-base text-theme-light-gray placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Subtitle / Deck</label>
            <textarea 
              rows={2}
              placeholder="Provide a quick editorial summary description..."
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
                setSeoDescription(e.target.value);
              }}
              className="bg-theme-black border border-theme-blue-deep px-4 py-2.5 text-sm text-theme-light-gray placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue"
            />
          </div>

          {/* Body with Formatting Toolbar */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Article Body</label>
            
            {/* Formatting Toolbar */}
            <div className="bg-theme-charcoal border border-theme-blue-deep border-b-0 p-1.5 flex items-center gap-1 overflow-x-auto select-none">
              <button
                type="button"
                onClick={() => insertFormat('bold')}
                className="p-1 hover:bg-theme-blue hover:text-theme-black text-theme-light-gray transition-colors border border-transparent font-bold flex items-center justify-center w-8 h-8"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('italic')}
                className="p-1 hover:bg-theme-blue hover:text-theme-black text-theme-light-gray transition-colors border border-transparent italic flex items-center justify-center w-8 h-8"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('underline')}
                className="p-1 hover:bg-theme-blue hover:text-theme-black text-theme-light-gray transition-colors border border-transparent flex items-center justify-center w-8 h-8"
                title="Underline"
              >
                <UnderlineIcon className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-[1px] bg-theme-blue-deep mx-1" />
              <button
                type="button"
                onClick={() => insertFormat('h2')}
                className="p-1 hover:bg-theme-blue hover:text-theme-black text-theme-light-gray transition-colors border border-transparent font-mono text-xs flex items-center justify-center w-8 h-8"
                title="Heading 2"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('h3')}
                className="p-1 hover:bg-theme-blue hover:text-theme-black text-theme-light-gray transition-colors border border-transparent font-mono text-[10px] flex items-center justify-center w-8 h-8"
                title="Heading 3"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-[1px] bg-theme-blue-deep mx-1" />
              <button
                type="button"
                onClick={() => insertFormat('quote')}
                className="p-1 hover:bg-theme-blue hover:text-theme-black text-theme-light-gray transition-colors border border-transparent flex items-center justify-center w-8 h-8"
                title="Blockquote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('link')}
                className="p-1 hover:bg-theme-blue hover:text-theme-black text-theme-light-gray transition-colors border border-transparent flex items-center justify-center w-8 h-8"
                title="Insert Link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('list')}
                className="p-1 hover:bg-theme-blue hover:text-theme-black text-theme-light-gray transition-colors border border-transparent flex items-center justify-center w-8 h-8"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea 
              ref={textareaRef}
              rows={15}
              placeholder="Write the article copy here. Select text and click the format buttons above to style your content..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-theme-black border border-theme-blue-deep px-4 py-2.5 text-sm text-theme-light-gray placeholder-theme-gray-400 font-sans focus:outline-none focus:border-theme-blue w-full"
              required
            />
          </div>
        </div>

        {/* Sidebar Controls column */}
        <div className="flex flex-col gap-6">
          <div className="border border-theme-blue-deep p-6 flex flex-col gap-5 bg-theme-charcoal/20">
            {/* Status Select */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Article Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-theme-black border border-theme-blue-deep px-4 py-2 text-xs font-mono text-theme-light-gray focus:outline-none"
              >
                <option value="draft">Draft (Private)</option>
                <option value="in_review">Submit for Review</option>
                {user?.role !== 'journalist' && <option value="published">Publish Instantly</option>}
              </select>
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Publishing Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-theme-black border border-theme-blue-deep px-4 py-2 text-xs font-mono text-theme-light-gray focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Checkbox settings */}
            <div className="flex flex-col gap-3 py-2 border-y border-theme-gray-100">
              <label className="flex items-center gap-2 text-xs font-mono text-theme-gray-400 cursor-pointer font-bold uppercase tracking-wider">
                <input 
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded border-theme-blue-deep text-theme-blue focus:ring-0 cursor-pointer"
                />
                <span>Breaking News Flash</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-theme-gray-400 cursor-pointer font-bold uppercase tracking-wider">
                <input 
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-theme-blue-deep text-theme-blue focus:ring-0 cursor-pointer"
                />
                <span>Homepage Hero Featured</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-theme-gray-400 cursor-pointer font-bold uppercase tracking-wider">
                <input 
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded border-theme-blue-deep text-theme-blue focus:ring-0 cursor-pointer"
                />
                <span>Premium Article</span>
              </label>
            </div>

            {/* Image upload */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Cover Image</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 bg-theme-charcoal border border-theme-blue-deep text-xs font-mono cursor-pointer hover:bg-theme-blue hover:text-theme-black transition-all text-theme-light-gray font-bold uppercase">
                  <ImageIcon className="w-4 h-4" />
                  Upload Image
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-theme-gray-400 font-mono truncate max-w-[150px] font-semibold">
                  {coverImage ? coverImage.name : 'No file selected'}
                </span>
              </div>
            </div>

            {/* Tags Multiple Grid */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Tags</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto scrollbar-thin p-1.5 border border-theme-blue-deep bg-theme-black">
                {sortedTags.map((tag) => {
                  const isChecked = selectedTags.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-2 py-1 text-[10px] font-mono text-left rounded transition-all cursor-pointer font-semibold ${
                        isChecked ? 'bg-theme-blue/20 text-theme-blue border border-theme-blue' : 'bg-transparent text-theme-gray-400 border border-transparent'
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
              className="w-full py-3 bg-theme-blue-deep hover:bg-theme-blue text-theme-black font-mono font-bold uppercase rounded-xl tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'SAVING...' : 'Save Article'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
