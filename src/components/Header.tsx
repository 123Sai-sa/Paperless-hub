import React, { useState } from 'react';
import {
  Shield,
  GraduationCap,
  LogOut,
  Bell,
  Volume2,
  VolumeX,
  UserCheck,
  ChevronDown,
  Lock,
  Sparkles,
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  Megaphone,
  ShieldAlert,
  Calendar,
  MessageSquare,
  Settings,
  BrainCircuit,
  PanelLeft,
  Video,
  FileCheck,
  ChevronRight,
  Sun,
  Moon,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Copy,
  Database,
} from 'lucide-react';
import { User, UserRole, NavigationTab, WelcomeBannerConfig } from '../types';

interface HeaderProps {
  currentUser: User;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onLogout: () => void;
  onSwitchUserRole: (role: UserRole) => void;
  onOpenGdprModal: () => void;
  onOpenDatabaseModal?: () => void;
  welcomeBanner: WelcomeBannerConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  unreadAnnouncementsCount: number;
  onToggleSlidebar?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSetTheme?: (theme: 'dark' | 'light') => void;
  onChangeMyCredentials?: (params: {
    newUsername?: string;
    newPassword?: string;
    newId?: string;
  }) => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  onSwitchUserRole,
  onOpenGdprModal,
  onOpenDatabaseModal,
  welcomeBanner,
  soundEnabled,
  onToggleSound,
  unreadAnnouncementsCount,
  onToggleSlidebar,
  theme,
  onToggleTheme,
  onSetTheme,
  onChangeMyCredentials,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Individual Credential Change Modal State
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [myUsername, setMyUsername] = useState(currentUser.username);
  const [myNewPassword, setMyNewPassword] = useState('');
  const [myConfirmPassword, setMyConfirmPassword] = useState('');
  const [showMyPassword, setShowMyPassword] = useState(false);
  const [myCredError, setMyCredError] = useState<string | null>(null);
  const [myCredSuccess, setMyCredSuccess] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleOpenMyCredModal = () => {
    setMyUsername(currentUser.username);
    setMyNewPassword('');
    setMyConfirmPassword('');
    setShowMyPassword(false);
    setMyCredError(null);
    setMyCredSuccess(null);
    setCopiedNotification(false);
    setIsCredModalOpen(true);
  };

  const generateStrongPassword = () => {
    const adjectives = ['Prasanthi', 'Anandam', 'Dharma', 'Sathya', 'Prema', 'Shanti', 'Vidya'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const pass = `${adj}#${num}!`;
    setMyNewPassword(pass);
    setMyConfirmPassword(pass);
    setMyCredError(null);
  };

  const handleCopyCredentials = () => {
    if (!myNewPassword) return;
    const info = `Sri Sathya Sai Portal Account:\nName: ${currentUser.fullName}\nID: ${currentUser.id}\nUsername: ${myUsername}\nPassword: ${myNewPassword}`;
    navigator.clipboard.writeText(info);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleSaveMyCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMyCredError(null);

    if (!myUsername.trim()) {
      setMyCredError('Username cannot be empty.');
      return;
    }

    if (myNewPassword && myNewPassword !== myConfirmPassword) {
      setMyCredError('Password and Confirm Password do not match.');
      return;
    }

    if (myNewPassword && myNewPassword.length < 4) {
      setMyCredError('Password must be at least 4 characters long.');
      return;
    }

    try {
      if (onChangeMyCredentials) {
        await onChangeMyCredentials({
          newUsername: myUsername.trim(),
          newPassword: myNewPassword.trim() || undefined,
        });
      }
      setMyCredSuccess('Credentials updated successfully! Active immediately.');
      setTimeout(() => {
        setIsCredModalOpen(false);
        setMyCredSuccess(null);
      }, 1500);
    } catch (err: any) {
      setMyCredError(err.message || 'Failed to update credentials.');
    }
  };

  // Role badges configuration
  const roleColors: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
    admin: { label: 'Principal / Admin', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    teacher: { label: 'Faculty / Teacher', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    student: { label: 'Student', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    accountant: { label: 'Chief Bursar', bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  };

  const navItems: { id: NavigationTab; label: string; icon: any; roles?: UserRole[] }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users, roles: ['admin'] },
    { id: 'academics', label: 'Gradebook', icon: BookOpen },
    { id: 'fees', label: 'Fee Ledger', icon: CreditCard, roles: ['admin', 'accountant', 'student'] },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'audit', label: 'Audit Logs', icon: ShieldAlert, roles: ['admin', 'accountant'] },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'chat', label: 'Community Forum', icon: MessageSquare },
    { id: 'ai-advisor', label: 'AI Diagnostic', icon: BrainCircuit },
    { id: 'settings', label: 'SecOps Settings', icon: Settings, roles: ['admin'] },
  ];

  // Filter tabs visible to current user role
  const visibleNavItems = navItems.filter(item => !item.roles || item.roles.includes(currentUser.role));

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Top Notification Welcome Banner */}
      {welcomeBanner.enabled && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-4 py-1.5 text-xs text-center border-b border-slate-800 flex items-center justify-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-300">{welcomeBanner.text}</span>
        </div>
      )}

      {/* Main Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left Brand Identity & Slidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSlidebar}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-300 hover:text-white transition cursor-pointer flex items-center gap-2 shadow-sm"
            title="Toggle Navigation Slidebar"
          >
            <PanelLeft className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold hidden sm:inline">Slidebar</span>
          </button>

          <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400/90 shadow-[0_0_12px_rgba(245,158,11,0.25)] bg-white p-0.5 shrink-0 flex items-center justify-center">
            <img
              src="/assets/sai_anandam_real_logo.png"
              alt="Sri Sathya Sai Anandam School Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black tracking-wide text-white uppercase text-sm sm:text-base">
                Sri Sathya Sai Anandam
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                School
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
              Sri Sathya Sai Anandam School • Zero-Paper Operations
            </div>
          </div>
        </div>

        {/* Right Controls & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Individual Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Muted'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* GDPR Status Pill */}
          <button
            type="button"
            onClick={onOpenGdprModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
            title="Inspect GDPR & Privacy Commitments"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>GDPR Active</span>
          </button>

          {/* Cloud Firestore Database Console Pill */}
          {onOpenDatabaseModal && (
            <button
              type="button"
              onClick={onOpenDatabaseModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              title="Inspect Cloud Firestore Database & Collections"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Firebase DB</span>
            </button>
          )}

          {/* Active User Chip & Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-left transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-300">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  {roleColors[currentUser.role]?.label || currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Profile Dropdown - Strictly Personal Profile, No Other Login Credentials */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-76 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3.5 z-50 text-xs">
                {/* User Identity Header */}
                <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base font-bold text-amber-300 shrink-0">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-sm truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      @{currentUser.username}
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${roleColors[currentUser.role]?.bg} ${roleColors[currentUser.role]?.text} border ${roleColors[currentUser.role]?.border}`}>
                      {roleColors[currentUser.role]?.label || currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="py-2.5 space-y-1.5 text-[11px] text-slate-300 border-b border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Institutional ID:</span>
                    <span className="font-mono text-slate-200">{currentUser.id}</span>
                  </div>
                  {currentUser.classSec && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class / Section:</span>
                      <span className="font-medium text-slate-200">{currentUser.classSec}</span>
                    </div>
                  )}
                  {currentUser.rollNo && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Roll Number:</span>
                      <span className="font-mono text-amber-300">{currentUser.rollNo}</span>
                    </div>
                  )}
                  <div className="flex justify-between truncate">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{currentUser.email}</span>
                  </div>
                </div>

                {/* Theme Selector for Every Individual */}
                <div className="py-2.5 border-b border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Display Theme</span>
                    <span className="text-amber-400 font-semibold capitalize">{theme} Mode</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => onSetTheme ? onSetTheme('light') : (theme !== 'light' && onToggleTheme())}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        theme === 'light'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetTheme ? onSetTheme('dark') : (theme !== 'dark' && onToggleTheme())}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Actions: Change Credentials, Private Vault & Sign Out */}
                <div className="pt-2.5 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      handleOpenMyCredModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white flex items-center justify-between border border-slate-700 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-xs">Change My ID & Pass</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onSelectTab('private-vault');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 flex items-center justify-between border border-amber-500/30 transition cursor-pointer"
                  >
                    <span className="font-semibold text-xs">🔒 Open Private Vault</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  {onOpenDatabaseModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenDatabaseModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-emerald-300 hover:text-white flex items-center justify-between border border-slate-700 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-xs">Firestore Database Console</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 cursor-pointer transition text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={onLogout}
            title="Terminate SecOps Session"
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dedicated Individual Change ID & Password Modal */}
      {isCredModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-start justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mb-1">
                  Individual Security Settings
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Change My Login Credentials</span>
                </h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Account: <span className="text-white font-medium">{currentUser.fullName}</span> ({currentUser.role})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCredModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {myCredError && (
              <div className="mb-4 p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{myCredError}</span>
              </div>
            )}

            {myCredSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{myCredSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveMyCredentials} className="space-y-4 text-xs">
              {/* Institutional ID (Read-only identifier) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Permanent Institutional ID
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentUser.id}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 font-mono text-xs outline-none cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Permanent system ID managed by school administration.
                </p>
              </div>

              {/* Login Username */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Login Username (Portal Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={myUsername}
                  onChange={(e) => setMyUsername(e.target.value)}
                  placeholder="e.g. your_username"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              {/* Password Section */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    New Account Password
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showMyPassword ? 'text' : 'password'}
                    value={myNewPassword}
                    onChange={(e) => setMyNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full pl-3 pr-20 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowMyPassword(!showMyPassword)}
                      className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                      title={showMyPassword ? 'Hide password' : 'Show password'}
                    >
                      {showMyPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {myNewPassword && (
                      <button
                        type="button"
                        onClick={handleCopyCredentials}
                        className="p-1 text-slate-400 hover:text-emerald-400 cursor-pointer"
                        title="Copy credentials"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {copiedNotification && (
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Password copied to clipboard!</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showMyPassword ? 'text' : 'password'}
                    value={myConfirmPassword}
                    onChange={(e) => setMyConfirmPassword(e.target.value)}
                    placeholder="Retype password to confirm"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCredModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Header Bar with Slidebar indicator & Student Learning Headings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 border-t border-slate-900 text-xs overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSlidebar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold transition cursor-pointer border border-slate-800"
            >
              <PanelLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span>Open Slidebar</span>
            </button>

            <span className="text-slate-600 hidden sm:inline">|</span>

            {/* Quick Primary Tab Headings */}
            <button
              type="button"
              onClick={() => onSelectTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'overview' || activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            {/* Student Learning Headings: Lectures & Assignments */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 hidden md:inline">
                Student Learning:
              </span>
              <button
                type="button"
                onClick={() => onSelectTab('lectures')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs transition cursor-pointer ${
                  activeTab === 'lectures'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lectures</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('assignments')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs transition cursor-pointer ${
                  activeTab === 'assignments'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Assignments</span>
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Zero-Paper Digital Campus</span>
          </div>
        </div>
      </div>
    </header>
  );
};
