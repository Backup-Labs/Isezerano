"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Terminal, Save, CheckCircle, ShieldAlert } from 'lucide-react';

export default function SiteSettingsManager() {
  const { token, fetchSiteSettings } = useApp();
  
  // Fields
  const [siteName, setSiteName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2F6DF6');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [footerText, setFooterText] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/site-settings/');
        if (res.ok) {
          const data = await res.json();
          setSiteName(data.site_name || 'The Pulse');
          setPrimaryColor(data.primary_color || '#2F6DF6');
          setMaintenanceMode(data.maintenance_mode || false);
          setFacebook(data.facebook_url || '');
          setTwitter(data.twitter_url || '');
          setInstagram(data.instagram_url || '');
          setYoutube(data.youtube_url || '');
          setFooterText(data.footer_text || '');
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
      const res = await fetch('http://127.0.0.1:8000/api/v1/cms/settings/1/', {
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
          footer_text: footerText
        })
      });

      if (res.ok) {
        setSuccess(true);
        // Refresh dynamic configurations in global context
        await fetchSiteSettings();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to update site configurations.");
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
        <span className="font-mono text-xs text-theme-gray-400">LOADING site CONFIGURATIONS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex items-center gap-2 pb-4 border-b border-white/5">
        <Terminal className="w-5 h-5 text-theme-blue" />
        <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-white">
          Global Settings Node
        </h1>
      </div>

      {/* Success banner */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono rounded-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>CONFIGURATIONS SAVED AND INJECTED SUCCESSFULLY.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl max-w-3xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Site Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-theme-gray-400 uppercase">Site Name</label>
            <input 
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-theme-blue/50"
              required
            />
          </div>

          {/* Primary Color Accent */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-theme-gray-400 uppercase">Primary Color Accent</label>
            <div className="flex items-center gap-3">
              <input 
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 border border-white/10 bg-transparent rounded-lg cursor-pointer"
              />
              <input 
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-theme-blue/50 font-mono w-32"
                required
              />
            </div>
          </div>
        </div>

        {/* Maintenance Toggle */}
        <div className="flex flex-col gap-2 py-4 border-y border-white/5">
          <label className="flex items-center gap-2.5 text-sm text-white font-mono cursor-pointer">
            <input 
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded border-white/10 text-theme-blue focus:ring-0 cursor-pointer w-4 h-4"
            />
            <span>ACTIVATE MAINTENANCE PROTOCOL</span>
          </label>
          <p className="text-xs text-theme-gray-400 pl-6">
            If enabled, public operations are suspended with an on-screen grid locked screen.
          </p>
        </div>

        {/* Social URL links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-mono text-white uppercase tracking-wider">Social Feed Anchors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase">Facebook URL</label>
              <input 
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase">Twitter/X URL</label>
              <input 
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase">Instagram URL</label>
              <input 
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-theme-gray-400 uppercase">Youtube URL</label>
              <input 
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="bg-theme-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-theme-gray-400 uppercase">Footer Credits text</label>
          <textarea 
            rows={2}
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="bg-theme-black/50 border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-theme-blue/50"
            required
          />
        </div>

        {/* Save button */}
        <button 
          type="submit" 
          disabled={saving}
          className="px-6 py-3 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_15px_rgba(47,109,246,0.3)] text-white font-mono font-bold uppercase rounded-xl tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start"
        >
          <Save className="w-4 h-4" />
          {saving ? 'SAVING DATA...' : 'SAVE SETTINGS'}
        </button>
      </form>
    </div>
  );
}
