"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Save, CheckCircle } from 'lucide-react';

export default function SiteSettingsManager() {
  const { token, fetchSiteSettings } = useApp();
  
  // Fields
  const [siteName, setSiteName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1B3B6F');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [footerText, setFooterText] = useState('');
  const [footerRecentLimit, setFooterRecentLimit] = useState(3);
  const [homepageLimit, setHomepageLimit] = useState(5);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const res = await fetch(API_BASE_URL + '/api/v1/site-settings/');
        if (res.ok) {
          const data = await res.json();
          setSiteName(data.site_name || 'Isezerano');
          setPrimaryColor(data.primary_color || '#1B3B6F');
          setMaintenanceMode(data.maintenance_mode || false);
          setFacebook(data.facebook_url || '');
          setTwitter(data.twitter_url || '');
          setInstagram(data.instagram_url || '');
          setYoutube(data.youtube_url || '');
          setFooterText(data.footer_text || '');
          setFooterRecentLimit(data.footer_recent_limit || 3);
          setHomepageLimit(data.homepage_limit || 5);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/settings/1/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          site_name: siteName,
          primary_color: primaryColor,
          maintenance_mode: maintenanceMode,
          facebook_url: facebook,
          twitter_url: twitter,
          instagram_url: instagram,
          youtube_url: youtube,
          footer_text: footerText,
          footer_recent_limit: Number(footerRecentLimit),
          homepage_limit: Number(homepageLimit)
        })
      });

      if (res.ok) {
        setSuccess(true);
        await fetchSiteSettings();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to update site settings.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING SETTINGS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center gap-2 pb-4 border-b border-theme-gray-100">
        <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black">
          General Settings
        </h1>
      </div>

      {/* Success banner */}
      {success && (
        <div className="p-4 border border-green-600 text-green-700 text-xs font-mono rounded flex items-center gap-2 bg-green-50">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>SETTINGS SAVED SUCCESSFULLY.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="border border-theme-gray-100 p-8 max-w-3xl flex flex-col gap-6 bg-theme-light-gray">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Site Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Site Name</label>
            <input 
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="bg-white border border-theme-gray-100 px-4 py-2 text-sm text-theme-black focus:outline-none focus:border-theme-blue w-full"
              required
            />
          </div>

          {/* Primary Color Accent */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Primary Color Accent</label>
            <div className="flex items-center gap-3">
              <input 
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 border border-theme-gray-100 bg-white cursor-pointer"
              />
              <input 
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="bg-white border border-theme-gray-100 px-4 py-2 text-sm text-theme-black focus:outline-none focus:border-theme-blue font-mono w-32"
                required
              />
            </div>
          </div>
        </div>

        {/* Display Limits Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-theme-gray-100">
          {/* Footer Inkuru Nshya Limit */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Footer "Inkuru Nshya" Limit</label>
            <input 
              type="number"
              value={footerRecentLimit}
              onChange={(e) => setFooterRecentLimit(Number(e.target.value))}
              className="bg-white border border-theme-gray-100 px-4 py-2 text-sm text-theme-black focus:outline-none focus:border-theme-blue w-full"
              min="1"
              required
            />
          </div>

          {/* Homepage Sections Limit */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Homepage Sections Limit</label>
            <input 
              type="number"
              value={homepageLimit}
              onChange={(e) => setHomepageLimit(Number(e.target.value))}
              className="bg-white border border-theme-gray-100 px-4 py-2 text-sm text-theme-black focus:outline-none focus:border-theme-blue w-full"
              min="1"
              required
            />
          </div>
        </div>

        {/* Maintenance Toggle */}
        <div className="flex flex-col gap-2 py-4 border-y border-theme-gray-100">
          <label className="flex items-center gap-2.5 text-xs text-theme-black font-mono cursor-pointer font-bold uppercase tracking-wider">
            <input 
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded border-theme-gray-100 text-theme-blue focus:ring-0 cursor-pointer w-4 h-4"
            />
            <span>Activate Maintenance Mode</span>
          </label>
          <p className="text-xs text-theme-gray-400 pl-6">
            If enabled, public operations are suspended and readers will see a maintenance screen.
          </p>
        </div>

        {/* Social URL links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-mono text-theme-black uppercase tracking-widest font-bold">Social Media Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Facebook URL', value: facebook, set: setFacebook },
              { label: 'Twitter/X URL', value: twitter, set: setTwitter },
              { label: 'Instagram URL', value: instagram, set: setInstagram },
              { label: 'Youtube URL', value: youtube, set: setYoutube },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-semibold">{label}</label>
                <input 
                  type="url"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="bg-white border border-theme-gray-100 px-4 py-2 text-xs text-theme-black focus:outline-none focus:border-theme-blue w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Footer Credits Text</label>
          <textarea 
            rows={2}
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="bg-white border border-theme-gray-100 px-4 py-2.5 text-sm text-theme-black focus:outline-none focus:border-theme-blue w-full"
            required
          />
        </div>

        {/* Save button */}
        <button 
          type="submit" 
          disabled={saving}
          className="px-6 py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start"
        >
          <Save className="w-4 h-4" />
          {saving ? 'SAVING...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
