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
  const { token, user } = useApp();
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
        <span className="font-mono text-xs text-theme-gray-400">PULLING ANALYTIC METRICS...</span>
      </div>
    );
  }

  // Calculate totals
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
    { name: 'Grid Pageviews', value: totalViews.toLocaleString(), icon: <Eye className="w-5 h-5 text-theme-blue" />, desc: 'System total decodes' },
    { name: 'Dispatched Articles', value: publishedArticles, icon: <BookOpen className="w-5 h-5 text-green-400" />, desc: 'Core articles published' },
    { name: 'Active Ad Placements', value: adCampaignCount, icon: <Megaphone className="w-5 h-5 text-orange-400" />, desc: 'Assigned active slots' },
    { name: 'Subscribed Terminals', value: subscriberCount, icon: <Users className="w-5 h-5 text-purple-400" />, desc: 'Registered newsletter emails' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center gap-2 pb-4 border-b border-white/5">
        <Sparkles className="w-5 h-5 text-theme-blue animate-spin" />
        <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-white">
          Realtime Analytics Node
        </h1>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-theme-blue/30 transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-theme-gray-400 font-mono uppercase">{card.name}</span>
              <span className="text-2xl font-bold text-white font-mono">{card.value}</span>
              <span className="text-[10px] text-theme-gray-400 font-mono mt-1">{card.desc}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-theme-blue/10 group-hover:text-theme-blue group-hover:border-theme-blue/20 transition-all">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Weekly Traffic line chart */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
            Weekly Traffic Signal Logs
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="day" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#14161a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#2F6DF6', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="views" stroke="#2F6DF6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories bar chart */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
            View count Distribution by Category
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#14161a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#2F6DF6', fontFamily: 'monospace' }}
                />
                <Bar dataKey="views" fill="#2F6DF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
