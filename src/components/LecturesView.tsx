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
} from 'lucide-react';
import { User, Lecture, LectureResource } from '../types';

interface LecturesViewProps {
  currentUser: User;
  lectures: Lecture[];
  onAddLecture: (lectureData: Omit<Lecture, 'id' | 'completedBy'>) => Promise<void>;
  onUpdateLecture: (id: string, updates: Partial<Lecture>) => Promise<void>;
  onDeleteLecture: (id: string) => Promise<void>;
  onToggleComplete: (lectureId: string, studentId: string) => Promise<void>;
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
  const [activeLectureModal, setActiveLectureModal] = useState<Lecture | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  // Form states for Teacher Adding/Editing Lecture
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Physics');
  const [formClassSec, setFormClassSec] = useState(currentUser.classSec || 'Class 10-A');
  const [formDuration, setFormDuration] = useState('45 mins');
  const [formRecordingType, setFormRecordingType] = useState<'video' | 'live' | 'presentation' | 'audio'>('video');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState('');
  const [formResourceName, setFormResourceName] = useState('');

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
    setFormRecordingType('video');
    setFormVideoUrl('https://www.youtube.com/embed/ZM8ECpBuQYE');
    setFormDescription('');
    setFormKeyPoints('');
    setFormResourceName('');
    setIsAddModalOpen(true);
  };

  const handleStartEdit = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormTitle(lecture.title);
    setFormSubject(lecture.subject);
    setFormClassSec(lecture.classSec);
    setFormDuration(lecture.duration);
    setFormRecordingType(lecture.recordingType);
    setFormVideoUrl(lecture.videoUrl || '');
    setFormDescription(lecture.description);
    setFormKeyPoints(lecture.keyPoints.join('\n'));
    setFormResourceName(lecture.resources[0]?.name || '');
    setIsAddModalOpen(true);
  };

  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Please provide a title and description.');
      return;
    }

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
            name: `${formTitle.replace(/\s+/g, '_')}_StudyNotes.pdf`,
            size: '1.5 MB',
            type: 'PDF',
            url: '#',
          },
        ];

    if (editingLecture) {
      await onUpdateLecture(editingLecture.id, {
        title: formTitle.trim(),
        subject: formSubject,
        classSec: formClassSec,
        duration: formDuration,
        recordingType: formRecordingType,
        videoUrl: formVideoUrl.trim() || undefined,
        description: formDescription.trim(),
        keyPoints: keyPointsArray.length > 0 ? keyPointsArray : ['Digital concepts reviewed in class.'],
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
        recordingType: formRecordingType,
        videoUrl: formVideoUrl.trim() || undefined,
        description: formDescription.trim(),
        keyPoints: keyPointsArray.length > 0 ? keyPointsArray : ['Core chapter concepts reviewed.'],
        resources,
        status: 'published',
      });
    }

    setIsAddModalOpen(false);
    setEditingLecture(null);
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
              Student Learning Hub
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Classroom Digital Lectures</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-white mt-1 flex items-center gap-2.5">
            <Video className="w-6 h-6 text-indigo-400" />
            <span>Digital Lectures & Video Classes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Zero-paper digital study archive. Teachers upload video recordings, conceptual slides, and chapter notes for students to access on-demand.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Lecture</span>
          </button>
        )}
      </div>

      {/* Student Progress Tracker Card (when logged in as Student) */}
      {isStudent && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Your Academic Lecture Progress: {currentUser.fullName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {completedCount} / {lectures.length} Completed
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Mark completed lectures to track revision coverage before term examinations.
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

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLectures.map((lecture) => {
          const isDone = isStudent && lecture.completedBy?.includes(currentUser.id);

          return (
            <div
              key={lecture.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:border-slate-700 shadow-xl relative group ${
                isDone ? 'border-emerald-500/30' : 'border-slate-800'
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
                      {lecture.classSec}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{lecture.duration}</span>
                  </div>
                </div>

                {/* Lecture Title */}
                <h3
                  onClick={() => setActiveLectureModal(lecture)}
                  className="text-base font-bold text-white hover:text-indigo-400 transition cursor-pointer line-clamp-2 leading-snug mb-2"
                >
                  {lecture.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {lecture.description}
                </p>

                {/* Key Points Preview */}
                <div className="space-y-1 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Key Concepts
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
                  <span className="truncate max-w-[120px]">{lecture.teacherName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isStudent && (
                    <button
                      type="button"
                      onClick={() => onToggleComplete(lecture.id, currentUser.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        isDone
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                      title={isDone ? 'Mark as Uncompleted' : 'Mark as Completed'}
                    >
                      <CheckCircle className={`w-3 h-3 ${isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveLectureModal(lecture)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Watch</span>
                  </button>

                  {isTeacherOrAdmin && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(lecture)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Edit Lecture"
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
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
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
              ? 'Click "+ Add New Lecture" to publish the first digital classroom session for your students.'
              : 'No lectures matched your subject filter. Check back soon for new faculty updates.'}
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

            {/* Video Player or Embed */}
            <div className="bg-black aspect-video w-full flex items-center justify-center relative border-b border-slate-800">
              {activeLectureModal.videoUrl ? (
                <iframe
                  src={activeLectureModal.videoUrl}
                  title={activeLectureModal.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8">
                  <Video className="w-16 h-16 text-indigo-400/50 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">Live Classroom Digital Presentation</p>
                  <p className="text-xs text-slate-500">Audio & slides synchronized with student notes below</p>
                </div>
              )}
            </div>

            {/* Details & Handouts */}
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

              {/* Student Completion Bar */}
              {isStudent && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {activeLectureModal.completedBy?.includes(currentUser.id)
                      ? '✓ You have marked this lecture as completed.'
                      : 'Mark this lecture completed when you finish reviewing the concepts.'}
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleComplete(activeLectureModal.id, currentUser.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeLectureModal.completedBy?.includes(currentUser.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {activeLectureModal.completedBy?.includes(currentUser.id)
                      ? 'Completed ✓'
                      : 'Mark as Completed'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Add / Edit Lecture Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                <span>{editingLecture ? 'Edit Digital Lecture' : 'Publish New Lecture (Teacher)'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Duration
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
                    Lecture Format
                  </label>
                  <select
                    value={formRecordingType}
                    onChange={(e) => setFormRecordingType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    <option value="video">Video Recording (YouTube / Stream)</option>
                    <option value="presentation">Slide Deck & Audio</option>
                    <option value="live">Recorded Live Session</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Video Recording Embed URL (YouTube or Stream link)
                </label>
                <input
                  type="url"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
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
                  {editingLecture ? 'Save Updates' : 'Publish Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
