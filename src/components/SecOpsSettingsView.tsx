import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  RotateCcw,
  Bell,
  Lock,
  Database,
  CheckCircle2,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';
import { WelcomeBannerConfig, User } from '../types';

interface SecOpsSettingsViewProps {
  welcomeBanner: WelcomeBannerConfig;
  onUpdateWelcomeBanner: (banner: WelcomeBannerConfig) => Promise<void>;
  onResetDatabase: () => Promise<void>;
  currentUser: User;
  theme?: 'dark' | 'light';
  onSetTheme?: (theme: 'dark' | 'light') => void;
  onToggleTheme?: () => void;
  onOpenDatabaseModal?: () => void;
}

export const SecOpsSettingsView: React.FC<SecOpsSettingsViewProps> = ({
  welcomeBanner,
  onUpdateWelcomeBanner,
  onResetDatabase,
  currentUser,
  theme = 'dark',
  onSetTheme,
  onToggleTheme,
  onOpenDatabaseModal,
}) => {
  const [bannerText, setBannerText] = useState(welcomeBanner.text);
  const [bannerEnabled, setBannerEnabled] = useState(welcomeBanner.enabled);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateWelcomeBanner({ text: bannerText, enabled: bannerEnabled });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteReset = async () => {
    await onResetDatabase();
    setConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>SecOps Configuration & Global Policies</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Master administrative controls for Sri Sathya Sai Anandam School.
        </p>
      </div>

      {/* Cloud Firestore Database Engine Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-emerald-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Database Engine: Cloud Firestore Online
              </span>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                ai-studio-paperlesshub-5e85e1d9-491f-4ca4-ab9b-6ccd5a952012
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              Live Cloud Firestore Persistence & Security Rules
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              All institutional gradebooks, fee ledger vouchers, announcements, audit trails, and confidential vaults synchronize with Google Cloud Firestore in real time.
            </p>
          </div>
        </div>

        {onOpenDatabaseModal && (
          <button
            type="button"
            onClick={onOpenDatabaseModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-600/20 shrink-0"
          >
            <Database className="w-4 h-4" />
            <span>Launch Firestore Console</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welcome Ticker Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Welcome Broadcast Header Ticker</span>
          </h2>

          <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Ticker Message Text</label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bannerEnabled"
                checked={bannerEnabled}
                onChange={(e) => setBannerEnabled(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <label htmlFor="bannerEnabled" className="text-slate-300">
                Display broadcast ticker at top of application
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Update Ticker'}</span>
            </button>

            {saveSuccess && (
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ticker updated successfully!</span>
              </div>
            )}
          </form>
        </div>

        {/* Security Policies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Zero-Paper Institutional Vault Status</span>
          </h2>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">AES-256 Storage Mode</div>
                <div className="text-[11px] text-slate-400">All student government identifiers encrypted</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                ENFORCED
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">GDPR & DPDP Protocol</div>
                <div className="text-[11px] text-slate-400">Right to portability and consent recording active</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">Factory Data Reset</div>
                <div className="text-[11px] text-slate-400">Revert student marks and records to initial template</div>
              </div>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Data</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExecuteReset}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {resetSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All institutional databases successfully reset to clean defaults.</span>
              </div>
            )}
          </div>
        </div>

        {/* Global & Individual Theme Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Institutional Display Theme Preference</span>
            </h2>
            <span className="text-[11px] text-amber-400 font-semibold uppercase">
              Current: {theme} mode
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Every individual student, faculty member, parent, and administrator can customize their interface appearance. Changes are saved specifically for your user profile across sessions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <button
              type="button"
              onClick={() => onSetTheme ? onSetTheme('light') : (theme !== 'light' && onToggleTheme?.())}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                theme === 'light'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Executive Light Mode</span>
                  {theme === 'light' && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Crisp daytime institutional palette with high-contrast text, pure white report cards, and clean slate surfaces.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSetTheme ? onSetTheme('dark') : (theme !== 'dark' && onToggleTheme?.())}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                theme === 'dark'
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Midnight Institutional Dark Mode</span>
                  {theme === 'dark' && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500 text-white">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Deep slate and navy low-fatigue dark background with amber highlights, designed for prolonged evening operations.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
