"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Save, CheckCircle, Plus, Trash2, Edit3, Globe, 
  Settings2, Palette, Type, Share2, AlertCircle, Info 
} from 'lucide-react';

interface SocialLink {
  id: number;
  platform: string;
  custom_name: string;
  url: string;
  icon_name: string;
  order: number;
}

export default function SiteSettingsManager() {
  const { token, fetchSiteSettings } = useApp();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'social'>('general');

  // General Settings Fields
  const [siteName, setSiteName] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [footerText, setFooterText] = useState('');
  const [footerRecentLimit, setFooterRecentLimit] = useState(3);
  const [homepageLimit, setHomepageLimit] = useState(5);

  // Theme customizer Fields
  const [primaryColor, setPrimaryColor] = useState('#1B3B6F');
  const [secondaryColor, setSecondaryColor] = useState('#F4F6F9');
  const [fontColor, setFontColor] = useState('#1A1A1A');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [btnBgColor, setBtnBgColor] = useState('#2F6DF6');
  const [btnTextColor, setBtnTextColor] = useState('#FFFFFF');
  const [linkColor, setLinkColor] = useState('#2F6DF6');
  const [hoverColor, setHoverColor] = useState('#1B3B6F');
  
  const [fontFamilyBody, setFontFamilyBody] = useState('Satoshi');
  const [fontFamilyHeadings, setFontFamilyHeadings] = useState('Playfair Display');
  const [activeTheme, setActiveTheme] = useState('theme-classic');
  const [customCss, setCustomCss] = useState('');

  // Social Links List and CRUD states
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);

  // Social form fields
  const [socPlatform, setSocPlatform] = useState('facebook');
  const [socCustomName, setSocCustomName] = useState('');
  const [socUrl, setSocUrl] = useState('');
  const [socIconName, setSocIconName] = useState('Facebook');
  const [socOrder, setSocOrder] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchSettingsData = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/site-settings/');
      if (res.ok) {
        const data = await res.json();
        setSiteName(data.site_name || 'Isezerano');
        setMaintenanceMode(data.maintenance_mode || false);
        setFooterText(data.footer_text || '');
        setFooterRecentLimit(data.footer_recent_limit || 3);
        setHomepageLimit(data.homepage_limit || 5);

        // Theme properties
        setPrimaryColor(data.primary_color || '#1B3B6F');
        setSecondaryColor(data.secondary_color || '#F4F6F9');
        setFontColor(data.font_color || '#1A1A1A');
        setBgColor(data.bg_color || '#FFFFFF');
        setBtnBgColor(data.btn_bg_color || '#2F6DF6');
        setBtnTextColor(data.btn_text_color || '#FFFFFF');
        setLinkColor(data.link_color || '#2F6DF6');
        setHoverColor(data.hover_color || '#1B3B6F');
        setFontFamilyBody(data.font_family_body || 'Satoshi');
        setFontFamilyHeadings(data.font_family_headings || 'Playfair Display');
        setActiveTheme(data.active_theme || 'theme-classic');
        setCustomCss(data.custom_css || '');
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/social-links/');
      if (res.ok) {
        const data = await res.json();
        setSocialLinks(data.sort((a: SocialLink, b: SocialLink) => a.order - b.order));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchSettingsData(), fetchSocialLinks()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmitSettings = async (e: React.FormEvent) => {
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
          maintenance_mode: maintenanceMode,
          footer_text: footerText,
          footer_recent_limit: Number(footerRecentLimit),
          homepage_limit: Number(homepageLimit),
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          font_color: fontColor,
          bg_color: bgColor,
          btn_bg_color: btnBgColor,
          btn_text_color: btnTextColor,
          link_color: linkColor,
          hover_color: hoverColor,
          font_family_body: fontFamilyBody,
          font_family_headings: fontFamilyHeadings,
          active_theme: activeTheme,
          custom_css: customCss
        })
      });

      if (res.ok) {
        setSuccess(true);
        await fetchSiteSettings();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to update configurations.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Social CRUD Operations
  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingSocial 
      ? `${API_BASE_URL}/api/v1/cms/social-links/${editingSocial.id}/`
      : `${API_BASE_URL}/api/v1/cms/social-links/`;
    
    const method = editingSocial ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: socPlatform,
          custom_name: socCustomName || socPlatform.toUpperCase(),
          url: socUrl,
          icon_name: socIconName,
          order: Number(socOrder) || 0
        })
      });
      if (res.ok) {
        setShowSocialModal(false);
        setEditingSocial(null);
        setSocPlatform('facebook'); setSocCustomName(''); setSocUrl(''); setSocIconName('Facebook'); setSocOrder(0);
        fetchSocialLinks();
      } else {
        alert("Failed to save social media platform link.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSocial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this social media connection?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/social-links/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSocialLinks();
      } else {
        alert("Failed to delete social link.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddSocialModal = () => {
    setEditingSocial(null);
    setSocPlatform('facebook');
    setSocCustomName('');
    setSocUrl('');
    setSocIconName('Facebook');
    setSocOrder(socialLinks.length);
    setShowSocialModal(true);
  };

  const openEditSocialModal = (link: SocialLink) => {
    setEditingSocial(link);
    setSocPlatform(link.platform);
    setSocCustomName(link.custom_name);
    setSocUrl(link.url);
    setSocIconName(link.icon_name);
    setSocOrder(link.order);
    setShowSocialModal(true);
  };

  const bodyFontsList = ['Satoshi', 'Inter', 'Roboto', 'Outfit', 'Open Sans', 'Georgia', 'system-ui'];
  const headingFontsList = ['Playfair Display', 'Lora', 'Merriweather', 'Instrument Serif', 'Cinzel', 'Outfit', 'Roboto'];

  const inputCls = "bg-white border border-theme-gray-100 px-4 py-2 text-xs text-theme-black focus:outline-none focus:border-theme-blue w-full rounded";
  const labelCls = "text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING GENERAL SETTINGS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-theme-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black">
            General Settings & Customization
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Control dynamic templates, styling elements, metadata, and dynamic footer networks
          </p>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="p-4 border border-green-600 text-green-700 text-xs font-mono rounded flex items-center gap-2 bg-green-50 shadow-sm animate-fade-in animate-duration-300">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>SETTINGS CONFIGURATION SAVED SUCCESSFULLY. OVERRIDES INJECTED IN CORE TEMPLATES.</span>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-theme-gray-100 font-mono text-xs">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-5 py-3 border-b-2 font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'general' ? 'border-theme-blue text-theme-blue' : 'border-transparent text-theme-gray-400 hover:text-theme-black'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Site Settings
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-5 py-3 border-b-2 font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'theme' ? 'border-theme-blue text-theme-blue' : 'border-transparent text-theme-gray-400 hover:text-theme-black'
          }`}
        >
          <Palette className="w-4 h-4" />
          Theme & Customizer
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-5 py-3 border-b-2 font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'social' ? 'border-theme-blue text-theme-blue' : 'border-transparent text-theme-gray-400 hover:text-theme-black'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Dynamic Social Profiles
        </button>
      </div>

      {/* TAB CONTENTS CONTAINER */}
      <div className="max-w-4xl w-full">
        {/* Tab 1: General Settings Form */}
        {activeTab === 'general' && (
          <form onSubmit={handleSubmitSettings} className="border border-theme-gray-100 p-8 flex flex-col gap-6 bg-theme-light-gray rounded shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site Name */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Site Platform Title</label>
                <input 
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              {/* Maintenance Toggle */}
              <div className="flex flex-col gap-2 bg-white border border-theme-gray-100 p-4 rounded justify-center">
                <label className="flex items-center gap-2.5 text-xs text-theme-black font-mono cursor-pointer font-bold uppercase tracking-wider">
                  <input 
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="rounded border-theme-gray-100 text-theme-blue focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span>Suspend Operations (Maintenance)</span>
                </label>
              </div>
            </div>

            {/* Display limits configuration */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-theme-gray-100">
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Footer Recent Articles Limit</label>
                <input 
                  type="number"
                  value={footerRecentLimit}
                  onChange={(e) => setFooterRecentLimit(Number(e.target.value))}
                  className={inputCls}
                  min="1"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelCls}>Global Homepage Section Limits</label>
                <input 
                  type="number"
                  value={homepageLimit}
                  onChange={(e) => setHomepageLimit(Number(e.target.value))}
                  className={inputCls}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Footer Text */}
            <div className="flex flex-col gap-2 pt-4 border-t border-theme-gray-100">
              <label className={labelCls}>Footer copyright credit details</label>
              <textarea 
                rows={3}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className={`${inputCls} font-mono`}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start rounded"
            >
              <Save className="w-4 h-4" />
              {saving ? 'SAVING...' : 'Save Settings'}
            </button>
          </form>
        )}

        {/* Tab 2: Theme Settings Customizer */}
        {activeTab === 'theme' && (
          <form onSubmit={handleSubmitSettings} className="border border-theme-gray-100 p-8 flex flex-col gap-6 bg-theme-light-gray rounded shadow-sm">
            
            {/* Color Palette customization options */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-theme-black border-b border-theme-gray-100 pb-1.5 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-theme-blue" />
                Color Theme Configuration Variables
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Primary Accent', value: primaryColor, set: setPrimaryColor },
                  { label: 'Secondary Accent', value: secondaryColor, set: setSecondaryColor },
                  { label: 'Core Background', value: bgColor, set: setBgColor },
                  { label: 'Default Text Color', value: fontColor, set: setFontColor },
                  { label: 'Button BG color', value: btnBgColor, set: setBtnBgColor },
                  { label: 'Button text color', value: btnTextColor, set: setBtnTextColor },
                  { label: 'Link Color accent', value: linkColor, set: setLinkColor },
                  { label: 'Hover link state', value: hoverColor, set: setHoverColor }
                ].map((item) => (
                  <div key={item.label} className="bg-white p-3 border border-theme-gray-100 flex flex-col gap-2 rounded shadow-sm">
                    <span className="text-[9px] font-mono text-theme-gray-400 font-bold uppercase truncate">{item.label}</span>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color"
                        value={item.value}
                        onChange={(e) => item.set(e.target.value)}
                        className="w-8 h-8 rounded border border-black/10 shrink-0 cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={item.value}
                        onChange={(e) => item.set(e.target.value)}
                        className="w-full bg-white border border-theme-gray-100 text-center font-mono text-[10px] py-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Customizers */}
            <div className="flex flex-col gap-4 pt-4 border-t border-theme-gray-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-theme-black border-b border-theme-gray-100 pb-1.5 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-theme-blue" />
                Typography Font Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Body Font */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Default Body Font family (Google Font)</label>
                  <select
                    value={fontFamilyBody}
                    onChange={(e) => setFontFamilyBody(e.target.value)}
                    className={inputCls}
                  >
                    {bodyFontsList.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                {/* Headings Font */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Default Headings Font family (Google Font)</label>
                  <select
                    value={fontFamilyHeadings}
                    onChange={(e) => setFontFamilyHeadings(e.target.value)}
                    className={inputCls}
                  >
                    {headingFontsList.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Theme Selector */}
            <div className="flex flex-col gap-4 pt-4 border-t border-theme-gray-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-theme-black border-b border-theme-gray-100 pb-1.5">
                Active Theme Engine Layout
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'theme-classic', name: 'Classic Broadcaster', desc: 'Serif titles, heavy outlines, and newspaper print styling.' },
                  { id: 'theme-editorial', name: 'Editorial Premium', desc: 'Vibrant gradients, sleek dark backdrops, and modern dynamic rails.' },
                  { id: 'theme-minimal', name: 'Minimal & Clean', desc: 'Low density, generous layout spaces, and light gray structures.' }
                ].map((th) => (
                  <label 
                    key={th.id}
                    className={`p-4 border rounded bg-white flex flex-col gap-1 cursor-pointer transition-all shadow-sm ${
                      activeTheme === th.id 
                        ? 'border-theme-blue ring-1 ring-theme-blue' 
                        : 'border-theme-gray-100 hover:border-theme-blue/40'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-theme-black uppercase tracking-wider">{th.name}</span>
                      <input 
                        type="radio" 
                        name="theme_select"
                        value={th.id}
                        checked={activeTheme === th.id}
                        onChange={() => setActiveTheme(th.id)}
                        className="text-theme-blue"
                      />
                    </div>
                    <p className="text-[10px] text-theme-gray-400 font-semibold font-mono leading-relaxed mt-1">{th.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom CSS overrides */}
            <div className="flex flex-col gap-2 pt-4 border-t border-theme-gray-100">
              <label className={labelCls}>Custom override CSS stylesheet code</label>
              <textarea 
                rows={5}
                placeholder="/* Override layout styles here */"
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className={`${inputCls} font-mono`}
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start rounded"
            >
              <Save className="w-4 h-4" />
              {saving ? 'SAVING...' : 'Save Theme Override'}
            </button>
          </form>
        )}

        {/* Tab 3: Dynamic Social Links manager */}
        {activeTab === 'social' && (
          <div className="border border-theme-gray-100 p-8 flex flex-col gap-6 bg-theme-light-gray rounded shadow-sm">
            <div className="flex justify-between items-center border-b border-theme-gray-100 pb-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-theme-black">Dynamic Networks</h3>
                <span className="text-[10px] text-theme-gray-400 font-mono">Dynamic platforms automatically populate the website footer bar</span>
              </div>
              <button
                onClick={openAddSocialModal}
                className="flex items-center gap-1 px-3 py-1.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Platform
              </button>
            </div>

            {/* Table of dynamic platforms */}
            <div className="border border-theme-gray-100 rounded overflow-hidden shadow-sm bg-white">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <thead>
                  <tr className="bg-theme-light-gray border-b border-theme-gray-100 text-[9px] uppercase tracking-wider text-theme-gray-400">
                    <th className="p-3 pl-4">Platform Type</th>
                    <th className="p-3">Label / Name</th>
                    <th className="p-3">URL Route</th>
                    <th className="p-3">Lucide Icon Class</th>
                    <th className="p-3">Display Order</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-gray-100">
                  {socialLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-theme-light-gray/20">
                      <td className="p-3 pl-4 font-bold uppercase text-theme-blue text-[10px]">{link.platform}</td>
                      <td className="p-3 text-theme-black font-semibold">{link.custom_name}</td>
                      <td className="p-3 text-theme-gray-400 text-[10px] truncate max-w-xs">{link.url}</td>
                      <td className="p-3 text-theme-black">
                        <code className="bg-theme-light-gray px-1 py-0.5 border border-theme-gray-100 text-[9px] rounded">{link.icon_name}</code>
                      </td>
                      <td className="p-3 text-center font-bold">{link.order}</td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => openEditSocialModal(link)}
                            className="p-1 border border-theme-gray-100 hover:bg-theme-light-gray text-theme-black rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSocial(link.id)}
                            className="p-1 border border-theme-gray-100 hover:bg-red-50 text-red-700 hover:border-red-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {socialLinks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-theme-gray-400 uppercase text-[10px] font-mono tracking-widest">
                        No dynamic platforms registered. Add a platform above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border border-theme-blue/10 bg-white text-theme-black text-xs font-mono rounded flex gap-2">
              <Info className="w-5 h-5 text-theme-blue shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Dynamic networks connect immediately. You may register any default platform or configure custom networks (such as Tiktok, Telegram, or WhatsApp) specifying an appropriate Lucide icon name.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SOCIAL MEDIA CRUD MODAL DIALOG */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-sm p-6 flex flex-col gap-5 shadow-xl max-h-[90vh] overflow-y-auto rounded animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                {editingSocial ? <Edit3 className="w-4 h-4 text-theme-blue" /> : <Plus className="w-4 h-4 text-theme-blue" />}
                {editingSocial ? 'Configure Connection' : 'Add Dynamic Platform'}
              </h3>
              <button
                onClick={() => {
                  setShowSocialModal(false);
                  setEditingSocial(null);
                }}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSocial} className="flex flex-col gap-4">
              {/* Platform Selector */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Platform Key Type</label>
                <select
                  value={socPlatform}
                  onChange={(e) => setSocPlatform(e.target.value)}
                  className={inputCls}
                >
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="github">GitHub</option>
                  <option value="custom">Custom Network Option</option>
                </select>
              </div>

              {/* Custom Display Name */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Display Label / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow us on Facebook"
                  value={socCustomName}
                  onChange={(e) => setSocCustomName(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* URL */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Platform URL Address</label>
                <input
                  type="url"
                  required
                  placeholder="https://facebook.com/my-handle"
                  value={socUrl}
                  onChange={(e) => setSocUrl(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon Key */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Lucide Icon Class</label>
                  <select
                    value={socIconName}
                    onChange={(e) => setSocIconName(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Youtube">YouTube</option>
                    <option value="Linkedin">LinkedIn</option>
                    <option value="Send">Send (Telegram)</option>
                    <option value="MessageCircle">MessageCircle (WhatsApp)</option>
                    <option value="Github">GitHub</option>
                    <option value="Globe">Globe (Custom Link)</option>
                  </select>
                </div>

                {/* Display Order */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Display order weight</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={socOrder}
                    onChange={(e) => setSocOrder(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowSocialModal(false);
                    setEditingSocial(null);
                  }}
                  className="px-4 py-2 border border-theme-gray-100 text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
