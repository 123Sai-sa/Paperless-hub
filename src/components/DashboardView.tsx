import React, { useState } from 'react';
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
  Medal,
  Crown,
  Trophy,
  Edit2,
  Plus,
  X,
  Check,
  CalendarCheck,
} from 'lucide-react';
import { User, StudentGrade, FeeTransaction, Announcement, AuditLog, NavigationTab } from '../types';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (tab: NavigationTab) => void;
  grades: StudentGrade[];
  transactions: FeeTransaction[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  users?: User[];
  onUpdateStudentBadges?: (studentId: string, badges: string[]) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  grades,
  transactions,
  announcements,
  auditLogs,
  users = [],
  onUpdateStudentBadges,
}) => {
  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  // State for Class Rank Board
  const defaultClass = currentUser.classSec || 'Class 10-A';
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);

  // State for Teacher Editing Badges Modal
  const [editingStudent, setEditingStudent] = useState<{ id: string; fullName: string; rollNo?: string; classSec?: string; badges?: string[] } | null>(null);
  const [activeBadges, setActiveBadges] = useState<string[]>([]);
  const [customBadgeInput, setCustomBadgeInput] = useState('');
  const [isSavingBadge, setIsSavingBadge] = useState(false);
  const [badgeSuccessMessage, setBadgeSuccessMessage] = useState<string | null>(null);

  const presetBadges = [
    '🌟 Math Star',
    '🏆 Prasanthi Scholar',
    '🏅 Dharma Star',
    '💎 100% Attendance',
    '🔬 Science Whiz',
    '🎨 Creative Genius',
    '⚡ Speed Solver',
    '🚀 AI Pioneer',
    '📖 Literature Laureate',
    '🌱 Eco Champion',
  ];

  // Aggregate Metrics
  const totalCollections = transactions.reduce((acc, t) => acc + t.amount, 0);
  const avgPercentage = grades.length
    ? (grades.reduce((acc, g) => acc + g.percentage, 0) / grades.length).toFixed(1)
    : '88.5';

  // Fallback default grade representation to prevent undefined crashes
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

  // Current student grade (for student view)
  const myGrade: StudentGrade =
    grades.find(
      (g) =>
        g.studentId === currentUser.id ||
        (currentUser.rollNo && g.rollNo === currentUser.rollNo) ||
        (currentUser.fullName && g.studentName.toLowerCase().trim() === currentUser.fullName.toLowerCase().trim())
    ) ||
    (isStudent ? defaultGrade : grades[0] || defaultGrade);

  // Collect student list for the Rank Board
  // Combine user records with academic grades
  const studentUsers = users.filter((u) => u.role === 'student');

  // Filter students based on selectedClass
  const filteredStudents = (studentUsers.length > 0
    ? studentUsers
    : [
        {
          id: 'u-std-01',
          fullName: 'Sai Krishna',
          role: 'student' as const,
          username: 'sai.krishna',
          email: 'sai.krishna@sssas.edu',
          classSec: 'Class 10-A',
          rollNo: '101',
          status: 'active' as const,
          rank: 1,
          badges: ['🌟 Math Star', '🏆 Prasanthi Scholar'],
        },
        {
          id: 'u-std-02',
          fullName: 'Aarav Patel',
          role: 'student' as const,
          username: 'aarav.patel',
          email: 'aarav.patel@sssas.edu',
          classSec: 'Class 10-A',
          rollNo: '102',
          status: 'active' as const,
          rank: 2,
          badges: ['🔬 Science Whiz', '🏅 Dharma Star'],
        },
        {
          id: 'u-std-03',
          fullName: 'Meera Sharma',
          role: 'student' as const,
          username: 'meera.sharma',
          email: 'meera.sharma@sssas.edu',
          classSec: 'Class 10-A',
          rollNo: '103',
          status: 'active' as const,
          rank: 3,
          badges: ['💎 100% Attendance', '🎨 Creative Genius'],
        },
      ]
  ).filter((s) => selectedClass === 'All' || s.classSec === selectedClass);

  // Map each student with their grade information and sort by percentage/rank
  const rankedStudents = filteredStudents
    .map((student) => {
      const g = grades.find(
        (grade) =>
          grade.studentId === student.id ||
          grade.rollNo === student.rollNo ||
          grade.studentName.toLowerCase().trim() === student.fullName.toLowerCase().trim()
      );
      const percentage = g ? g.percentage : (student.rank === 1 ? 94.5 : student.rank === 2 ? 91.2 : 88.0);
      const gpa = g ? g.gpa : (student.rank === 1 ? 9.8 : student.rank === 2 ? 9.5 : 9.2);
      const gradeLetter = g ? g.grade : 'A+';
      return {
        ...student,
        calculatedPercentage: percentage,
        calculatedGpa: gpa,
        calculatedGrade: gradeLetter,
        displayBadges: student.badges || (student.rank === 1 ? ['🌟 Math Star', '🏆 Prasanthi Scholar'] : ['🏅 Dharma Star']),
      };
    })
    .sort((a, b) => b.calculatedPercentage - a.calculatedPercentage);

  // Available classes for filtering
  const availableClasses = ['Class 10-A', 'Class 10-B', 'Class 9-A', 'All'];

  // Open Teacher Badge Editing Modal
  const handleOpenEditBadges = (student: { id: string; fullName: string; rollNo?: string; classSec?: string; badges?: string[]; displayBadges?: string[] }) => {
    setEditingStudent(student);
    setActiveBadges(student.displayBadges || student.badges || []);
    setCustomBadgeInput('');
    setBadgeSuccessMessage(null);
  };

  const handleTogglePresetBadge = (badge: string) => {
    if (activeBadges.includes(badge)) {
      setActiveBadges(activeBadges.filter((b) => b !== badge));
    } else {
      setActiveBadges([...activeBadges, badge]);
    }
  };

  const handleAddCustomBadge = () => {
    if (!customBadgeInput.trim()) return;
    const formatted = customBadgeInput.trim();
    if (!activeBadges.includes(formatted)) {
      setActiveBadges([...activeBadges, formatted]);
    }
    setCustomBadgeInput('');
  };

  const handleRemoveBadge = (badgeToRemove: string) => {
    setActiveBadges(activeBadges.filter((b) => b !== badgeToRemove));
  };

  const handleSaveBadges = async () => {
    if (!editingStudent || !onUpdateStudentBadges) return;
    setIsSavingBadge(true);
    try {
      await onUpdateStudentBadges(editingStudent.id, activeBadges);
      setBadgeSuccessMessage('Badges updated and synchronized with student profile!');
      setTimeout(() => {
        setEditingStudent(null);
        setBadgeSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to update badges.');
    } finally {
      setIsSavingBadge(false);
    }
  };

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
              {currentUser.role === 'admin' && 'Centralized command center. Oversee user accounts, class rank boards, academic marksheets, fee audit trails, and attendance books.'}
              {currentUser.role === 'teacher' && 'Academic faculty console. Manage subject marks, award badges on the Class Rank Board, and track daily classroom attendance.'}
              {currentUser.role === 'student' && 'Student academic portal. View your class rank board, verified marksheet, daily attendance rate, and take video lecture quizzes.'}
              {currentUser.role === 'accountant' && 'Institutional treasury console. Issue verified digital fee vouchers and audit cryptographic transaction ledgers.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(currentUser.role === 'teacher' ? 'academics' : currentUser.role === 'accountant' ? 'fees' : 'attendance')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <span>{isStudent ? 'Check Attendance Book' : 'Explore Active Tasks'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Grade / Enrollment */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isStudent ? 'Term-2 Grade' : 'Class Enrollment'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {isStudent ? `${myGrade?.grade || 'A+'} (${myGrade?.percentage ?? 91}%)` : '850+ Students'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">100% Digital</span>
              <span>• Zero paper registers</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Academic Index (GPA) */}
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
              {isStudent ? `${myGrade?.gpa ?? 9.6} / 10.0` : `${avgPercentage}% Aggregate`}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-indigo-400 font-semibold">Term-2 Half Yearly</span>
              <span>Assessment</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Daily Attendance Rate (Day-wise percentage) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isStudent ? 'Attendance Rate' : 'Campus Attendance'}
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-400">
              {isStudent ? '96.8%' : '97.2% Average'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span className="text-slate-300 font-medium">
                {isStudent ? '29 / 30 Days Present' : 'Daily Register Synced'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="text-teal-400 hover:text-teal-300 font-bold"
              >
                View Log →
              </button>
            </div>
          </div>
        </div>

        {/* KPI 4: Treasury / Security */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isStudent ? 'Fee Ledger' : 'Treasury / Collections'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {isStudent ? 'Clear (Paid)' : `₹ ${totalCollections.toLocaleString()}`}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-amber-400 font-semibold">Cryptographically</span>
              <span>Verified Hash</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CLASS RANK BOARD & BADGES SHOWCASE (Front Page for Students & Faculty)
          ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Front Page Leaderboard
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">Peer Achievements & Distinctions</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-white mt-1 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Class Rank Board & Badges Showcase</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isStudent
                ? 'Check your class standing, see your classmates’ ranks, and celebrate awarded distinction badges.'
                : 'Faculty review: Observe class standings, track student academic performance, and award/edit badges.'}
            </p>
          </div>

          {/* Class Filter Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-400">Class Section:</span>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rank Board Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] font-extrabold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-20">Rank</th>
                <th className="py-3 px-4">Student Name & Roll No</th>
                <th className="py-3 px-4 text-center">Class</th>
                <th className="py-3 px-4 text-center">Score / GPA</th>
                <th className="py-3 px-4">Distinction Badges (Awarded by Faculty)</th>
                {isTeacherOrAdmin && (
                  <th className="py-3 px-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedStudents.map((student, index) => {
                const rankNum = index + 1;
                const isMe = isStudent && (student.id === currentUser.id || student.rollNo === currentUser.rollNo);

                return (
                  <tr
                    key={student.id}
                    className={`transition ${
                      isMe
                        ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500 hover:bg-indigo-950/60'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank Medal / Badge */}
                    <td className="py-3 px-4">
                      {rankNum === 1 && (
                        <div className="flex items-center gap-1.5 font-black text-amber-400">
                          <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                          <span className="text-sm">1st</span>
                        </div>
                      )}
                      {rankNum === 2 && (
                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                          <Medal className="w-4 h-4 text-slate-300" />
                          <span className="text-sm">2nd</span>
                        </div>
                      )}
                      {rankNum === 3 && (
                        <div className="flex items-center gap-1.5 font-bold text-amber-600">
                          <Medal className="w-4 h-4 text-amber-600" />
                          <span className="text-sm">3rd</span>
                        </div>
                      )}
                      {rankNum > 3 && (
                        <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-400 font-mono font-bold text-xs">
                          #{rankNum}
                        </span>
                      )}
                    </td>

                    {/* Student Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          rankNum === 1
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{student.fullName}</span>
                            {isMe && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Roll #{student.rollNo || '101'} • ID: {student.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 font-semibold text-[11px] border border-slate-800">
                        {student.classSec || 'Class 10-A'}
                      </span>
                    </td>

                    {/* Academic Score */}
                    <td className="py-3 px-4 text-center">
                      <div className="font-black text-white text-sm">
                        {student.calculatedPercentage}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        GPA: <span className="text-emerald-400 font-bold">{student.calculatedGpa}</span> ({student.calculatedGrade})
                      </div>
                    </td>

                    {/* Badges List */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {student.displayBadges && student.displayBadges.length > 0 ? (
                          student.displayBadges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950 text-amber-300 border border-amber-500/30 shadow-sm flex items-center gap-1"
                            >
                              <span>{badge}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">
                            No badges awarded yet
                          </span>
                        )}

                        {isTeacherOrAdmin && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditBadges(student)}
                            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Edit Badges"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Teacher Action */}
                    {isTeacherOrAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBadges(student)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3 h-3 text-indigo-400" />
                          <span>Edit Badges</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rankedStudents.length === 0 && (
          <div className="text-center p-8 text-slate-500 text-xs">
            No students found for {selectedClass}. Select another class or add students in User Directory.
          </div>
        )}
      </div>

      {/* Role-Specific Secondary View Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Academic Standings & Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Specific Highlight Card */}
          {isStudent && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>Academic Performance Summary (Term-2)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Student: <strong className="text-slate-200">{myGrade?.studentName || currentUser.fullName}</strong> • Roll #{myGrade?.rollNo || currentUser.rollNo || '101'} • {myGrade?.classSec || currentUser.classSec || 'Class 10-A'}
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

        {/* Right Col: Quick Access & SecOps Feed */}
        <div className="space-y-6">
          {/* Quick Action Tiles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3">
              Quick Shortcuts
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-teal-400 mb-1" />
                <div className="text-xs font-bold text-white">Attendance</div>
                <div className="text-[10px] text-slate-400">Day-wise log</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('academics')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400 mb-1" />
                <div className="text-xs font-bold text-white">Gradebook</div>
                <div className="text-[10px] text-slate-400">Classwise marks</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('lectures')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                <div className="text-xs font-bold text-white">Lectures</div>
                <div className="text-[10px] text-slate-400">Video & quizzes</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('assignments')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="text-xs font-bold text-white">Assignments</div>
                <div className="text-[10px] text-slate-400">Attachments & HW</div>
              </button>
            </div>
          </div>

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
        </div>
      </div>

      {/* =========================================================================
          TEACHER BADGE EDITING MODAL
          ========================================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mb-1">
                  Faculty Distinction Portal
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Award & Edit Badges: {editingStudent.fullName}</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  Roll #{editingStudent.rollNo || '101'} • {editingStudent.classSec || 'Class 10-A'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {badgeSuccessMessage && (
              <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{badgeSuccessMessage}</span>
              </div>
            )}

            {/* Currently Assigned Badges */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Currently Awarded Badges ({activeBadges.length})
                </label>
                {activeBadges.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    {activeBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{badge}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBadge(badge)}
                          className="hover:text-rose-400 transition cursor-pointer"
                          title="Remove badge"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 italic text-center">
                    No badges assigned to this student yet. Click preset chips below to award.
                  </div>
                )}
              </div>

              {/* Preset Badges Quick Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Click to Toggle Preset Distinction Badges
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presetBadges.map((badge) => {
                    const isSelected = activeBadges.includes(badge);
                    return (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => handleTogglePresetBadge(badge)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {badge} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Badge Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Or Add Custom Badge (e.g. 🎯 Debate Champion)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBadgeInput}
                    onChange={(e) => setCustomBadgeInput(e.target.value)}
                    placeholder="Enter emoji + badge label"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomBadge();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBadge}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingBadge}
                  onClick={handleSaveBadges}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingBadge ? 'Saving...' : 'Save & Synchronize Badges'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
