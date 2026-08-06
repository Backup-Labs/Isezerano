"use client";
import { API_BASE_URL } from '@/config';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Key, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, language } = useApp();

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

  const t = {
    title: {
      RW: 'Kwinjira mu bwanditsi',
      EN: 'Staff Sign In',
      FR: "Connexion de l'équipe"
    },
    subtitle: {
      RW: "ISEZERANO // KWINJIRA KW'ABAKOZI",
      EN: 'ISEZERANO // EDITORIAL PORTAL',
      FR: "ISEZERANO // PORTAIL DE L'ÉQUIPE"
    },
    usernameLabel: {
      RW: "Izina ry'ukoresha",
      EN: 'Username',
      FR: "Nom d'utilisateur"
    },
    passwordLabel: {
      RW: "Ijambo ry'ibanga",
      EN: 'Password',
      FR: 'Mot de passe'
    },
    errorMsg: {
      RW: 'Ntibyakunze: Umwirondoro si wo cyangwa ntabwo wemerewe.',
      EN: 'Authentication failure: Access denied.',
      FR: "Nom d'utilisateur ou mot de passe incorrect."
    },
    signingIn: {
      RW: 'KWINJIRA...',
      EN: 'SIGNING IN...',
      FR: 'CONNEXION...'
    },
    signIn: {
      RW: 'KWINJIRA',
      EN: 'SIGN IN',
      FR: 'SE CONNECTER'
    },
    returnHome: {
      RW: '← Subira ku rupapuro rubanza',
      EN: '← Return to Homepage',
      FR: "← Retour à l'accueil"
    },
    credentialsText: {
      RW: "Umwirondoro w'igerageza w'Umuyobozi (Admin): admin / pulse_admin_pass. Umwanditsi (Editor): editor_alex / pulse_editor_pass.",
      EN: 'Default Admin credentials: admin / pulse_admin_pass. Default Editor credentials: editor_alex / pulse_editor_pass.',
      FR: 'Identifiants Administrateur par défaut : admin / pulse_admin_pass. Éditeur par défaut : editor_alex / pulse_editor_pass.'
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-6 py-20 relative flex flex-col gap-6 bg-theme-white text-theme-black animate-fade-in">
      {/* Brand */}
      <div className="text-center flex flex-col items-center gap-2 mb-4">
        <h2 className="serif-title text-3xl font-black uppercase tracking-tight text-theme-black">
          {t.title[language]}
        </h2>
        <p className="text-[10px] text-theme-gray-400 font-mono uppercase tracking-widest font-bold">
          {t.subtitle[language]}
        </p>
      </div>

      {/* Form Card */}
      <div className="border border-theme-gray-100 p-8 flex flex-col gap-6 bg-theme-light-gray">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-mono text-theme-black">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="uppercase font-bold tracking-wider text-theme-black">{t.usernameLabel[language]}</label>
            <input 
              type="text" 
              placeholder={t.usernameLabel[language]}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white border border-theme-gray-100 px-4 py-2.5 text-xs text-theme-black placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="uppercase font-bold tracking-wider text-theme-black">{t.passwordLabel[language]}</label>
            <input 
              type="password" 
              placeholder={t.passwordLabel[language]}
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
              <span>{t.errorMsg[language]}</span>
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-theme-blue hover:bg-theme-blue-glow text-white font-mono font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Key className="w-4 h-4" />
            {loading ? t.signingIn[language] : t.signIn[language]}
          </button>
        </form>

        <div className="border-t border-theme-gray-100 pt-4 text-center text-[10px] text-theme-gray-400 font-mono">
          <p className="leading-relaxed">
            {t.credentialsText[language]}
          </p>
        </div>
      </div>

      <Link href="/" className="text-center text-xs font-mono text-theme-gray-400 hover:text-theme-blue transition-colors uppercase font-bold tracking-wider">
        {t.returnHome[language]}
      </Link>
    </div>
  );
}
