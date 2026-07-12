"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Terminal, Plus, Megaphone, Check, X, ShieldAlert, BarChart3, Save } from 'lucide-react';

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

  // Form states
  const [name, setName] = useState('');
  const [placement, setPlacement] = useState('header-banner');
  const [targetUrl, setTargetUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchAds = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cms/ads/', {
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

  useEffect(() => {
    if (token) {
      fetchAds();
    }
  }, [token]);

  const handleToggleActive = async (ad: Ad) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cms/ads/${ad.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !ad.is_active })
      });
      if (res.ok) {
        fetchAds();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cms/ads/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          placement,
          target_url: targetUrl,
          html_content: htmlContent,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          priority: Number(priority),
          is_active: isActive
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        // Reset states
        setName('');
        setTargetUrl('');
        setHtmlContent('');
        setStartDate('');
        setEndDate('');
        setPriority(0);
        setIsActive(true);
        fetchAds();
      } else {
        alert("Failed to submit campaign data.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING CAMPAIGN REGISTRY...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-theme-blue" />
            Ad Campaigns Console
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            ALLOCATE PROMOTIONAL SLOTS, VIEW IMPRESSION/CLICK METRICS, AND ADJUST CTR PRIORITIES
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_12px_rgba(47,109,246,0.3)] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Deploy Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono text-theme-gray-400 uppercase bg-white/2">
                <th className="p-4 pl-6">Campaign Name</th>
                <th className="p-4">Placement Slot</th>
                <th className="p-4">Schedule Frame</th>
                <th className="p-4">Impressions</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">CTR Metrics</th>
                <th className="p-4 pr-6 text-right">Gate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-theme-gray-400 font-mono">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 pl-6 text-white font-bold max-w-xs truncate">
                    {ad.name}
                  </td>
                  <td className="p-4 text-xs font-semibold uppercase text-theme-blue">
                    {ad.placement}
                  </td>
                  <td className="p-4 text-[10px] text-theme-gray-400 whitespace-nowrap">
                    {new Date(ad.start_date).toLocaleDateString()} – {new Date(ad.end_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-xs">
                    {ad.impressions.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs">
                    {ad.clicks.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs flex items-center gap-1 mt-2 text-white font-semibold">
                    <BarChart3 className="w-3.5 h-3.5 text-theme-blue" />
                    {ad.ctr}%
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => handleToggleActive(ad)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                        ad.is_active 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
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
                    No campaigns deployed. Activate the first sponsorship.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Deploying Campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="font-mono text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <Megaphone className="w-4.5 h-4.5 text-theme-blue" />
                Deploy New Campaign
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-theme-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="flex flex-col gap-4 text-xs font-mono text-theme-gray-400">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase">Campaign Description Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Cyber Goggles Launch Phase 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Placement */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase">Placement Slot</label>
                  <select 
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="header-banner">Header Leaderboard (970x250)</option>
                    <option value="sidebar-rail">Sidebar Rail (300x600)</option>
                    <option value="in-feed-native">In-Feed Native Card</option>
                    <option value="in-article-inline">In-Article Inline (336x280)</option>
                    <option value="footer-banner">Footer Leaderboard (728x90)</option>
                    <option value="interstitial">Interstitial Glass Modal</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase">Priority Weight</label>
                  <input 
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Target URL */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase">Target Anchor URL</label>
                <input 
                  type="url"
                  placeholder="https://omnicorp.cyber/campaign"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* HTML Content (fallback image code) */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase">HTML Code / Script creative</label>
                <textarea 
                  rows={4}
                  placeholder="Insert custom HTML banner code, script tags, or styling frames..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="bg-theme-black/50 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase">Launch Timestamp</label>
                  <input 
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase">Expiration Timestamp</label>
                  <input 
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center py-2 border-y border-white/5">
                <input 
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-white/10 text-theme-blue w-4 h-4 cursor-pointer"
                  id="modal-active"
                />
                <label htmlFor="modal-active" className="uppercase cursor-pointer">Activate Campaign immediately</label>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_15px_rgba(47,109,246,0.3)] text-white font-mono font-bold uppercase rounded-xl tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Save className="w-4 h-4" />
                TRANSMIT CAMPAIGN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
