import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Users,
  Search,
  Calendar,
  Sparkles,
  Download,
  Filter,
  Check,
  UserCheck,
  GraduationCap,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import { User, AttendanceRecord, AttendanceStudentEntry } from '../types';
import { sdbmsApi } from '../services/api';

interface AttendanceViewProps {
  currentUser: User;
  users: User[];
  onSoundChime?: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  users,
  onSoundChime,
}) => {
  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  const todayStr = new Date().toISOString().split('T')[0];

  // Default class selection
  const defaultClass = useMemo(() => {
    if (currentUser.classSec && currentUser.classSec.startsWith('Class')) {
      return currentUser.classSec.trim();
    }
    return 'Class 10-A';
  }, [currentUser]);

  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Student specific summary state
  const [studentSummary, setStudentSummary] = useState<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    percentage: number;
    history: { date: string; classSec: string; status: 'present' | 'absent' | 'late' | 'excused'; remarks?: string }[];
  }>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    excusedDays: 0,
    percentage: 100,
    history: [],
  });

  // Current working day student attendance roster for selectedClass and selectedDate
  const [dailyEntries, setDailyEntries] = useState<Record<string, AttendanceStudentEntry>>({});

  // List of students in the selected class
  const classStudents = useMemo(() => {
    return users.filter(
      (u) => u.role === 'student' && (!selectedClass || u.classSec === selectedClass)
    );
  }, [users, selectedClass]);

  // Load attendance data
  useEffect(() => {
    loadAttendance();
  }, [selectedClass, selectedDate, currentUser]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const records = await sdbmsApi.getAttendance();
      setAttendanceRecords(records);

      if (isStudent) {
        const summary = await sdbmsApi.getStudentAttendanceSummary(
          currentUser.id,
          currentUser.fullName,
          currentUser.rollNo
        );
        setStudentSummary(summary);
      } else {
        // Find existing record for this class & date
        const existingRec = records.find(
          (r) => r.classSec === selectedClass && r.date === selectedDate
        );

        const newMap: Record<string, AttendanceStudentEntry> = {};

        // Populate with class students
        classStudents.forEach((st) => {
          const match = existingRec?.records.find((r) => r.studentId === st.id);
          if (match) {
            newMap[st.id] = { ...match };
          } else {
            newMap[st.id] = {
              studentId: st.id,
              studentName: st.fullName,
              rollNo: st.rollNo || `R-${st.id.slice(-2)}`,
              status: 'present',
              remarks: '',
            };
          }
        });

        setDailyEntries(newMap);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Change individual student attendance status
  const handleSetStatus = (
    studentId: string,
    status: 'present' | 'absent' | 'late' | 'excused'
  ) => {
    setDailyEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          studentId,
          studentName: users.find((u) => u.id === studentId)?.fullName || 'Student',
          rollNo: users.find((u) => u.id === studentId)?.rollNo || '00',
        }),
        status,
      },
    }));
  };

  // Change individual remarks
  const handleSetRemarks = (studentId: string, remarks: string) => {
    setDailyEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          studentId,
          studentName: users.find((u) => u.id === studentId)?.fullName || 'Student',
          rollNo: users.find((u) => u.id === studentId)?.rollNo || '00',
          status: 'present',
        }),
        remarks,
      },
    }));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStudentEntry> = {};
    classStudents.forEach((st) => {
      updated[st.id] = {
        studentId: st.id,
        studentName: st.fullName,
        rollNo: st.rollNo || `R-${st.id.slice(-2)}`,
        status: 'present',
        remarks: dailyEntries[st.id]?.remarks || '',
      };
    });
    setDailyEntries(updated);
    if (onSoundChime) onSoundChime();
  };

  // Save attendance record to Firestore
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const recordsArray: AttendanceStudentEntry[] = Object.values(dailyEntries);
      const recordId = `att-${selectedDate}-${selectedClass.replace(/\s+/g, '')}`;

      const newRecord: AttendanceRecord = {
        id: recordId,
        date: selectedDate,
        classSec: selectedClass,
        markedBy: currentUser.fullName,
        markedById: currentUser.id,
        records: recordsArray,
        timestamp: new Date().toISOString(),
      };

      await sdbmsApi.saveAttendanceRecord(newRecord);
      setSaveSuccessNotice(
        `✅ Attendance for ${selectedClass} on ${selectedDate} saved to Cloud Firestore!`
      );
      if (onSoundChime) onSoundChime();
      setTimeout(() => setSaveSuccessNotice(null), 4000);
      await loadAttendance();
    } catch (err: any) {
      alert(`Failed to save attendance: ${err.message || 'Network error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Statistics for current daily selection
  const dailyStats = useMemo(() => {
    const entries = Object.values(dailyEntries);
    const total = entries.length;
    const present = entries.filter((e) => e.status === 'present').length;
    const absent = entries.filter((e) => e.status === 'absent').length;
    const late = entries.filter((e) => e.status === 'late').length;
    const excused = entries.filter((e) => e.status === 'excused').length;
    const percent = total > 0 ? Math.round(((present + late + excused) / total) * 1000) / 10 : 100;
    return { total, present, absent, late, excused, percent };
  }, [dailyEntries]);

  // Export CSV of Class Attendance
  const handleExportAttendanceCsv = () => {
    const headers = ['Date', 'Class', 'Roll No', 'Student Name', 'Status', 'Remarks', 'Marked By'];
    const rows: string[][] = [];

    attendanceRecords
      .filter((r) => !selectedClass || r.classSec === selectedClass)
      .forEach((r) => {
        r.records.forEach((s) => {
          rows.push([
            r.date,
            r.classSec,
            s.rollNo,
            `"${s.studentName}"`,
            s.status.toUpperCase(),
            `"${(s.remarks || '').replace(/"/g, '""')}"`,
            `"${r.markedBy}"`,
          ]);
        });
      });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSSAS_Attendance_${selectedClass.replace(/\s+/g, '_')}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Institutional Day-Wise Register
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Verified Campus Attendance</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-emerald-400" />
            <span>Attendance Book & Daily Student Presence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isTeacherOrAdmin
              ? 'Classwise day-by-day attendance ledger. Mark Present, Absent, Late, or Excused with automatic percentage calculations and instant Cloud Firestore synchronization.'
              : 'Official Student Presence Dossier. Track your daily academic attendance percentage and verify your compliance with institutional examination criteria.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {isTeacherOrAdmin && (
            <button
              type="button"
              onClick={handleExportAttendanceCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}

          {isTeacherOrAdmin && (
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to Firestore...' : 'Save Attendance Book'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Success Notice */}
      {saveSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{saveSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessNotice(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* STUDENT PERSONAL ATTENDANCE VIEW */}
      {/* ======================================================== */}
      {isStudent && (
        <div className="space-y-6">
          {/* Student Overview Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Attendance Rate
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black text-emerald-400">
                  {studentSummary.percentage}%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {studentSummary.percentage >= 75 ? (
                    <span className="text-emerald-400 font-semibold">✓ Meets Board Exam Criteria (≥75%)</span>
                  ) : (
                    <span className="text-rose-400 font-semibold">⚠ Below 75% Minimum Criteria</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Days Present
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black text-white">
                  {studentSummary.presentDays} Days
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Out of {studentSummary.totalDays || 1} Total Calendar Sessions
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Days Absent
                </span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black text-rose-400">
                  {studentSummary.absentDays} Days
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Unexcused absence records
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Late & Excused
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black text-amber-400">
                  {studentSummary.lateDays + studentSummary.excusedDays} Days
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {studentSummary.lateDays} Late • {studentSummary.excusedDays} Medical/Official Leave
                </div>
              </div>
            </div>
          </div>

          {/* Student Day-Wise Attendance Register History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>My Day-Wise Attendance Log: {currentUser.fullName}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Roll #{currentUser.rollNo || '10A-14'} • {currentUser.classSec || 'Class 10-A'}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Overall: {studentSummary.percentage}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Class Session</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4">Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {studentSummary.history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No recorded attendance history found.
                      </td>
                    </tr>
                  ) : (
                    studentSummary.history.map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {h.date}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{h.classSec}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                              h.status === 'present'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : h.status === 'absent'
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : h.status === 'late'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                h.status === 'present'
                                  ? 'bg-emerald-400'
                                  : h.status === 'absent'
                                  ? 'bg-rose-400'
                                  : h.status === 'late'
                                  ? 'bg-amber-400'
                                  : 'bg-cyan-400'
                              }`}
                            />
                            {h.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {h.remarks || 'Standard classroom attendance verified.'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TEACHER & ADMIN ATTENDANCE BOOK CONTROLS */}
      {/* ======================================================== */}
      {isTeacherOrAdmin && (
        <div className="space-y-6">
          {/* Class, Date, and Day Quick Metrics Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Class Selector Tabs */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Class / Section:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 12-B'].map((cls) => {
                    const isSelected = selectedClass === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-500'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Picker & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    Day / Date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search student or roll..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Daily Summary Metrics & Quick Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Enrolled: </span>
                  <strong className="text-white font-mono">{dailyStats.total}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Present: </span>
                  <strong className="text-emerald-400 font-mono">{dailyStats.present}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Absent: </span>
                  <strong className="text-rose-400 font-mono">{dailyStats.absent}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Late / Excused: </span>
                  <strong className="text-amber-400 font-mono">{dailyStats.late + dailyStats.excused}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Day Attendance: </span>
                  <strong className="text-emerald-400 font-mono">{dailyStats.percent}%</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark All Present</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Roster Attendance Register Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  <span>{selectedClass} Day-Wise Student Attendance Roster</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Date: <span className="font-mono text-emerald-400 font-bold">{selectedDate}</span> • Marked by {currentUser.fullName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Record</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Roll #</th>
                    <th className="py-3 px-4">Student Name & Identifiers</th>
                    <th className="py-3 px-4 text-center">Status Marker</th>
                    <th className="py-3 px-4">Teacher Observation Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No students enrolled in {selectedClass}.
                      </td>
                    </tr>
                  ) : (
                    classStudents
                      .filter(
                        (st) =>
                          st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (st.rollNo && st.rollNo.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((st) => {
                        const entry = dailyEntries[st.id] || {
                          studentId: st.id,
                          studentName: st.fullName,
                          rollNo: st.rollNo || '00',
                          status: 'present',
                          remarks: '',
                        };

                        return (
                          <tr key={st.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 font-mono text-slate-400 font-bold whitespace-nowrap">
                              {st.rollNo || `R-${st.id.slice(-2)}`}
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-white text-sm">{st.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {st.id} {st.apaarId ? `• APAAR: ${st.apaarId}` : ''}
                              </div>
                            </td>

                            {/* Presence Status Buttons */}
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(st.id, 'present')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    entry.status === 'present'
                                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                                      : 'bg-slate-800 text-slate-400 hover:text-emerald-300 hover:bg-slate-700'
                                  }`}
                                >
                                  <span>Present</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(st.id, 'absent')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    entry.status === 'absent'
                                      ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                                      : 'bg-slate-800 text-slate-400 hover:text-rose-300 hover:bg-slate-700'
                                  }`}
                                >
                                  <span>Absent</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(st.id, 'late')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    entry.status === 'late'
                                      ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                                      : 'bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-700'
                                  }`}
                                >
                                  <span>Late</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(st.id, 'excused')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    entry.status === 'excused'
                                      ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400'
                                      : 'bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700'
                                  }`}
                                >
                                  <span>Excused</span>
                                </button>
                              </div>
                            </td>

                            {/* Remarks Input */}
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                placeholder="Add remark (e.g. sick leave, bus delay)..."
                                value={entry.remarks || ''}
                                onChange={(e) => handleSetRemarks(st.id, e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
