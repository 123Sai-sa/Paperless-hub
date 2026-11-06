import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
  GraduationCap,
  Sparkles,
  Database,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';
import { User } from '../types';
import { sdbmsApi } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? '🌅 Good Morning'
      : hour < 17
      ? '☀️ Good Afternoon'
      : '🌙 Good Evening';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both your institutional ID and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { user } = await sdbmsApi.login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authorization failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { user } = await sdbmsApi.loginWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Firebase Google authentication failed. Please try again or use institutional credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="login-screen"
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/90 relative overflow-hidden px-4 py-8 font-sans text-slate-100"
    >
      {/* Ambient background glow accents */}
      <span className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <span className="absolute bottom-[-25%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/15 blur-[160px] rounded-full pointer-events-none" />

      {/* Security grid overlay */}
      <span className="absolute inset-0 bg-[linear-gradient(to_right,#030712_1px,transparent_1px),linear-gradient(to_bottom,#030712_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Top Corner Theme Switcher */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition cursor-pointer text-xs font-semibold backdrop-blur-md shadow-lg"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-slate-950/70 border border-slate-800/90 rounded-3xl overflow-hidden flex flex-col md:flex-row backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative z-10"
      >
        {/* Left Institutional Branding Showcase */}
        <section className="flex-1 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80">
          <div>
            <header className="flex flex-col items-center text-center md:items-start md:text-left mb-6">
              {/* Institutional Crest / Emblem */}
              <div className="mb-4 relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.35)] bg-white p-1.5 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/assets/sai_anandam_real_logo.png"
                    alt="Sri Sathya Sai Anandam School Official Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <span className="text-[11px] tracking-[0.25em] text-amber-400 font-bold uppercase block mb-1">
                  Sri Sathya Sai Anandam
                </span>
                <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-white leading-tight">
                  Sri Sathya Sai Anandam School
                </h1>
                <p className="text-xs text-amber-300/80 font-medium mt-1">
                  Hostel & School Management System
                </p>
              </div>
            </header>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-sm mt-3">
              Centralized, zero-paper institutional operating system. Integrates hostel residency care, digital classrooms, verified marksheet gradebooks, fee ledgers, electronic circulars, and private document lockers.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/70">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Hostel & School Unified
              </span>
              <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Zero-Paper System
              </span>
              <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Private Vault Protected
              </span>
            </div>
          </div>
        </section>

        {/* Right Authentication Form */}
        <section className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-slate-950/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-3 select-none">
                {greeting}
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Institutional Sign-In
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your institutional login ID / Username and Password to access the portal.
              </p>
            </div>

            {error && (
              <div className="bg-rose-950/40 border border-rose-800/60 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 font-sans leading-normal">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Login ID or Email (e.g. admin, student_sai)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500 focus:bg-indigo-950/20 transition duration-200 font-sans"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500 focus:bg-indigo-950/20 transition duration-200 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl active:scale-[0.99] transition duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating credentials...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Alternative Firebase Google Sign-In */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                or use Firebase Auth
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-slate-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition cursor-pointer shadow-sm disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign In with Institutional Google</span>
            </button>
          </form>

          {/* Institutional Access Info & Firestore Status */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">Database:</span>
                <span className="text-emerald-400 font-mono font-bold">Cloud Firestore</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Active & Persistent
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Authorized Institutional Access Only</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                Faculty, students, parents, and administrative staff sign in using their registered institutional credentials or verified institutional Google account.
              </p>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};
