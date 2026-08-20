import React, { useState } from 'react';
import { Sprout, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Valid user credentials map
    const VALID_USERS = {
      'admin@skagro.com': 'admin123',
      'skagro@gmail.com': 'skagro2026',
      'tirth@skagro.com': 'tirth',
      'dharmesh@skagro.com': 'dharmesh',
      'bhavin@skagro.com': 'bhavin',
      'meet@skagro.com': 'meet',
    };

    // Strict authentication verification
    if (VALID_USERS[cleanEmail] && VALID_USERS[cleanEmail] === password) {
      setError('');
      const loggedUser = {
        name: cleanEmail.split('@')[0].toUpperCase(),
        email: cleanEmail,
        role: 'admin',
      };
      localStorage.setItem('sk_user', JSON.stringify(loggedUser));
      onLoginSuccess && onLoginSuccess(loggedUser);
    } else {
      setError('Invalid email address or password. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#0A0F0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl p-6 sm:p-8 shadow-floating space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <img
            src="sk-agro-logo.jpg"
            alt="S K Agro Chemical Logo"
            className="w-24 h-24 mx-auto object-contain rounded-2xl bg-white p-1 shadow-md border border-slate-100 dark:border-emerald-950/60"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              S K AGRO CHEMICAL
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Product Asset Hub • Secure Portal
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skagro.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 font-bold text-sm shadow-md">
            Sign In to Asset Hub
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Protected Access & Multi-User Shared Supabase Cloud</span>
        </div>
      </div>
    </div>
  );
};
