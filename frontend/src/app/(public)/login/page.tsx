"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Terminal, Key, ShieldAlert } from 'lucide-react';
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
      // Re-fetch profile details through context before redirecting
      // Since context loads profile on login, let's redirect.
      // Fetching profile checks user role. If reader, redirect to /, otherwise /newsroom
      setTimeout(async () => {
        try {
          const res = await fetch('http://127.0.0.1:8000/api/v1/auth/me/', {
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
    <div className="max-w-md mx-auto w-full px-6 py-20 relative flex flex-col gap-6">
      <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-theme-blue/10 rounded-full blur-[60px] pointer-events-none -z-10" />

      {/* Brand */}
      <div className="text-center flex flex-col items-center gap-2 mb-4">
        <Terminal className="w-10 h-10 text-theme-blue" />
        <h2 className="font-mono text-2xl font-bold uppercase tracking-widest text-white">
          GRID ACCESS TERMINAL
        </h2>
        <p className="text-xs text-theme-gray-400 font-mono">
          THE PULSE // HIGH FREQUENCY NETWORK ENTRY
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-theme-gray-400 uppercase">Operator ID</label>
            <input 
              type="text" 
              placeholder="username (e.g. admin or editor_alex)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-theme-black/50 border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue/50"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-theme-gray-400 uppercase">Access Code</label>
            <input 
              type="password" 
              placeholder="access passcode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-theme-black/50 border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue/50"
              required
            />
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>TERMINATION FAILURE: ACCESS DENIED.</span>
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_15px_rgba(47,109,246,0.3)] text-white font-mono font-bold uppercase rounded-xl tracking-wider text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Key className="w-4 h-4" />
            {loading ? 'AUTHENTICATING CORRIDORS...' : 'SECURE ENTRY'}
          </button>
        </form>

        <div className="border-t border-white/5 pt-4 text-center">
          <p className="text-xs text-theme-gray-400 font-mono">
            Default Admin credentials: <span className="text-white">admin</span> / <span className="text-white">pulse_admin_pass</span>
          </p>
          <p className="text-xs text-theme-gray-400 font-mono mt-1">
            Default Editor credentials: <span className="text-white">editor_alex</span> / <span className="text-white">pulse_editor_pass</span>
          </p>
        </div>
      </div>

      <Link href="/" className="text-center text-xs font-mono text-theme-gray-400 hover:text-white transition-colors">
        ← Return to Main Grid
      </Link>
    </div>
  );
}
