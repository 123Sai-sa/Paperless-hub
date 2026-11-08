import React, { useState } from 'react';
import {
  Video,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Search,
  Filter,
  Layers,
  Sparkles,
  FileText,
  User as UserIcon,
  X,
  Share2,
  Lock,
  Unlock,
  HelpCircle,
  AlertTriangle,
  Award,
  Check,
  RotateCcw,
} from 'lucide-react';
import { User, Lecture, LectureResource, LectureQuiz, LectureQuizQuestion } from '../types';

interface LecturesViewProps {
  currentUser: User;
  lectures: Lecture[];
  onAddLecture: (lectureData: Omit<Lecture, 'id' | 'completedBy'>) => Promise<void>;
  onUpdateLecture: (id: string, updates: Partial<Lecture>) => Promise<void>;
  onDeleteLecture: (id: string) => Promise<void>;
  onToggleComplete: (lectureId: string, studentId: string) => Promise<void>;
}

// Convert various YouTube links to an embed URL
export function toYoutubeEmbed(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return trimmed;
}

export function isYoutubeUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export const LecturesView: React.FC<LecturesViewProps> = ({
  currentUser,
  lectures,
  onAddLecture,
  onUpdateLecture,
  onDeleteLecture,
  onToggleComplete,
}) => {
  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [activeLectureModal, setActiveLectureModal] = useState<Lecture | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  // Form states for Teacher Adding/Editing Lecture (Only YouTube URL allowed!)
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Physics');
  const [formClassSec, setFormClassSec] = useState(currentUser.classSec || 'Class 10-A');
  const [formDuration, setFormDuration] = useState('45 mins');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState('');
  const [formResourceName, setFormResourceName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Quiz Modal State
  const [quizLecture, setQuizLecture] = useState<Lecture | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number; percentage: number; passed: boolean } | null>(null);

  const subjects = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Computer Science', 'English'];

  const filteredLectures = lectures.filter((lec) => {
    const matchesSub = selectedSubject === 'All' || lec.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesSearch =
      lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.keyPoints.some(kp => kp.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSub && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingLecture(null);
    setFormTitle('');
    setFormSubject('Physics');
    setFormClassSec(currentUser.classSec || 'Class 10-A');
    setFormDuration('45 mins');
    setFormVideoUrl('https://www.youtube.com/watch?v=ZM8ECpBuQYE');
    setFormDescription('');
    setFormKeyPoints('');
    setFormResourceName('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleStartEdit = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormTitle(lecture.title);
    setFormSubject(lecture.subject);
    setFormClassSec(lecture.classSec);
    setFormDuration(lecture.duration);
    setFormVideoUrl(lecture.youtubeUrl || lecture.videoUrl || '');
    setFormDescription(lecture.description);
    setFormKeyPoints(lecture.keyPoints.join('\n'));
    setFormResourceName(lecture.resources[0]?.name || '');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim() || !formDescription.trim()) {
      setFormError('Please provide both a lecture title and synopsis.');
      return;
    }

    // STRICT VALIDATION: Teacher is only able to add YouTube video!
    if (!formVideoUrl.trim() || !isYoutubeUrl(formVideoUrl)) {
      setFormError('Institutional Requirement: Only valid YouTube video URLs (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...) are allowed for lectures.');
      return;
    }

    const embedUrl = toYoutubeEmbed(formVideoUrl);
    const keyPointsArray = formKeyPoints
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean);

    const resources: LectureResource[] = formResourceName.trim()
      ? [
          {
            id: `res-${Date.now()}`,
            name: formResourceName.trim(),
            size: '2.1 MB',
            type: 'PDF',
            url: '#',
          },
        ]
      : [
          {
            id: `res-${Date.now()}`,
            name: `${formTitle.replace(/\s+/g, '_')}_StudyHandout.pdf`,
            size: '1.5 MB',
            type: 'PDF',
            url: '#',
          },
        ];

    // Default 4-question quiz for newly added lecture if none provided
    const defaultLectureQuiz: LectureQuiz = {
      id: `quiz-${Date.now()}`,
      lectureId: editingLecture?.id || `lec-${Date.now()}`,
      passThreshold: 75,
      passPercentage: 75,
      questions: [
        {
          id: 'q-1',
          question: `What fundamental law or principle was established in this ${formSubject} lecture on "${formTitle}"?`,
          options: [
            'Conservation principles under ideal conditions',
            'Random variance with no predictable equilibrium',
            'Arbitrary scalar transformation',
            'Linear degradation over infinite cycles',
          ],
          correctOption: 0,
          correctAnswerIndex: 0,
          explanation: 'The core syllabus principle reinforces conservation and foundational equations.',
        },
        {
          id: 'q-2',
          question: 'What is the primary mathematical relationship derived in this video?',
          options: [
            'Inverse logarithmic ratio',
            'Direct proportional relationship with boundary limits',
            'Uncorrelated stochastic distribution',
            'Static coefficient invariant',
          ],
          correctOption: 1,
          correctAnswerIndex: 1,
          explanation: 'As demonstrated in the lecture proof, proportional constraints define the relationship.',
        },
        {
          id: 'q-3',
          question: 'Why is zero-paper digital documentation emphasized for this topic?',
          options: [
            'It enables verifiable timestamps and environmental protection',
            'It eliminates all examinations entirely',
            'It prevents teachers from evaluating work',
            'It reduces laboratory safety compliance',
          ],
          correctOption: 0,
          correctAnswerIndex: 0,
          explanation: 'Digital recording ensures paperless sustainability and transparent institutional audit.',
        },
        {
          id: 'q-4',
          question: 'What practical laboratory experiment corresponds with this theoretical framework?',
          options: [
            'Direct calorimeter and energy balance observation',
            'Uncalibrated open system trial',
            'Hypothetical mental conjecture without measurement',
            'Purely intuitive observation',
          ],
          correctOption: 0,
          correctAnswerIndex: 0,
          explanation: 'Calorimetric validation verifies theoretical derivations with empirical data.',
        },
      ],
    };

    if (editingLecture) {
      await onUpdateLecture(editingLecture.id, {
        title: formTitle.trim(),
        subject: formSubject,
        classSec: formClassSec,
        duration: formDuration,
        recordingType: 'video',
        youtubeUrl: formVideoUrl.trim(),
        videoUrl: embedUrl,
        description: formDescription.trim(),
        keyPoints: keyPointsArray.length > 0 ? keyPointsArray : ['Core chapter concepts reviewed.'],
        resources,
      });
    } else {
      await onAddLecture({
        title: formTitle.trim(),
        subject: formSubject,
        classSec: formClassSec,
        teacherId: currentUser.id,
        teacherName: currentUser.fullName,
        date: new Date().toISOString().split('T')[0],
        duration: formDuration,
        recordingType: 'video',
        youtubeUrl: formVideoUrl.trim(),
        videoUrl: embedUrl,
        description: formDescription.trim(),
        keyPoints: keyPointsArray.length > 0 ? keyPointsArray : ['Core chapter concepts reviewed.'],
        resources,
        status: 'published',
        quiz: defaultLectureQuiz,
      });
    }

    setIsAddModalOpen(false);
    setEditingLecture(null);
  };

  // Helper to check if student has unlocked this lecture (Sequential Progression)
  const isLectureUnlocked = (lecture: Lecture, index: number): boolean => {
    if (isTeacherOrAdmin) return true; // Teachers & admins can preview everything
    if (index === 0) return true; // First lecture is always unlocked

    // Previous lecture must have been completed by the student
    const prevLecture = filteredLectures[index - 1];
    if (!prevLecture) return true;
    return prevLecture.completedBy?.includes(currentUser.id) || false;
  };

  // Open Quiz Modal
  const handleOpenQuiz = (lecture: Lecture) => {
    setQuizLecture(lecture);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Submit Quiz Answers & Enforce 75% Passing Threshold
  const handleSubmitQuiz = async () => {
    if (!quizLecture) return;

    // Fallback quiz questions if lecture.quiz is not present
    const questions: LectureQuizQuestion[] = quizLecture.quiz?.questions || [
      {
        id: 1,
        question: `What fundamental law or principle was established in this ${quizLecture.subject} lecture?`,
        options: [
          'Conservation principles under ideal boundary conditions',
          'Random variance with no predictable equilibrium',
          'Arbitrary scalar transformation',
          'Linear degradation over infinite cycles',
        ],
        correctAnswerIndex: 0,
        explanation: 'The core syllabus principle reinforces conservation and foundational equations.',
      },
      {
        id: 2,
        question: 'What is the primary mathematical relationship derived in this video?',
        options: [
          'Inverse logarithmic ratio',
          'Direct proportional relationship with boundary limits',
          'Uncorrelated stochastic distribution',
          'Static coefficient invariant',
        ],
        correctAnswerIndex: 1,
        explanation: 'As demonstrated in the lecture proof, proportional constraints define the relationship.',
      },
      {
        id: 3,
        question: 'What practical laboratory experiment corresponds with this theoretical framework?',
        options: [
          'Direct calorimeter and energy balance observation',
          'Uncalibrated open system trial',
          'Hypothetical mental conjecture without measurement',
          'Purely intuitive observation',
        ],
        correctAnswerIndex: 0,
        explanation: 'Empirical verification validates theoretical derivations with measurable data.',
      },
      {
        id: 4,
        question: 'Why is this topic essential for the upcoming term examination?',
        options: [
          'It provides the basis for 25% of numerical and theoretical questions',
          'It is purely optional reading material',
          'It is excluded from standardized assessment',
          'It will not appear on question papers',
        ],
        correctAnswerIndex: 0,
        explanation: 'Mastery of foundational chapters is essential for high percentile standing.',
      },
    ];

    let correctCount = 0;
    questions.forEach((q, idx) => {
      const targetAns = q.correctAnswerIndex ?? q.correctOption ?? 0;
      if (selectedAnswers[idx] === targetAns) {
        correctCount += 1;
      }
    });

    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const passThreshold = quizLecture.quiz?.passThreshold ?? quizLecture.quiz?.passPercentage ?? 75;
    const passed = percentage >= passThreshold;

    setQuizScore({
      correct: correctCount,
      total,
      percentage,
      passed,
    });
    setQuizSubmitted(true);

    if (passed) {
      // Mark as completed and unlock next lecture
      await onToggleComplete(quizLecture.id, currentUser.id);
    }
  };

  // Student completion statistics
  const completedCount = isStudent
    ? lectures.filter(l => l.completedBy?.includes(currentUser.id)).length
    : 0;
  const progressPercent = lectures.length > 0 ? Math.round((completedCount / lectures.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Zero-Paper Digital Hub
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">YouTube Video Lectures & Topic Quizzes</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-white mt-1 flex items-center gap-2.5">
            <Video className="w-6 h-6 text-indigo-400" />
            <span>Classroom Video Lectures & Progression</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Watch faculty YouTube lectures, review key concepts, and complete the topic quiz with at least 75% to unlock the next lecture in the syllabus sequence.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add YouTube Lecture</span>
          </button>
        )}
      </div>

      {/* Student Progress Tracker Card */}
      {isStudent && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Lecture Syllabus Progression: {currentUser.fullName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {completedCount} / {lectures.length} Passed
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Rule: Pass each lecture's topic quiz (≥ 75%) to complete the step and unlock the next lesson.
              </div>
            </div>
          </div>

          <div className="w-full sm:w-48 flex items-center gap-2">
            <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-400">{progressPercent}%</span>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search lectures by topic, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Subject Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Lectures Grid with Sequential Lock Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLectures.map((lecture, index) => {
          const isDone = isStudent && lecture.completedBy?.includes(currentUser.id);
          const isUnlocked = isLectureUnlocked(lecture, index);

          return (
            <div
              key={lecture.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xl relative group ${
                isDone
                  ? 'border-emerald-500/40 bg-slate-900/90'
                  : !isUnlocked
                  ? 'border-slate-800/60 opacity-70 bg-slate-950/60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      {lecture.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
                      Step {index + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      YouTube
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{lecture.duration}</span>
                  </div>
                </div>

                {/* Lecture Title */}
                <h3
                  onClick={() => {
                    if (isUnlocked) {
                      setActiveLectureModal(lecture);
                    }
                  }}
                  className={`text-base font-bold transition leading-snug mb-2 ${
                    isUnlocked
                      ? 'text-white hover:text-indigo-400 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {lecture.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {lecture.description}
                </p>

                {/* Key Points Preview */}
                <div className="space-y-1 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Key Concepts</span>
                    {isDone ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Quiz Passed (≥ 75%)</span>
                      </span>
                    ) : !isUnlocked ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Locked Step</span>
                      </span>
                    ) : (
                      <span className="text-indigo-400 font-bold">Quiz Required</span>
                    )}
                  </div>
                  {lecture.keyPoints.slice(0, 2).map((pt, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 line-clamp-1">
                      <span className="text-indigo-400">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[110px]">{lecture.teacherName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isUnlocked ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-400 font-semibold" title={`Pass Step ${index} quiz to unlock this lecture.`}>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pass Step {index} First</span>
                    </div>
                  ) : (
                    <>
                      {/* Watch Video Button */}
                      <button
                        type="button"
                        onClick={() => setActiveLectureModal(lecture)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Watch</span>
                      </button>

                      {/* Take Quiz Button */}
                      {isStudent && (
                        <button
                          type="button"
                          onClick={() => handleOpenQuiz(lecture)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            isDone
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                          }`}
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>{isDone ? 'Passed 75% ✓' : 'Topic Quiz'}</span>
                        </button>
                      )}
                    </>
                  )}

                  {isTeacherOrAdmin && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(lecture)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Edit YouTube Lecture"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete lecture "${lecture.title}"?`)) {
                            onDeleteLecture(lecture.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLectures.length === 0 && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Video className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No digital lectures found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isTeacherOrAdmin
              ? 'Click "+ Add YouTube Lecture" to publish an educational video and quiz for your students.'
              : 'No lectures matched your subject filter.'}
          </p>
        </div>
      )}

      {/* Video / Lecture Player Modal */}
      {activeLectureModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-400">
                    {activeLectureModal.subject}
                  </span>
                  <span className="text-xs text-slate-400">{activeLectureModal.classSec}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    YouTube Stream
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {activeLectureModal.title}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Delivered by {activeLectureModal.teacherName} • {activeLectureModal.duration}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveLectureModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* YouTube Video Player Embed */}
            <div className="bg-black aspect-video w-full flex items-center justify-center relative border-b border-slate-800">
              {activeLectureModal.videoUrl ? (
                <iframe
                  src={toYoutubeEmbed(activeLectureModal.videoUrl)}
                  title={activeLectureModal.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8">
                  <Video className="w-16 h-16 text-indigo-400/50 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">YouTube Video Lecture</p>
                </div>
              )}
            </div>

            {/* Details, Notes & Take Quiz Callout */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Lecture Synopsis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeLectureModal.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Takeaways & Conceptual Roadmap
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeLectureModal.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Handout Attachments */}
              {activeLectureModal.resources && activeLectureModal.resources.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Zero-Paper Digital Handouts & Slides
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeLectureModal.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-semibold text-white truncate">{res.name}</div>
                            <div className="text-[10px] text-slate-500">{res.size} • {res.type}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Downloading verified digital lecture slide: ${res.name}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Download handout"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Topic Quiz Action Bar */}
              {isStudent && (
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Mandatory Topic Quiz</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Pass Mark: 75%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {activeLectureModal.completedBy?.includes(currentUser.id)
                        ? '✓ You have passed the quiz and unlocked subsequent lectures.'
                        : 'You must answer the conceptual questions and score at least 75% to unlock the next step.'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const lec = activeLectureModal;
                      setActiveLectureModal(null);
                      handleOpenQuiz(lec);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                      activeLectureModal.completedBy?.includes(currentUser.id)
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{activeLectureModal.completedBy?.includes(currentUser.id) ? 'Retake Topic Quiz' : 'Take Topic Quiz to Complete'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE TOPIC QUIZ MODAL (Enforces ≥ 75% Passing Threshold)
          ========================================================================= */}
      {quizLecture && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Topic Mastery Quiz
                  </span>
                  <span className="text-xs text-slate-400">{quizLecture.subject}</span>
                  <span className="text-xs font-bold text-amber-300">Passing Threshold: 75%</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  Quiz on: {quizLecture.title}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Answer all 4 conceptual questions. If you fail (&lt; 75%), you will not be allowed to proceed to the next step.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuizLecture(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quiz Result Banner */}
            {quizSubmitted && quizScore && (
              <div
                className={`p-4 rounded-xl border mb-6 ${
                  quizScore.passed
                    ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-600/70 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {quizScore.passed ? (
                    <Award className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {quizScore.passed
                        ? `🎉 Congratulations! You Passed (${quizScore.percentage}% - ${quizScore.correct}/${quizScore.total} Correct)`
                        : `❌ Quiz Failed: Score ${quizScore.percentage}% (${quizScore.correct}/${quizScore.total} Correct)`}
                    </h3>
                    <p className="text-xs mt-1 leading-relaxed">
                      {quizScore.passed
                        ? 'You have successfully satisfied the 75% threshold! This lecture is now marked completed, and the subsequent lecture step has been unlocked for you.'
                        : 'Institutional Rule: You scored below the mandatory 75% threshold. You are NOT permitted to complete this lecture or proceed to the next step. Please review the video lecture and retake the quiz.'}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      {!quizScore.passed && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnswers({});
                            setQuizSubmitted(false);
                            setQuizScore(null);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retake Quiz Now</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const lec = quizLecture;
                          setQuizLecture(null);
                          setActiveLectureModal(lec);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Rewatch YouTube Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-5">
              {(quizLecture.quiz?.questions || [
                {
                  id: 1,
                  question: `What fundamental law or principle was established in this ${quizLecture.subject} lecture on "${quizLecture.title}"?`,
                  options: [
                    'Conservation principles under ideal boundary conditions',
                    'Random variance with no predictable equilibrium',
                    'Arbitrary scalar transformation',
                    'Linear degradation over infinite cycles',
                  ],
                  correctAnswerIndex: 0,
                  explanation: 'The core syllabus principle reinforces conservation and foundational equations.',
                },
                {
                  id: 2,
                  question: 'What is the primary mathematical relationship derived in this video?',
                  options: [
                    'Inverse logarithmic ratio',
                    'Direct proportional relationship with boundary limits',
                    'Uncorrelated stochastic distribution',
                    'Static coefficient invariant',
                  ],
                  correctAnswerIndex: 1,
                  explanation: 'As demonstrated in the lecture proof, proportional constraints define the relationship.',
                },
                {
                  id: 3,
                  question: 'Why is zero-paper digital documentation emphasized for this topic?',
                  options: [
                    'It enables verifiable timestamps and environmental protection',
                    'It eliminates all examinations entirely',
                    'It prevents teachers from evaluating work',
                    'It reduces laboratory safety compliance',
                  ],
                  correctAnswerIndex: 0,
                  explanation: 'Digital recording ensures paperless sustainability and transparent institutional audit.',
                },
                {
                  id: 4,
                  question: 'What practical laboratory experiment corresponds with this theoretical framework?',
                  options: [
                    'Direct calorimeter and energy balance observation',
                    'Uncalibrated open system trial',
                    'Hypothetical mental conjecture without measurement',
                    'Purely intuitive observation',
                  ],
                  correctAnswerIndex: 0,
                  explanation: 'Calorimetric validation verifies theoretical derivations with empirical data.',
                },
              ]).map((q, qIdx) => {
                const userChoice = selectedAnswers[qIdx];
                const targetAns = q.correctAnswerIndex ?? q.correctOption ?? 0;
                const isCorrect = quizSubmitted && userChoice === targetAns;
                const isWrong = quizSubmitted && userChoice !== undefined && userChoice !== targetAns;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition ${
                      quizSubmitted
                        ? isCorrect
                          ? 'bg-emerald-950/30 border-emerald-800/60'
                          : isWrong
                          ? 'bg-rose-950/30 border-rose-800/60'
                          : 'bg-slate-950/80 border-slate-800'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px]">
                          {qIdx + 1}
                        </span>
                        <span>{q.question}</span>
                      </span>
                      {quizSubmitted && (
                        <span>
                          {isCorrect && <span className="text-emerald-400 font-bold">✓ Correct</span>}
                          {isWrong && <span className="text-rose-400 font-bold">✗ Incorrect</span>}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 mt-3">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userChoice === oIdx;
                        const isThisOptionCorrect = quizSubmitted && oIdx === targetAns;

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => {
                              setSelectedAnswers({
                                ...selectedAnswers,
                                [qIdx]: oIdx,
                              });
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between border ${
                              isThisOptionCorrect
                                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-bold'
                                : isSelected
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400">
                                [{String.fromCharCode(65 + oIdx)}]
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isSelected && !quizSubmitted && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && q.explanation && (
                      <div className="mt-2.5 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                        <strong className="text-slate-300">Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {Object.keys(selectedAnswers).length} of 4 answered
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuizLecture(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>

                {!quizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < 4}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  quizScore?.passed && (
                    <button
                      type="button"
                      onClick={() => setQuizLecture(null)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      Done & Proceed ✓
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TEACHER ADD / EDIT LECTURE MODAL (Strictly Enforces YouTube Video Only)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block mb-1">
                  YouTube Video Required
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-400" />
                  <span>{editingLecture ? 'Edit YouTube Lecture' : 'Publish New YouTube Lecture (Teacher)'}</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLecture} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Lecture Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Thermodynamics & Heat Engines"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Strict YouTube Video URL Input */}
              <div className="p-3.5 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-1.5">
                <label className="block text-[11px] font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>YouTube Video Link (Required)</span>
                </label>
                <input
                  type="url"
                  required
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-slate-950 border border-rose-800/50 rounded-xl text-white outline-none focus:border-rose-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400">
                  Institutional policy: Teachers are only able to add YouTube video links (e.g. watch URLs or youtu.be links).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Target Class & Sec
                  </label>
                  <input
                    type="text"
                    required
                    value={formClassSec}
                    onChange={(e) => setFormClassSec(e.target.value)}
                    placeholder="Class 10-A"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="45 mins"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Lecture Description / Synopsis
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline key derivations, equations, and topics covered..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Key Takeaways (one per line)
                </label>
                <textarea
                  rows={2}
                  value={formKeyPoints}
                  onChange={(e) => setFormKeyPoints(e.target.value)}
                  placeholder="Concept 1: Definition of Work&#10;Concept 2: Conservation law..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Digital Handout / Slides Attachment
                </label>
                <input
                  type="text"
                  value={formResourceName}
                  onChange={(e) => setFormResourceName(e.target.value)}
                  placeholder="e.g. Chapter4_Formulas_Handout.pdf"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {editingLecture ? 'Save Updates' : 'Publish YouTube Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
