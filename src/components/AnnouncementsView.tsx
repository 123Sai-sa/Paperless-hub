import React, { useState } from 'react';
import {
  Megaphone,
  PlusCircle,
  Search,
  Filter,
  Paperclip,
  Trash2,
  Volume2,
  Calendar,
  UserCheck,
  Radio,
} from 'lucide-react';
import { Announcement, User } from '../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  currentUser: User;
  onCreateAnnouncement: (ann: Omit<Announcement, 'id' | 'timestamp' | 'readCount'>) => Promise<Announcement>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  onPlayChime: () => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  currentUser,
  onCreateAnnouncement,
  onDeleteAnnouncement,
  onPlayChime,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAudience, setFormAudience] = useState<Announcement['targetAudience']>('all');
  const [formPriority, setFormPriority] = useState<Announcement['priority']>('academic');

  const canPublish = ['admin', 'teacher'].includes(currentUser.role);

  const filtered = announcements.filter((a) => {
    const matchesAudience = selectedAudience === 'all' || a.targetAudience === 'all' || a.targetAudience === selectedAudience;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAudience && matchesSearch;
  });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    await onCreateAnnouncement({
      title: formTitle,
      content: formContent,
      author: currentUser.fullName,
      role: currentUser.role,
      targetAudience: formAudience,
      priority: formPriority,
    });

    onPlayChime();
    setFormTitle('');
    setFormContent('');
    setIsComposeOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-400" />
            <span>Digital Circulars & Broadcast Board</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-paper announcements broadcasting instantaneously to students, faculty, and parents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPlayChime}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Test Institutional Alert Chime"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Test Chime</span>
          </button>

          {canPublish && (
            <button
              type="button"
              onClick={() => setIsComposeOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Circular</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search circulars, subjects, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'students', 'parents', 'teachers'].map((aud) => (
            <button
              key={aud}
              type="button"
              onClick={() => setSelectedAudience(aud)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                selectedAudience === aud
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Target: {aud}
            </button>
          ))}
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    ann.priority === 'critical'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : ann.priority === 'urgent'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  {ann.priority}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {ann.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{new Date(ann.timestamp).toLocaleDateString()}</span>
                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {ann.content}
            </p>

            {/* Attachments (if any) */}
            {ann.attachments && ann.attachments.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {ann.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-indigo-300 transition"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{att.name}</span>
                    <span className="text-[10px] text-slate-500">({att.size})</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <div>
                Authored by <strong className="text-slate-300">{ann.author}</strong> ({ann.role.toUpperCase()})
              </div>
              <div className="text-[10px] text-slate-400">
                Audience: <span className="uppercase font-bold text-slate-400">{ann.targetAudience}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Circular Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              Broadcast Institutional Circular
            </h2>

            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Circular Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Practical Exam Hall Tickets Released"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Target Recipient Group
                  </label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    <option value="all">Entire Institution (All)</option>
                    <option value="students">Students Only</option>
                    <option value="parents">Parents Only</option>
                    <option value="teachers">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    <option value="academic">Academic Notification</option>
                    <option value="urgent">Urgent Notice</option>
                    <option value="critical">Critical / Emergency</option>
                    <option value="general">General Circular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Full Announcement Text
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Draft your circular body here. Zero paper, instantaneous broadcast."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Transmit Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
