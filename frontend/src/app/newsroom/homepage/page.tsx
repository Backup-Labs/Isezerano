"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Save, ChevronUp, ChevronDown, Layers, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface LayoutBlock {
  id: number;
  section_type: string;
  order: number;
  is_visible: boolean;
  category: number | null;
  ad_slot: number | null;
  category_details?: { name: string };
  ad_slot_details?: { name: string };
}

export default function HomepageBuilder() {
  const { token } = useApp();
  const [layout, setLayout] = useState<LayoutBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchLayout = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/layout/', {
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

  useEffect(() => {
    if (token) {
      fetchLayout();
    }
  }, [token]);

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const nextLayout = [...layout];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= nextLayout.length) return;

    // Swap blocks
    const temp = nextLayout[index];
    nextLayout[index] = nextLayout[targetIdx];
    nextLayout[targetIdx] = temp;

    // Re-assign order index values
    const updated = nextLayout.map((block, idx) => ({
      ...block,
      order: idx
    }));

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
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              order: block.order,
              is_visible: block.is_visible
            })
          })
        )
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save layout.");
    } finally {
      setSaving(false);
    }
  };

  const getSectionLabel = (type: string) => {
    switch (type) {
      case 'hero': return 'Hero Lead Story';
      case 'featured-grid': return 'Featured Stories Grid';
      case 'category-rail': return 'Category Grid Rail';
      case 'ad-slot': return 'Advertisement Banner';
      default: return 'Trending Stories Widget';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING HOMEPAGE CONFIGURATION...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-theme-light-gray animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-blue-deep">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-light-gray">
            Homepage Layout Builder
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Arrange and configure the layout of the public homepage
          </p>
        </div>

        <button 
          onClick={handleSaveLayout}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue-deep hover:bg-theme-blue text-theme-black text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? 'SAVING...' : 'Save Layout'}
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="p-4 border border-green-600 text-green-700 text-xs font-mono rounded flex items-center gap-2 bg-green-50">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>HOMEPAGE LAYOUT SAVED SUCCESSFULLY.</span>
        </div>
      )}

      {/* Blocks Column */}
      <div className="flex flex-col gap-4 max-w-4xl w-full">
        {layout.map((block, idx) => (
          <div 
            key={block.id} 
            className={`p-6 border flex items-center justify-between gap-6 transition-all bg-theme-charcoal/20 ${
              block.is_visible ? 'border-theme-blue-deep hover:border-theme-blue' : 'border-theme-gray-100 opacity-50'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-10 h-10 bg-theme-charcoal flex items-center justify-center border border-theme-blue-deep text-theme-gray-400">
                <Layers className="w-4 h-4" />
              </div>

              {/* Title details */}
              <div className="flex flex-col gap-1">
                <h3 className="serif-title text-base font-bold text-theme-light-gray uppercase">{getSectionLabel(block.section_type)}</h3>
                <span className="text-[10px] text-theme-gray-400 font-mono font-semibold uppercase tracking-wider">
                  {block.section_type === 'category-rail' && block.category_details ? `Category: ${block.category_details.name}` : ''}
                  {block.section_type === 'ad-slot' && block.ad_slot_details ? `Ad Placement: ${block.ad_slot_details.name}` : ''}
                  {!['category-rail', 'ad-slot'].includes(block.section_type) && 'Core Template Block'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Order shifts */}
              <button 
                onClick={() => moveBlock(idx, 'up')}
                disabled={idx === 0}
                className="p-1.5 border border-theme-blue-deep hover:bg-theme-charcoal disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer text-theme-light-gray"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveBlock(idx, 'down')}
                disabled={idx === layout.length - 1}
                className="p-1.5 border border-theme-blue-deep hover:bg-theme-charcoal disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer text-theme-light-gray"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Visibility toggle */}
              <button 
                onClick={() => toggleVisibility(idx)}
                className={`p-1.5 border transition-all cursor-pointer ${
                  block.is_visible 
                    ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100' 
                    : 'border-theme-blue-deep text-theme-gray-400 hover:bg-theme-charcoal'
                }`}
                title={block.is_visible ? 'Hide section' : 'Show section'}
              >
                {block.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
