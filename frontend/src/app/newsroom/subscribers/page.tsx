"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Users, Search, Trash2, Mail, Check, X, UserMinus, UserPlus } from 'lucide-react';

interface Subscriber {
  id: number;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

export default function SubscribersManager() {
  const { token } = useApp();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add manual subscriber state
  const [newEmail, setNewEmail] = useState('');
  const [addingSub, setAddingSub] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/subscribers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSubscribers();
  }, [token]);

  const handleToggleActive = async (sub: Subscriber) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/subscribers/${sub.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !sub.is_active })
      });
      if (res.ok) {
        fetchSubscribers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this subscriber?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/subscribers/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchSubscribers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || addingSub) return;
    setAddingSub(true);

    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/subscribers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail, is_active: true })
      });

      if (res.ok) {
        setNewEmail('');
        setShowAddModal(false);
        fetchSubscribers();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.email ? errData.email[0] : "Failed to add subscriber.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSub(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING SUBSCRIBER LIST...</span>
      </div>
    );
  }

  const inputCls = "bg-white border border-theme-gray-100 px-4 py-2 text-xs text-theme-black focus:outline-none focus:border-theme-blue w-full";

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black flex items-center gap-2">
            <Users className="w-6 h-6 text-theme-blue" />
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Manage readers subscribed to the news newsletter dispatch
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Subscriber
        </button>
      </div>

      {/* Search Filter input */}
      <div className="flex items-center gap-2 border border-theme-gray-100 px-3.5 py-2.5 max-w-md bg-theme-light-gray">
        <Search className="w-4 h-4 text-theme-gray-400" />
        <input
          type="text"
          placeholder="SEARCH SUBSCRIBERS BY EMAIL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-0 text-xs font-mono text-theme-black placeholder-theme-gray-400 focus:outline-none w-full"
        />
      </div>

      {/* Subscribers Table */}
      <div className="border border-theme-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-gray-100 text-[10px] font-mono text-theme-gray-400 uppercase bg-theme-light-gray">
                <th className="p-4 pl-6">Subscriber Email</th>
                <th className="p-4">Subscribed At</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-100 text-sm text-theme-black font-mono bg-white">
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-theme-light-gray/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-theme-black max-w-md truncate">
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-theme-gray-400" />
                      {sub.email}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-theme-gray-400">
                    {new Date(sub.subscribed_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                      sub.is_active 
                        ? 'border-green-600 bg-green-50 text-green-700' 
                        : 'border-red-600 bg-red-50 text-red-700'
                    }`}>
                      {sub.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(sub)}
                        className={`p-1.5 border transition-all cursor-pointer flex items-center gap-0.5 ${
                          sub.is_active 
                            ? 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20'
                        }`}
                        title={sub.is_active ? "Deactivate" : "Activate"}
                      >
                        {sub.is_active ? (
                          <>
                            <UserMinus className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono font-bold uppercase">Deactivate</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono font-bold uppercase">Activate</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSubscriber(sub.id)}
                        className="p-1.5 bg-theme-light-gray border border-theme-gray-100 hover:bg-red-600 hover:text-white text-theme-black transition-all cursor-pointer flex items-center gap-0.5"
                        title="Remove subscriber"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono font-bold uppercase">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-xs uppercase tracking-wider text-theme-gray-400">
                    No subscribers found matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-md p-6 flex flex-col gap-5 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-theme-blue" />
                Add New Subscriber
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscriber} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={addingSub}
                className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                {addingSub ? 'ADDING...' : 'Add Subscriber'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
