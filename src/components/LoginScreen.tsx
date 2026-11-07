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
  UserPlus,
  Eye,
  EyeOff,
  Check,
  BookOpen,
} from 'lucide-react';
import { User, UserRole } from '../types';
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
  // Mode: Sign In vs New Registration
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Sign In State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regClassSec, setRegClassSec] = useState('Class 10-A');
  const [regRollNo, setRegRollNo] = useState('');
  const [regApaarId, setRegApaarId] = useState('');
  const [regPenId, setRegPenId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? '🌅 Good Morning'
      : hour < 17
      ? '☀️ Good Afternoon'
      : '🌙 Good Evening';

  const handleGenerateStrongPassword = () => {
    const prefixes = ['Sai', 'Anandam', 'Dharma', 'Prasanthi', 'Vidya', 'Sathya'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const n = Math.floor(1000 + Math.random() * 9000);
    const pass = `${p}#${n}!`;
    setRegPassword(pass);
    setRegConfirmPassword(pass);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegSuccess(null);

    if (!regFullName.trim() || !regUsername.trim() || !regEmail.trim()) {
      setError('Please provide Full Legal Name, Login Username, and Email.');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await sdbmsApi.registerUser({
        fullName: regFullName.trim(),
        username: regUsername.trim(),
        role: regRole,
        email: regEmail.trim(),
        password: regPassword.trim(),
        phone: regPhone.trim() || undefined,
        classSec: regRole === 'student' || regRole === 'teacher' ? regClassSec : undefined,
        rollNo: regRole === 'student' ? regRollNo.trim() : undefined,
        apaarId: regRole === 'student' ? regApaarId.trim() : undefined,
        penId: regRole === 'student' ? regPenId.trim() : undefined,
      });

      setRegSuccess(`Registration successful for ${user.fullName} (${user.role.toUpperCase()})! Initializing portal...`);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both your institutional ID/Username and password.');
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

        {/* Right Authentication & Registration Form */}
        <section className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-slate-950/60 overflow-y-auto max-h-[92vh]">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
                setRegSuccess(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                !isRegisterMode
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Portal Sign-In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
                setRegSuccess(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                isRegisterMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Registration</span>
            </button>
          </div>

          {!isRegisterMode ? (
            /* --- SIGN-IN FORM --- */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-3 select-none">
                  {greeting}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Institutional Sign-In
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered institutional login ID / Username and Password to access the portal.
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
                    placeholder="Login ID or Username (e.g. admin, student_sai)"
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

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition"
                >
                  New student, faculty or administrator? Register your account →
                </button>
              </div>
            </form>
          ) : (
            /* --- REGISTRATION FORM FOR STUDENT, TEACHER, ADMINISTRATOR, ETC --- */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full inline-block mb-2 select-none">
                  Institutional Register
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Register Institutional Account
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register as Student, Faculty, Administrator, Parent, or Bursar.
                </p>
              </div>

              {error && (
                <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 font-sans leading-normal">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {regSuccess && (
                <div className="bg-emerald-950/50 border border-emerald-800/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 font-sans leading-normal">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>{regSuccess}</p>
                </div>
              )}

              {/* Role Selection Bar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Institutional Role / Register
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  {(
                    [
                      { role: 'student' as UserRole, label: 'Student' },
                      { role: 'teacher' as UserRole, label: 'Teacher' },
                      { role: 'admin' as UserRole, label: 'Admin' },
                      { role: 'parent' as UserRole, label: 'Parent' },
                      { role: 'accountant' as UserRole, label: 'Bursar' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setRegRole(item.role)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                        regRole === item.role
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Desired Login Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rajesh_kumar"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Official Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Institutional / Personal Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@sdbms.sai.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98450 ..."
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
              </div>

              {/* Student / Teacher Specific Fields */}
              {(regRole === 'student' || regRole === 'teacher') && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Class & Section
                      </label>
                      <select
                        value={regClassSec}
                        onChange={(e) => setRegClassSec(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs outline-none focus:border-indigo-500"
                      >
                        <option value="Class 10-A">Class 10-A</option>
                        <option value="Class 10-B">Class 10-B</option>
                        <option value="Class 9-A">Class 9-A</option>
                        <option value="Class 9-B">Class 9-B</option>
                        <option value="Class 11-Science">Class 11-Science</option>
                        <option value="Class 12-Science">Class 12-Science</option>
                        <option value="Class 11-Commerce">Class 11-Commerce</option>
                        <option value="Class 12-Commerce">Class 12-Commerce</option>
                      </select>
                    </div>

                    {regRole === 'student' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Class Roll Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 10A-25"
                          value={regRollNo}
                          onChange={(e) => setRegRollNo(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>

                  {regRole === 'student' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          APAAR ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="9021-..."
                          value={regApaarId}
                          onChange={(e) => setRegApaarId(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-[11px] font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          PEN Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="PEN-KA-..."
                          value={regPenId}
                          onChange={(e) => setRegPenId(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-[11px] font-mono outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Password & Confirm */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Create Account Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateStrongPassword}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Password (min 4 chars)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl active:scale-[0.99] transition duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Registering Account in Cloud Database...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Registration & Enter Portal</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer transition"
                >
                  Already registered? <span className="text-amber-400 font-semibold">Sign In here</span>
                </button>
              </div>
            </form>
          )}

          {/* Institutional Access Info Card */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 shrink-0">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Paper Institutional Register</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal">
                Students, faculty, administrators, parents, and bursar staff accounts are managed under Sri Sathya Sai Anandam School.
              </p>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};
