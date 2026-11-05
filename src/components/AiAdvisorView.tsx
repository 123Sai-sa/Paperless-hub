import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Send,
  UserCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Loader2,
  Download,
} from 'lucide-react';
import { StudentGrade, User } from '../types';
import { sdbmsApi } from '../services/api';

interface AiAdvisorViewProps {
  grades: StudentGrade[];
  currentUser: User;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({ grades, currentUser }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(grades[0]?.id || '');
  const [inquiry, setInquiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const activeStudent = grades.find((g) => g.id === selectedStudentId) || grades[0];

  const handleGenerateDiagnostic = async () => {
    if (!activeStudent) return;
    setLoading(true);
    try {
      const prompt = `Student Name: ${activeStudent.studentName}
Class: ${activeStudent.classSec}
Roll No: ${activeStudent.rollNo}
Subject Scores (out of 100): ${JSON.stringify(activeStudent.scores)}
Total: ${activeStudent.totalMarks}/600 (${activeStudent.percentage}%)
Grade: ${activeStudent.grade}
Current Remarks: ${activeStudent.remarks}
User Inquiry: ${inquiry || 'Provide full academic diagnostic and 4-week remediation plan'}`;

      const res = await sdbmsApi.generateDiagnostic(prompt);
      setAnalysisResult(res.analysis);
    } catch (err: any) {
      console.error('Failed to run AI diagnostic:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
            <span>AI Academic Diagnostic & Remediation Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Machine-intelligence assisted evaluation. Evaluates subject vulnerabilities, designs targeted zero-paper study regimens, and assists faculty recommendations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Selector & Query */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Select Candidate Student
            </h2>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Student Profile</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.studentName} ({g.rollNo}) — {g.percentage}% ({g.grade})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Metrics Card */}
            {activeStudent && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white text-sm">
                  {activeStudent.studentName}
                </div>
                <div className="text-slate-400">
                  {activeStudent.classSec} • Roll #{activeStudent.rollNo}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Percentage</span>
                    <strong className="text-emerald-400">{activeStudent.percentage}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Academic GPA</span>
                    <strong className="text-indigo-400">{activeStudent.gpa} / 10.0</strong>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">Specific Diagnostic Focus (Optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. Focus on Physics problem solving and exam time management..."
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateDiagnostic}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Diagnostic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Academic Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Diagnostic Assessment Output</span>
              </h2>
              {analysisResult && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800">
                  Gemini Flash 2.5
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
                <p>Analyzing mark distribution and calculating academic standard deviation...</p>
              </div>
            ) : analysisResult ? (
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                {analysisResult}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500 text-xs">
                <BrainCircuit className="w-12 h-12 text-slate-700 mb-3" />
                <p className="max-w-md">
                  Select a student from the panel on the left and click &ldquo;Run Academic Analysis&rdquo; to generate a comprehensive, personalized diagnostic and improvement roadmap.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
