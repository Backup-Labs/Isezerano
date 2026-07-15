"use client";
import { API_BASE_URL } from '@/config';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Key, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError(false);

    const success = await login(username, password);
    if (success) {
      setTimeout(async () => {
        try {
          const res = await fetch(API_BASE_URL + '/api/v1/auth/me/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.role !== 'reader') {
              router.push('/newsroom');
            } else {
              router.push('/');
            }
          } else {
            router.push('/');
          }
        } catch (err) {
          router.push('/');
        }
      }, 500);
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-6 py-20 relative flex flex-col gap-6 bg-theme-white text-theme-black animate-fade-in">
      {/* Brand */}
      <div className="text-center flex flex-col items-center gap-2 mb-4">
        <h2 className="serif-title text-3xl font-black uppercase tracking-tight text-theme-black">
          Console Portal Sign In
        </h2>
        <p className="text-[10px] text-theme-gray-400 font-mono uppercase tracking-widest font-bold">
          ISEZERANO // STAFF VERIFICATION
        </p>
      </div>

      {/* Form Card */}
      <div className="border border-theme-gray-100 p-8 flex flex-col gap-6 bg-theme-light-gray">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-mono text-theme-black">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="uppercase font-bold tracking-wider text-theme-black">Username</label>
            <input 
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white border border-theme-gray-100 px-4 py-2.5 text-xs text-theme-black placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="uppercase font-bold tracking-wider text-theme-black">Password</label>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border border-theme-gray-100 px-4 py-2.5 text-xs text-theme-black placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue"
              required
            />
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 border border-red-500/30 bg-red-500/5 text-red-600 text-xs font-mono rounded flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>AUTHENTICATION FAILURE: ACCESS DENIED.</span>
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Key className="w-4 h-4" />
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="border-t border-theme-gray-100 pt-4 text-center text-[10px] text-theme-gray-400 font-mono">
          <p>
            Default Admin credentials: <span className="text-theme-black font-bold">admin</span> / <span className="text-theme-black font-bold">pulse_admin_pass</span>
          </p>
          <p className="mt-1">
            Default Editor credentials: <span className="text-theme-black font-bold">editor_alex</span> / <span className="text-theme-black font-bold">pulse_editor_pass</span>
          </p>
        </div>
      </div>

      <Link href="/" className="text-center text-xs font-mono text-theme-gray-400 hover:text-theme-blue transition-colors uppercase font-bold tracking-wider">
        ← Return to Homepage
      </Link>
    </div>
  );
}
