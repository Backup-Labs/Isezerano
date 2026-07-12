"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Plus, Eye, Clock, Check, X, FileText, ChevronRight, Edit3 } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  category: { name: string } | null;
  author: { username: string };
  status: 'draft' | 'in_review' | 'published' | 'archived';
  published_at: string;
  view_count: number;
}

export default function ArticlesManager() {
  const { token, user } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchArticles = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cms/articles/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchArticles();
    }
  }, [token]);

  const handlePublish = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cms/articles/${id}/publish/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cms/articles/${id}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold rounded-lg font-mono">PUBLISHED</span>;
      case 'in_review':
        return <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-theme-blue text-[10px] font-bold rounded-lg font-mono">IN REVIEW</span>;
      case 'draft':
        return <span className="px-2 py-0.5 bg-gray-500/10 border border-gray-500/30 text-theme-gray-400 text-[10px] font-bold rounded-lg font-mono">DRAFT</span>;
      default:
        return <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-lg font-mono">ARCHIVED</span>;
    }
  };

  const isEditorOrAdmin = user && ['editor', 'admin'].includes(user.role);

  const filteredArticles = statusFilter === 'all' 
    ? articles 
    : articles.filter(a => a.status === statusFilter);

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-white">
            Articles Broadcast Terminal
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            MANAGE, EDIT, AND APPROVE NETWORK FREQUENCIES
          </p>
        </div>

        <Link 
          href="/newsroom/articles/create"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_12px_rgba(47,109,246,0.3)] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Transmit Article
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 glass-panel rounded-xl w-max">
        {['all', 'draft', 'in_review', 'published'].map((status) => (
          <button 
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              statusFilter === status ? 'bg-theme-blue text-white' : 'text-theme-gray-400 hover:text-white'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Data Table List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono text-theme-gray-400 uppercase bg-white/2">
                <th className="p-4 pl-6">Headline Title</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Terminal Author</th>
                <th className="p-4">Index Status</th>
                <th className="p-4">Decoded views</th>
                <th className="p-4 pr-6 text-right">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-theme-gray-400">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 pl-6 font-mono text-white font-semibold max-w-sm truncate">
                    {art.title}
                  </td>
                  <td className="p-4 text-xs font-mono">
                    {art.category?.name || 'GENERIC'}
                  </td>
                  <td className="p-4 text-xs font-mono">
                    @{art.author.username}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(art.status)}
                  </td>
                  <td className="p-4 text-xs font-mono flex items-center gap-1 mt-1">
                    <Eye className="w-3.5 h-3.5 text-theme-blue" />
                    {art.view_count}
                  </td>
                  <td className="p-4 pr-6 text-right flex items-center justify-end gap-2">
                    {/* Editorial Controls for Editor+ */}
                    {isEditorOrAdmin && art.status === 'in_review' && (
                      <>
                        <button 
                          onClick={() => handlePublish(art.id)}
                          className="p-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all cursor-pointer flex items-center gap-0.5"
                          title="Approve & Publish"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono font-bold uppercase">Publish</span>
                        </button>
                        <button 
                          onClick={() => handleReject(art.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer flex items-center gap-0.5"
                          title="Reject to Draft"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono font-bold uppercase">Reject</span>
                        </button>
                      </>
                    )}

                    <Link 
                      href={`/newsroom/articles/${art.id}/edit`}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-theme-blue/10 hover:text-theme-blue hover:border-theme-blue/30 text-white transition-all flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-bold uppercase">Modify</span>
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 font-mono text-xs uppercase tracking-wider">
                    Terminals empty. No active dispatches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
