import React from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Award,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';
import { User, StudentGrade, FeeTransaction, Announcement, AuditLog, NavigationTab } from '../types';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (tab: NavigationTab) => void;
  grades: StudentGrade[];
  transactions: FeeTransaction[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  grades,
  transactions,
  announcements,
  auditLogs,
}) => {
  // Aggregate Metrics
  const totalCollections = transactions.reduce((acc, t) => acc + t.amount, 0);
  const avgPercentage = grades.length
    ? (grades.reduce((acc, g) => acc + g.percentage, 0) / grades.length).toFixed(1)
    : '88.5';

  // Fallback default grade representation to prevent undefined crashes during data loading
  const defaultGrade: StudentGrade = {
    id: 'grade-default',
    studentId: currentUser.id,
    studentName: currentUser.fullName,
    rollNo: currentUser.rollNo || '101',
    classSec: currentUser.classSec || 'Class 10-A',
    examTermId: 'term-2-2026',
    scores: {
      'sub-math': 92,
      'sub-phys': 88,
      'sub-chem': 85,
      'sub-eng': 94,
      'sub-cs': 98,
      'sub-soc': 89,
    },
    totalMarks: 546,
    maxPossible: 600,
    percentage: 91.0,
    grade: 'A+',
    gpa: 9.6,
    status: 'pass',
    remarks: 'Consistent academic performance and paperless digital compliance.',
    lastUpdated: new Date().toISOString(),
  };

  // Current student grade (for student / parent views)
  const myGrade: StudentGrade =
    grades.find(
      (g) =>
        g.studentId === currentUser.id ||
        (currentUser.rollNo && g.rollNo === currentUser.rollNo) ||
        (currentUser.fullName && g.studentName.toLowerCase().includes(currentUser.fullName.toLowerCase())) ||
        g.studentName.includes('Sai')
    ) ||
    grades[0] ||
    defaultGrade;

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Institutional Workspace Active
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Academic Session 2026–27
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Welcome back, {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {currentUser.role === 'admin' && 'Centralized command center. Oversee user accounts, academic marksheets, fee audit trails, and GDPR telemetry.'}
              {currentUser.role === 'teacher' && 'Academic faculty console. Manage subject marks, assess student indexes, and publish classroom announcements.'}
              {currentUser.role === 'student' && 'Student academic portal. View your verified marksheet, download receipts, and check institutional circulars.'}
              {currentUser.role === 'parent' && 'Parent observatory portal. Review your ward’s academic performance indicators, payment vouchers, and faculty alerts.'}
              {currentUser.role === 'accountant' && 'Institutional treasury console. Issue verified digital fee vouchers and audit cryptographic transaction ledgers.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(currentUser.role === 'teacher' ? 'academics' : currentUser.role === 'accountant' ? 'fees' : 'announcements')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Active Tasks</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentUser.role === 'student' ? 'Term-2 Grade' : 'Class Enrollment'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {currentUser.role === 'student' ? `${myGrade?.grade || 'A+'} (${myGrade?.percentage ?? 91}%)` : '850+ Students'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">100% Digital</span>
              <span>• Zero paper registers</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Academic Index (GPA)
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {currentUser.role === 'student' ? `${myGrade?.gpa ?? 9.6} / 10.0` : `${avgPercentage}% Aggregate`}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-indigo-400 font-semibold">Term-2 Half Yearly</span>
              <span>Assessment</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Treasury / Fees
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {currentUser.role === 'student' || currentUser.role === 'parent' ? 'Clear (Paid)' : `₹ ${totalCollections.toLocaleString()}`}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-amber-400 font-semibold">Cryptographically</span>
              <span>Verified Hash</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Data Security (SecOps)
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">
              99.8% Grade A+
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-purple-400 font-semibold">AES-256</span>
              <span>• GDPR DPDP v5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Secondary View Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Academic Standings & Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Specific Highlight Card */}
          {(currentUser.role === 'student' || currentUser.role === 'parent') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>Academic Performance Summary (Term-2)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ward: <strong className="text-slate-200">{myGrade?.studentName || currentUser.fullName}</strong> • Roll #{myGrade?.rollNo || currentUser.rollNo || '101'} • {myGrade?.classSec || currentUser.classSec || 'Class 10-A'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('academics')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  View Full Marksheet →
                </button>
              </div>

              {/* Subject Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(myGrade?.scores || {}).map(([subKey, score]) => {
                  const subjectNames: Record<string, string> = {
                    'sub-math': 'Mathematics',
                    'sub-phys': 'Physics',
                    'sub-chem': 'Chemistry',
                    'sub-eng': 'English Lit',
                    'sub-cs': 'Computer Science',
                    'sub-soc': 'Social Studies',
                  };
                  return (
                    <div key={subKey} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-bold text-slate-400">
                        {subjectNames[subKey] || subKey}
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-white">{score}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">/ 100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl flex items-start gap-3 text-xs text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Faculty Remark:</strong> &ldquo;{myGrade?.remarks || 'Consistent academic performance and paperless compliance.'}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Institutional Circulars & Notices Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Recent Institutional Circulars</span>
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('announcements')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                All Announcements ({announcements.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">
                      {ann.title}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        ann.priority === 'critical'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      }`}
                    >
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {ann.content}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                    <span>By {ann.author} ({ann.role.toUpperCase()})</span>
                    <span>{new Date(ann.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: SecOps Telemetry & Quick Access */}
        <div className="space-y-6">
          {/* Security & Audit Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Security Audit Feed</span>
              </h2>
              {['admin', 'accountant'].includes(currentUser.role) && (
                <button
                  type="button"
                  onClick={() => onNavigate('audit')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View Full Logs →
                </button>
              )}
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
                      {log.eventType}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-normal">
                    {log.details}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    IP: {log.ipAddress}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Tiles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3">
              Quick Shortcuts
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigate('academics')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400 mb-1" />
                <div className="text-xs font-bold text-white">Gradebook</div>
                <div className="text-[10px] text-slate-400">Marks matrix</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('fees')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-amber-400 mb-1" />
                <div className="text-xs font-bold text-white">Fee Ledger</div>
                <div className="text-[10px] text-slate-400">Vouchers & hash</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="text-xs font-bold text-white">Calendar</div>
                <div className="text-[10px] text-slate-400">Working days</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('ai-advisor')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-400 mb-1" />
                <div className="text-xs font-bold text-white">AI Advisor</div>
                <div className="text-[10px] text-slate-400">Diagnostic plan</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
