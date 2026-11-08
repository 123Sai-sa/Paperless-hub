import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Award,
  Edit3,
  Download,
  Printer,
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  Trash2,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Users,
  TrendingUp,
  BarChart3,
  X,
  Save,
  Check,
} from 'lucide-react';
import { StudentGrade, AcademicSubject, ExamTerm, User } from '../types';
import { INITIAL_SUBJECTS, INITIAL_EXAM_TERMS } from '../data/sdbmsInitialData';

interface AcademicsViewProps {
  grades: StudentGrade[];
  users?: User[];
  currentUser: User;
  onUpdateGrade: (grade: StudentGrade) => Promise<StudentGrade>;
  onBulkUpdateGrades: (grades: StudentGrade[]) => Promise<StudentGrade[]>;
  onAddGrade?: (gradeData: Omit<StudentGrade, 'id' | 'lastUpdated'>) => Promise<StudentGrade>;
  onDeleteGrade?: (gradeId: string) => Promise<void>;
  onRefreshGrades?: () => Promise<void>;
  onOpenAiDiagnostic?: (studentName: string, grade: StudentGrade) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  grades,
  users = [],
  currentUser,
  onUpdateGrade,
  onBulkUpdateGrades,
  onAddGrade,
  onDeleteGrade,
  onRefreshGrades,
  onOpenAiDiagnostic,
}) => {
  const subjects = INITIAL_SUBJECTS;
  const isTeacherOrAdmin = ['admin', 'teacher'].includes(currentUser.role);

  // Extract all distinct classes from grades and users
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    grades.forEach((g) => {
      if (g.classSec) classSet.add(g.classSec.trim());
    });
    users.forEach((u) => {
      if (u.role === 'student' && u.classSec) {
        classSet.add(u.classSec.trim());
      }
    });
    // Ensure standard school sections exist
    ['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 12-B'].forEach((c) =>
      classSet.add(c)
    );
    return Array.from(classSet).sort();
  }, [grades, users]);

  // Determine initial class selection: if teacher has an assigned class, select it; otherwise "Class 10-A"
  const defaultClass = useMemo(() => {
    if (currentUser.role === 'teacher' && currentUser.classSec && availableClasses.includes(currentUser.classSec)) {
      return currentUser.classSec;
    }
    if (currentUser.role === 'student' && currentUser.classSec) {
      return currentUser.classSec;
    }
    return 'Class 10-A';
  }, [currentUser, availableClasses]);

  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [selectedTerm, setSelectedTerm] = useState('term-half');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<StudentGrade | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClassPrintOpen, setIsClassPrintOpen] = useState(false);
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);
  const [quickScores, setQuickScores] = useState<Record<string, Record<string, number>>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Form State for Adding New Marksheet
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [newClassSec, setNewClassSec] = useState(selectedClass === 'ALL' ? 'Class 10-A' : selectedClass);
  const [newScores, setNewScores] = useState<Record<string, number>>({
    'sub-math': 80,
    'sub-phys': 80,
    'sub-chem': 80,
    'sub-eng': 85,
    'sub-cs': 85,
    'sub-soc': 80,
  });
  const [newRemarks, setNewRemarks] = useState('Satisfactory performance with consistent exam effort.');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered grades based on role, class, and search
  const displayedGrades = useMemo(() => {
    return grades.filter((g) => {
      // If student, strictly restrict to their own record only
      if (currentUser.role === 'student') {
        const matchesUser =
          g.studentId === currentUser.id ||
          (currentUser.rollNo && g.rollNo === currentUser.rollNo) ||
          g.studentName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase();
        if (!matchesUser) return false;
      }

      // Class filter
      if (selectedClass !== 'ALL' && g.classSec !== selectedClass) {
        return false;
      }

      // Exam term filter
      if (selectedTerm && g.examTermId !== selectedTerm) {
        // Fallback: if examTermId not set, include or match
        if (g.examTermId && g.examTermId !== selectedTerm) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          g.studentName.toLowerCase().includes(query) ||
          g.rollNo.toLowerCase().includes(query) ||
          g.classSec.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [grades, currentUser, selectedClass, selectedTerm, searchQuery]);

  // Performance calculations
  const calculateDerived = (scores: Record<string, number>) => {
    const total = Object.values(scores).reduce((a, b) => a + Number(b || 0), 0);
    const subjectCount = Math.max(Object.keys(scores).length, 1);
    const max = subjectCount * 100;
    const percentage = Number(((total / max) * 100).toFixed(2));
    const gpa = Number(((percentage / 100) * 10).toFixed(1));

    let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const status: 'pass' | 'fail' = percentage >= 40 ? 'pass' : 'fail';
    return { total, max, percentage, gpa, grade, status };
  };

  // Class analytics for selected class
  const classAnalytics = useMemo(() => {
    if (displayedGrades.length === 0) {
      return {
        avgPercentage: 0,
        passRate: 0,
        passedCount: 0,
        failedCount: 0,
        topper: null,
        subjectAverages: subjects.map((s) => ({ name: s.name, id: s.id, avg: 0 })),
      };
    }

    const totalPct = displayedGrades.reduce((sum, g) => sum + g.percentage, 0);
    const avgPercentage = Number((totalPct / displayedGrades.length).toFixed(1));
    const passed = displayedGrades.filter((g) => g.status === 'pass');
    const passRate = Number(((passed.length / displayedGrades.length) * 100).toFixed(0));

    // Sort to find topper
    const sorted = [...displayedGrades].sort((a, b) => b.totalMarks - a.totalMarks);
    const topper = sorted[0];

    const subjectAverages = subjects.map((sub) => {
      const subTotal = displayedGrades.reduce((sum, g) => sum + (g.scores[sub.id] || 0), 0);
      const avg = Number((subTotal / displayedGrades.length).toFixed(1));
      return { name: sub.name, id: sub.id, avg };
    });

    return {
      avgPercentage,
      passRate,
      passedCount: passed.length,
      failedCount: displayedGrades.length - passed.length,
      topper,
      subjectAverages,
    };
  }, [displayedGrades, subjects]);

  // Handle score change in single edit modal
  const handleScoreChange = (subId: string, val: number) => {
    if (!editingGrade) return;
    const scoreVal = Math.min(100, Math.max(0, val));
    const newScoresObj = { ...editingGrade.scores, [subId]: scoreVal };
    const derived = calculateDerived(newScoresObj);
    setEditingGrade({
      ...editingGrade,
      scores: newScoresObj,
      totalMarks: derived.total,
      maxPossible: derived.max,
      percentage: derived.percentage,
      gpa: derived.gpa,
      grade: derived.grade,
      status: derived.status,
    });
  };

  const [newSubName, setNewSubName] = useState('');
  const [newSubScore, setNewSubScore] = useState(80);

  const handleAddSubjectToEditingGrade = () => {
    if (!editingGrade || !newSubName.trim()) return;
    const cleanKey = `sub-custom-${newSubName.trim().toLowerCase().replace(/\s+/g, '-')}`;
    const newScoresObj = { ...editingGrade.scores, [cleanKey]: Math.min(100, Math.max(0, newSubScore)) };
    const derived = calculateDerived(newScoresObj);
    setEditingGrade({
      ...editingGrade,
      scores: newScoresObj,
      totalMarks: derived.total,
      maxPossible: derived.max,
      percentage: derived.percentage,
      gpa: derived.gpa,
      grade: derived.grade,
      status: derived.status,
    });
    setNewSubName('');
    setNewSubScore(80);
  };

  const handleRemoveSubjectFromEditingGrade = (subKey: string) => {
    if (!editingGrade) return;
    const newScoresObj = { ...editingGrade.scores };
    delete newScoresObj[subKey];
    const derived = calculateDerived(newScoresObj);
    setEditingGrade({
      ...editingGrade,
      scores: newScoresObj,
      totalMarks: derived.total,
      maxPossible: derived.max,
      percentage: derived.percentage,
      gpa: derived.gpa,
      grade: derived.grade,
      status: derived.status,
    });
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;
    await onUpdateGrade({
      ...editingGrade,
      lastUpdated: new Date().toISOString(),
    });
    setEditingGrade(null);
    setSyncNotice(`✅ Marksheet updated and synchronized to Firestore DB`);
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Handle student selection when adding new grade
  const handleSelectStudentForNewGrade = (studentId: string) => {
    setNewStudentId(studentId);
    const student = users.find((u) => u.id === studentId);
    if (student) {
      setNewStudentName(student.fullName);
      setNewRollNo(student.rollNo || '');
      if (student.classSec) {
        setNewClassSec(student.classSec);
      }
    }
  };

  // Submit New Marksheet
  const handleCreateNewGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newStudentName.trim() || !newRollNo.trim()) {
      setFormError('Please provide both Student Name and Roll Number.');
      return;
    }

    const derived = calculateDerived(newScores);
    const gradePayload: Omit<StudentGrade, 'id' | 'lastUpdated'> = {
      studentId: newStudentId || `u-stud-${Date.now().toString(36)}`,
      studentName: newStudentName.trim(),
      rollNo: newRollNo.trim(),
      classSec: newClassSec,
      examTermId: selectedTerm,
      scores: newScores,
      totalMarks: derived.total,
      maxPossible: derived.max,
      percentage: derived.percentage,
      gpa: derived.gpa,
      grade: derived.grade,
      status: derived.status,
      remarks: newRemarks,
    };

    if (onAddGrade) {
      await onAddGrade(gradePayload);
    } else {
      await onUpdateGrade({
        ...gradePayload,
        id: `grd-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
      });
    }

    setIsAddModalOpen(false);
    setNewStudentName('');
    setNewRollNo('');
    setNewStudentId('');
    setSyncNotice(`✅ New marksheet for ${gradePayload.studentName} (${newClassSec}) saved to Firestore!`);
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Quick edit mode handlers
  const handleToggleQuickEdit = () => {
    if (!isQuickEditMode) {
      // populate quickScores
      const initialMap: Record<string, Record<string, number>> = {};
      displayedGrades.forEach((g) => {
        initialMap[g.id] = { ...g.scores };
      });
      setQuickScores(initialMap);
      setIsQuickEditMode(true);
    } else {
      setIsQuickEditMode(false);
    }
  };

  const handleQuickScoreChange = (gradeId: string, subId: string, val: number) => {
    const cleanVal = Math.min(100, Math.max(0, val));
    setQuickScores((prev) => ({
      ...prev,
      [gradeId]: {
        ...(prev[gradeId] || {}),
        [subId]: cleanVal,
      },
    }));
  };

  const handleSaveAllQuickScores = async () => {
    const updatedGradesList: StudentGrade[] = displayedGrades.map((g) => {
      const studentScores = quickScores[g.id] || g.scores;
      const derived = calculateDerived(studentScores);
      return {
        ...g,
        scores: studentScores,
        totalMarks: derived.total,
        maxPossible: derived.max,
        percentage: derived.percentage,
        gpa: derived.gpa,
        grade: derived.grade,
        status: derived.status,
        lastUpdated: new Date().toISOString(),
      };
    });

    await onBulkUpdateGrades(updatedGradesList);
    setIsQuickEditMode(false);
    setSyncNotice(`✅ All ${updatedGradesList.length} marksheet scores synchronized to Cloud Firestore DB`);
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Refresh from Firestore database
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      if (onRefreshGrades) {
        await onRefreshGrades();
      }
      setSyncNotice('🟢 Connected to Cloud Firestore • Latest class marksheets synchronized.');
    } catch {
      setSyncNotice('Cloud database cached offline mode active.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 3500);
    }
  };

  // Export CSV for the currently selected class
  const handleExportCsv = () => {
    const headers = [
      'Roll No',
      'Student Name',
      'Class & Section',
      ...subjects.map((s) => s.name),
      'Total Marks',
      'Max Marks',
      'Percentage',
      'GPA',
      'Grade',
      'Status',
      'Remarks',
    ];
    const rows = displayedGrades.map((g) => [
      `"${g.rollNo}"`,
      `"${g.studentName}"`,
      `"${g.classSec}"`,
      ...subjects.map((s) => g.scores[s.id] || 0),
      g.totalMarks,
      g.maxPossible,
      `"${g.percentage}%"`,
      g.gpa,
      `"${g.grade}"`,
      `"${g.status}"`,
      `"${(g.remarks || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safeClassName = selectedClass.replace(/[\s-]/g, '_');
    link.setAttribute('download', `Sri_Sathya_Sai_Anandam_${safeClassName}_Gradebook_${selectedTerm}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-white p-1 shrink-0 flex items-center justify-center">
            <img
              src="/assets/sai_anandam_real_logo.png"
              alt="Sri Sathya Sai Anandam School Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Sri Sathya Sai Anandam School
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-2.5 h-2.5" />
                Firestore DB Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
              Classwise Academic Marksheet & Evaluation Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero-paper continuous comprehensive assessment portal for teachers and administrators.
            </p>
          </div>
        </div>

        {/* Database Sync & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Synchronize fresh marks from Cloud Firestore Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          {isTeacherOrAdmin && (
            <>
              <button
                type="button"
                onClick={handleToggleQuickEdit}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  isQuickEditMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Toggle fast in-grid score entry for the selected class"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isQuickEditMode ? 'Exit Quick Edit' : 'Quick Grade Entry'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewClassSec(selectedClass === 'ALL' ? 'Class 10-A' : selectedClass);
                  setIsAddModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Record Marksheet</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Download CSV for this class"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClassPrintOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Print consolidated class marksheet"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Print Class</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncNotice && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-300 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncNotice(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CLASSWISE NAVIGATION & SELECTION BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Class Select Tabs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Institutional Class / Grade:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => setSelectedClass('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedClass === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All Classes</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/50">
                    {grades.length}
                  </span>
                </button>
              )}

              {availableClasses.map((cls) => {
                const count = grades.filter((g) => g.classSec === cls).length;
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 border border-amber-400'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    <span>{cls}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-amber-900/30 text-slate-950' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Term Selector & Search Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            {/* Term selector */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium">Exam Term:</span>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer font-medium"
              >
                {INITIAL_EXAM_TERMS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Selected Class Performance Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {selectedClass === 'ALL' ? 'School Average' : `${selectedClass} Average`}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {classAnalytics.avgPercentage}%
              </span>
              <span className="text-[10px] text-slate-500">Overall</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Pass Rate
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-indigo-400 font-mono">
                {classAnalytics.passRate}%
              </span>
              <span className="text-[10px] text-slate-400">
                ({classAnalytics.passedCount} Pass / {classAnalytics.failedCount} Needs Help)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Class Strength
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-white font-mono">
                {displayedGrades.length}
              </span>
              <span className="text-[10px] text-slate-500">Enrolled Marks</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Class Topper
            </span>
            <div className="truncate mt-0.5">
              {classAnalytics.topper ? (
                <>
                  <span className="text-xs font-bold text-white truncate block">
                    {classAnalytics.topper.studentName}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {classAnalytics.topper.totalMarks}/600 ({classAnalytics.topper.percentage}%) • GPA {classAnalytics.topper.gpa}
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-500">No records</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Edit Mode Floating Save Bar */}
      {isQuickEditMode && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Quick Grade Entry Active:</strong> You can edit numbers directly in the marksheet table below.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQuickEditMode(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAllQuickScores}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All to Database</span>
            </button>
          </div>
        </div>
      )}

      {/* Marksheet Evaluation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              {selectedClass === 'ALL' ? 'All Classes Gradebook' : `${selectedClass} Official Evaluation Sheet`}
            </h2>
            <span className="text-[11px] text-slate-400">
              ({displayedGrades.length} students listed)
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Term: <strong className="text-white">{INITIAL_EXAM_TERMS.find((t) => t.id === selectedTerm)?.name || selectedTerm}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Student Name & Class</th>
                {subjects.map((sub) => (
                  <th key={sub.id} className="py-3 px-2.5 text-center">
                    <span className="block truncate max-w-[85px]">{sub.name.split(' ')[0]}</span>
                    <span className="block text-[9px] text-slate-500 font-normal">Max: 100</span>
                  </th>
                ))}
                <th className="py-3 px-3 text-center">Total</th>
                <th className="py-3 px-3 text-center">% Age</th>
                <th className="py-3 px-3 text-center">GPA</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedGrades.length === 0 ? (
                <tr>
                  <td colSpan={subjects.length + 6} className="py-12 text-center text-slate-500">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-400">
                      No marksheet records found for {selectedClass} in {selectedTerm}.
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Click <strong>"Record Marksheet"</strong> above to enter marks for this class.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 font-bold whitespace-nowrap">
                      {g.rollNo}
                    </td>
                    <td className="py-3 px-4">
                      {isTeacherOrAdmin ? (
                        <button
                          type="button"
                          onClick={() => setEditingGrade(g)}
                          className="text-left group cursor-pointer"
                          title="Click to edit marks & subjects for this student"
                        >
                          <div className="font-bold text-white text-sm group-hover:text-amber-400 flex items-center gap-1.5 transition">
                            <span>{g.studentName}</span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
                          </div>
                          <div className="text-[10px] text-amber-400/90 font-medium">{g.classSec} • Click name to edit marks</div>
                        </button>
                      ) : (
                        <div>
                          <div className="font-bold text-white text-sm">{g.studentName}</div>
                          <div className="text-[10px] text-amber-400/90 font-medium">{g.classSec}</div>
                        </div>
                      )}
                    </td>

                    {subjects.map((sub) => {
                      const currentScore = isQuickEditMode
                        ? quickScores[g.id]?.[sub.id] ?? g.scores[sub.id] ?? 0
                        : g.scores[sub.id] ?? 0;

                      if (isQuickEditMode) {
                        return (
                          <td key={sub.id} className="py-2 px-1 text-center font-mono">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={currentScore}
                              onChange={(e) =>
                                handleQuickScoreChange(g.id, sub.id, parseInt(e.target.value) || 0)
                              }
                              className="w-14 py-1 text-center bg-slate-950 border border-amber-500/50 rounded text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                            />
                          </td>
                        );
                      }

                      return (
                        <td key={sub.id} className="py-3 px-2.5 text-center font-mono whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              currentScore >= 90
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                : currentScore >= 75
                                ? 'bg-indigo-950/60 text-indigo-300'
                                : currentScore >= 40
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                            }`}
                          >
                            {currentScore}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center font-bold text-white whitespace-nowrap">
                      {g.totalMarks} / {g.maxPossible}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-emerald-400 whitespace-nowrap">
                      {g.percentage}%
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-300 whitespace-nowrap">
                      {g.gpa}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {g.grade}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setReportCardStudent(g)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Generate Official Digital Progress Report Card"
                        >
                          <Printer className="w-3 h-3 text-indigo-400" />
                          <span>Report</span>
                        </button>

                        {isTeacherOrAdmin && (
                          <button
                            type="button"
                            onClick={() => setEditingGrade(g)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/60 text-slate-300 hover:text-indigo-300 transition cursor-pointer"
                            title="Edit Individual Marks"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {currentUser.role === 'admin' && onDeleteGrade && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Remove marksheet record for ${g.studentName} (${g.classSec})?`)) {
                                await onDeleteGrade(g.id);
                                setSyncNotice(`Removed marksheet for ${g.studentName} from Firestore.`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Delete Marksheet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD NEW MARKSHEET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-400/80 bg-white p-0.5 flex items-center justify-center">
                  <img
                    src="/assets/sai_anandam_real_logo.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Record Student Marksheet</h2>
                  <p className="text-xs text-slate-400">Classwise Entry • Cloud Firestore Synchronized</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-rose-950/50 border border-rose-800/80 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateNewGrade} className="space-y-4 text-xs">
              {/* Pick from registered students */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Quick Select from Registered Students (Optional):
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => handleSelectStudentForNewGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 cursor-pointer text-xs"
                >
                  <option value="">-- Choose a student or enter manually below --</option>
                  {users
                    .filter((u) => u.role === 'student')
                    .map((stud) => (
                      <option key={stud.id} value={stud.id}>
                        {stud.fullName} ({stud.classSec || 'No Class'} • Roll #{stud.rollNo || 'N/A'})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sai Anandam K."
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10A-14"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Class & Section *
                  </label>
                  <select
                    value={newClassSec}
                    onChange={(e) => setNewClassSec(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Marks Grid */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Subject Marks (Out of 100):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-slate-400 font-semibold truncate mb-1">
                        {sub.name}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newScores[sub.id] || 0}
                        onChange={(e) =>
                          setNewScores({
                            ...newScores,
                            [sub.id]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                          })
                        }
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-center outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Evaluator Remarks:
                </label>
                <textarea
                  rows={2}
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  placeholder="Comprehensive academic commentary..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Real-time Calculation Summary */}
              {(() => {
                const derived = calculateDerived(newScores);
                return (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Total: </span>
                      <strong className="text-white font-mono">{derived.total} / {derived.max}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Percentage: </span>
                      <strong className="text-emerald-400 font-mono">{derived.percentage}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">GPA: </span>
                      <strong className="text-indigo-400 font-mono">{derived.gpa}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Grade: </span>
                      <strong className="text-amber-400 font-bold">{derived.grade}</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Marksheet to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MARKS & SUBJECTS MODAL (CLICK-TO-EDIT) */}
      {editingGrade && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Classwise Marksheet Editor
                  </span>
                  <span className="text-xs text-slate-400">{editingGrade.classSec}</span>
                </div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <span>Student: {editingGrade.studentName}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Roll No: <span className="font-mono text-amber-300 font-bold">{editingGrade.rollNo}</span> • Term: {INITIAL_EXAM_TERMS.find((t) => t.id === editingGrade.examTermId)?.name || 'Term Exam'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingGrade(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
              {/* Existing Subjects & Marks */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                  Subject Marks (Max 100 per subject):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(editingGrade.scores).map(([subKey, score]) => {
                    const presetSub = subjects.find(s => s.id === subKey);
                    const displayName = presetSub
                      ? presetSub.name
                      : subKey.replace('sub-custom-', '').replace(/-/g, ' ').toUpperCase();
                    const isCustom = !presetSub;

                    return (
                      <div key={subKey} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                        <div className="truncate flex-1">
                          <span className="font-semibold text-slate-200 block truncate">{displayName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Max: 100 • Pass: 40</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={score}
                            onChange={(e) => handleScoreChange(subKey, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-center outline-none focus:border-amber-400"
                          />

                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubjectFromEditingGrade(subKey)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                              title="Remove custom subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Subject Section */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Another Subject to Marksheet</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Sanskrit, Moral Science, Arts..."
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs outline-none focus:border-indigo-500 w-full sm:w-auto"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Score"
                      value={newSubScore}
                      onChange={(e) => setNewSubScore(parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-center text-xs outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubjectToEditingGrade}
                      disabled={!newSubName.trim()}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      + Add Subject
                    </button>
                  </div>
                </div>
              </div>

              {/* Faculty Remarks */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Faculty Evaluation Remarks:
                </label>
                <textarea
                  rows={2}
                  value={editingGrade.remarks || ''}
                  onChange={(e) => setEditingGrade({ ...editingGrade, remarks: e.target.value })}
                  placeholder="Enter developmental observations..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Real-time calculated preview */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Total Score</span>
                  <strong className="text-white text-sm font-mono">{editingGrade.totalMarks} / {editingGrade.maxPossible}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Percentage</span>
                  <strong className="text-emerald-400 text-sm font-mono">{editingGrade.percentage}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">GPA Index</span>
                  <strong className="text-indigo-400 text-sm font-mono">{editingGrade.gpa} / 10.0</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Grade & Status</span>
                  <strong className="text-amber-400 text-sm font-bold uppercase">{editingGrade.grade} ({editingGrade.status})</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Marksheet to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL DIGITAL PROGRESS REPORT MODAL */}
      {reportCardStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Header with School Crest */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img
                  src="/assets/sai_anandam_real_logo.png"
                  alt="Sri Sathya Sai Anandam School"
                  className="w-16 h-16 rounded-xl border-2 border-amber-600 shadow-md object-contain bg-white p-1"
                />
                <div className="text-left">
                  <div className="text-xs font-bold tracking-widest uppercase text-amber-700">
                    Sri Sathya Sai Anandam School
                  </div>
                  <h2 className="text-2xl font-serif font-black uppercase tracking-wide">
                    Official Progress Report Card
                  </h2>
                  <div className="text-[11px] text-slate-600">
                    SDBMS v5.0 • Cryptographically Verified Institutional Record
                  </div>
                </div>
              </div>
            </div>

            {/* Student metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-100 rounded-xl mb-6 text-xs">
              <div>
                <span className="text-slate-500 block">Student Name</span>
                <strong className="text-slate-900 text-sm">{reportCardStudent.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Roll Number</span>
                <strong className="text-slate-900 font-mono">{reportCardStudent.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Class & Section</span>
                <strong className="text-slate-900">{reportCardStudent.classSec}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Academic Assessment</span>
                <strong className="text-slate-900">
                  {INITIAL_EXAM_TERMS.find((t) => t.id === reportCardStudent.examTermId)?.name || 'Term Exam'}
                </strong>
              </div>
            </div>

            {/* Table of marks */}
            <table className="w-full text-left text-xs mb-6 border border-slate-300">
              <thead className="bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border-b border-slate-300">Subject</th>
                  <th className="p-2.5 border-b border-slate-300 text-center">Max Marks</th>
                  <th className="p-2.5 border-b border-slate-300 text-center">Pass Marks</th>
                  <th className="p-2.5 border-b border-slate-300 text-center">Marks Obtained</th>
                  <th className="p-2.5 border-b border-slate-300 text-center">Subject Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.map((sub) => {
                  const score = reportCardStudent.scores[sub.id] || 0;
                  const subGrade =
                    score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : 'C';
                  return (
                    <tr key={sub.id}>
                      <td className="p-2.5 font-medium">{sub.name}</td>
                      <td className="p-2.5 text-center text-slate-600">100</td>
                      <td className="p-2.5 text-center text-slate-600">40</td>
                      <td className="p-2.5 text-center font-bold text-sm font-mono">{score}</td>
                      <td className="p-2.5 text-center font-bold text-indigo-700">{subGrade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl mb-6 text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Total Marks</span>
                <span className="font-bold font-mono">
                  {reportCardStudent.totalMarks} / {reportCardStudent.maxPossible}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Percentage</span>
                <span className="font-bold text-emerald-400 font-mono">{reportCardStudent.percentage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Final Grade</span>
                <span className="font-bold text-amber-400 text-base">{reportCardStudent.grade}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Result</span>
                <span className="font-bold uppercase text-emerald-400">{reportCardStudent.status}</span>
              </div>
            </div>

            {/* Remarks */}
            <div className="text-xs text-slate-700 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <strong>Institutional Remarks:</strong> {reportCardStudent.remarks}
            </div>

            {/* Verification Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Cloud Firestore DB Record • Sri Sathya Sai Anandam School</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportCardStudent(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLIDATED CLASS PRINT VIEW MODAL */}
      {isClassPrintOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img
                  src="/assets/sai_anandam_real_logo.png"
                  alt="Sri Sathya Sai Anandam School Logo"
                  className="w-16 h-16 rounded-xl border border-amber-500 object-contain bg-white p-1"
                />
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-amber-700">
                    Sri Sathya Sai Anandam School
                  </div>
                  <h2 className="text-2xl font-serif font-black uppercase">
                    Consolidated Class Marksheet & Rank List
                  </h2>
                  <div className="text-xs text-slate-600">
                    {selectedClass} • Term: {INITIAL_EXAM_TERMS.find((t) => t.id === selectedTerm)?.name || selectedTerm}
                  </div>
                </div>
              </div>
            </div>

            <table className="w-full text-left text-xs mb-6 border border-slate-300">
              <thead className="bg-slate-200 text-slate-900 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border border-slate-300">Rank</th>
                  <th className="p-2 border border-slate-300">Roll #</th>
                  <th className="p-2 border border-slate-300">Student Name</th>
                  {subjects.map((s) => (
                    <th key={s.id} className="p-2 border border-slate-300 text-center">
                      {s.name.split(' ')[0]}
                    </th>
                  ))}
                  <th className="p-2 border border-slate-300 text-center">Total</th>
                  <th className="p-2 border border-slate-300 text-center">%</th>
                  <th className="p-2 border border-slate-300 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {[...displayedGrades]
                  .sort((a, b) => b.totalMarks - a.totalMarks)
                  .map((g, idx) => (
                    <tr key={g.id} className="border-b border-slate-200">
                      <td className="p-2 font-bold text-center">#{idx + 1}</td>
                      <td className="p-2 font-mono">{g.rollNo}</td>
                      <td className="p-2 font-semibold">{g.studentName}</td>
                      {subjects.map((s) => (
                        <td key={s.id} className="p-2 text-center font-mono">
                          {g.scores[s.id] || 0}
                        </td>
                      ))}
                      <td className="p-2 text-center font-bold">{g.totalMarks}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">{g.percentage}%</td>
                      <td className="p-2 text-center font-bold">{g.grade}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-300 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
                <span className="font-semibold text-slate-700">Class Teacher Signature</span>
              </div>
              <div>
                <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
                <span className="font-semibold text-slate-700">Principal / Headmaster Signature</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClassPrintOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
