export type UserRole = 'admin' | 'teacher' | 'student' | 'accountant';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone?: string;
  classSec?: string;
  rollNo?: string;
  apaarId?: string;
  penId?: string;
  avatar?: string;
  status: 'active' | 'suspended';
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
  gdprConsentDate?: string;
  password?: string;
  themePreference?: 'dark' | 'light';
  badges?: string[];
  rank?: number;
}

export interface AcademicSubject {
  id: string;
  name: string;
  code: string;
  maxMarks: number;
  passMarks: number;
}

export interface ExamTerm {
  id: string;
  name: string;
  academicYear: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classSec: string;
  examTermId: string;
  scores: Record<string, number>; // subjectId -> score
  totalMarks: number;
  maxPossible: number;
  percentage: number;
  gpa: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  status: 'pass' | 'fail';
  rank?: number;
  remarks?: string;
  lastUpdated: string;
}

export interface AttendanceStudentEntry {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface AttendanceRecord {
  id: string; // e.g. att-2026-09-19-10A
  date: string; // YYYY-MM-DD
  classSec: string;
  markedBy: string;
  markedById: string;
  records: AttendanceStudentEntry[];
  timestamp: string;
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  classSec: string;
  category: 'Tuition Fee' | 'Laboratory Fee' | 'Library Deposit' | 'Hostel Boarding' | 'Annual Development' | 'Exam Fee' | string;
  amount: number;
  paymentMethod: 'UPI' | 'Net Banking' | 'Credit/Debit Card' | 'Cash Voucher' | string;
  date: string;
  status: 'verified' | 'pending' | 'flagged';
  verificationHash: string;
  cashierName: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  role: UserRole;
  targetAudience: 'all' | 'students' | 'teachers';
  priority: 'critical' | 'academic' | 'urgent' | 'general';
  timestamp: string;
  readCount: number;
  attachments?: { name: string; size: string }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  eventType: 
    | 'AUTH_LOGIN'
    | 'AUTH_LOGOUT'
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'USER_DELETE'
    | 'CREDENTIALS_RESET'
    | 'GRADE_UPDATE'
    | 'FEE_RECORDED'
    | 'ATTENDANCE_RECORDED'
    | 'GDPR_EXPORT'
    | 'GDPR_CONSENT'
    | 'SETTINGS_UPDATE'
    | 'BROADCAST_ALERT'
    | 'LECTURE_CREATE'
    | 'LECTURE_QUIZ_PASS'
    | 'ASSESSMENT_CREATE'
    | 'ASSESSMENT_SUBMIT'
    | 'ASSESSMENT_GRADE'
    | string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface WorkingDayMonth {
  id: string;
  month: string;
  year: number;
  totalCalendarDays: number;
  workingDays: number;
  holidays: number;
  enabled: boolean;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  type: 'gazetted' | 'institutional' | 'restricted';
  description?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  category: 'exam' | 'holiday' | 'event' | 'deadline';
}

export interface ChatGroup {
  id: string;
  name: string;
  description: string;
  memberRoles: UserRole[];
  membersCount?: number;
  unreadCount?: number;
  lastMessage?: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  role?: string;
  text: string;
  timestamp: string;
}

export interface WelcomeBannerConfig {
  text: string;
  enabled: boolean;
  urgency?: 'normal' | 'alert' | 'highlight';
}

export interface PortalPhotos {
  login_background?: string;
  hero_banner?: string;
  emblem_url?: string;
}

// ----------------------------------------------------
// Lectures & Digital Classrooms Models
// ----------------------------------------------------
export interface LectureResource {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface LectureQuizQuestion {
  id: string | number;
  question: string;
  options: string[];
  correctOption?: number;
  correctAnswerIndex?: number;
  explanation?: string;
}

export interface LectureQuiz {
  id?: string;
  lectureId?: string;
  questions: LectureQuizQuestion[];
  passPercentage?: number;
  passThreshold?: number;
}

export interface Lecture {
  id: string;
  title: string;
  subject: string;
  classSec: string;
  teacherId: string;
  teacherName: string;
  date: string;
  duration: string;
  recordingType: 'video' | 'live' | 'presentation' | 'audio';
  videoUrl?: string; // YouTube video link or embed
  youtubeUrl?: string;
  description: string;
  keyPoints: string[];
  resources: LectureResource[];
  completedBy: string[]; // student IDs who finished/viewed
  quiz?: LectureQuiz;
  quizPassedBy?: string[]; // student IDs who passed the topic quiz
  status: 'published' | 'draft';
}

// ----------------------------------------------------
// Assessments & Homework Assignments Models
// ----------------------------------------------------
export interface AssessmentAttachment {
  id: string;
  name: string;
  url?: string;
  size?: string;
  type?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  marks: number;
  type: 'subjective' | 'mcq';
  options?: string[];
  correctOption?: number;
}

export interface AssessmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  submissionText: string;
  fileName?: string;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  classSec: string;
  teacherId: string;
  teacherName: string;
  type: 'assignment' | 'quiz' | 'test' | 'project';
  totalMarks: number;
  passMarks: number;
  dueDate: string;
  assignedDate: string;
  description: string;
  instructions: string[];
  attachments?: AssessmentAttachment[];
  questions?: AssessmentQuestion[];
  submissions: AssessmentSubmission[];
  status: 'active' | 'closed' | 'draft';
}

// ----------------------------------------------------
// Navigation Structure
// ----------------------------------------------------
export type NavigationTab = 
  | 'overview'
  | 'dashboard'
  | 'lectures'
  | 'assignments'
  | 'attendance'
  | 'academics'
  | 'users'
  | 'fees'
  | 'announcements'
  | 'audit'
  | 'calendar'
  | 'chat'
  | 'forum'
  | 'private-vault'
  | 'ai-advisor'
  | 'ai-diagnostic'
  | 'settings';

// ----------------------------------------------------
// Private Vault / Personal Locker Models
// ----------------------------------------------------
export interface VaultCredential {
  id: string;
  userId: string;
  siteName: string;
  siteUrl?: string;
  loginId: string;
  password: string;
  category: 'Examination' | 'Scholarship' | 'Hostel' | 'Education' | 'Identity' | 'Other';
  notes?: string;
  updatedAt: string;
}

export interface VaultDocument {
  id: string;
  userId: string;
  title: string;
  category: 'Admit Card / Hall Ticket' | 'APAAR & Identity' | 'Hostel Pass / Slip' | 'Fee Receipt' | 'Study Notes' | 'Certificate' | 'Other';
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData: string; // Data URI string
  uploadDate: string;
  notes?: string;
}
