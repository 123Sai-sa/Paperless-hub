import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Download,
  CheckCircle,
  FileCheck,
  KeyRound,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { User } from '../types';
import { sdbmsApi } from '../services/api';

interface GdprModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onConsentAccepted: (user: User) => void;
}

export const GdprModal: React.FC<GdprModalProps> = ({
  user,
  isOpen,
  onClose,
  onConsentAccepted,
}) => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const updated = await sdbmsApi.acceptGdprConsent(user);
      onConsentAccepted(updated);
      onClose();
    } catch (err) {
      console.error('Failed to register GDPR consent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const dossier = await sdbmsApi.exportGdprDossier(user);
      const blob = new Blob([JSON.stringify(dossier, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sdbms-gdpr-dossier-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Data portability export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 flex items-center gap-4 border-b border-indigo-800/40">
            <div className="bg-indigo-600/30 border border-indigo-500/40 p-3 rounded-xl text-indigo-300 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans tracking-tight text-white">
                GDPR Compliance & Student Data Consent
              </h2>
              <p className="text-xs text-indigo-300">
                Sri Sathya Sai Anandam School • SDBMS v5.0 SecOps
              </p>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-slate-300 font-sans">
            <p className="leading-relaxed">
              Dear <strong className="text-white">{user.fullName}</strong> ({user.role.toUpperCase()}), under GDPR (General Data Protection Regulation) and the Digital Personal Data Protection (DPDP) frameworks, we maintain strict controls over your institutional performance indicators and records.
            </p>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                Our Institutional Security Commitments
              </h3>

              <div className="flex gap-3.5 items-start bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
                <div className="bg-emerald-950/60 text-emerald-400 p-2 rounded-lg shrink-0 border border-emerald-800/50">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Encrypted Student Identifiers (AES-256)
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">
                    Government identifiers such as PEN, APAAR IDs, parent contact details, and dates of birth are encrypted with AES-256 before storage to defend against illegal intrusion.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
                <div className="bg-blue-950/60 text-blue-400 p-2 rounded-lg shrink-0 border border-blue-800/50">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Role-Based Access Control (RBAC)
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">
                    Academics marks and fee receipts are strictly segregated. Teachers only view their designated classes, parents only access their wards, and audit logs track all modifications.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
                <div className="bg-purple-950/60 text-purple-400 p-2 rounded-lg shrink-0 border border-purple-800/50">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Right to Data Portability & Erasure
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">
                    You hold full rights to export your structured data records at any time or request verified data anonymization upon academic graduation.
                  </p>
                </div>
              </div>
            </div>

            {user.gdprConsentDate && (
              <div className="bg-emerald-950/30 border border-emerald-800/50 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Consent actively recorded on {new Date(user.gdprConsentDate).toLocaleDateString()} at {new Date(user.gdprConsentDate).toLocaleTimeString()}.
                </span>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExportData}
              disabled={exporting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              {exporting ? 'Compiling Dossier...' : 'Export My Data (JSON)'}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-800 cursor-pointer transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Saving...' : 'Accept & Acknowledge'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
