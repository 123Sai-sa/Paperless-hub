import React, { useState } from 'react';
import {
  FileCheck,
  Plus,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Upload,
  Send,
  Trash2,
  Edit,
  Eye,
  FileText,
  User as UserIcon,
  X,
  Sparkles,
  ChevronRight,
  Check,
  Paperclip,
  Download,
} from 'lucide-react';
import { User, Assessment, AssessmentQuestion, AssessmentSubmission, AssessmentAttachment } from '../types';

interface AssignmentsViewProps {
  currentUser: User;
  assessments: Assessment[];
  onCreateAssessment: (assessmentData: Omit<Assessment, 'id' | 'submissions'>) => Promise<void>;
  onUpdateAssessment: (id: string, updates: Partial<Assessment>) => Promise<void>;
  onDeleteAssessment: (id: string) => Promise<void>;
  onSubmitAssessment: (assessmentId: string, submission: {
    studentId: string;
    studentName: string;
    rollNo?: string;
    submissionText: string;
    fileName?: string;
  }) => Promise<void>;
  onGradeSubmission: (assessmentId: string, submissionId: string, score: number, feedback: string, teacherName: string) => Promise<void>;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  currentUser,
  assessments,
  onCreateAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
  onSubmitAssessment,
  onGradeSubmission,
}) => {
  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{ assessment: Assessment; submission: AssessmentSubmission } | null>(null);

  // Student submission form
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');

  // Teacher grading form
  const [gradingScore, setGradingScore] = useState<number>(0);
  const [gradingFeedback, setGradingFeedback] = useState('');

  // Teacher create assessment form
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Physics');
  const [formClassSec, setFormClassSec] = useState(currentUser.classSec || 'Class 10-A');
  const [formType, setFormType] = useState<'assignment' | 'quiz' | 'test' | 'project'>('assignment');
  const [formTotalMarks, setFormTotalMarks] = useState<number>(50);
  const [formPassMarks, setFormPassMarks] = useState<number>(20);
  const [formDueDate, setFormDueDate] = useState('2026-09-30T23:59');
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formQuestion1, setFormQuestion1] = useState('');
  const [formQuestion2, setFormQuestion2] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');

  const subjects = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Computer Science'];

  const filteredAssessments = assessments.filter((asm) => {
    const matchesSub = selectedSubject === 'All' || asm.subject.toLowerCase() === selectedSubject.toLowerCase();
    
    if (!matchesSub) return false;

    if (isStudent) {
      const studentSub = asm.submissions.find(s => s.studentId === currentUser.id);
      if (selectedStatus === 'pending') return !studentSub;
      if (selectedStatus === 'submitted') return studentSub && studentSub.status === 'submitted';
      if (selectedStatus === 'graded') return studentSub && studentSub.status === 'graded';
    }

    return true;
  });

  const handleOpenCreate = () => {
    setFormTitle('');
    setFormSubject('Physics');
    setFormClassSec(currentUser.classSec || 'Class 10-A');
    setFormType('assignment');
    setFormTotalMarks(50);
    setFormPassMarks(20);
    setFormDueDate('2026-09-30T23:59');
    setFormDescription('');
    setFormInstructions('State all derivations and mathematical formulas clearly.\nSubmit before the midnight cutoff.');
    setFormQuestion1('Problem 1: Derive the formula for kinetic energy and verify units.');
    setFormQuestion2('Problem 2: Calculate work done when a force of 25 N moves a 4 kg mass over 6 meters.');
    setFormAttachmentName('Problem_Set_Exercise_Sheet.pdf');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Please fill in title and description.');
      return;
    }

    const instructionsArray = formInstructions
      .split('\n')
      .map(i => i.trim())
      .filter(Boolean);

    const questions: AssessmentQuestion[] = [];
    if (formQuestion1.trim()) {
      questions.push({
        id: `q-${Date.now()}-1`,
        question: formQuestion1.trim(),
        marks: Math.round(formTotalMarks / 2),
        type: 'subjective',
      });
    }
    if (formQuestion2.trim()) {
      questions.push({
        id: `q-${Date.now()}-2`,
        question: formQuestion2.trim(),
        marks: Math.round(formTotalMarks / 2),
        type: 'subjective',
      });
    }

    const attachments: AssessmentAttachment[] | undefined = formAttachmentName.trim()
      ? [
          {
            id: `att-${Date.now()}`,
            name: formAttachmentName.trim(),
            size: '1.8 MB',
            type: 'PDF',
            url: '#',
          },
        ]
      : undefined;

    await onCreateAssessment({
      title: formTitle.trim(),
      subject: formSubject,
      classSec: formClassSec,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      type: formType,
      totalMarks: Number(formTotalMarks) || 50,
      passMarks: Number(formPassMarks) || 20,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: formDueDate,
      description: formDescription.trim(),
      instructions: instructionsArray.length > 0 ? instructionsArray : ['Answer all questions completely.'],
      questions: questions.length > 0 ? questions : undefined,
      attachments,
      status: 'active',
    });

    setIsCreateModalOpen(false);
  };

  const handleOpenStudentSubmit = (asm: Assessment) => {
    setActiveAssessment(asm);
    const existingSub = asm.submissions.find(s => s.studentId === currentUser.id);
    setSubmissionText(existingSub ? existingSub.submissionText : '');
    setSubmissionFileName(existingSub?.fileName || `${currentUser.fullName.replace(/\s+/g, '_')}_Solution.pdf`);
    setIsSubmitModalOpen(true);
  };

  const handleSaveStudentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment) return;
    if (!submissionText.trim()) {
      alert('Please enter your written solution or response.');
      return;
    }

    await onSubmitAssessment(activeAssessment.id, {
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      rollNo: currentUser.rollNo,
      submissionText: submissionText.trim(),
      fileName: submissionFileName.trim() || undefined,
    });

    setIsSubmitModalOpen(false);
  };

  const handleOpenGradeModal = (assessment: Assessment, submission: AssessmentSubmission) => {
    setSelectedSubmission({ assessment, submission });
    setGradingScore(submission.score ?? Math.round(assessment.totalMarks * 0.85));
    setGradingFeedback(submission.feedback || 'Good systematic approach to the problem solutions.');
    setIsGradingModalOpen(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    await onGradeSubmission(
      selectedSubmission.assessment.id,
      selectedSubmission.submission.id,
      Number(gradingScore),
      gradingFeedback.trim(),
      currentUser.fullName
    );

    setIsGradingModalOpen(false);
    setSelectedSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Student Learning Hub
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Paperless Assessment Portal</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-white mt-1 flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-emerald-400" />
            <span>Assignments & Academic Assessments</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Zero-paper assignment delivery and electronic grading workflow. Students submit typed or attached solutions; faculty assign marks and personalized feedback.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Assessment</span>
          </button>
        )}
      </div>

      {/* Filters and Status Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Subject Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Student Status Toggle */}
        {isStudent && (
          <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            {(['all', 'pending', 'submitted', 'graded'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                  selectedStatus === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assessments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssessments.map((asm) => {
          const studentSubmission = isStudent
            ? asm.submissions.find(s => s.studentId === currentUser.id)
            : null;

          const isOverdue = new Date(asm.dueDate).getTime() < Date.now();

          return (
            <div
              key={asm.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition flex flex-col justify-between"
            >
              <div>
                {/* Top Badge strip */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {asm.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                      {asm.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/80 text-slate-400">
                      {asm.classSec}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Award className="w-3.5 h-3.5" />
                    <span>{asm.totalMarks} Marks</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {asm.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                  {asm.description}
                </p>

                {/* Due Date & Submissions Count */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Due: {new Date(asm.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 justify-end">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {isTeacherOrAdmin
                        ? `${asm.submissions.length} Submissions`
                        : `Faculty: ${asm.teacherName}`}
                    </span>
                  </div>
                </div>

                {/* Teacher Attachment Badge */}
                {asm.attachments && asm.attachments.length > 0 && (
                  <div className="mb-3 p-2 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-200 truncate font-semibold text-[11px]">{asm.attachments[0].name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">({asm.attachments[0].size || '1.8 MB'})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading verified teacher problem sheet: ${asm.attachments![0].name}`)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Download attachment"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                )}

                {/* Student specific status chip */}
                {isStudent && (
                  <div className="mb-4">
                    {studentSubmission ? (
                      studentSubmission.status === 'graded' ? (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Graded & Verified</span>
                            </span>
                            <span className="text-xs font-black text-white bg-emerald-700/60 px-2 py-0.5 rounded-md">
                              {studentSubmission.score} / {asm.totalMarks} Marks
                            </span>
                          </div>
                          {studentSubmission.feedback && (
                            <p className="text-[11px] text-slate-300 italic pt-1">
                              "{studentSubmission.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-center justify-between text-xs text-indigo-300">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Submitted • Awaiting Faculty Review</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(studentSubmission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-center justify-between text-xs text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Not Submitted Yet</span>
                        </span>
                        <span className="text-[10px] font-semibold text-amber-400">
                          {isOverdue ? 'Overdue' : 'Due Soon'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveAssessment(asm)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-2">
                  {isStudent && (
                    <button
                      type="button"
                      onClick={() => handleOpenStudentSubmit(asm)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{studentSubmission ? 'Update Work' : 'Submit Work'}</span>
                    </button>
                  )}

                  {isTeacherOrAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveAssessment(asm)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Review Submissions ({asm.submissions.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete assessment "${asm.title}"?`)) {
                            onDeleteAssessment(asm.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssessments.length === 0 && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No academic assessments found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isTeacherOrAdmin
              ? 'Click "+ Create Assessment" to assign homework, problem sets, or quizzes to your classes.'
              : 'You have no pending assessments under the selected filters.'}
          </p>
        </div>
      )}

      {/* Assessment Details & Submissions Modal */}
      {activeAssessment && !isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                    {activeAssessment.subject}
                  </span>
                  <span className="text-xs text-slate-400">{activeAssessment.classSec}</span>
                  <span className="text-xs text-amber-400 font-bold">Total: {activeAssessment.totalMarks} Marks</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {activeAssessment.title}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Assigned by {activeAssessment.teacherName} • Due: {new Date(activeAssessment.dueDate).toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveAssessment(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Instructions */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Instructions
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeAssessment.description}
                </p>
              </div>

              {activeAssessment.instructions && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Guidelines for Solution Submission
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {activeAssessment.instructions.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Teacher Attachments */}
              {activeAssessment.attachments && activeAssessment.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Teacher Question Paper & Reference Attachments</span>
                  </h4>
                  <div className="space-y-2">
                    {activeAssessment.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white">{att.name}</div>
                            <div className="text-[10px] text-slate-400">{att.size || '1.8 MB'} • {att.type || 'PDF Document'} • Verified Faculty Upload</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Downloading verified teacher reference handout: ${att.name}`)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions if any */}
              {activeAssessment.questions && activeAssessment.questions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Questions / Problems
                  </h4>
                  <div className="space-y-2">
                    {activeAssessment.questions.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                          <span>Question {idx + 1} ({q.marks} Marks)</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{q.type}</span>
                        </div>
                        <p className="text-xs text-slate-300">{q.question}</p>
                        {q.options && (
                          <div className="mt-2 space-y-1 pl-2">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                <span className="font-mono text-indigo-400">[{String.fromCharCode(65 + oIdx)}]</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submissions Section (For Teachers) */}
            {isTeacherOrAdmin && (
              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">
                    Student Submissions ({activeAssessment.submissions.length})
                  </h4>
                  <span className="text-xs text-slate-400">
                    Review and grade each digital submission
                  </span>
                </div>

                {activeAssessment.submissions.length === 0 ? (
                  <div className="text-center p-6 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-500">
                    No students have submitted responses for this assessment yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activeAssessment.submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{sub.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({sub.rollNo || 'Roll —'})</span>
                            {sub.status === 'graded' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Graded: {sub.score}/{activeAssessment.totalMarks}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {sub.submissionText}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenGradeModal(activeAssessment, sub)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
                        >
                          {sub.status === 'graded' ? 'Update Grade' : 'Grade Work'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Work button for Student */}
            {isStudent && (
              <div className="border-t border-slate-800 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenStudentSubmit(activeAssessment)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Submit / Revise Your Solution
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Submit Work Modal */}
      {isSubmitModalOpen && activeAssessment && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400">Electronic Submission</span>
                <h2 className="text-lg font-bold text-white">
                  {activeAssessment.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentSubmission} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Your Answer & Written Solutions
                </label>
                <textarea
                  rows={5}
                  required
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your answers, step-by-step calculations, equations, or summary here..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Attached Document (PDF or scan)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={submissionFileName}
                    onChange={(e) => setSubmissionFileName(e.target.value)}
                    placeholder="e.g. Physics_SaiAnandam_Term2.pdf"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSubmissionFileName(`${currentUser.fullName.replace(/\s+/g, '_')}_HW.pdf`)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Simulate Upload
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  No paper printing required. Your submission is timestamped and cryptographically linked to your Student ID.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Submit Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Grading Modal */}
      {isGradingModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-400">Faculty Evaluation</span>
                <h2 className="text-lg font-bold text-white">
                  Grading: {selectedSubmission.submission.studentName}
                </h2>
                <div className="text-xs text-slate-400">
                  Assessment: {selectedSubmission.assessment.title} (Max: {selectedSubmission.assessment.totalMarks})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGradingModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Student's Submission</div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedSubmission.submission.submissionText}
              </p>
              {selectedSubmission.submission.fileName && (
                <div className="mt-2 text-[11px] text-indigo-400 font-mono">
                  Attached File: {selectedSubmission.submission.fileName}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Marks Awarded (out of {selectedSubmission.assessment.totalMarks})
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={selectedSubmission.assessment.totalMarks}
                  value={gradingScore}
                  onChange={(e) => setGradingScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Personalized Pedagogical Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  placeholder="Provide constructive guidance on formulas, derivations, or analytical reasoning..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGradingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Save Grade & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Create Assessment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span>Create New Assessment (Teacher)</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Assessment Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Calculus Mid-Term Examination"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Assessment Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="assignment">Homework Assignment</option>
                    <option value="quiz">Timed Quiz</option>
                    <option value="test">Term Unit Test</option>
                    <option value="project">Cap-stone Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Class & Sec
                  </label>
                  <input
                    type="text"
                    required
                    value={formClassSec}
                    onChange={(e) => setFormClassSec(e.target.value)}
                    placeholder="Class 10-A"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={formTotalMarks}
                    onChange={(e) => setFormTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={formPassMarks}
                    onChange={(e) => setFormPassMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Submission Deadline Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description / Topic Overview
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline what syllabus chapters or concepts this assignment tests..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Submission Instructions (one per line)
                </label>
                <textarea
                  rows={2}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="State assumptions clearly&#10;Write final answers with units"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Question 1
                </label>
                <input
                  type="text"
                  value={formQuestion1}
                  onChange={(e) => setFormQuestion1(e.target.value)}
                  placeholder="e.g. Derive Newton's 2nd Law of Motion..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Question 2
                </label>
                <input
                  type="text"
                  value={formQuestion2}
                  onChange={(e) => setFormQuestion2(e.target.value)}
                  placeholder="e.g. Solve the numerical problem..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Teacher Attachment Field */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1.5">
                <label className="block text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Teacher Assignment Attachment (PDF / Question Sheet)</span>
                </label>
                <input
                  type="text"
                  value={formAttachmentName}
                  onChange={(e) => setFormAttachmentName(e.target.value)}
                  placeholder="e.g. Calculus_Term2_QuestionSet.pdf"
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-800/50 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400">
                  Attach reference question sets, laboratory diagrams, or problem rubrics for students to download.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Publish Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
