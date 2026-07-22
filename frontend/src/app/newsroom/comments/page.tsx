"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Check, X, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface Comment {
  id: number;
  article: { title: string } | number;
  user: { username: string };
  body: string;
  status: 'pending' | 'approved' | 'flagged' | 'spam';
  created_at: string;
}

export default function CommentsModerator() {
  const { token } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchComments = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/comments/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchComments(); }, [token]);

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/comments/${id}/approve/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchComments();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/comments/${id}/reject/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchComments();
    } catch (err) { console.error(err); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 border border-green-600 bg-green-50 text-green-700 text-[10px] font-bold font-mono">APPROVED</span>;
      case 'flagged':
        return <span className="px-2 py-0.5 border border-orange-500 bg-orange-50 text-orange-600 text-[10px] font-bold font-mono">FLAGGED</span>;
      case 'spam':
        return <span className="px-2 py-0.5 border border-red-600 bg-red-50 text-red-700 text-[10px] font-bold font-mono">SPAM</span>;
      default:
        return <span className="px-2 py-0.5 border border-theme-blue bg-theme-blue/10 text-theme-blue text-[10px] font-bold font-mono">PENDING</span>;
    }
  };

  // Pagination Logic
  const totalItems = comments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedComments = comments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING COMMENTS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col gap-1 pb-4 border-b border-theme-gray-100">
        <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-theme-blue" />
          Moderate Comments
        </h1>
        <p className="text-xs text-theme-gray-400 font-mono">
          Review reader comments and manage forum permissions
        </p>
      </div>

      {/* Table grid queue */}
      <div className="border border-theme-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-gray-100 text-[10px] font-mono text-theme-gray-400 uppercase bg-theme-light-gray">
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Comment Body</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-100 text-sm text-theme-black font-mono bg-white">
              {paginatedComments.map((comment) => (
                <tr key={comment.id} className="hover:bg-theme-light-gray/40 transition-colors">
                  <td className="p-4 pl-6 text-[10px] font-mono whitespace-nowrap text-theme-black">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-xs font-mono text-theme-black font-bold font-bold">
                    {comment.user.username}
                  </td>
                  <td className="p-4 max-w-md">
                    <p className="text-xs leading-relaxed line-clamp-3 text-theme-black font-sans">
                      "{comment.body}"
                    </p>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(comment.status)}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className="p-1.5 bg-green-500/10 text-green-700 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all cursor-pointer flex items-center gap-0.5"
                          title="Approve Comment"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono font-bold uppercase">Approve</span>
                        </button>
                      )}
                      {comment.status !== 'flagged' && (
                        <button
                          onClick={() => handleReject(comment.id)}
                          className="p-1.5 bg-red-500/10 text-red-700 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer flex items-center gap-0.5"
                          title="Reject / Flag"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono font-bold uppercase">Reject</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedComments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 font-mono text-xs uppercase tracking-wider text-theme-gray-400">
                    No comments found.
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
