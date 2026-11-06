import React from 'react';
import {
  LayoutDashboard,
  Award,
  Users,
  CreditCard,
  Bell,
  Calendar,
  ShieldCheck,
  Brain,
  MessageSquare,
  Sliders,
  Video,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  LogOut,
  X,
  FileSpreadsheet,
  Lock,
  Sun,
  Moon,
  Database,
} from 'lucide-react';
import { NavigationTab, User } from '../types';

interface SlidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onCloseMobile?: () => void;
  onClose?: () => void;
  onToggleCollapse: () => void;
  activeTab: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  onSelectTab?: (tab: NavigationTab) => void;
  currentUser: User;
  onLogout?: () => void;
  announcementCount?: number;
  unreadAnnouncementsCount?: number;
  lectureCount?: number;
  assignmentCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenDatabaseModal?: () => void;
}

interface NavItem {
  tab: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  highlight?: boolean;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

export const Slidebar: React.FC<SlidebarProps> = ({
  isOpen,
  isCollapsed,
  onCloseMobile,
  onClose,
  onToggleCollapse,
  activeTab,
  onTabChange,
  onSelectTab,
  currentUser,
  onLogout = () => {},
  announcementCount,
  unreadAnnouncementsCount,
  lectureCount = 6,
  assignmentCount = 4,
  theme = 'dark',
  onToggleTheme,
  onOpenDatabaseModal,
}) => {
  const handleClose = onClose || onCloseMobile || (() => {});
  const handleSelectTab = onSelectTab || onTabChange || (() => {});
  const finalAnnouncementCount = unreadAnnouncementsCount ?? announcementCount ?? 4;
  const isAdmin = currentUser.role === 'admin';
  const isTeacher = currentUser.role === 'teacher';
  const isStudent = currentUser.role === 'student';

  // Define Navigation Sections
  const navSections: NavSection[] = [
    {
      heading: 'STUDENT LEARNING',
      items: [
        {
          tab: 'lectures',
          label: 'Lectures',
          icon: Video,
          badge: lectureCount > 0 ? `${lectureCount}` : undefined,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          highlight: true,
        },
        {
          tab: 'assignments',
          label: 'Assignments',
          icon: FileCheck,
          badge: assignmentCount > 0 ? `${assignmentCount}` : undefined,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          highlight: true,
        },
      ],
    },
    {
      heading: 'ACADEMICS & PROGRESS',
      items: [
        { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
        { tab: 'academics', label: 'Gradebook', icon: Award },
        { tab: 'calendar', label: 'Academic Calendar', icon: Calendar },
        { tab: 'ai-diagnostic', label: 'AI Diagnostic Dossier', icon: Brain },
      ],
    },
    {
      heading: 'CAMPUS OPERATIONS',
      items: [
        {
          tab: 'users',
          label: isAdmin ? 'User & ID Management' : 'Institutional Directory',
          icon: Users,
        },
        { tab: 'fees', label: 'Fee Ledger', icon: CreditCard },
        {
          tab: 'announcements',
          label: 'Announcements',
          icon: Bell,
          badge: finalAnnouncementCount > 0 ? `${finalAnnouncementCount}` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        },
        { tab: 'forum', label: 'Community Forum', icon: MessageSquare },
      ],
    },
  ];

  if (isAdmin) {
    navSections.push({
      heading: 'GOVERNANCE & SECURITY',
      items: [
        { tab: 'audit', label: 'Audit Trail Logs', icon: ShieldCheck },
        { tab: 'settings', label: 'SecOps Settings', icon: Sliders },
      ],
    });
  }

  // Confidential Private Vault for all users (Entry ID/Password of sites & Upload PDFs)
  navSections.push({
    heading: 'CONFIDENTIAL VAULT',
    items: [
      {
        tab: 'private-vault',
        label: 'Private Locker & Vault',
        icon: Lock,
        badge: 'Secure',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        highlight: true,
      },
    ],
  });

  const roleColors: Record<string, string> = {
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    teacher: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    student: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    parent: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Slidebar Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-72 lg:w-72'}`}
      >
        {/* Slidebar Header / Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400/90 shadow-[0_0_12px_rgba(245,158,11,0.25)] bg-white p-0.5 shrink-0 flex items-center justify-center">
              <img
                src="/assets/sai_anandam_real_logo.png"
                alt="Sri Sathya Sai Anandam School Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-white font-serif">Sri Sathya Sai Anandam</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    School
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Hostel & School Management</div>
              </div>
            )}
          </div>

          {/* Controls: Collapse on desktop, Close on mobile */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title={isCollapsed ? 'Expand Slidebar' : 'Collapse Slidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>{section.heading}</span>
                  {section.heading === 'STUDENT LEARNING' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                      Digital Hub
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-px bg-slate-800 my-2 mx-2" />
              )}

              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.tab;

                return (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => {
                      handleSelectTab(item.tab);
                      handleClose();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group relative ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                        : item.highlight
                        ? 'text-slate-200 hover:bg-slate-800/90 hover:text-white bg-slate-850/40'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    {/* Active Accent indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-400" />
                    )}

                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-indigo-400 group-hover:text-indigo-300'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Cloud Firestore Database Console Button */}
          {onOpenDatabaseModal && !isCollapsed && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onOpenDatabaseModal}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-emerald-500/30 text-xs text-left cursor-pointer transition group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-[11px] group-hover:text-emerald-300 transition">
                      Cloud Firestore
                    </div>
                    <div className="text-[9px] text-slate-400">Database & Collections</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>
          )}

          {/* Environmental Paper Savings Widget */}
          {!isCollapsed && (
            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-b from-slate-950/80 to-slate-900 border border-emerald-500/20 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Paper Demand Reduced</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                48,290 printed sheets saved via digital homework, gradebooks, and lectures.
              </p>
            </div>
          )}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 shrink-0 space-y-2">
          {onToggleTheme && !isCollapsed && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span className="font-medium">Theme: {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-500">Switch</span>
            </button>
          )}

          <div
            className={`flex items-center gap-2.5 rounded-xl p-2 ${
              isCollapsed ? 'justify-center' : 'bg-slate-900/60 border border-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>

            {!isCollapsed && (
              <div className="truncate flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                      roleColors[currentUser.role] || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                  {currentUser.rollNo && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{currentUser.rollNo}
                    </span>
                  )}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                title="Sign out of SDBMS"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
