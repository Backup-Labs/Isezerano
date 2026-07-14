"use client";

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
  maintenance_mode: boolean;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  footer_text: string;
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
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    } else {
      document.documentElement.className = 'dark';
    }

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
    document.documentElement.className = nextTheme;
  };

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/me/', {
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

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/site-settings/');
      if (res.ok) {
        const settings = await res.json();
        setSiteSettings(settings);
        
        // Dynamically override primary color accent
        if (settings.primary_color) {
          document.documentElement.style.setProperty('--color-blue', settings.primary_color);
        }
      }
    } catch (err) {
      console.error("Failed to load site settings", err);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/token/', {
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
