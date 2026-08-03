"use client";
import { API_BASE_URL } from '@/config';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'reader' | 'journalist' | 'editor' | 'admin';
  avatar: string | null;
  bio: string;
  twitter: string;
  github: string;
  website: string;
}

export interface SiteSettings {
  site_name: string;
  logo_light: string | null;
  logo_dark: string | null;
  primary_color: string;
  secondary_color: string;
  font_color: string;
  bg_color: string;
  btn_bg_color: string;
  btn_text_color: string;
  link_color: string;
  hover_color: string;
  font_family_body: string;
  font_family_headings: string;
  active_theme: string;
  custom_css: string;
  maintenance_mode: boolean;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  footer_text: string;
  footer_recent_limit: number;
  homepage_limit: number;
}

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  bookmarks: string[];
  isBookmarked: (slug: string) => boolean;
  toggleBookmark: (slug: string) => void;
  language: 'RW' | 'EN' | 'FR';
  setLanguage: (lang: 'RW' | 'EN' | 'FR') => void;
  siteSettings: SiteSettings | null;
  fetchSiteSettings: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [language, setLanguageState] = useState<'RW' | 'EN' | 'FR'>('RW');
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize state from local storage and fetch settings
  useEffect(() => {
    // 1. Theme Check
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const currentTheme = savedTheme || 'dark';
    setTheme(currentTheme);
    document.documentElement.classList.add(currentTheme);

    // 2. Bookmarks Check
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Error loading bookmarks", e);
      }
    }

    // 3. Token Check
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setLoading(false);
    }

    // 3.5 Language Check
    const savedLanguage = localStorage.getItem('language') as 'RW' | 'EN' | 'FR' | null;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }

    // 4. Fetch site settings
    fetchSiteSettings();
  }, []);

  // Update theme tag on change
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(nextTheme);
  };

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/auth/me/', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token might have expired
        logout();
      }
    } catch (err) {
      console.error("Profile fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleFont = (fontName: string) => {
    if (!fontName || ['Satoshi', 'Space Mono', 'Inter', 'system-ui', 'sans-serif', 'serif', 'monospace'].includes(fontName)) return;
    const fontId = `google-font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
    if (document.getElementById(fontId)) return;

    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&display=swap`;
    document.head.appendChild(link);
  };

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/site-settings/');
      if (res.ok) {
        const settings = await res.json();
        setSiteSettings(settings);
        
        const root = document.documentElement;
        // Dynamically override styles
        if (settings.primary_color) {
          root.style.setProperty('--color-blue', settings.primary_color);
          root.style.setProperty('--color-dark-section', settings.primary_color);
          root.style.setProperty('--color-dark-blue', settings.primary_color);
        }
        if (settings.secondary_color) {
          root.style.setProperty('--color-light-gray', settings.secondary_color);
        }
        if (settings.font_color) {
          root.style.setProperty('--color-black', settings.font_color);
        }
        if (settings.bg_color) {
          root.style.setProperty('--color-white', settings.bg_color);
        }
        if (settings.btn_bg_color) {
          root.style.setProperty('--color-btn-bg', settings.btn_bg_color);
        }
        if (settings.btn_text_color) {
          root.style.setProperty('--color-btn-text', settings.btn_text_color);
        }
        if (settings.link_color) {
          root.style.setProperty('--color-link', settings.link_color);
        }
        if (settings.hover_color) {
          root.style.setProperty('--color-blue-glow', settings.hover_color);
        }

        // Typography settings
        if (settings.font_family_body) {
          loadGoogleFont(settings.font_family_body);
          const bodyFont = ['Satoshi', 'Inter', 'Roboto', 'Outfit', 'Open Sans'].includes(settings.font_family_body)
            ? `'${settings.font_family_body}', Satoshi, system-ui, sans-serif`
            : `'${settings.font_family_body}', sans-serif`;
          root.style.setProperty('--font-sans', bodyFont);
        }
        if (settings.font_family_headings) {
          loadGoogleFont(settings.font_family_headings);
          const headingFont = ['Playfair Display', 'Lora', 'Merriweather', 'Instrument Serif', 'Cinzel'].includes(settings.font_family_headings)
            ? `'${settings.font_family_headings}', 'Instrument Serif', Georgia, serif`
            : `'${settings.font_family_headings}', serif`;
          root.style.setProperty('--font-serif', headingFont);
        }

        // Active Theme Class Settings
        const activeTheme = settings.active_theme || 'theme-classic';
        root.classList.remove('theme-classic', 'theme-editorial', 'theme-minimal');
        root.classList.add(activeTheme);

        // Inject Custom CSS block
        const customCssId = 'cms-custom-css';
        let styleTag = document.getElementById(customCssId) as HTMLStyleElement;
        if (settings.custom_css) {
          if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = customCssId;
            document.head.appendChild(styleTag);
          }
          styleTag.innerHTML = settings.custom_css;
        } else if (styleTag) {
          styleTag.remove();
        }
      }
    } catch (err) {
      console.error("Failed to load site settings", err);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/auth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        const accessToken = data.access;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', data.refresh);
        setToken(accessToken);
        await fetchUserProfile(accessToken);
        return true;
      }
    } catch (err) {
      console.error("Login request failed", err);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  const isBookmarked = (slug: string) => bookmarks.includes(slug);

  const toggleBookmark = (slug: string) => {
    let nextBookmarks: string[];
    if (bookmarks.includes(slug)) {
      nextBookmarks = bookmarks.filter(b => b !== slug);
    } else {
      nextBookmarks = [...bookmarks, slug];
    }
    setBookmarks(nextBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(nextBookmarks));
  };

  const setLanguage = (lang: 'RW' | 'EN' | 'FR') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        token,
        login,
        logout,
        bookmarks,
        isBookmarked,
        toggleBookmark,
        language,
        setLanguage,
        siteSettings,
        fetchSiteSettings,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
