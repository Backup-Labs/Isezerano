"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Send, ArrowLeft, Image as ImageIcon, History, RefreshCw, Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Quote, Link2, List } from 'lucide-react';
import Link from 'next/link';

interface Category { id: number; name: string; }
interface Tag { id: number; name: string; }
interface Revision {
  id: number;
  author: { username: string } | null;
  title: string;
  subtitle: string;
  body: string;
  created_at: string;
}
interface Article {
  id: number; title: string; subtitle: string; body: string;
  cover_image: string | null; category: { id: number } | null;
  tags: { id: number }[]; status: string;
  is_breaking: boolean; is_featured: boolean; is_premium: boolean;
  seo_title: string; seo_description: string; revisions: Revision[];
}

export default function EditArticle() {
  const { id } = useParams();
  const { token, user } = useApp();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [status, setStatus] = useState('draft');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadArticleData = async () => {
    try {
      const [catRes, tagRes, artRes] = await Promise.all([
        fetch(API_BASE_URL + '/api/v1/categories/'),
        fetch(API_BASE_URL + '/api/v1/tags/'),
        fetch(`${API_BASE_URL}/api/v1/cms/articles/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      if (catRes.ok && tagRes.ok && artRes.ok) {
        setCategories(await catRes.json());
        setTags(await tagRes.json());
        const art: Article = await artRes.json();
        setTitle(art.title); setSubtitle(art.subtitle); setBody(art.body);
        setCurrentCoverUrl(art.cover_image);
        setCategory(art.category ? art.category.id.toString() : '');
        setSelectedTags(art.tags.map(t => t.id));
        setStatus(art.status); setIsBreaking(art.is_breaking);
        setIsFeatured(art.is_featured); setIsPremium(art.is_premium);
        setSeoTitle(art.seo_title); setSeoDescription(art.seo_description);
        setRevisions(art.revisions || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadArticleData(); }, [id, token]);

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  const restoreRevision = (rev: Revision) => {
    setTitle(rev.title); setSubtitle(rev.subtitle); setBody(rev.body);
    setSelectedRevision(null);
    alert("Loaded revision backup history. Save changes to apply.");
  };

  const insertFormat = (type: 'bold' | 'italic' | 'underline' | 'h2' | 'h3' | 'quote' | 'link' | 'list') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const selected = el.value.substring(start, end);
    let formatted = '';
    switch (type) {
      case 'bold': formatted = `**${selected || 'bold text'}**`; break;
      case 'italic': formatted = `*${selected || 'italic text'}*`; break;
      case 'underline': formatted = `<u>${selected || 'underlined text'}</u>`; break;
      case 'h2': formatted = `\n## ${selected || 'Heading 2'}\n`; break;
      case 'h3': formatted = `\n### ${selected || 'Heading 3'}\n`; break;
      case 'quote': formatted = `\n> ${selected || 'Blockquote'}\n`; break;
      case 'link': formatted = `[${selected || 'Link Text'}](https://example.com)`; break;
      case 'list': formatted = `\n- ${selected || 'List item'}\n`; break;
    }
    const newValue = el.value.substring(0, start) + formatted + el.value.substring(end);
    setBody(newValue);
    setTimeout(() => { el.focus(); el.setSelectionRange(start, start + formatted.length); }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body || submitting) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title); formData.append('subtitle', subtitle);
    formData.append('body', body);
    if (coverImage) formData.append('cover_image', coverImage);
    formData.append('category', category); formData.append('status', status);
    formData.append('is_breaking', String(isBreaking));
    formData.append('is_featured', String(isFeatured));
    formData.append('is_premium', String(isPremium));
    formData.append('seo_title', seoTitle); formData.append('seo_description', seoDescription);
    selectedTags.forEach(tagId => { formData.append('tags', tagId.toString()); });
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/articles/${id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) { router.push('/newsroom/articles'); }
      else { alert("Failed to save article modifications."); }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

  const inputCls = "bg-white border border-theme-gray-100 px-4 py-2.5 text-sm text-theme-black placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue w-full";
  const selectCls = "bg-white border border-theme-gray-100 px-4 py-2 text-xs font-mono text-theme-black focus:outline-none focus:border-theme-blue w-full";
  const toolbarBtnCls = "p-1 hover:bg-theme-blue hover:text-white text-theme-black transition-colors border border-transparent flex items-center justify-center w-8 h-8";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING ARTICLE DATA...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      <Link href="/newsroom/articles" className="flex items-center gap-1 text-xs font-mono text-theme-gray-400 hover:text-theme-blue transition-colors mr-auto uppercase font-bold tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        Return to Articles List
      </Link>

      <div className="flex items-center justify-between pb-4 border-b border-theme-gray-100">
        <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black">
          Edit Article: {id}
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Editor columns (3/4 width on desktop) */}
        <form onSubmit={handleSubmit} className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6 border border-theme-gray-100 p-6 bg-white">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Headline Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />
            </div>

            {/* Subtitle */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Subtitle / Deck</label>
              <textarea rows={2} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} />
            </div>

            {/* Body with Formatting Toolbar */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Article Body</label>
              <div className="bg-theme-light-gray border border-theme-gray-100 border-b-0 p-1.5 flex items-center gap-1 overflow-x-auto select-none">
                <button type="button" onClick={() => insertFormat('bold')} className={`${toolbarBtnCls} font-bold`} title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertFormat('italic')} className={`${toolbarBtnCls} italic`} title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertFormat('underline')} className={toolbarBtnCls} title="Underline"><UnderlineIcon className="w-3.5 h-3.5" /></button>
                <div className="h-4 w-[1px] bg-theme-gray-100 mx-1" />
                <button type="button" onClick={() => insertFormat('h2')} className={`${toolbarBtnCls} font-mono text-xs`} title="Heading 2"><Heading1 className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertFormat('h3')} className={`${toolbarBtnCls} font-mono text-[10px]`} title="Heading 3"><Heading2 className="w-3.5 h-3.5" /></button>
                <div className="h-4 w-[1px] bg-theme-gray-100 mx-1" />
                <button type="button" onClick={() => insertFormat('quote')} className={toolbarBtnCls} title="Blockquote"><Quote className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertFormat('link')} className={toolbarBtnCls} title="Insert Link"><Link2 className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertFormat('list')} className={toolbarBtnCls} title="Bullet List"><List className="w-3.5 h-3.5" /></button>
              </div>
              <textarea 
                ref={textareaRef} rows={15}
                placeholder="Write the article copy here..."
                value={body} onChange={(e) => setBody(e.target.value)}
                className="bg-white border border-theme-gray-100 px-4 py-2.5 text-sm text-theme-black placeholder-theme-gray-400 font-sans focus:outline-none focus:border-theme-blue w-full"
                required
              />
            </div>
          </div>

          {/* Controls column */}
          <div className="flex flex-col gap-6">
            <div className="border border-theme-gray-100 p-6 flex flex-col gap-5 bg-theme-light-gray">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Article Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
                  <option value="draft">Draft (Private)</option>
                  <option value="in_review">Submit for Review</option>
                  {user?.role !== 'journalist' && <option value="published">Publish Instantly</option>}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Publishing Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                  <option value="">No Category assigned</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3 py-2 border-y border-theme-gray-100">
                {[
                  { checked: isBreaking, set: setIsBreaking, label: 'Breaking News Flash' },
                  { checked: isFeatured, set: setIsFeatured, label: 'Homepage Hero Featured' },
                  { checked: isPremium, set: setIsPremium, label: 'Premium Article' },
                ].map(({ checked, set, label }) => (
                  <label key={label} className="flex items-center gap-2 text-xs font-mono text-theme-gray-400 cursor-pointer font-bold uppercase tracking-wider">
                    <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)}
                      className="rounded border-theme-gray-100 text-theme-blue focus:ring-0 cursor-pointer" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {/* Image upload */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Cover Image</label>
                {currentCoverUrl && (
                  <img 
                    src={currentCoverUrl.startsWith('http') ? currentCoverUrl : `${API_BASE_URL}${currentCoverUrl}`}
                    alt="cover preview" 
                    className="w-full h-24 object-cover border border-theme-gray-100 mb-2"
                  />
                )}
                <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-theme-gray-100 text-xs font-mono cursor-pointer hover:bg-theme-blue hover:text-white transition-all text-theme-black font-bold uppercase w-max">
                  <ImageIcon className="w-4 h-4" />
                  Load New File
                  <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>

              {/* Tags Select */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Tags</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto scrollbar-thin p-1.5 border border-theme-gray-100 bg-white">
                  {sortedTags.map((tag) => {
                    const isChecked = selectedTags.includes(tag.id);
                    return (
                      <button type="button" key={tag.id} onClick={() => handleTagToggle(tag.id)}
                        className={`px-2 py-1 text-[10px] font-mono text-left rounded transition-all cursor-pointer font-semibold ${
                          isChecked ? 'bg-theme-blue/10 text-theme-blue border border-theme-blue' : 'bg-transparent text-theme-gray-400 border border-transparent hover:border-theme-gray-100'
                        }`}>
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2">
                <Send className="w-4 h-4" />
                {submitting ? 'SAVING...' : 'Save Article'}
              </button>
            </div>
          </div>
        </form>

        {/* Revision logs (1/4 width on desktop) */}
        <div className="flex flex-col gap-6">
          <div className="border border-theme-gray-100 p-6 flex flex-col gap-4 bg-theme-light-gray">
            <h3 className="serif-title text-sm font-bold uppercase tracking-wider text-theme-black border-b border-theme-gray-100 pb-2 flex items-center gap-1.5">
              <History className="w-4 h-4 text-theme-blue" />
              Revision History
            </h3>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto scrollbar-thin">
              {revisions.map((rev) => (
                <div key={rev.id} onClick={() => setSelectedRevision(rev)}
                  className="p-3 border border-theme-gray-100 bg-white hover:border-theme-blue hover:bg-theme-light-gray cursor-pointer transition-all">
                  <div className="text-[10px] font-mono text-theme-black font-bold">
                    Saved by @{rev.author?.username || 'system'}
                  </div>
                  <div className="text-[9px] font-mono text-theme-gray-400 mt-1">
                    {new Date(rev.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {revisions.length === 0 && (
                <div className="text-center py-6 text-[10px] font-mono text-theme-gray-400 uppercase">
                  No historical revisions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-2xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-sm font-bold text-theme-black uppercase">Revision Details</h3>
              <button onClick={() => setSelectedRevision(null)} className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base">✕</button>
            </div>
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-thin text-sm">
              <div>
                <span className="text-[9px] font-mono text-theme-gray-400 block mb-1 uppercase font-bold tracking-wider">Headline</span>
                <span className="serif-title font-bold text-base text-theme-black">{selectedRevision.title}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-theme-gray-400 block mb-1 uppercase font-bold tracking-wider">Deck</span>
                <span className="text-theme-gray-400">{selectedRevision.subtitle || '(No deck recorded)'}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-theme-gray-400 block mb-1 uppercase font-bold tracking-wider">Body Text</span>
                <pre className="p-3 bg-theme-light-gray border border-theme-gray-100 text-xs font-sans text-theme-black overflow-x-auto whitespace-pre-wrap">
                  {selectedRevision.body}
                </pre>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-theme-gray-100">
              <button onClick={() => setSelectedRevision(null)}
                className="px-4 py-2 border border-theme-gray-100 bg-white hover:bg-theme-light-gray text-theme-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all">
                Cancel
              </button>
              <button onClick={() => restoreRevision(selectedRevision)}
                className="px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-widest text-xs flex items-center gap-1 cursor-pointer transition-all">
                <RefreshCw className="w-3.5 h-3.5" />
                Restore Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
