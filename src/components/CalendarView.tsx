import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Clock,
  MapPin,
  Tag,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react';
import { CalendarEvent, User } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  currentUser: User;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  currentUser,
  onAddEvent,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // October 2026
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('2026-10-20');
  const [formCategory, setFormCategory] = useState<CalendarEvent['category']>('exam');

  const canAdd = ['admin', 'teacher'].includes(currentUser.role);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    await onAddEvent({
      title: formTitle,
      description: formDesc,
      date: formDate,
      category: formCategory,
    });
    setFormTitle('');
    setFormDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            <span>Digital Institutional Almanac</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-paper academic planner. Examination schedules, laboratory practicals, institutional festivals, and evaluation deadlines.
          </p>
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Event</span>
          </button>
        )}
      </div>

      {/* Events Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const catColors: Record<CalendarEvent['category'], { bg: string; text: string; border: string }> = {
            exam: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
            holiday: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
            event: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
            deadline: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
          };
          const style = catColors[event.category];

          return (
            <div
              key={event.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {event.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {new Date(event.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2.5">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Campus Almanac</span>
                </span>
                <span className="text-emerald-400 font-semibold">Active Session</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              Schedule Academic Almanac Event
            </h2>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Exhibition & Lab Practicals"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Category Classification
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="exam">Examination</option>
                    <option value="holiday">Holiday / Recess</option>
                    <option value="event">Campus Event</option>
                    <option value="deadline">Academic Deadline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Description & Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide syllabus pointers, attire or schedule requirements..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Confirm Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
