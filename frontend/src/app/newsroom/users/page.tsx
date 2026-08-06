"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Plus, Search, Mail, Check, X, ChevronLeft, ChevronRight, 
  UserCog, Key, FileText, UserPlus, UserMinus, ShieldAlert, Edit2, History
} from 'lucide-react';

interface ManagedUser {
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
  is_active: boolean;
  date_joined: string;
}

interface AuditLog {
  id: number;
  actor: number | null;
  actor_username: string;
  target_user: number;
  target_username: string;
  action: 'create' | 'update' | 'role_change' | 'status_change' | 'password_reset';
  details: string;
  timestamp: string;
}

export default function UserManagementPage() {
  const { token, user: currentUser } = useApp();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'logs'>('directory');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentLogsPage, setCurrentLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(15);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Selected user for editing/password reset
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'reader' as ManagedUser['role'],
    is_active: true,
    bio: '',
    twitter: '',
    github: '',
    website: ''
  });

  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetConfirmPasswordVal, setResetConfirmPasswordVal] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/user-audit-logs/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchAuditLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const handleOpenAddModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'reader',
      is_active: true,
      bio: '',
      twitter: '',
      github: '',
      website: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: ManagedUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      is_active: user.is_active,
      bio: user.bio || '',
      twitter: user.twitter || '',
      github: user.github || '',
      website: user.website || ''
    });
    setShowEditModal(true);
  };

  const handleOpenPasswordModal = (user: ManagedUser) => {
    setSelectedUser(user);
    setResetPasswordVal('');
    setResetConfirmPasswordVal('');
    setShowPasswordModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || actionLoading) return;
    
    // Quick validation
    if (formData.username.length < 3) {
      alert("Username must be at least 3 characters long.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          is_active: formData.is_active,
          bio: formData.bio,
          twitter: formData.twitter,
          github: formData.github,
          website: formData.website
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        await loadData();
      } else {
        const errData = await res.json().catch(() => ({}));
        let errMsg = "Failed to create user.";
        if (errData.username) errMsg = `Username error: ${errData.username[0]}`;
        else if (errData.email) errMsg = `Email error: ${errData.email[0]}`;
        alert(errMsg);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || actionLoading) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/users/${selectedUser.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          is_active: formData.is_active,
          bio: formData.bio,
          twitter: formData.twitter,
          github: formData.github,
          website: formData.website
        })
      });

      if (res.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        await loadData();
      } else {
        const errData = await res.json().catch(() => ({}));
        let errMsg = "Failed to update user.";
        if (errData.username) errMsg = `Username error: ${errData.username[0]}`;
        else if (errData.email) errMsg = `Email error: ${errData.email[0]}`;
        alert(errMsg);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !resetPasswordVal || actionLoading) return;

    if (resetPasswordVal !== resetConfirmPasswordVal) {
      alert("Passwords do not match.");
      return;
    }

    if (resetPasswordVal.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/users/${selectedUser.id}/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: resetPasswordVal })
      });

      if (res.ok) {
        alert("Password reset successfully!");
        setShowPasswordModal(false);
        setSelectedUser(null);
        await fetchAuditLogs(); // Refresh logs
      } else {
        alert("Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActiveStatus = async (user: ManagedUser) => {
    if (user.id === currentUser?.id) {
      alert("You cannot deactivate your own account.");
      return;
    }
    
    const actionText = user.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${actionText} the account for ${user.username}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/users/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      if (res.ok) {
        await loadData();
      } else {
        alert("Failed to change account status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Directory filter logic
  const filteredUsers = users.filter(usr => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      usr.username.toLowerCase().includes(query) ||
      usr.email.toLowerCase().includes(query) ||
      `${usr.first_name} ${usr.last_name}`.toLowerCase().includes(query);
    
    const matchesRole = roleFilter === 'all' || usr.role === roleFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && usr.is_active) || 
      (statusFilter === 'inactive' && !usr.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Directory pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Logs filter logic
  const filteredLogs = auditLogs.filter(log => {
    const query = searchQuery.toLowerCase();
    return (
      log.actor_username.toLowerCase().includes(query) ||
      log.target_username.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query)
    );
  });

  // Logs pagination
  const totalLogsItems = filteredLogs.length;
  const totalLogsPages = Math.ceil(totalLogsItems / logsPageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentLogsPage - 1) * logsPageSize,
    currentLogsPage * logsPageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, pageSize]);

  useEffect(() => {
    setCurrentLogsPage(1);
  }, [searchQuery, logsPageSize]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING USER DATA...</span>
      </div>
    );
  }

  const inputCls = "bg-white border border-theme-gray-100 px-4 py-2 text-xs text-theme-black focus:outline-none focus:border-theme-blue w-full";
  const selectCls = "bg-white border border-theme-gray-100 px-3 py-2.5 text-xs text-theme-black focus:outline-none focus:border-theme-blue font-mono font-bold";

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black flex items-center gap-2">
            <UserCog className="w-6 h-6 text-theme-blue" />
            User Management
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Create, manage, and audit operator accounts, roles, and access logs
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add User Account
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-theme-gray-100 font-mono text-xs font-bold uppercase">
        <button
          onClick={() => { setActiveTab('directory'); setSearchQuery(''); }}
          className={`px-6 py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'directory' 
              ? 'border-theme-blue text-theme-blue' 
              : 'border-transparent text-theme-gray-400 hover:text-theme-black'
          }`}
        >
          <UserCog className="w-4 h-4" />
          User Directory
        </button>
        <button
          onClick={() => { setActiveTab('logs'); setSearchQuery(''); }}
          className={`px-6 py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs' 
              ? 'border-theme-blue text-theme-blue' 
              : 'border-transparent text-theme-gray-400 hover:text-theme-black'
          }`}
        >
          <History className="w-4 h-4" />
          Administrative Logs
        </button>
      </div>

      {/* Control panel (Filters + Search) */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Search */}
        <div className="flex items-center gap-2 border border-theme-gray-100 px-3.5 py-2.5 max-w-md w-full bg-theme-light-gray">
          <Search className="w-4 h-4 text-theme-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'directory' ? "SEARCH USERS BY NAME, USERNAME, EMAIL..." : "SEARCH AUDIT LOG ENTRIES..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 text-xs font-mono text-theme-black placeholder-theme-gray-400 focus:outline-none w-full uppercase"
          />
        </div>

        {/* Filters (only for directory tab) */}
        {activeTab === 'directory' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-theme-gray-400 uppercase">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={selectCls}
              >
                <option value="all">ALL ROLES</option>
                <option value="admin">ADMIN/SUPERADMIN</option>
                <option value="editor">EDITOR</option>
                <option value="journalist">JOURNALIST</option>
                <option value="reader">READER</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-theme-gray-400 uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectCls}
              >
                <option value="all">ALL STATUSES</option>
                <option value="active">ACTIVE ONLY</option>
                <option value="inactive">INACTIVE ONLY</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Users Directory Table */}
          <div className="border border-theme-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-theme-gray-100 text-[10px] font-mono text-theme-gray-400 uppercase bg-theme-light-gray">
                    <th className="p-4 pl-6">Operator User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Registered On</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-gray-100 text-sm text-theme-black font-mono bg-white">
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-theme-light-gray/40 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-theme-black">{u.username}</span>
                          <span className="text-xs text-theme-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                          u.role === 'admin' 
                            ? 'border-red-600 bg-red-50 text-red-700' 
                            : u.role === 'editor' 
                            ? 'border-purple-600 bg-purple-50 text-purple-700' 
                            : u.role === 'journalist' 
                            ? 'border-blue-600 bg-blue-50 text-theme-blue' 
                            : 'border-theme-gray-200 bg-theme-light-gray text-theme-gray-400'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-theme-gray-400">
                        {new Date(u.date_joined).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                          u.is_active 
                            ? 'border-green-600 bg-green-50 text-green-700' 
                            : 'border-red-600 bg-red-50 text-red-700'
                        }`}>
                          {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 bg-theme-light-gray border border-theme-gray-100 hover:bg-theme-blue hover:text-white hover:border-theme-blue text-theme-black transition-all cursor-pointer flex items-center gap-0.5"
                            title="Edit Account Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase">Edit</span>
                          </button>

                          <button
                            onClick={() => handleOpenPasswordModal(u)}
                            className="p-1.5 bg-theme-light-gray border border-theme-gray-100 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 text-theme-black transition-all cursor-pointer flex items-center gap-0.5"
                            title="Reset User Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase">Password</span>
                          </button>
                          
                          <button
                            onClick={() => handleToggleActiveStatus(u)}
                            disabled={u.id === currentUser?.id}
                            className={`p-1.5 border transition-all flex items-center gap-0.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                              u.is_active 
                                ? 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20' 
                                : 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20'
                            }`}
                            title={u.is_active ? "Deactivate Account" : "Activate Account"}
                          >
                            {u.is_active ? (
                              <>
                                <UserMinus className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase">Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase">Activate</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-xs uppercase tracking-wider text-theme-gray-400">
                        No operators found matching the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Directory Pagination Footer */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-theme-gray-100 font-mono text-xs text-theme-gray-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-theme-gray-100 text-theme-black px-2 py-1 focus:outline-none focus:border-theme-blue font-bold"
                >
                  {[10, 25, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
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
        </>
      ) : (
        <>
          {/* System Audit Logs List */}
          <div className="border border-theme-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-theme-gray-100 text-[10px] font-mono text-theme-gray-400 uppercase bg-theme-light-gray">
                    <th className="p-4 pl-6">Timestamp</th>
                    <th className="p-4">Action Owner</th>
                    <th className="p-4">Target User</th>
                    <th className="p-4">Action</th>
                    <th className="p-4 pr-6">Change details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-gray-100 text-xs text-theme-black font-mono bg-white">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-theme-light-gray/20 transition-colors">
                      <td className="p-4 pl-6 text-theme-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold">
                        {log.actor_username || 'System'}
                      </td>
                      <td className="p-4 font-bold text-theme-blue">
                        {log.target_username}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 border text-[9px] font-bold ${
                          log.action === 'create' 
                            ? 'border-green-600 bg-green-50 text-green-700' 
                            : log.action === 'password_reset' 
                            ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                            : log.action === 'role_change'
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : log.action === 'status_change'
                            ? 'border-orange-600 bg-orange-50 text-orange-700'
                            : 'border-theme-gray-200 bg-theme-light-gray text-theme-gray-400'
                        }`}>
                          {log.action.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-theme-gray-400">
                        {log.details}
                      </td>
                    </tr>
                  ))}

                  {paginatedLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-xs uppercase tracking-wider text-theme-gray-400">
                        No audit log entries matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs Pagination Footer */}
          {totalLogsItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-theme-gray-100 font-mono text-xs text-theme-gray-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={logsPageSize}
                  onChange={(e) => setLogsPageSize(Number(e.target.value))}
                  className="bg-white border border-theme-gray-100 text-theme-black px-2 py-1 focus:outline-none focus:border-theme-blue font-bold"
                >
                  {[15, 30, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span>entries</span>
                <span className="text-theme-gray-300">|</span>
                <span>
                  Showing {(currentLogsPage - 1) * logsPageSize + 1} to {Math.min(currentLogsPage * logsPageSize, totalLogsItems)} of {totalLogsItems} entries
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-bold">
                <button
                  onClick={() => setCurrentLogsPage(1)}
                  disabled={currentLogsPage === 1}
                  className="px-2 py-1 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentLogsPage((p) => Math.max(1, p - 1))}
                  disabled={currentLogsPage === 1}
                  className="px-2 py-1 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-0.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                
                {Array.from({ length: totalLogsPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalLogsPages || Math.abs(page - currentLogsPage) <= 1)
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1">...</span>}
                        <button
                          onClick={() => setCurrentLogsPage(page)}
                          className={`px-2.5 py-1 border cursor-pointer transition-colors ${
                            currentLogsPage === page
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
                  onClick={() => setCurrentLogsPage((p) => Math.min(totalLogsPages, p + 1))}
                  disabled={currentLogsPage === totalLogsPages}
                  className="px-2 py-1 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-0.5"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentLogsPage(totalLogsPages)}
                  disabled={currentLogsPage === totalLogsPages}
                  className="px-2 py-1 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-lg p-6 flex flex-col gap-5 shadow-xl my-8">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-theme-blue" />
                Create Operator Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className={inputCls}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={inputCls}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Access Control Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as ManagedUser['role']})}
                    className={selectCls + " py-2 w-full"}
                  >
                    <option value="reader">Reader / Public Visitor</option>
                    <option value="journalist">Journalist / Writer</option>
                    <option value="editor">Editor / Section Head</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Biography</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className={inputCls + " h-20 resize-none py-2"}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase">Twitter URL</label>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                    className={inputCls}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({...formData, github: e.target.value})}
                    className={inputCls}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase">Website URL</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className={inputCls}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                {actionLoading ? 'PROCESSING...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-lg p-6 flex flex-col gap-5 shadow-xl my-8">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-theme-blue" />
                Modify Operator Profile: {selectedUser.username}
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    className={inputCls + " opacity-50 bg-theme-light-gray cursor-not-allowed"}
                    disabled
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Access Control Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as ManagedUser['role']})}
                    className={selectCls + " py-2 w-full"}
                    disabled={selectedUser.id === currentUser?.id}
                  >
                    <option value="reader">Reader / Public Visitor</option>
                    <option value="journalist">Journalist / Writer</option>
                    <option value="editor">Editor / Section Head</option>
                    <option value="admin">Administrator</option>
                  </select>
                  {selectedUser.id === currentUser?.id && (
                    <span className="text-[9px] text-red-500 font-bold">You cannot change your own role.</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Account Status</label>
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({...formData, is_active: e.target.value === 'active'})}
                    className={selectCls + " py-2 w-full"}
                    disabled={selectedUser.id === currentUser?.id}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Suspended / Deactivated</option>
                  </select>
                  {selectedUser.id === currentUser?.id && (
                    <span className="text-[9px] text-red-500 font-bold">You cannot deactivate yourself.</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Biography</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className={inputCls + " h-20 resize-none py-2"}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase">Twitter URL</label>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({...formData, github: e.target.value})}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-theme-gray-400 uppercase">Website URL</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Check className="w-4 h-4" />
                {actionLoading ? 'SAVING CHANGES...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-md p-6 flex flex-col gap-5 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Key className="w-4 h-4 text-theme-blue" />
                Reset Password: {selectedUser.username}
              </h3>
              <button
                onClick={() => { setShowPasswordModal(false); setSelectedUser(null); }}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4 text-xs font-mono">
              
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 flex gap-2.5">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold block uppercase text-[10px]">Security Warning</span>
                  This will change the operator's active login credentials immediately. The user will be required to log in again using the new credentials.
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">New Password *</label>
                <input
                  type="password"
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-theme-gray-400 uppercase font-bold tracking-wider">Confirm New Password *</label>
                <input
                  type="password"
                  value={resetConfirmPasswordVal}
                  onChange={(e) => setResetConfirmPasswordVal(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Key className="w-4 h-4" />
                {actionLoading ? 'RESETTING...' : 'Confirm Password Change'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
