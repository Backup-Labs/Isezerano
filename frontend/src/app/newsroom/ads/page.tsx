"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Megaphone, Check, X, BarChart3, Save } from 'lucide-react';

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
    <div className="flex flex-col gap-6 text-theme-light-gray animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-blue-deep">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-light-gray flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-theme-blue" />
            Ad Campaigns
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Manage advertisement slots and campaign performance
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue-deep hover:bg-theme-blue text-theme-black text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="border border-theme-blue-deep overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-blue-deep text-[10px] font-mono text-theme-gray-400 uppercase bg-theme-charcoal/40">
                <th className="p-4 pl-6">Campaign Name</th>
                <th className="p-4">Placement Slot</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Impressions</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">CTR</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-100 text-sm text-theme-gray-400 font-mono bg-theme-charcoal/10">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-theme-charcoal/30 transition-colors">
                  <td className="p-4 pl-6 text-theme-light-gray font-bold max-w-xs truncate">
                    {ad.name}
                  </td>
                  <td className="p-4 text-xs font-semibold uppercase text-theme-blue">
                    {ad.placement}
                  </td>
                  <td className="p-4 text-[10px] text-theme-gray-400 whitespace-nowrap">
                    {new Date(ad.start_date).toLocaleDateString()} – {new Date(ad.end_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-xs text-theme-light-gray">
                    {ad.impressions.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs text-theme-light-gray">
                    {ad.clicks.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs text-theme-light-gray font-bold">
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
          <div className="border border-theme-blue-deep bg-theme-black text-theme-light-gray w-full max-w-xl p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-light-gray uppercase flex items-center gap-1.5">
                <Megaphone className="w-4.5 h-4.5 text-theme-blue" />
                Deploy New Campaign
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-theme-gray-400 hover:text-theme-light-gray cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="flex flex-col gap-4 text-xs font-mono text-theme-gray-400">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase font-bold text-theme-light-gray">Campaign Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Summer Furniture Launch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border border-theme-blue-deep px-4 py-2 text-xs text-theme-light-gray focus:outline-none focus:border-theme-blue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Placement */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase font-bold text-theme-light-gray">Placement Slot</label>
                  <select 
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="bg-theme-black border border-theme-blue-deep px-4 py-2 text-xs text-theme-light-gray focus:outline-none focus:border-theme-blue"
                  >
                    <option value="header-banner">Header Leaderboard (970x250)</option>
                    <option value="sidebar-rail">Sidebar Rail (300x600)</option>
                    <option value="in-feed-native">In-Feed Native Card</option>
                    <option value="in-article-inline">In-Article Inline (336x280)</option>
                    <option value="footer-banner">Footer Leaderboard (728x90)</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase font-bold text-theme-light-gray">Priority Weight</label>
                  <input 
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="bg-transparent border border-theme-blue-deep px-4 py-2 text-xs text-theme-light-gray focus:outline-none focus:border-theme-blue"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Target URL */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase font-bold text-theme-light-gray">Target URL</label>
                <input 
                  type="url"
                  placeholder="https://example.com/campaign"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="bg-transparent border border-theme-blue-deep px-4 py-2 text-xs text-theme-light-gray focus:outline-none focus:border-theme-blue"
                />
              </div>

              {/* HTML Content (fallback image code) */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase font-bold text-theme-light-gray">Banner HTML</label>
                <textarea 
                  rows={4}
                  placeholder="Insert custom HTML banner code..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="bg-transparent border border-theme-blue-deep px-4 py-2.5 text-xs text-theme-light-gray focus:outline-none focus:border-theme-blue font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase font-bold text-theme-light-gray">Start Date</label>
                  <input 
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-theme-black border border-theme-blue-deep px-4 py-2 text-xs text-theme-light-gray focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase font-bold text-theme-light-gray">End Date</label>
                  <input 
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-theme-black border border-theme-blue-deep px-4 py-2 text-xs text-theme-light-gray focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center py-2 border-y border-theme-gray-100">
                <input 
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-theme-blue-deep text-theme-blue w-4 h-4 cursor-pointer"
                  id="modal-active"
                />
                <label htmlFor="modal-active" className="uppercase cursor-pointer text-theme-light-gray font-bold">Activate Campaign immediately</label>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-theme-blue-deep hover:bg-theme-blue text-theme-black font-mono font-bold uppercase rounded-xl tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
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
