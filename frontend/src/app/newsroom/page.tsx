"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { BookOpen, Users, Megaphone, Eye, Sparkles } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  category: { name: string } | null;
  view_count: number;
  published_at: string;
}

export default function AnalyticsDashboard() {
  const { token } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [adCampaignCount, setAdCampaignCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 1. Fetch Articles for traffic metrics
        const artRes = await fetch('http://127.0.0.1:8000/api/v1/articles/');
        if (artRes.ok) {
          const data = await artRes.json();
          setArticles(Array.isArray(data) ? data : (data.results || []));
        }

        // 2. Fetch Ad campaigns count
        const adRes = await fetch('http://127.0.0.1:8000/api/v1/ads/header-banner/');
        if (adRes.ok) {
          setAdCampaignCount(3); // Mock active campaigns total for display
        }

        // 3. Fetch Subscribers count
        const subRes = await fetch('http://127.0.0.1:8000/api/v1/newsletter/subscribe/');
        if (subRes.ok) {
          setSubscriberCount(148); // Mock subscribers list size
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING ANALYTICS...</span>
      </div>
    );
  }

  const totalViews = articles.reduce((sum, art) => sum + art.view_count, 0);
  const publishedArticles = articles.length;

  // Chart data: views by category
  const categoryViews: Record<string, number> = {};
  articles.forEach(art => {
    const catName = art.category?.name || 'Uncategorized';
    categoryViews[catName] = (categoryViews[catName] || 0) + art.view_count;
  });
  const chartData = Object.entries(categoryViews).map(([name, views]) => ({ name, views }));

  // Line chart data: pageviews over time (weekly forecast)
  const lineChartData = [
    { day: 'Mon', views: Math.round(totalViews * 0.1) },
    { day: 'Tue', views: Math.round(totalViews * 0.15) },
    { day: 'Wed', views: Math.round(totalViews * 0.12) },
    { day: 'Thu', views: Math.round(totalViews * 0.22) },
    { day: 'Fri', views: Math.round(totalViews * 0.18) },
    { day: 'Sat', views: Math.round(totalViews * 0.08) },
    { day: 'Sun', views: Math.round(totalViews * 0.15) },
  ];

  const statCards = [
    { name: 'Total Pageviews', value: totalViews.toLocaleString(), icon: <Eye className="w-5 h-5 text-theme-blue" />, desc: 'Total article pageviews' },
    { name: 'Published Articles', value: publishedArticles, icon: <BookOpen className="w-5 h-5 text-theme-blue" />, desc: 'Total articles live' },
    { name: 'Active Ads', value: adCampaignCount, icon: <Megaphone className="w-5 h-5 text-theme-blue" />, desc: 'Active ad placements' },
    { name: 'Newsletter Subscribers', value: subscriberCount, icon: <Users className="w-5 h-5 text-theme-blue" />, desc: 'Registered newsletter emails' },
  ];

  return (
    <div className="flex flex-col gap-8 text-theme-black">
      {/* Title */}
      <div className="flex items-center gap-2 pb-4 border-b border-theme-gray-100">
        <Sparkles className="w-5 h-5 text-theme-blue" />
        <h1 className="serif-title text-2xl font-bold uppercase tracking-wide text-theme-black">
          Dashboard Analytics
        </h1>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="border border-theme-gray-100 p-6 flex items-center justify-between group hover:border-theme-blue transition-all bg-theme-light-gray/40 rounded-md">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-theme-gray-400 font-mono uppercase font-bold tracking-wider">{card.name}</span>
              <span className="serif-title text-3xl font-black text-theme-black">{card.value}</span>
              <span className="text-[10px] text-theme-gray-400 font-mono mt-1 font-semibold">{card.desc}</span>
            </div>
            <div className="w-12 h-12 flex items-center justify-center shrink-0 border border-theme-gray-100 bg-theme-light-gray group-hover:bg-theme-blue group-hover:text-white transition-all rounded">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Weekly Traffic line chart */}
        <div className="border border-theme-gray-100 p-6 flex flex-col gap-4 bg-theme-light-gray/20 rounded-md">
          <h3 className="serif-title text-base font-bold uppercase tracking-tight text-theme-black border-b border-theme-gray-100 pb-2">
            Weekly Traffic Overview
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#F5F6F8', border: '1px solid #e5e7eb' }}
                  labelStyle={{ color: '#000', fontFamily: 'monospace', fontWeight: 'bold' }}
                  itemStyle={{ color: '#1B3B6F', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="views" stroke="#1B3B6F" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories bar chart */}
        <div className="border border-theme-gray-100 p-6 flex flex-col gap-4 bg-theme-light-gray/20 rounded-md">
          <h3 className="serif-title text-base font-bold uppercase tracking-tight text-theme-black border-b border-theme-gray-100 pb-2">
            Views by Category
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#F5F6F8', border: '1px solid #e5e7eb' }}
                  labelStyle={{ color: '#000', fontFamily: 'monospace', fontWeight: 'bold' }}
                  itemStyle={{ color: '#1B3B6F', fontFamily: 'monospace' }}
                />
                <Bar dataKey="views" fill="#1B3B6F" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
