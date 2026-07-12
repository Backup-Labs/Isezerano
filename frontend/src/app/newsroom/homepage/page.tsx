"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Terminal, Save, CheckCircle, ChevronUp, ChevronDown, Layers, Eye, EyeOff } from 'lucide-react';

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
      const res = await fetch('http://127.0.0.1:8000/api/v1/cms/layout/', {
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
      // Send individual PATCH updates for order and visibility
      await Promise.all(
        layout.map(block => 
          fetch(`http://127.0.0.1:8000/api/v1/cms/layout/${block.id}/`, {
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
      alert("Failed to sync homepage architecture.");
    } finally {
      setSaving(false);
    }
  };

  const getSectionLabel = (type: string) => {
    switch (type) {
      case 'hero': return 'Hero Lead Story Splash';
      case 'featured-grid': return 'Secondary Featured Stories Grid (3 cards)';
      case 'category-rail': return 'Category Scroll Rail Section';
      case 'ad-slot': return 'Advertisement Banner Block';
      default: return 'Trending List Sidebar';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">PULLING HOMEPAGE CONFIGURATION...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-white">
            Homepage Section Builder
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            DRAG, ORGANIZE, AND REORDER HOMEPAGE GRID BLOCKS IN REALTIME
          </p>
        </div>

        <button 
          onClick={handleSaveLayout}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_12px_rgba(47,109,246,0.3)] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? 'SYNCING...' : 'SYNC HOMEPAGE'}
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono rounded-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>HOMEPAGE LAYOUT ARCHITECTURE SYNCED SUCCESSFULLY // LIVE DEPLOY ACTIVE.</span>
        </div>
      )}

      {/* Blocks Column */}
      <div className="flex flex-col gap-4 max-w-4xl w-full">
        {layout.map((block, idx) => (
          <div 
            key={block.id} 
            className={`p-6 glass-panel rounded-2xl flex items-center justify-between gap-6 transition-all border ${
              block.is_visible ? 'border-white/5 hover:border-theme-blue/30' : 'border-white/2 bg-white/1 opacity-50'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-theme-gray-400">
                <Layers className="w-4 h-4" />
              </div>

              {/* Title details */}
              <div className="flex flex-col gap-1">
                <h3 className="font-mono text-sm font-bold text-white uppercase">{getSectionLabel(block.section_type)}</h3>
                <span className="text-[10px] text-theme-gray-400 font-mono tracking-wider">
                  {block.section_type === 'category-rail' && block.category_details ? `CHANNEL: ${block.category_details.name}` : ''}
                  {block.section_type === 'ad-slot' && block.ad_slot_details ? `AD CAMPAIGN: ${block.ad_slot_details.name}` : ''}
                  {!['category-rail', 'ad-slot'].includes(block.section_type) && 'CORE TEMPLATE BLOCK'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Order shifts */}
              <button 
                onClick={() => moveBlock(idx, 'up')}
                disabled={idx === 0}
                className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveBlock(idx, 'down')}
                disabled={idx === layout.length - 1}
                className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Visibility toggle */}
              <button 
                onClick={() => toggleVisibility(idx)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  block.is_visible 
                    ? 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                    : 'border-white/5 text-theme-gray-400 hover:bg-white/5'
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
