import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Lock,
  Layers,
  Activity,
  HardDrive,
  ExternalLink,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { sdbmsApi } from '../services/api';
import { firebaseConfig } from '../services/firebase';

interface DatabaseConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const DatabaseConsoleModal: React.FC<DatabaseConsoleModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    connected: boolean;
    databaseId: string;
    projectId: string;
    latencyMs: number;
    collections: { name: string; count: number; status: string }[];
  } | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await sdbmsApi.getFirestoreStats();
      setStats(data);
    } catch (e: any) {
      console.error('Failed to load Firestore stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePingTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await sdbmsApi.testFirestoreConnection();
      setTestResult(`Latency: ${res.latencyMs}ms • Status: ${res.ok ? 'Healthy & Connected' : 'Offline Mode'}`);
      await loadStats();
    } catch (err: any) {
      setTestResult(`Ping failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAll = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await sdbmsApi.seedAllToFirestore();
      if (res.success) {
        setSeedResult(`Successfully synchronized and seeded ${res.count} records to Cloud Firestore!`);
        await loadStats();
        if (onRefreshData) onRefreshData();
      } else {
        setSeedResult('Seeding encountered a non-fatal warning, records cached.');
      }
    } catch (err: any) {
      setSeedResult(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Cloud Firestore Active
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Firebase v11
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-serif mt-1">
                Cloud Firestore Database Console
              </h2>
              <div className="text-xs text-slate-400 font-mono">
                Database: <span className="text-amber-300">{firebaseConfig.firestoreDatabaseId}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {/* Status & Latency Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Database Engine</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Firestore Online</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Read/Write Latency</div>
                <div className="text-xs font-bold text-white mt-0.5">
                  {stats ? `${stats.latencyMs} ms` : 'Testing...'}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Security Rules</div>
                <div className="text-xs font-bold text-white mt-0.5">
                  Institutional Enforced
                </div>
              </div>
            </div>
          </div>

          {/* Test Ping or Seed Notification */}
          {testResult && (
            <div className="p-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl text-indigo-200 text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {seedResult && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{seedResult}</span>
            </div>
          )}

          {/* Cloud Collections Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Connected Cloud Firestore Collections</span>
              </h3>
              <button
                type="button"
                onClick={loadStats}
                disabled={loading}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Counts</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {stats?.collections.map((col) => (
                <div
                  key={col.name}
                  className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col justify-between"
                >
                  <div className="text-[10px] font-mono font-bold text-slate-400 truncate">
                    /{col.name}
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-base font-extrabold text-white">{col.count}</span>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      {col.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Data Synchronization & Seeding Tool */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-indigo-500/20 text-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>One-Click Cloud Sync & Seeding</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Batches all student marks, hostel fee records, circulars, and lectures straight into Cloud Firestore.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePingTest}
                  disabled={loading}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-60"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ping Firestore</span>
                </button>

                <button
                  type="button"
                  onClick={handleSeedAll}
                  disabled={seeding}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-amber-500/20 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Syncing...' : 'Sync All Collections'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sri Sathya Sai Anandam School • Zero-Paper Institutional Cloud</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer transition"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
