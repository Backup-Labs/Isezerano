"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Plus, Eye, Check, X, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchArticles = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/articles/', {
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
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/articles/${id}/publish/`, {
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
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/articles/${id}/reject/`, {
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
        return <span className="px-2 py-0.5 border border-green-600 text-green-700 text-[10px] font-bold font-mono">PUBLISHED</span>;
      case 'in_review':
        return <span className="px-2 py-0.5 border border-theme-blue text-theme-blue text-[10px] font-bold font-mono">IN REVIEW</span>;
      case 'draft':
        return <span className="px-2 py-0.5 border border-theme-gray-400 text-theme-gray-400 text-[10px] font-bold font-mono">DRAFT</span>;
      default:
        return <span className="px-2 py-0.5 border border-red-600 text-red-700 text-[10px] font-bold font-mono">ARCHIVED</span>;
    }
  };

  const isEditorOrAdmin = user && ['editor', 'admin'].includes(user.role);

  const filteredArticles = statusFilter === 'all' 
    ? articles 
    : articles.filter(a => a.status === statusFilter);

  // Pagination Logic
  const totalItems = filteredArticles.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, pageSize]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING ARTICLES...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black">
            Articles Manager
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Write, edit, and publish news stories
          </p>
        </div>

        <Link 
          href="/newsroom/articles/create"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Write Article
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 border border-theme-gray-100 w-max bg-theme-light-gray">
        {['all', 'draft', 'in_review', 'published'].map((status) => (
          <button 
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              statusFilter === status ? 'bg-theme-blue text-white' : 'text-theme-gray-400 hover:text-theme-black'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Data Table List */}
      <div className="border border-theme-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-gray-100 text-[10px] font-mono text-theme-gray-400 uppercase bg-theme-light-gray">
                <th className="p-4 pl-6">Headline Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Author</th>
                <th className="p-4">Status</th>
                <th className="p-4">Views</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-100 text-sm text-theme-gray-400 bg-white">
              {paginatedArticles.map((art) => (
                <tr key={art.id} className="hover:bg-theme-light-gray transition-colors">
                  <td className="p-4 pl-6 font-bold text-theme-black max-w-sm truncate">
                    <Link href={`/a/${art.slug}`} target="_blank" className="hover:text-theme-blue transition-colors hover:underline">
                      {art.title}
                    </Link>
                  </td>
                  <td className="p-4 text-xs font-mono text-theme-black">
                    {art.category?.name || 'GENERIC'}
                  </td>
                  <td className="p-4 text-xs font-mono text-theme-black">
                    @{art.author.username}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(art.status)}
                  </td>
                  <td className="p-4 text-xs font-mono text-theme-black">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-theme-blue" />
                      {art.view_count}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Editorial Controls for Editor+ */}
                      {isEditorOrAdmin && art.status === 'in_review' && (
                        <>
                          <button 
                            onClick={() => handlePublish(art.id)}
                            className="p-1.5 bg-green-500/10 text-green-700 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all cursor-pointer flex items-center gap-0.5"
                            title="Approve & Publish"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono font-bold uppercase">Publish</span>
                          </button>
                          <button 
                            onClick={() => handleReject(art.id)}
                            className="p-1.5 bg-red-500/10 text-red-700 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer flex items-center gap-0.5"
                            title="Reject to Draft"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono font-bold uppercase">Reject</span>
                          </button>
                        </>
                      )}

                      <Link 
                        href={`/newsroom/articles/${art.id}/edit`}
                        className="p-1.5 border border-theme-gray-100 bg-theme-light-gray hover:bg-theme-blue hover:text-white transition-all flex items-center gap-1 text-theme-black"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono font-bold uppercase">Edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedArticles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 font-mono text-xs uppercase tracking-wider text-theme-gray-400">
                    No articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-theme-gray-100 font-mono text-xs text-theme-gray-400">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-theme-gray-100 text-theme-black px-2 py-1 focus:outline-none focus:border-theme-blue font-bold"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
            <span className="text-theme-gray-300">|</span>
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            
            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-2.5 py-1 border cursor-pointer transition-colors ${
                        currentPage === page
                          ? 'bg-theme-blue text-white border-theme-blue'
                          : 'border-theme-gray-100 hover:bg-theme-light-gray text-theme-black'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-0.5"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
