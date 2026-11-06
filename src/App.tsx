import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Slidebar } from './components/Slidebar';
import { GdprModal } from './components/GdprModal';
import { DashboardView } from './components/DashboardView';
import { UserManagementView } from './components/UserManagementView';
import { AcademicsView } from './components/AcademicsView';
import { FeeLedgerView } from './components/FeeLedgerView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { AuditLogsView } from './components/AuditLogsView';
import { CalendarView } from './components/CalendarView';
import { CommunityChatView } from './components/CommunityChatView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { SecOpsSettingsView } from './components/SecOpsSettingsView';
import { LecturesView } from './components/LecturesView';
import { AssignmentsView } from './components/AssignmentsView';
import { PrivateVaultView } from './components/PrivateVaultView';
import { DatabaseConsoleModal } from './components/DatabaseConsoleModal';

import { sdbmsApi } from './services/api';
import { playInstitutionalChime } from './utils/audio';
import {
  User,
  UserRole,
  NavigationTab,
  StudentGrade,
  FeeTransaction,
  Announcement,
  AuditLog,
  CalendarEvent,
  ChatGroup,
  ChatMessage,
  WelcomeBannerConfig,
  Lecture,
  Assessment,
  AssessmentSubmission,
} from './types';

export const App: React.FC = () => {
  // Session State
  const [currentUser, setCurrentUser] = useState<User | null>(() => sdbmsApi.getStoredSession());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Individual Theme State (saved per user or global fallback)
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    sdbmsApi.getUserThemePreference(currentUser?.id)
  );

  // Synchronize Theme to document body & html classes
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Load individual user's theme preference when session switches
  useEffect(() => {
    if (currentUser) {
      const userTheme = sdbmsApi.getUserThemePreference(currentUser.id);
      setTheme(userTheme);
    }
  }, [currentUser?.id]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    sdbmsApi.setUserThemePreference(currentUser?.id, nextTheme);
  };

  const handleSetTheme = (nextTheme: 'dark' | 'light') => {
    setTheme(nextTheme);
    sdbmsApi.setUserThemePreference(currentUser?.id, nextTheme);
  };

  // Slidebar Navigation Drawer State
  const [isSlidebarOpen, setIsSlidebarOpen] = useState(false);
  const [isSlidebarCollapsed, setIsSlidebarCollapsed] = useState(false);

  // Application Data Repositories
  const [users, setUsers] = useState<User[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeChatGroupId, setActiveChatGroupId] = useState('grp-10a');
  const [welcomeBanner, setWelcomeBanner] = useState<WelcomeBannerConfig>({
    text: 'SDBMS v5.0 SECURE PORTAL ACTIVE • SRI SATHYA SAI ANANDAM • ZERO PAPER ARCHITECTURE',
    enabled: true,
  });

  // Load datasets when user is logged in
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser?.id]);

  const loadAllData = async () => {
    try {
      const [
        loadedUsers,
        loadedGrades,
        loadedTx,
        loadedAnn,
        loadedAudit,
        loadedEvents,
        loadedGroups,
        loadedMessages,
        loadedBanner,
        loadedLectures,
        loadedAssessments,
      ] = await Promise.all([
        sdbmsApi.getUsers(),
        sdbmsApi.getGrades(),
        sdbmsApi.getTransactions(),
        sdbmsApi.getAnnouncements(),
        sdbmsApi.getAuditLogs(),
        sdbmsApi.getCalendarEvents(),
        sdbmsApi.getChatGroups(),
        sdbmsApi.getChatMessages(activeChatGroupId),
        sdbmsApi.getWelcomeBanner(),
        sdbmsApi.getLectures(),
        sdbmsApi.getAssessments(),
      ]);

      setUsers(loadedUsers);
      setGrades(loadedGrades);
      setTransactions(loadedTx);
      setAnnouncements(loadedAnn);
      setAuditLogs(loadedAudit);
      setCalendarEvents(loadedEvents);
      setChatGroups(loadedGroups);
      setChatMessages(loadedMessages);
      setWelcomeBanner(loadedBanner);
      setLectures(loadedLectures);
      setAssessments(loadedAssessments);
    } catch (err) {
      console.error('Data initialization error:', err);
    }
  };

  const handleSoundChime = () => {
    if (soundEnabled) {
      playInstitutionalChime();
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    handleSoundChime();
  };

  const handleLogout = async () => {
    await sdbmsApi.logout();
    setCurrentUser(null);
  };

  // Quick switch role handler
  const handleSwitchUserRole = async (targetRole: UserRole) => {
    try {
      const allUsers = users.length > 0 ? users : await sdbmsApi.getUsers();
      const targetUser = allUsers.find((u) => u.role === targetRole) || allUsers[0];
      if (targetUser) {
        sdbmsApi.setStoredSession(targetUser);
        setCurrentUser(targetUser);
        handleSoundChime();
      }
    } catch (err) {
      console.error('Failed to switch user role perspective:', err);
    }
  };

  // --- Handlers for User Management ---
  const handleAddUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const newUser = await sdbmsApi.createUser(userData);
    setUsers((prev) => [newUser, ...prev]);
    const updatedLogs = await sdbmsApi.getAuditLogs();
    setAuditLogs(updatedLogs);
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const updated = await sdbmsApi.updateUser(id, updates);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(updated);
    }
  };

  const handleDeleteUser = async (id: string) => {
    await sdbmsApi.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    const updatedLogs = await sdbmsApi.getAuditLogs();
    setAuditLogs(updatedLogs);
  };

  // --- Handlers for Academic Grades ---
  const handleUpdateGrade = async (grade: StudentGrade) => {
    const updated = await sdbmsApi.updateGrade(grade);
    setGrades((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    const updatedLogs = await sdbmsApi.getAuditLogs();
    setAuditLogs(updatedLogs);
    return updated;
  };

  const handleBulkUpdateGrades = async (newGrades: StudentGrade[]) => {
    const updated = await sdbmsApi.bulkUpdateGrades(newGrades);
    setGrades(updated);
    return updated;
  };

  const handleAddGrade = async (gradeData: Omit<StudentGrade, 'id' | 'lastUpdated'>) => {
    const newGrade = await sdbmsApi.createGrade(gradeData);
    setGrades((prev) => [newGrade, ...prev]);
    const updatedLogs = await sdbmsApi.getAuditLogs();
    setAuditLogs(updatedLogs);
    return newGrade;
  };

  const handleDeleteGrade = async (gradeId: string) => {
    await sdbmsApi.deleteGrade(gradeId);
    setGrades((prev) => prev.filter((g) => g.id !== gradeId));
    const updatedLogs = await sdbmsApi.getAuditLogs();
    setAuditLogs(updatedLogs);
  };

  const handleRefreshGrades = async () => {
    const fresh = await sdbmsApi.getGrades();
    setGrades(fresh);
  };

  // --- Handlers for Fee Transactions ---
  const handleRecordTransaction = async (
    txData: Omit<FeeTransaction, 'id' | 'receiptNo' | 'verificationHash' | 'date'>
  ) => {
    const newTx = await sdbmsApi.recordTransaction(txData);
    setTransactions((prev) => [newTx, ...prev]);
    handleSoundChime();
    const updatedLogs = await sdbmsApi.getAuditLogs();
    setAuditLogs(updatedLogs);
    return newTx;
  };

  // --- Handlers for Announcements ---
  const handleCreateAnnouncement = async (
    annData: Omit<Announcement, 'id' | 'timestamp' | 'readCount'>
  ) => {
    const newAnn = await sdbmsApi.createAnnouncement(annData);
    setAnnouncements((prev) => [newAnn, ...prev]);
    handleSoundChime();
    const updatedLogs = await sdbmsApi.getAuditLogs();
    setAuditLogs(updatedLogs);
    return newAnn;
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await sdbmsApi.deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // --- Handlers for Almanac Events ---
  const handleAddCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent = await sdbmsApi.addCalendarEvent(eventData);
    setCalendarEvents((prev) => [...prev, newEvent]);
    handleSoundChime();
    return newEvent;
  };

  // --- Handlers for Community Forum Chat ---
  const handleSelectChatGroup = async (groupId: string) => {
    setActiveChatGroupId(groupId);
    const msgs = await sdbmsApi.getChatMessages(groupId);
    setChatMessages(msgs);
  };

  const handleSendChatMessage = async (groupId: string, text: string) => {
    if (!currentUser) throw new Error('Not logged in');
    const msg = await sdbmsApi.sendChatMessage(groupId, text, currentUser);
    setChatMessages((prev) => [...prev, msg]);
    return msg;
  };

  // --- Handlers for Welcome Banner & Reset ---
  const handleUpdateWelcomeBanner = async (config: WelcomeBannerConfig) => {
    const updated = await sdbmsApi.updateWelcomeBanner(config);
    setWelcomeBanner(updated);
  };

  const handleResetDatabase = async () => {
    await sdbmsApi.resetToFactoryData();
    await loadAllData();
  };

  // --- Handlers for Student & All-User Credentials & ID Management (Admin) ---
  const handleChangeStudentCredentials = async (
    studentId: string,
    params: {
      newId?: string;
      newRollNo?: string;
      newUsername?: string;
      newPassword?: string;
      apaarId?: string;
      penId?: string;
    }
  ) => {
    await sdbmsApi.changeStudentCredentials(studentId, params);
    const [updatedUsers, updatedGrades, updatedTx] = await Promise.all([
      sdbmsApi.getUsers(),
      sdbmsApi.getGrades(),
      sdbmsApi.getTransactions(),
    ]);
    setUsers(updatedUsers);
    setGrades(updatedGrades);
    setTransactions(updatedTx);

    // If current logged-in user changed their own ID/username, update session seamlessly
    if (currentUser && (currentUser.id === studentId || (params.newId && currentUser.id === params.newId))) {
      const refreshedUser = updatedUsers.find((u) => u.id === (params.newId || studentId));
      if (refreshedUser) {
        setCurrentUser(refreshedUser);
        sdbmsApi.setStoredSession(refreshedUser);
      }
    }
    handleSoundChime();
  };

  // --- Handlers for Any Individual User Updating Their Own Credentials ---
  const handleChangeMyCredentials = async (params: {
    newUsername?: string;
    newPassword?: string;
    newId?: string;
  }) => {
    if (!currentUser) return;
    const updated = await sdbmsApi.changeMyCredentials(currentUser.id, params);
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    handleSoundChime();
  };

  // --- Handlers for Lectures (Teachers & Students) ---
  const handleAddLecture = async (
    lectureData: Omit<Lecture, 'id' | 'completedBy'>
  ) => {
    const created = await sdbmsApi.createLecture(lectureData);
    setLectures((prev) => [created, ...prev]);
    handleSoundChime();
  };

  const handleUpdateLecture = async (id: string, updates: Partial<Lecture>) => {
    const updated = await sdbmsApi.updateLecture(id, updates);
    setLectures((prev) => prev.map((l) => (l.id === id ? updated : l)));
  };

  const handleDeleteLecture = async (id: string) => {
    await sdbmsApi.deleteLecture(id);
    setLectures((prev) => prev.filter((l) => l.id !== id));
    handleSoundChime();
  };

  const handleToggleCompleteLecture = async (lectureId: string, studentId: string) => {
    const updated = await sdbmsApi.toggleLectureCompleted(lectureId, studentId);
    setLectures((prev) => prev.map((l) => (l.id === lectureId ? updated : l)));
  };

  // --- Handlers for Assessments & Assignments (Teachers & Students) ---
  const handleCreateAssessment = async (
    assessmentData: Omit<Assessment, 'id' | 'submissions'>
  ) => {
    const created = await sdbmsApi.createAssessment(assessmentData);
    setAssessments((prev) => [created, ...prev]);
    handleSoundChime();
  };

  const handleUpdateAssessment = async (id: string, updates: Partial<Assessment>) => {
    const updated = await sdbmsApi.updateAssessment(id, updates);
    setAssessments((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const handleDeleteAssessment = async (id: string) => {
    await sdbmsApi.deleteAssessment(id);
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    handleSoundChime();
  };

  const handleSubmitAssessment = async (
    assessmentId: string,
    submission: {
      studentId: string;
      studentName: string;
      rollNo?: string;
      submissionText: string;
      fileName?: string;
    }
  ) => {
    await sdbmsApi.submitAssessment(assessmentId, submission);
    const refreshed = await sdbmsApi.getAssessments();
    setAssessments(refreshed);
    handleSoundChime();
  };

  const handleGradeSubmission = async (
    assessmentId: string,
    submissionId: string,
    score: number,
    feedback: string,
    teacherName: string
  ) => {
    await sdbmsApi.gradeAssessmentSubmission(
      assessmentId,
      submissionId,
      score,
      feedback,
      teacherName
    );
    const refreshed = await sdbmsApi.getAssessments();
    setAssessments(refreshed);
    handleSoundChime();
  };

  // Render Login screen if no authenticated user
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'light'
          ? 'theme-light bg-slate-100 text-slate-900 selection:bg-amber-500 selection:text-white'
          : 'dark bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white'
      }`}
    >
      {/* Top Main Navigation Header with Slidebar toggle */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        onSwitchUserRole={handleSwitchUserRole}
        onOpenGdprModal={() => setIsGdprModalOpen(true)}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        welcomeBanner={welcomeBanner}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        unreadAnnouncementsCount={announcements.length}
        onToggleSlidebar={() => setIsSlidebarOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSetTheme={handleSetTheme}
        onChangeMyCredentials={handleChangeMyCredentials}
      />

      {/* Main Body Layout with Navigation Slidebar */}
      <div className="flex-1 flex w-full relative">
        {/* Navigation Slidebar */}
        <Slidebar
          isOpen={isSlidebarOpen}
          isCollapsed={isSlidebarCollapsed}
          onToggleCollapse={() => setIsSlidebarCollapsed((prev) => !prev)}
          onClose={() => setIsSlidebarOpen(false)}
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={(tab: NavigationTab) => {
            setActiveTab(tab);
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setIsSlidebarOpen(false);
            }
          }}
          onLogout={handleLogout}
          unreadAnnouncementsCount={announcements.length}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        />

        {/* Main Container Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0 transition-all duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {(activeTab === 'dashboard' || activeTab === 'overview') && (
                <DashboardView
                  currentUser={currentUser}
                  onNavigate={setActiveTab}
                  grades={grades}
                  transactions={transactions}
                  announcements={announcements}
                  auditLogs={auditLogs}
                />
              )}

              {/* Student Learning: Lectures */}
              {activeTab === 'lectures' && (
                <LecturesView
                  currentUser={currentUser}
                  lectures={lectures}
                  onAddLecture={handleAddLecture}
                  onUpdateLecture={handleUpdateLecture}
                  onDeleteLecture={handleDeleteLecture}
                  onToggleComplete={handleToggleCompleteLecture}
                />
              )}

              {/* Student Learning: Assignments & Assessments */}
              {activeTab === 'assignments' && (
                <AssignmentsView
                  currentUser={currentUser}
                  assessments={assessments}
                  onCreateAssessment={handleCreateAssessment}
                  onUpdateAssessment={handleUpdateAssessment}
                  onDeleteAssessment={handleDeleteAssessment}
                  onSubmitAssessment={handleSubmitAssessment}
                  onGradeSubmission={handleGradeSubmission}
                />
              )}

              {activeTab === 'users' && currentUser.role === 'admin' && (
                <UserManagementView
                  users={users}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onChangeStudentCredentials={handleChangeStudentCredentials}
                />
              )}

              {activeTab === 'academics' && (
                <AcademicsView
                  grades={grades}
                  users={users}
                  currentUser={currentUser}
                  onUpdateGrade={handleUpdateGrade}
                  onBulkUpdateGrades={handleBulkUpdateGrades}
                  onAddGrade={handleAddGrade}
                  onDeleteGrade={handleDeleteGrade}
                  onRefreshGrades={handleRefreshGrades}
                  onOpenAiDiagnostic={(studentName, grade) => {
                    setActiveTab('ai-advisor');
                  }}
                />
              )}

              {activeTab === 'fees' && (
                <FeeLedgerView
                  transactions={transactions}
                  currentUser={currentUser}
                  onRecordTransaction={handleRecordTransaction}
                />
              )}

              {activeTab === 'announcements' && (
                <AnnouncementsView
                  announcements={announcements}
                  currentUser={currentUser}
                  onCreateAnnouncement={handleCreateAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  onPlayChime={handleSoundChime}
                />
              )}

              {activeTab === 'audit' && (
                <AuditLogsView logs={auditLogs} />
              )}

              {activeTab === 'calendar' && (
                <CalendarView
                  events={calendarEvents}
                  currentUser={currentUser}
                  onAddEvent={handleAddCalendarEvent}
                />
              )}

              {(activeTab === 'chat' || activeTab === 'forum') && (
                <CommunityChatView
                  groups={chatGroups}
                  activeGroupId={activeChatGroupId}
                  onSelectGroup={handleSelectChatGroup}
                  messages={chatMessages}
                  currentUser={currentUser}
                  onSendMessage={handleSendChatMessage}
                  onPlayChime={handleSoundChime}
                />
              )}

              {(activeTab === 'ai-advisor' || activeTab === 'ai-diagnostic') && (
                <AiAdvisorView
                  grades={grades}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'settings' && currentUser.role === 'admin' && (
                <SecOpsSettingsView
                  welcomeBanner={welcomeBanner}
                  onUpdateWelcomeBanner={handleUpdateWelcomeBanner}
                  onResetDatabase={handleResetDatabase}
                  currentUser={currentUser}
                  theme={theme}
                  onSetTheme={handleSetTheme}
                  onToggleTheme={handleToggleTheme}
                  onOpenDatabaseModal={() => setIsDbModalOpen(true)}
                />
              )}

              {activeTab === 'private-vault' && (
                <PrivateVaultView currentUser={currentUser} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* GDPR Data Protection & Portability Modal */}
      <GdprModal
        user={currentUser}
        isOpen={isGdprModalOpen}
        onClose={() => setIsGdprModalOpen(false)}
        onConsentAccepted={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />

      {/* Cloud Firestore Database Console & Security Modal */}
      <DatabaseConsoleModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onRefreshData={loadAllData}
      />
    </div>
  );
};

export default App;

