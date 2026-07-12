"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Terminal, Check, X, ShieldAlert, AlertCircle, MessageSquare } from 'lucide-react';

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

  const fetchComments = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cms/comments/', {
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

  useEffect(() => {
    if (token) {
      fetchComments();
    }
  }, [token]);

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cms/comments/${id}/approve/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cms/comments/${id}/reject/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold rounded-lg font-mono">APPROVED</span>;
      case 'flagged':
        return <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold rounded-lg font-mono">FLAGGED</span>;
      case 'spam':
        return <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-lg font-mono">SPAM</span>;
      default:
        return <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-theme-blue text-[10px] font-bold rounded-lg font-mono">PENDING</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">PULLING COMMENT DATABASE...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
        <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-theme-blue" />
          Forums Moderation Desk
        </h1>
        <p className="text-xs text-theme-gray-400 font-mono">
          MONITOR FEED BACKLOGS, REMOVE BAD TRANSMISSIONS, AND SECURE DISCUSSION NODES
        </p>
      </div>

      {/* Table grid queue */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono text-theme-gray-400 uppercase bg-white/2">
                <th className="p-4 pl-6">Terminal User</th>
                <th className="p-4">Message payload</th>
                <th className="p-4">Index Status</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 pr-6 text-right">Moderations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-theme-gray-400">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 pl-6 font-mono text-white text-xs">
                    @{comment.user.username}
                  </td>
                  <td className="p-4 max-w-md">
                    <p className="text-xs leading-relaxed line-clamp-3 italic text-theme-gray-400">
                      "{comment.body}"
                    </p>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(comment.status)}
                  </td>
                  <td className="p-4 text-[10px] font-mono whitespace-nowrap">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 pr-6 text-right flex items-center justify-end gap-2 mt-2">
                    {comment.status !== 'approved' && (
                      <button 
                        onClick={() => handleApprove(comment.id)}
                        className="p-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all cursor-pointer flex items-center gap-0.5"
                        title="Approve Comment"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono font-bold uppercase">Approve</span>
                      </button>
                    )}
                    {comment.status !== 'flagged' && (
                      <button 
                        onClick={() => handleReject(comment.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer flex items-center gap-0.5"
                        title="Flag/Reject Comment"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono font-bold uppercase">Flag</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {comments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 font-mono text-xs uppercase tracking-wider">
                    Comments backlog empty.
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
