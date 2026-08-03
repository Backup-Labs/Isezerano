"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Save, ChevronUp, ChevronDown, Layers, Eye, EyeOff, 
  CheckCircle, Plus, Trash2, Edit3, Copy, FileText, Globe 
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface AdSlot {
  id: number;
  name: string;
}

interface LayoutBlock {
  id: number;
  page: string;
  section_type: string;
  order: number;
  is_visible: boolean;
  article_limit: number | null;
  category: number | null;
  ad_slot: number | null;
  title: string;
  content: string;
  category_details?: { name: string };
  ad_slot_details?: { name: string };
}

export default function SectionsManager() {
  const { token } = useApp();
  const [layout, setLayout] = useState<LayoutBlock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<AdSlot[]>([]);
  
  const [activePage, setActivePage] = useState('home');
  const [customPage, setCustomPage] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Modal Dialog states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<LayoutBlock | null>(null);

  // Form states
  const [formPage, setFormPage] = useState('home');
  const [formSectionType, setFormSectionType] = useState('hero');
  const [formLimit, setFormLimit] = useState(5);
  const [formCategory, setFormCategory] = useState<string>('');
  const [formAdSlot, setFormAdSlot] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIsVisible, setFormIsVisible] = useState(true);

  const fetchLayout = async (pageName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/layout/?page=${pageName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLayout(data.sort((a: any, b: any) => a.order - b.order));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [catRes, adRes] = await Promise.all([
        fetch(API_BASE_URL + '/api/v1/categories/'),
        fetch(API_BASE_URL + '/api/v1/cms/ads/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (adRes.ok) {
        const adsData = await adRes.json();
        setAds(Array.isArray(adsData) ? adsData : (adsData.results || []));
      }
    } catch (err) {
      console.error("Failed to load options", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLayout(activePage);
      fetchOptions();
    }
  }, [token, activePage]);

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const nextLayout = [...layout];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nextLayout.length) return;
    const temp = nextLayout[index];
    nextLayout[index] = nextLayout[targetIdx];
    nextLayout[targetIdx] = temp;
    const updated = nextLayout.map((block, idx) => ({ ...block, order: idx }));
    setLayout(updated);
  };

  const toggleVisibility = (index: number) => {
    const nextLayout = [...layout];
    nextLayout[index].is_visible = !nextLayout[index].is_visible;
    setLayout(nextLayout);
  };

  const handleSaveLayout = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await Promise.all(
        layout.map(block =>
          fetch(`${API_BASE_URL}/api/v1/cms/layout/${block.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
              order: block.order, 
              is_visible: block.is_visible,
              article_limit: block.article_limit
            })
          })
        )
      );
      setSuccess(true);
      fetchLayout(activePage);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save layout order.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/layout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          page: formPage,
          section_type: formSectionType,
          article_limit: ['ad-slot', 'flyers', 'rich-text', 'contact-form'].includes(formSectionType) ? null : formLimit,
          category: formSectionType === 'category-rail' ? Number(formCategory) || null : null,
          ad_slot: formSectionType === 'ad-slot' ? Number(formAdSlot) || null : null,
          title: formTitle,
          content: formContent,
          is_visible: formIsVisible,
          order: layout.length
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setFormSectionType('hero');
        setFormLimit(5);
        setFormCategory('');
        setFormAdSlot('');
        setFormTitle('');
        setFormContent('');
        setFormIsVisible(true);
        if (formPage === activePage) {
          fetchLayout(activePage);
        } else {
          setActivePage(formPage);
        }
      } else {
        alert("Failed to create layout section.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/layout/${editingBlock.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          page: formPage,
          section_type: formSectionType,
          article_limit: ['ad-slot', 'flyers', 'rich-text', 'contact-form'].includes(formSectionType) ? null : formLimit,
          category: formSectionType === 'category-rail' ? Number(formCategory) || null : null,
          ad_slot: formSectionType === 'ad-slot' ? Number(formAdSlot) || null : null,
          title: formTitle,
          content: formContent,
          is_visible: formIsVisible
        })
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditingBlock(null);
        if (formPage === activePage) {
          fetchLayout(activePage);
        } else {
          setActivePage(formPage);
        }
      } else {
        alert("Failed to update layout section.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateSection = async (block: LayoutBlock) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/layout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          page: block.page,
          section_type: block.section_type,
          article_limit: block.article_limit,
          category: block.category,
          ad_slot: block.ad_slot,
          title: block.title ? `${block.title} (Copy)` : '',
          content: block.content,
          is_visible: block.is_visible,
          order: block.order + 1
        })
      });
      if (res.ok) {
        fetchLayout(activePage);
      } else {
        alert("Failed to duplicate section.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm("Are you sure you want to delete this section block?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/layout/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLayout(activePage);
      } else {
        alert("Failed to delete section.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setFormPage(activePage);
    setFormSectionType('hero');
    setFormLimit(5);
    setFormCategory(categories[0]?.id.toString() || '');
    setFormAdSlot(ads[0]?.id.toString() || '');
    setFormTitle('');
    setFormContent('');
    setFormIsVisible(true);
    setShowCreateModal(true);
  };

  const openEditModal = (block: LayoutBlock) => {
    setEditingBlock(block);
    setFormPage(block.page);
    setFormSectionType(block.section_type);
    setFormLimit(block.article_limit || 5);
    setFormCategory(block.category?.toString() || (categories[0]?.id.toString() || ''));
    setFormAdSlot(block.ad_slot?.toString() || (ads[0]?.id.toString() || ''));
    setFormTitle(block.title || '');
    setFormContent(block.content || '');
    setFormIsVisible(block.is_visible);
    setShowEditModal(true);
  };

  const getSectionLabel = (type: string) => {
    switch (type) {
      case 'hero': return 'Hero Lead Story';
      case 'featured-grid': return 'Featured Stories Grid';
      case 'category-rail': return 'Category Grid Rail';
      case 'ad-slot': return 'Advertisement Banner';
      case 'trending-widget': return 'Trending Stories Widget';
      case 'news-desk': return 'News Desk Section';
      case 'announcements': return 'Amatangazo Classifieds';
      case 'lifestyle': return 'Lifestyle & Culture';
      case 'sports-grid': return 'Sports Vertical Grid';
      case 'featured-secondary': return 'Second Featured Posts';
      case 'flyers': return 'Local Partner Flyers';
      case 'you-missed': return 'You Missed Rail';
      case 'rich-text': return 'Custom Rich Text Block';
      case 'contact-form': return 'Contact Inquiry Form';
      default: return type;
    }
  };

  const commonPages = [
    { name: 'Home Page', slug: 'home' },
    { name: 'About Us', slug: 'about' },
    { name: 'Services', slug: 'services' },
    { name: 'Contact', slug: 'contact' },
    { name: 'Blog Feed', slug: 'blog' }
  ];

  const inputCls = "bg-white border border-theme-gray-100 px-4 py-2 text-xs text-theme-black focus:outline-none focus:border-theme-blue w-full";
  const labelCls = "text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider";

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black">
            Manage Sections
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Build pages, reorder layouts, and configure custom page sections dynamically
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
          <button
            onClick={handleSaveLayout}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-theme-blue text-theme-blue hover:bg-theme-blue hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'SAVING...' : 'Save Reordering'}
          </button>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="p-4 border border-green-600 text-green-700 text-xs font-mono flex items-center gap-2 bg-green-50 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>LAYOUT ORDER SAVED SUCCESSFULLY.</span>
        </div>
      )}

      {/* Page Filtering Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-theme-gray-100 bg-theme-light-gray rounded">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-theme-gray-400 uppercase tracking-widest">Active Page:</span>
          <div className="flex gap-1">
            {commonPages.map((pg) => (
              <button
                key={pg.slug}
                onClick={() => {
                  setActivePage(pg.slug);
                  setShowCustomInput(false);
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  activePage === pg.slug && !showCustomInput
                    ? 'bg-theme-blue text-white border-theme-blue'
                    : 'bg-white text-theme-black border-theme-gray-100 hover:border-theme-blue'
                }`}
              >
                {pg.name}
              </button>
            ))}
            <button
              onClick={() => setShowCustomInput(true)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                showCustomInput
                  ? 'bg-theme-blue text-white border-theme-blue'
                  : 'bg-white text-theme-black border-theme-gray-100 hover:border-theme-blue'
              }`}
            >
              Custom Slug...
            </button>
          </div>
        </div>

        {/* Custom Slug Input box */}
        {showCustomInput && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (customPage.trim()) {
                setActivePage(customPage.toLowerCase().trim());
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              required
              placeholder="e.g. privacy-policy"
              value={customPage}
              onChange={(e) => setCustomPage(e.target.value)}
              className="bg-white border border-theme-gray-100 px-3 py-1.5 text-xs font-mono text-theme-black outline-none focus:border-theme-blue rounded"
            />
            <button 
              type="submit"
              className="px-3 py-1.5 bg-theme-black hover:bg-theme-blue text-white text-xs font-mono font-bold uppercase rounded cursor-pointer"
            >
              Load
            </button>
          </form>
        )}

        <div className="text-[10px] font-mono text-theme-gray-400 uppercase tracking-widest flex items-center gap-1 bg-white px-3 py-1 border border-theme-gray-100">
          <Globe className="w-3.5 h-3.5 text-theme-blue" />
          <span>Active Route: /{activePage === 'home' ? '' : activePage}</span>
        </div>
      </div>

      {/* Blocks Column */}
      <div className="flex flex-col gap-3 max-w-4xl w-full">
        {layout.map((block, idx) => (
          <div
            key={block.id}
            className={`p-5 border flex items-center justify-between gap-6 transition-all bg-white rounded shadow-sm ${
              block.is_visible
                ? 'border-theme-gray-100 hover:border-theme-blue'
                : 'border-theme-gray-100 opacity-50'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Icon */}
              <div className="w-10 h-10 bg-theme-light-gray flex items-center justify-center border border-theme-gray-100 text-theme-blue shrink-0">
                <Layers className="w-4 h-4" />
              </div>

              {/* Title details */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="serif-title text-base font-bold text-theme-black uppercase truncate">
                  {block.title ? `${block.title} (${getSectionLabel(block.section_type)})` : getSectionLabel(block.section_type)}
                </h3>
                <span className="text-[10px] text-theme-gray-400 font-mono font-semibold uppercase tracking-wider truncate">
                  {block.section_type === 'category-rail' && block.category_details
                    ? `Category: ${block.category_details.name}`
                    : ''}
                  {block.section_type === 'ad-slot' && block.ad_slot_details
                    ? `Ad Placement: ${block.ad_slot_details.name}`
                    : ''}
                  {block.section_type === 'rich-text'
                    ? `HTML/Text Snippet: ${block.content ? block.content.substring(0, 40) + '...' : 'empty'}`
                    : ''}
                  {!['category-rail', 'ad-slot', 'rich-text'].includes(block.section_type) && 'Core Template Block'}
                </span>
              </div>
            </div>

            {/* Config metadata displays */}
            <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-theme-black">
              {!['ad-slot', 'flyers', 'rich-text', 'contact-form'].includes(block.section_type) && (
                <div className="flex items-center gap-1.5 bg-theme-light-gray px-2.5 py-1 border border-theme-gray-100 rounded">
                  <span className="text-[10px] text-theme-gray-400 font-bold uppercase tracking-wider">Limit:</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={block.article_limit || 5}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 5;
                      const nextLayout = [...layout];
                      nextLayout[idx] = { ...block, article_limit: val };
                      setLayout(nextLayout);
                    }}
                    className="w-10 bg-white border border-theme-gray-100 text-center py-0.5 text-xs text-theme-black focus:outline-none focus:border-theme-blue font-bold font-mono"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(block)}
                  className="p-1.5 border border-theme-gray-100 hover:bg-theme-light-gray hover:text-theme-blue transition-all cursor-pointer text-theme-black rounded"
                  title="Edit details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDuplicateSection(block)}
                  className="p-1.5 border border-theme-gray-100 hover:bg-theme-light-gray hover:text-green-700 transition-all cursor-pointer text-theme-black rounded"
                  title="Duplicate block"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveBlock(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-theme-black rounded"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveBlock(idx, 'down')}
                  disabled={idx === layout.length - 1}
                  className="p-1.5 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-theme-black rounded"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleVisibility(idx)}
                  className={`p-1.5 border transition-all cursor-pointer rounded ${
                    block.is_visible
                      ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                      : 'border-theme-gray-100 text-theme-gray-400 hover:bg-theme-light-gray'
                  }`}
                  title={block.is_visible ? 'Hide section' : 'Show section'}
                >
                  {block.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDeleteSection(block.id)}
                  className="p-1.5 border border-theme-gray-100 hover:bg-red-50 hover:text-red-700 hover:border-red-500 transition-all cursor-pointer text-theme-black rounded"
                  title="Delete section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {layout.length === 0 && (
          <div className="text-center py-16 text-xs font-mono uppercase tracking-wider text-theme-gray-400 border border-theme-gray-100 bg-white rounded">
            No sections configured for this page. Click "Add Section" to begin.
          </div>
        )}
      </div>

      {/* Modal Dialog for ADD Section */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-xl p-6 flex flex-col gap-5 shadow-xl max-h-[90vh] overflow-y-auto rounded">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-theme-blue" />
                Add Page Section
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Target Page */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Target Page Route</label>
                  <input
                    type="text"
                    required
                    value={formPage}
                    onChange={(e) => setFormPage(e.target.value.toLowerCase().trim())}
                    className={inputCls}
                    placeholder="e.g. home, about, contact"
                  />
                </div>

                {/* Section Type */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Section Template Type</label>
                  <select
                    value={formSectionType}
                    onChange={(e) => setFormSectionType(e.target.value)}
                    className={inputCls}
                  >
                    <option value="hero">Hero Lead Story</option>
                    <option value="featured-grid">Featured Grid</option>
                    <option value="category-rail">Category Rail</option>
                    <option value="ad-slot">Advertisement Banner</option>
                    <option value="trending-widget">Trending Sidebar Widget</option>
                    <option value="news-desk">News Desk Section</option>
                    <option value="announcements">Amatangazo Classifieds</option>
                    <option value="lifestyle">Lifestyle & Culture</option>
                    <option value="sports-grid">Sports Grid</option>
                    <option value="featured-secondary">Second Featured Row</option>
                    <option value="flyers">Partner Flyers</option>
                    <option value="you-missed">You Missed Rail</option>
                    <option value="rich-text">Custom Rich Text Block</option>
                    <option value="contact-form">Contact Inquiry Form</option>
                  </select>
                </div>
              </div>

              {/* Title (for dynamic labels/titles) */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Section Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Welcome to Isezerano"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Dynamic properties depending on type */}
              {!['ad-slot', 'flyers', 'rich-text', 'contact-form'].includes(formSectionType) && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Article Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formLimit}
                    onChange={(e) => setFormLimit(Number(e.target.value))}
                    className={inputCls}
                    required
                  />
                </div>
              )}

              {formSectionType === 'category-rail' && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Scroll Category Source</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={inputCls}
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formSectionType === 'ad-slot' && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Banner Slot Source</label>
                  <select
                    value={formAdSlot}
                    onChange={(e) => setFormAdSlot(e.target.value)}
                    className={inputCls}
                    required
                  >
                    <option value="">-- Choose Ad slot --</option>
                    {ads.map((ad) => (
                      <option key={ad.id} value={ad.id}>{ad.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formSectionType === 'rich-text' && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>HTML / Text Content Block</label>
                  <textarea
                    rows={6}
                    placeholder="Enter custom HTML or plain text details to render..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className={`${inputCls} font-mono`}
                    required
                  />
                </div>
              )}

              {/* Is Visible */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="formIsVisible"
                  checked={formIsVisible}
                  onChange={(e) => setFormIsVisible(e.target.checked)}
                  className="rounded border-theme-gray-100 text-theme-blue focus:ring-theme-blue"
                />
                <label htmlFor="formIsVisible" className="text-xs font-mono font-bold uppercase text-theme-black cursor-pointer">
                  Initially Visible
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-theme-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-theme-gray-100 text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog for EDIT Section */}
      {showEditModal && editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-xl p-6 flex flex-col gap-5 shadow-xl max-h-[90vh] overflow-y-auto rounded">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-theme-blue" />
                Configure Page Section
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBlock(null);
                }}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSection} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Target Page */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Target Page Route</label>
                  <input
                    type="text"
                    required
                    value={formPage}
                    onChange={(e) => setFormPage(e.target.value.toLowerCase().trim())}
                    className={inputCls}
                    placeholder="e.g. home, about, contact"
                  />
                </div>

                {/* Section Type */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Section Template Type</label>
                  <select
                    value={formSectionType}
                    onChange={(e) => setFormSectionType(e.target.value)}
                    className={inputCls}
                  >
                    <option value="hero">Hero Lead Story</option>
                    <option value="featured-grid">Featured Grid</option>
                    <option value="category-rail">Category Rail</option>
                    <option value="ad-slot">Advertisement Banner</option>
                    <option value="trending-widget">Trending Sidebar Widget</option>
                    <option value="news-desk">News Desk Section</option>
                    <option value="announcements">Amatangazo Classifieds</option>
                    <option value="lifestyle">Lifestyle & Culture</option>
                    <option value="sports-grid">Sports Grid</option>
                    <option value="featured-secondary">Second Featured Row</option>
                    <option value="flyers">Partner Flyers</option>
                    <option value="you-missed">You Missed Rail</option>
                    <option value="rich-text">Custom Rich Text Block</option>
                    <option value="contact-form">Contact Inquiry Form</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Section Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Welcome to Isezerano"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Dynamic properties depending on type */}
              {!['ad-slot', 'flyers', 'rich-text', 'contact-form'].includes(formSectionType) && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Article Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formLimit}
                    onChange={(e) => setFormLimit(Number(e.target.value))}
                    className={inputCls}
                    required
                  />
                </div>
              )}

              {formSectionType === 'category-rail' && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Scroll Category Source</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={inputCls}
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formSectionType === 'ad-slot' && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Banner Slot Source</label>
                  <select
                    value={formAdSlot}
                    onChange={(e) => setFormAdSlot(e.target.value)}
                    className={inputCls}
                    required
                  >
                    <option value="">-- Choose Ad slot --</option>
                    {ads.map((ad) => (
                      <option key={ad.id} value={ad.id}>{ad.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formSectionType === 'rich-text' && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>HTML / Text Content Block</label>
                  <textarea
                    rows={6}
                    placeholder="Enter custom HTML or plain text details to render..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className={`${inputCls} font-mono`}
                    required
                  />
                </div>
              )}

              {/* Is Visible */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="formIsVisible"
                  checked={formIsVisible}
                  onChange={(e) => setFormIsVisible(e.target.checked)}
                  className="rounded border-theme-gray-100 text-theme-blue focus:ring-theme-blue"
                />
                <label htmlFor="formIsVisible" className="text-xs font-mono font-bold uppercase text-theme-black cursor-pointer">
                  Is Visible
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-theme-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBlock(null);
                  }}
                  className="px-4 py-2 border border-theme-gray-100 text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
