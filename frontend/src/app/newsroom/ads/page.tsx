"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Megaphone, BarChart3, Save } from 'lucide-react';

interface Ad {
  id: number;
  name: string;
  placement: string;
  target_url: string;
  start_date: string;
  end_date: string;
  priority: number;
  impressions: number;
  clicks: number;
  is_active: boolean;
  ctr: number;
}

export default function AdSlotsManager() {
  const { token } = useApp();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState('');
  const [placement, setPlacement] = useState('header_banner');
  const [targetUrl, setTargetUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // New fields
  const [image, setImage] = useState<File | null>(null);
  const [sponsoredLogo, setSponsoredLogo] = useState<File | null>(null);
  const [ctaText, setCtaText] = useState('Learn More');
  const [sponsoredHeadline, setSponsoredHeadline] = useState('');
  const [sponsoredVideoUrl, setSponsoredVideoUrl] = useState('');

  const fetchAds = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/ads/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAds(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchAds(); }, [token]);

  const handleToggleActive = async (ad: Ad) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/ads/${ad.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: !ad.is_active })
      });
      if (res.ok) fetchAds();
    } catch (err) { console.error(err); }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('placement', placement);
    formData.append('target_url', targetUrl);
    formData.append('html_content', htmlContent);
    formData.append('start_date', new Date(startDate).toISOString());
    formData.append('end_date', new Date(endDate).toISOString());
    formData.append('priority', String(priority));
    formData.append('is_active', String(isActive));
    formData.append('cta_text', ctaText);
    formData.append('sponsored_headline', sponsoredHeadline);
    formData.append('sponsored_video_url', sponsoredVideoUrl);

    if (image) {
      formData.append('image', image);
    }
    if (sponsoredLogo) {
      formData.append('sponsored_logo', sponsoredLogo);
    }

    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/ads/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setShowCreateModal(false);
        setName(''); setPlacement('header_banner'); setTargetUrl(''); setHtmlContent('');
        setStartDate(''); setEndDate(''); setPriority(0); setIsActive(true);
        setImage(null); setSponsoredLogo(null); setCtaText('Learn More');
        setSponsoredHeadline(''); setSponsoredVideoUrl('');
        fetchAds();
      } else {
        alert("Failed to submit campaign data.");
      }
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING CAMPAIGN REGISTRY...</span>
      </div>
    );
  }

  const inputCls = "bg-white border border-theme-gray-100 px-4 py-2 text-xs text-theme-black focus:outline-none focus:border-theme-blue w-full";
  const labelCls = "text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider";

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-theme-blue" />
            Ad Campaigns
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Manage advertisement slots and campaign performance
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="border border-theme-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-gray-100 text-[10px] font-mono text-theme-gray-400 uppercase bg-theme-light-gray">
                <th className="p-4 pl-6">Campaign Name</th>
                <th className="p-4">Placement Slot</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Impressions</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">CTR</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-100 text-sm text-theme-black font-mono bg-white">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-theme-light-gray/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-theme-black max-w-xs truncate">{ad.name}</td>
                  <td className="p-4 text-xs font-semibold uppercase text-theme-black">{ad.placement}</td>
                  <td className="p-4 text-[10px] text-theme-black whitespace-nowrap">
                    {new Date(ad.start_date).toLocaleDateString()} – {new Date(ad.end_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-xs text-theme-black">{ad.impressions.toLocaleString()}</td>
                  <td className="p-4 text-xs text-theme-black">{ad.clicks.toLocaleString()}</td>
                  <td className="p-4 text-xs text-theme-black font-bold">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-theme-blue" />
                      {ad.ctr}%
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                        ad.is_active
                          ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {ad.is_active ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </td>
                </tr>
              ))}

              {ads.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs uppercase tracking-wider text-theme-gray-400">
                    No campaigns deployed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Deploying Campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-xl p-6 flex flex-col gap-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-theme-blue" />
                Deploy New Campaign
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Furniture Launch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Placement */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Placement Slot</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className={inputCls}
                  >
                    <option value="header_banner">Header Banner (970x90 Leaderboard)</option>
                    <option value="hero_sidebar">Hero Sidebar (300x600 Skyscraper)</option>
                    <option value="daily_verse_sidebar">Daily Verse Sidebar (300x250)</option>
                    <option value="news_desk_sidebar">News Desk Sidebar (300x600)</option>
                    <option value="sports_sidebar">Sports Sidebar (300x600)</option>
                    <option value="sponsored_content">Sponsored Content Block (Tax Corner)</option>
                    <option value="grid_sidebar_stack_1">Grid Sidebar Stack Ad 1 (300x250)</option>
                    <option value="grid_sidebar_stack_2">Grid Sidebar Stack Ad 2 (300x250)</option>
                    <option value="grid_sidebar_stack_3">Grid Sidebar Stack Ad 3 (300x250)</option>
                    <option value="flyer_1">Flyer Ad 1 (Square/Portrait)</option>
                    <option value="flyer_2">Flyer Ad 2 (Square/Portrait)</option>
                    <option value="flyer_3">Flyer Ad 3 (Square/Portrait)</option>
                    <option value="full_width_1">Full Width Banner 1 (728x90)</option>
                    <option value="full_width_2">Full Width Banner 2 (728x90)</option>
                    <option value="full_width_3">Full Width Banner 3 (728x90)</option>
                    <option value="full_width_4">Full Width Banner 4 (728x90)</option>
                    <option value="in-article-inline">In-Article Inline (336x280)</option>
                    <option value="footer-banner">Footer Leaderboard (728x90)</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Priority Weight</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className={inputCls}
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Target URL & CTA Text */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Target URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/campaign"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>CTA Text</label>
                  <input
                    type="text"
                    placeholder="Learn More"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Uploads (Image Banner & Brand Logo) */}
              <div className="grid grid-cols-2 gap-4 border border-theme-gray-100 p-3 bg-theme-light-gray/50">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Campaign Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-mono file:bg-theme-blue file:text-white cursor-pointer"
                  />
                  {image && <span className="text-[9px] text-theme-gray-400 truncate">{image.name}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Sponsored Brand Logo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSponsoredLogo(e.target.files?.[0] || null)}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-mono file:bg-theme-blue file:text-white cursor-pointer"
                  />
                  {sponsoredLogo && <span className="text-[9px] text-theme-gray-400 truncate">{sponsoredLogo.name}</span>}
                </div>
              </div>

              {/* Sponsored Rich Block Specifics */}
              <div className="border border-theme-gray-100 p-3 flex flex-col gap-3">
                <span className="text-[9px] font-mono font-bold text-theme-blue uppercase tracking-widest">Sponsored Content Fields (Only for Tax Corner / Rich Content slots)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Sponsored Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Taxpayer Channel"
                      value={sponsoredHeadline}
                      onChange={(e) => setSponsoredHeadline(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Sponsored Video Embed URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      value={sponsoredVideoUrl}
                      onChange={(e) => setSponsoredVideoUrl(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* HTML Content */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Banner HTML / AdSense Code</label>
                <textarea
                  rows={3}
                  placeholder="Insert custom HTML banner code..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="bg-white border border-theme-gray-100 px-4 py-2.5 text-xs text-theme-black focus:outline-none focus:border-theme-blue font-mono w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Start Date</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>End Date</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center py-2 border-y border-theme-gray-100">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-theme-gray-100 text-theme-blue w-4 h-4 cursor-pointer"
                  id="modal-active"
                />
                <label htmlFor="modal-active" className="text-xs font-mono font-bold uppercase cursor-pointer text-theme-black tracking-wider">
                  Activate Campaign immediately
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Save className="w-4 h-4" />
                Save Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
