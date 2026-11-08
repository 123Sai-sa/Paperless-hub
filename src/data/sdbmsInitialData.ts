import {
  User,
  AcademicSubject,
  ExamTerm,
  StudentGrade,
  FeeTransaction,
  Announcement,
  AuditLog,
  WorkingDayMonth,
  HolidayItem,
  ChatGroup,
  ChatMessage,
  WelcomeBannerConfig,
  Lecture,
  Assessment,
  AttendanceRecord,
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin-01',
    username: 'admin',
    password: 'Sai Anandam',
    fullName: 'Dr. S. K. Ramanathan',
    role: 'admin',
    email: 'admin@sssas.edu',
    phone: '+91 98450 11220',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-09-18T21:40:15Z',
    createdAt: '2024-06-01T08:00:00Z',
    gdprConsentDate: '2025-01-10T10:00:00Z',
  },
  {
    id: 'u-teach-01',
    username: 'teacher_math',
    password: 'Sai Anandam',
    fullName: 'Prof. Ananya Sharma',
    role: 'teacher',
    email: 'ananya.sharma@sssas.edu',
    phone: '+91 94481 22334',
    classSec: 'Class 10-A',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-09-18T18:15:30Z',
    createdAt: '2024-07-15T09:30:00Z',
    gdprConsentDate: '2025-01-12T14:20:00Z',
  },
  {
    id: 'u-teach-02',
    username: 'teacher_sci',
    password: 'Sai Anandam',
    fullName: 'Dr. K. Murali Krishna',
    role: 'teacher',
    email: 'murali.krishna@sssas.edu',
    phone: '+91 98802 33445',
    classSec: 'Class 12-B',
    status: 'active',
    twoFactorEnabled: false,
    lastLogin: '2026-09-17T16:22:10Z',
    createdAt: '2024-07-20T11:00:00Z',
    gdprConsentDate: '2025-01-14T09:15:00Z',
  },
  {
    id: 'u-stud-01',
    username: 'student_sai',
    password: 'Sai Anandam',
    fullName: 'Sai Anandam K.',
    role: 'student',
    email: 'sai.anandam@sssas.edu',
    phone: '+91 99001 55667',
    classSec: 'Class 10-A',
    rollNo: '10A-14',
    apaarId: '9021-4821-0021',
    penId: 'PEN-KA-2024-09881',
    status: 'active',
    twoFactorEnabled: false,
    rank: 1,
    badges: ['Prasanthi Scholar', 'Math Star', '100% Attendance'],
    lastLogin: '2026-09-18T22:10:00Z',
    createdAt: '2024-08-01T10:00:00Z',
    gdprConsentDate: '2025-01-15T11:00:00Z',
  },
  {
    id: 'u-stud-02',
    username: 'student_priya',
    password: 'Sai Anandam',
    fullName: 'Priya Sundaram',
    role: 'student',
    email: 'priya.sundaram@sssas.edu',
    phone: '+91 99002 66778',
    classSec: 'Class 10-A',
    rollNo: '10A-15',
    apaarId: '9021-4821-0022',
    penId: 'PEN-KA-2024-09882',
    status: 'active',
    twoFactorEnabled: false,
    rank: 2,
    badges: ['Science Champ', 'Dharma Star'],
    lastLogin: '2026-09-18T14:45:00Z',
    createdAt: '2024-08-01T10:15:00Z',
    gdprConsentDate: '2025-01-15T11:30:00Z',
  },
  {
    id: 'u-stud-03',
    username: 'student_rohit',
    password: 'Sai Anandam',
    fullName: 'Rohit Varma',
    role: 'student',
    email: 'rohit.varma@sssas.edu',
    phone: '+91 99003 77889',
    classSec: 'Class 10-A',
    rollNo: '10A-16',
    apaarId: '9021-4821-0023',
    penId: 'PEN-KA-2024-09883',
    status: 'active',
    twoFactorEnabled: false,
    rank: 3,
    badges: ['Values Leader', 'Top Orator'],
    lastLogin: '2026-09-17T09:20:00Z',
    createdAt: '2024-08-01T10:30:00Z',
    gdprConsentDate: '2025-01-16T12:00:00Z',
  },
  {
    id: 'u-stud-04',
    username: 'student_aditya',
    password: 'Sai Anandam',
    fullName: 'Aditya Narayan',
    role: 'student',
    email: 'aditya.narayan@sssas.edu',
    phone: '+91 99004 88990',
    classSec: 'Class 10-B',
    rollNo: '10B-01',
    apaarId: '9021-4821-0024',
    penId: 'PEN-KA-2024-09884',
    status: 'active',
    twoFactorEnabled: false,
    rank: 1,
    badges: ['Math Star', 'Prasanthi Scholar'],
    lastLogin: '2026-09-18T08:15:00Z',
    createdAt: '2024-08-02T10:00:00Z',
  },
  {
    id: 'u-stud-05',
    username: 'student_meera',
    password: 'Sai Anandam',
    fullName: 'Meera Nair',
    role: 'student',
    email: 'meera.nair@sssas.edu',
    phone: '+91 99005 99001',
    classSec: 'Class 10-B',
    rollNo: '10B-02',
    apaarId: '9021-4821-0025',
    penId: 'PEN-KA-2024-09885',
    status: 'active',
    twoFactorEnabled: false,
    rank: 2,
    badges: ['Science Champ'],
    lastLogin: '2026-09-17T11:40:00Z',
    createdAt: '2024-08-02T10:15:00Z',
  },
  {
    id: 'u-stud-06',
    username: 'student_deepak',
    password: 'Sai Anandam',
    fullName: 'Deepak Sharma',
    role: 'student',
    email: 'deepak.sharma@sssas.edu',
    phone: '+91 99006 11223',
    classSec: 'Class 9-A',
    rollNo: '9A-04',
    apaarId: '9021-4821-0026',
    penId: 'PEN-KA-2024-09886',
    status: 'active',
    twoFactorEnabled: false,
    rank: 1,
    badges: ['Dharma Star'],
    lastLogin: '2026-09-16T15:10:00Z',
    createdAt: '2024-08-03T09:30:00Z',
  },
  {
    id: 'u-stud-07',
    username: 'student_sneha',
    password: 'Sai Anandam',
    fullName: 'Sneha Patil',
    role: 'student',
    email: 'sneha.patil@sssas.edu',
    phone: '+91 99007 22334',
    classSec: 'Class 9-A',
    rollNo: '9A-08',
    apaarId: '9021-4821-0027',
    penId: 'PEN-KA-2024-09887',
    status: 'active',
    twoFactorEnabled: false,
    rank: 2,
    badges: ['100% Attendance'],
    lastLogin: '2026-09-18T16:20:00Z',
    createdAt: '2024-08-03T10:00:00Z',
  },
  {
    id: 'u-stud-08',
    username: 'student_tanvi',
    password: 'Sai Anandam',
    fullName: 'Tanvi Deshmukh',
    role: 'student',
    email: 'tanvi.deshmukh@sssas.edu',
    phone: '+91 99008 33445',
    classSec: 'Class 9-B',
    rollNo: '9B-05',
    apaarId: '9021-4821-0028',
    penId: 'PEN-KA-2024-09888',
    status: 'active',
    twoFactorEnabled: false,
    rank: 1,
    badges: ['Prasanthi Scholar', 'Values Leader'],
    lastLogin: '2026-09-18T12:05:00Z',
    createdAt: '2024-08-04T11:00:00Z',
  },
  {
    id: 'u-stud-09',
    username: 'student_sathya',
    password: 'Sai Anandam',
    fullName: 'Sathya Prakash',
    role: 'student',
    email: 'sathya.prakash@sssas.edu',
    phone: '+91 99009 44556',
    classSec: 'Class 12-B',
    rollNo: '12B-01',
    apaarId: '9021-4821-0029',
    penId: 'PEN-KA-2024-09889',
    status: 'active',
    twoFactorEnabled: false,
    rank: 1,
    badges: ['Prasanthi Scholar', 'Top Orator'],
    lastLogin: '2026-09-18T18:40:00Z',
    createdAt: '2024-08-04T11:30:00Z',
  },
  {
    id: 'u-acc-01',
    username: 'accountant',
    password: 'Sai Anandam',
    fullName: 'M. Sundaram',
    role: 'accountant',
    email: 'accountant@sssas.edu',
    phone: '+91 97410 44556',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-09-18T17:05:00Z',
    createdAt: '2024-06-15T09:00:00Z',
    gdprConsentDate: '2025-01-11T16:00:00Z',
  },
];

export const INITIAL_SUBJECTS: AcademicSubject[] = [
  { id: 'sub-math', name: 'Advanced Mathematics', code: 'MATH-101', maxMarks: 100, passMarks: 40 },
  { id: 'sub-phys', name: 'Physical Sciences', code: 'PHYS-102', maxMarks: 100, passMarks: 40 },
  { id: 'sub-chem', name: 'Chemical Sciences', code: 'CHEM-103', maxMarks: 100, passMarks: 40 },
  { id: 'sub-eng', name: 'English Literature & Grammar', code: 'ENG-104', maxMarks: 100, passMarks: 40 },
  { id: 'sub-cs', name: 'Computer Science & AI Basics', code: 'CS-105', maxMarks: 100, passMarks: 40 },
  { id: 'sub-soc', name: 'Social Sciences & Civics', code: 'SOC-106', maxMarks: 100, passMarks: 40 },
];

export const INITIAL_EXAM_TERMS: ExamTerm[] = [
  { id: 'term-q1', name: 'Quarterly Assessment (Q1)', academicYear: '2026-27', status: 'completed' },
  { id: 'term-half', name: 'Mid-Term / Half-Yearly (Q2)', academicYear: '2026-27', status: 'active' },
  { id: 'term-pre', name: 'Pre-Board Examination', academicYear: '2026-27', status: 'upcoming' },
  { id: 'term-annual', name: 'Annual Final Examination', academicYear: '2026-27', status: 'upcoming' },
];

export const INITIAL_GRADES: StudentGrade[] = [
  {
    id: 'grd-01',
    studentId: 'u-stud-01',
    studentName: 'Sai Anandam K.',
    rollNo: '10A-14',
    classSec: 'Class 10-A',
    examTermId: 'term-half',
    scores: {
      'sub-math': 96,
      'sub-phys': 92,
      'sub-chem': 89,
      'sub-eng': 94,
      'sub-cs': 98,
      'sub-soc': 91,
    },
    totalMarks: 560,
    maxPossible: 600,
    percentage: 93.33,
    gpa: 9.6,
    grade: 'A+',
    status: 'pass',
    remarks: 'Exemplary analytical aptitude and consistent participation.',
    lastUpdated: '2026-09-18T10:30:00Z',
  },
  {
    id: 'grd-02',
    studentId: 'u-stud-02',
    studentName: 'Priya Sundaram',
    rollNo: '10A-15',
    classSec: 'Class 10-A',
    examTermId: 'term-half',
    scores: {
      'sub-math': 88,
      'sub-phys': 85,
      'sub-chem': 90,
      'sub-eng': 92,
      'sub-cs': 94,
      'sub-soc': 87,
    },
    totalMarks: 536,
    maxPossible: 600,
    percentage: 89.33,
    gpa: 9.1,
    grade: 'A',
    status: 'pass',
    remarks: 'Strong performance across science and languages.',
    lastUpdated: '2026-09-18T10:35:00Z',
  },
  {
    id: 'grd-03',
    studentId: 'u-stud-03',
    studentName: 'Rohit Varma',
    rollNo: '10A-16',
    classSec: 'Class 10-A',
    examTermId: 'term-half',
    scores: {
      'sub-math': 72,
      'sub-phys': 68,
      'sub-chem': 74,
      'sub-eng': 81,
      'sub-cs': 85,
      'sub-soc': 76,
    },
    totalMarks: 456,
    maxPossible: 600,
    percentage: 76.0,
    gpa: 7.8,
    grade: 'B+',
    status: 'pass',
    remarks: 'Good progress in computing; additional focus advised for Physics equations.',
    lastUpdated: '2026-09-18T11:00:00Z',
  },
  // Class 10-B
  {
    id: 'grd-04',
    studentId: 'u-stud-04',
    studentName: 'Aditya Narayan',
    rollNo: '10B-01',
    classSec: 'Class 10-B',
    examTermId: 'term-half',
    scores: {
      'sub-math': 94,
      'sub-phys': 89,
      'sub-chem': 91,
      'sub-eng': 88,
      'sub-cs': 96,
      'sub-soc': 85,
    },
    totalMarks: 543,
    maxPossible: 600,
    percentage: 90.5,
    gpa: 9.2,
    grade: 'A+',
    status: 'pass',
    remarks: 'Outstanding logical reasoning and dedication.',
    lastUpdated: '2026-09-19T09:15:00Z',
  },
  {
    id: 'grd-05',
    studentId: 'u-stud-05',
    studentName: 'Meera Nair',
    rollNo: '10B-02',
    classSec: 'Class 10-B',
    examTermId: 'term-half',
    scores: {
      'sub-math': 82,
      'sub-phys': 80,
      'sub-chem': 86,
      'sub-eng': 91,
      'sub-cs': 88,
      'sub-soc': 84,
    },
    totalMarks: 511,
    maxPossible: 600,
    percentage: 85.17,
    gpa: 8.7,
    grade: 'A',
    status: 'pass',
    remarks: 'Consistent grades, very active in scientific lab work.',
    lastUpdated: '2026-09-19T09:30:00Z',
  },
  // Class 9-A
  {
    id: 'grd-06',
    studentId: 'u-stud-06',
    studentName: 'Deepak Sharma',
    rollNo: '9A-04',
    classSec: 'Class 9-A',
    examTermId: 'term-half',
    scores: {
      'sub-math': 91,
      'sub-phys': 90,
      'sub-chem': 87,
      'sub-eng': 85,
      'sub-cs': 92,
      'sub-soc': 89,
    },
    totalMarks: 534,
    maxPossible: 600,
    percentage: 89.0,
    gpa: 9.0,
    grade: 'A',
    status: 'pass',
    remarks: 'Strong foundation across all secondary curricula.',
    lastUpdated: '2026-09-19T10:00:00Z',
  },
  {
    id: 'grd-07',
    studentId: 'u-stud-07',
    studentName: 'Sneha Patil',
    rollNo: '9A-08',
    classSec: 'Class 9-A',
    examTermId: 'term-half',
    scores: {
      'sub-math': 78,
      'sub-phys': 75,
      'sub-chem': 81,
      'sub-eng': 89,
      'sub-cs': 84,
      'sub-soc': 80,
    },
    totalMarks: 487,
    maxPossible: 600,
    percentage: 81.17,
    gpa: 8.3,
    grade: 'A',
    status: 'pass',
    remarks: 'Commendable language and presentation flair.',
    lastUpdated: '2026-09-19T10:15:00Z',
  },
  // Class 9-B
  {
    id: 'grd-08',
    studentId: 'u-stud-08',
    studentName: 'Tanvi Deshmukh',
    rollNo: '9B-05',
    classSec: 'Class 9-B',
    examTermId: 'term-half',
    scores: {
      'sub-math': 85,
      'sub-phys': 82,
      'sub-chem': 84,
      'sub-eng': 90,
      'sub-cs': 87,
      'sub-soc': 86,
    },
    totalMarks: 514,
    maxPossible: 600,
    percentage: 85.67,
    gpa: 8.8,
    grade: 'A',
    status: 'pass',
    remarks: 'Regular attendance and high exam composure.',
    lastUpdated: '2026-09-19T10:45:00Z',
  },
  // Class 12-B
  {
    id: 'grd-09',
    studentId: 'u-stud-09',
    studentName: 'Sathya Prakash',
    rollNo: '12B-01',
    classSec: 'Class 12-B',
    examTermId: 'term-half',
    scores: {
      'sub-math': 97,
      'sub-phys': 95,
      'sub-chem': 93,
      'sub-eng': 92,
      'sub-cs': 99,
      'sub-soc': 90,
    },
    totalMarks: 566,
    maxPossible: 600,
    percentage: 94.33,
    gpa: 9.7,
    grade: 'A+',
    status: 'pass',
    remarks: 'Academic topper for Senior Secondary Science division.',
    lastUpdated: '2026-09-19T11:00:00Z',
  },
];

export const INITIAL_TRANSACTIONS: FeeTransaction[] = [
  {
    id: 'tx-901',
    receiptNo: 'RCPT-2026-09881',
    studentId: 'u-stud-01',
    studentName: 'Sai Anandam K.',
    classSec: 'Class 10-A',
    category: 'Tuition Fee',
    amount: 18500,
    paymentMethod: 'UPI',
    date: '2026-09-10T11:42:00Z',
    status: 'verified',
    verificationHash: '0x7e8b901fc842a19d08e5c6a12b45e7f8',
    cashierName: 'M. Sundaram (Bursar)',
    notes: 'Term-2 Tuition & Composite Instructional Fee verified via UPI Gateway ID #992817.',
  },
  {
    id: 'tx-902',
    receiptNo: 'RCPT-2026-09882',
    studentId: 'u-stud-01',
    studentName: 'Sai Anandam K.',
    classSec: 'Class 10-A',
    category: 'Laboratory Fee',
    amount: 3200,
    paymentMethod: 'Net Banking',
    date: '2026-09-12T14:10:00Z',
    status: 'verified',
    verificationHash: '0x4a9d18c72b01ef458291ac039d562b81',
    cashierName: 'M. Sundaram (Bursar)',
    notes: 'Physics & Computing advanced lab materials accession fee.',
  },
  {
    id: 'tx-903',
    receiptNo: 'RCPT-2026-09883',
    studentId: 'u-stud-02',
    studentName: 'Priya Sundaram',
    classSec: 'Class 10-A',
    category: 'Tuition Fee',
    amount: 18500,
    paymentMethod: 'Credit/Debit Card',
    date: '2026-09-15T09:25:00Z',
    status: 'verified',
    verificationHash: '0x81ef932a764d0bc8194a2b109c47e852',
    cashierName: 'M. Sundaram (Bursar)',
    notes: 'Card transaction auth ref #POS-8891.',
  },
  {
    id: 'tx-904',
    receiptNo: 'RCPT-2026-09884',
    studentId: 'u-stud-03',
    studentName: 'Rohit Varma',
    classSec: 'Class 10-A',
    category: 'Tuition Fee',
    amount: 18500,
    paymentMethod: 'Net Banking',
    date: '2026-09-16T16:00:00Z',
    status: 'verified',
    verificationHash: '0x12bc9034e567fa890123de4567bc89a0',
    cashierName: 'M. Sundaram (Bursar)',
    notes: 'NEFT transfer acknowledged.',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-101',
    title: '📢 Mid-Term Assessment Schedule & Digital Hall Tickets',
    content: 'The Mid-Term assessments for Classes 9 through 12 commence on Monday, October 6, 2026. Hall tickets and subject seating blueprints are published digitally in the Student & Parent portals. Please verify your APAAR IDs prior to reporting.',
    author: 'Dr. S. K. Ramanathan',
    role: 'admin',
    targetAudience: 'all',
    priority: 'critical',
    timestamp: '2026-09-18T09:00:00Z',
    readCount: 412,
    attachments: [
      { name: 'MidTerm_Assessment_Timetable_2026.pdf', size: '1.4 MB' },
      { name: 'Lab_Practical_Guidelines.pdf', size: '820 KB' },
    ],
  },
  {
    id: 'ann-102',
    title: '🔬 Inter-Institutional Science & AI Exhibition 2026',
    content: 'Students wishing to exhibit computational science, robotics, or ecological conservation working prototypes are invited to submit their abstract synopsis to Prof. Ananya Sharma by next Friday.',
    author: 'Prof. Ananya Sharma',
    role: 'teacher',
    targetAudience: 'students',
    priority: 'academic',
    timestamp: '2026-09-17T11:30:00Z',
    readCount: 285,
    attachments: [
      { name: 'Exhibition_Rubric_and_Format.pdf', size: '640 KB' },
    ],
  },
  {
    id: 'ann-103',
    title: '💳 Term-2 Fee Vouchers & Digital Receipts Dispatched',
    content: 'Parents can now access instant cryptographic receipts for Term-2 fee receipts under the Fee & Transactions tab. Physical counters are replaced with 24/7 digital verification.',
    author: 'M. Sundaram',
    role: 'accountant',
    targetAudience: 'all',
    priority: 'general',
    timestamp: '2026-09-15T10:00:00Z',
    readCount: 340,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-18T22:10:00Z',
    actorId: 'u-stud-01',
    actorName: 'Sai Anandam K.',
    actorRole: 'student',
    eventType: 'AUTH_LOGIN',
    details: 'Successful token authentication with verified credentials.',
    ipAddress: '103.21.144.18',
    severity: 'info',
  },
  {
    id: 'log-02',
    timestamp: '2026-09-18T21:40:15Z',
    actorId: 'u-admin-01',
    actorName: 'Dr. S. K. Ramanathan',
    actorRole: 'admin',
    eventType: 'AUTH_LOGIN',
    details: 'Admin SecOps session initiated with 2FA TOTP verification.',
    ipAddress: '172.16.4.1',
    severity: 'info',
  },
  {
    id: 'log-03',
    timestamp: '2026-09-18T10:30:00Z',
    actorId: 'u-teach-01',
    actorName: 'Prof. Ananya Sharma',
    actorRole: 'teacher',
    eventType: 'GRADE_UPDATE',
    details: 'Batch marks updated for Class 10-A: Mathematics Term-2 Assessment.',
    ipAddress: '192.168.1.42',
    severity: 'info',
  },
  {
    id: 'log-04',
    timestamp: '2026-09-16T16:00:00Z',
    actorId: 'u-acc-01',
    actorName: 'M. Sundaram',
    actorRole: 'accountant',
    eventType: 'FEE_RECORDED',
    details: 'Generated cryptographic verified fee voucher RCPT-2026-09884 (Rs 18,500).',
    ipAddress: '192.168.1.18',
    severity: 'info',
  },
  {
    id: 'log-05',
    timestamp: '2026-09-15T11:00:00Z',
    actorId: 'u-stud-01',
    actorName: 'Sai Anandam K.',
    actorRole: 'student',
    eventType: 'GDPR_CONSENT',
    details: 'User acknowledged and signed digital GDPR & Student Data Privacy Policy v5.0.',
    ipAddress: '103.21.144.18',
    severity: 'info',
  },
];

export const INITIAL_WORKING_DAYS: WorkingDayMonth[] = [
  { id: 'wd-jun', month: 'June', year: 2026, totalCalendarDays: 30, workingDays: 22, holidays: 8, enabled: true },
  { id: 'wd-jul', month: 'July', year: 2026, totalCalendarDays: 31, workingDays: 25, holidays: 6, enabled: true },
  { id: 'wd-aug', month: 'August', year: 2026, totalCalendarDays: 31, workingDays: 23, holidays: 8, enabled: true },
  { id: 'wd-sep', month: 'September', year: 2026, totalCalendarDays: 30, workingDays: 24, holidays: 6, enabled: true },
  { id: 'wd-oct', month: 'October', year: 2026, totalCalendarDays: 31, workingDays: 20, holidays: 11, enabled: true },
  { id: 'wd-nov', month: 'November', year: 2026, totalCalendarDays: 30, workingDays: 23, holidays: 7, enabled: true },
  { id: 'wd-dec', month: 'December', year: 2026, totalCalendarDays: 31, workingDays: 18, holidays: 13, enabled: true },
  { id: 'wd-jan', month: 'January', year: 2027, totalCalendarDays: 31, workingDays: 22, holidays: 9, enabled: true },
  { id: 'wd-feb', month: 'February', year: 2027, totalCalendarDays: 28, workingDays: 22, holidays: 6, enabled: true },
  { id: 'wd-mar', month: 'March', year: 2027, totalCalendarDays: 31, workingDays: 25, holidays: 6, enabled: true },
];

export const INITIAL_HOLIDAYS: HolidayItem[] = [
  { id: 'h-01', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'gazetted', description: 'National Holiday' },
  { id: 'h-02', name: 'Dussehra & Vijayadashami Break', date: '2026-10-18', type: 'institutional', description: 'Autumn Institutional Vacation' },
  { id: 'h-03', name: 'Deepavali Festival of Lights', date: '2026-11-08', type: 'gazetted', description: 'Festival Break' },
  { id: 'h-04', name: 'Sri Sathya Sai Baba Birthday Celebrations', date: '2026-11-23', type: 'institutional', description: 'Institution Founder Day & Convocation' },
  { id: 'h-05', name: 'Winter Solstice / Christmas Recess', date: '2026-12-24', type: 'institutional', description: 'Winter Break' },
  { id: 'h-06', name: 'National Republic Day', date: '2027-01-26', type: 'gazetted', description: 'National Flag Hoisting & Parade' },
];

export const INITIAL_CHAT_GROUPS: ChatGroup[] = [
  {
    id: 'grp-faculty',
    name: '🏫 Senior Faculty Council',
    description: 'Academic coordination, curriculum deadlines, and grading moderation.',
    memberRoles: ['admin', 'teacher'],
    unreadCount: 2,
    lastMessage: 'Term-2 marksheets review is scheduled for 3:30 PM in Conference Room B.',
  },
  {
    id: 'grp-class10a',
    name: '🎓 Class 10-A Academic Forum',
    description: 'Teacher announcements, assignment help, and classroom alerts.',
    memberRoles: ['admin', 'teacher', 'student'],
    unreadCount: 1,
    lastMessage: 'Reminder: Mathematics problem set #5 submissions close tomorrow at 5 PM.',
  },
  {
    id: 'grp-parents',
    name: '👨‍🎓 Student & Faculty Advisory Circle',
    description: 'Institutional updates, health advisories, and student developmental progress.',
    memberRoles: ['admin', 'teacher', 'student'],
    unreadCount: 0,
    lastMessage: 'Thank you all who attended the digital Open House session on Saturday.',
  },
  {
    id: 'grp-admin-ops',
    name: '🛡️ SecOps & Institutional Operations',
    description: 'Administrative logistics, fees reconciliation, and system maintenance.',
    memberRoles: ['admin', 'accountant'],
    unreadCount: 0,
    lastMessage: 'Monthly audited ledger export for September generated successfully.',
  },
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'grp-class10a': [
    {
      id: 'msg-1',
      groupId: 'grp-class10a',
      senderId: 'u-teach-01',
      senderName: 'Prof. Ananya Sharma',
      senderRole: 'teacher',
      text: 'Good morning Class 10-A! Please check your marks matrix in the Academic Gradebook for the latest Term-2 marks updates.',
      timestamp: '2026-09-18T08:30:00Z',
    },
    {
      id: 'msg-2',
      groupId: 'grp-class10a',
      senderId: 'u-stud-01',
      senderName: 'Sai Anandam K.',
      senderRole: 'student',
      text: 'Thank you Ma\'am! The Computer Science project score is also visible now.',
      timestamp: '2026-09-18T08:45:00Z',
    },
    {
      id: 'msg-3',
      groupId: 'grp-class10a',
      senderId: 'u-teach-01',
      senderName: 'Prof. Ananya Sharma',
      senderRole: 'teacher',
      text: 'Reminder: Mathematics problem set #5 submissions close tomorrow at 5 PM.',
      timestamp: '2026-09-18T09:15:00Z',
    },
  ],
  'grp-faculty': [
    {
      id: 'msg-f1',
      groupId: 'grp-faculty',
      senderId: 'u-admin-01',
      senderName: 'Dr. S. K. Ramanathan',
      senderRole: 'admin',
      text: 'Colleagues, all marks uploads for the Mid-Term must be confirmed by this Friday for report card dispatch.',
      timestamp: '2026-09-17T15:00:00Z',
    },
    {
      id: 'msg-f2',
      groupId: 'grp-faculty',
      senderId: 'u-teach-01',
      senderName: 'Prof. Ananya Sharma',
      senderRole: 'teacher',
      text: 'Term-2 marksheets review is scheduled for 3:30 PM in Conference Room B.',
      timestamp: '2026-09-18T07:20:00Z',
    },
  ],
};

export const INITIAL_WELCOME_BANNER: WelcomeBannerConfig = {
  text: '🌟 Welcome to Sri Sathya Sai Anandam SDBMS • Term-2 Assessment Portal Open • APAAR Integrated',
  enabled: true,
  urgency: 'highlight',
};

export const INITIAL_CALENDAR_EVENTS = [
  {
    id: 'evt-1',
    title: 'Science Practical Examination',
    description: 'Physics & Chemistry laboratory evaluations in Lab 3.',
    date: '2026-10-05',
    category: 'exam' as const,
  },
  {
    id: 'evt-2',
    title: 'Mahatma Gandhi Jayanti Holiday',
    description: 'National holiday observing institutional closure.',
    date: '2026-10-02',
    category: 'holiday' as const,
  },
  {
    id: 'evt-3',
    title: 'Annual Science & Tech Innovation Fair',
    description: 'Campus auditorium project demonstrations for Classes 8-12.',
    date: '2026-10-18',
    category: 'event' as const,
  },
  {
    id: 'evt-4',
    title: 'Term-2 Fee Clearance Deadline',
    description: 'Last date for digital bursar voucher reconciliation.',
    date: '2026-10-25',
    category: 'deadline' as const,
  },
  {
    id: 'evt-5',
    title: 'Half-Yearly Board Model Exam',
    description: 'Comprehensive curriculum model evaluation for Class 10 & 12.',
    date: '2026-11-10',
    category: 'exam' as const,
  },
];

export const INITIAL_LECTURES: Lecture[] = [
  {
    id: 'lec-101',
    title: 'Kinematics & Newton\'s Laws of Motion - Deep Dive',
    subject: 'Physics',
    classSec: 'Class 10-A',
    teacherId: 'u-teach-02',
    teacherName: 'Dr. K. Murali Krishna',
    date: '2026-09-17',
    duration: '45 mins',
    recordingType: 'video',
    videoUrl: 'https://www.youtube.com/embed/ZM8ECpBuQYE',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZM8ECpBuQYE',
    description: 'Detailed exposition of free body diagrams, inertial reference frames, friction coefficients, and conservation of linear momentum with real-world problems.',
    keyPoints: [
      'Newton\'s 1st, 2nd, and 3rd laws formulation and vector calculus application',
      'Resolving inclined plane components with static and kinetic friction',
      'Atwood machine tension calculations and system accelerations',
      'Impulse-momentum theorem with graphical integration'
    ],
    resources: [
      { id: 'res-1', name: 'Newton_Laws_Lecture_Slides_10A.pdf', size: '2.4 MB', type: 'PDF' },
      { id: 'res-2', name: 'Worked_Kinematics_Problems.pdf', size: '1.8 MB', type: 'PDF' }
    ],
    completedBy: ['u-stud-01'],
    quizPassedBy: ['u-stud-01'],
    quiz: {
      passPercentage: 75,
      questions: [
        {
          id: 'q-lec-1-1',
          question: 'According to Newton\'s First Law, what is required to change an object\'s state of motion?',
          options: [
            'Continuous application of internal force',
            'A non-zero net external unbalanced force',
            'Zero friction at all times',
            'A constant increase in mass'
          ],
          correctOption: 1,
          explanation: 'Newton\'s First Law states an object continues in its state of rest or uniform motion unless acted upon by a net external force.'
        },
        {
          id: 'q-lec-1-2',
          question: 'What is the SI unit of momentum?',
          options: ['kg·m/s²', 'N/m', 'kg·m/s', 'Joules'],
          correctOption: 2,
          explanation: 'Linear momentum p = mv has dimensions kg * m/s.'
        },
        {
          id: 'q-lec-1-3',
          question: 'If a crate is on an inclined plane of angle θ, what is the normal force component perpendicular to the incline?',
          options: ['mg * sin(θ)', 'mg * cos(θ)', 'mg * tan(θ)', 'mg'],
          correctOption: 1,
          explanation: 'The component perpendicular to the surface is mg * cos(θ).'
        },
        {
          id: 'q-lec-1-4',
          question: 'In an elastic collision between two isolated bodies, which of the following is conserved?',
          options: ['Only momentum', 'Only kinetic energy', 'Both momentum and kinetic energy', 'Neither'],
          correctOption: 2,
          explanation: 'In purely elastic collisions, total momentum and total mechanical kinetic energy are conserved.'
        }
      ]
    },
    status: 'published'
  },
  {
    id: 'lec-102',
    title: 'Differential Calculus: Rates of Change & Maxima/Minima',
    subject: 'Mathematics',
    classSec: 'Class 10-A',
    teacherId: 'u-teach-01',
    teacherName: 'Prof. Ananya Sharma',
    date: '2026-09-18',
    duration: '50 mins',
    recordingType: 'video',
    videoUrl: 'https://www.youtube.com/embed/WUvTyaaNkzM',
    youtubeUrl: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
    description: 'Understanding the geometric interpretation of the derivative, tangent slopes, velocity as rate of change, and second derivative tests for optimization.',
    keyPoints: [
      'Limits approach and first-principle derivation of power rule',
      'Product and Quotient rules applied to trigonometric and polynomial functions',
      'Critical points, local extrema, and point of inflection analysis',
      'Optimization modeling in economics, geometry, and physics'
    ],
    resources: [
      { id: 'res-3', name: 'Calculus_Formula_Sheet_Term2.pdf', size: '1.2 MB', type: 'PDF' },
      { id: 'res-4', name: 'Optimization_Word_Problems.pdf', size: '3.1 MB', type: 'PDF' }
    ],
    completedBy: [],
    quizPassedBy: [],
    quiz: {
      passPercentage: 75,
      questions: [
        {
          id: 'q-lec-2-1',
          question: 'What does f\'(x) = 0 indicate at a smooth continuous point?',
          options: [
            'A vertical asymptote',
            'A stationary or critical point where the tangent line is horizontal',
            'The function is undefined',
            'A discontinuity in the domain'
          ],
          correctOption: 1,
          explanation: 'A zero derivative signifies a stationary point with horizontal tangent.'
        },
        {
          id: 'q-lec-2-2',
          question: 'If f\'(c) = 0 and f\'\'(c) > 0, what does the Second Derivative Test conclude about x = c?',
          options: ['Local Maximum', 'Local Minimum', 'Saddle Point', 'Inconclusive'],
          correctOption: 1,
          explanation: 'When f\'\'(c) > 0, the curve is concave up, indicating a local minimum.'
        },
        {
          id: 'q-lec-2-3',
          question: 'What is the derivative of f(x) = 3x² + 5x - 7 with respect to x?',
          options: ['6x + 5', '3x + 5', '6x² + 5', '6x'],
          correctOption: 0,
          explanation: 'Applying the power rule: d/dx(3x²) = 6x, d/dx(5x) = 5.'
        },
        {
          id: 'q-lec-2-4',
          question: 'Geometrically, what does the first derivative of a function represent?',
          options: ['Area under the curve', 'Slope of the tangent line to the curve', 'Perimeter of graph', 'X-intercept'],
          correctOption: 1,
          explanation: 'The derivative at a point is the instantaneous rate of change and slope of the tangent.'
        }
      ]
    },
    status: 'published'
  },
  {
    id: 'lec-103',
    title: 'Chemical Bonding & Molecular Orbital Geometry',
    subject: 'Chemistry',
    classSec: 'Class 10-A',
    teacherId: 'u-teach-02',
    teacherName: 'Dr. K. Murali Krishna',
    date: '2026-09-16',
    duration: '40 mins',
    recordingType: 'video',
    videoUrl: 'https://www.youtube.com/embed/QXT4OVM4vXI',
    youtubeUrl: 'https://www.youtube.com/watch?v=QXT4OVM4vXI',
    description: 'Electronegativity gradients, VSEPR 3D geometries, sp3/sp2/sp hybridization, and dipole moments in polyatomic molecules.',
    keyPoints: [
      'Lewis dot structures and formal charge minimization',
      'VSEPR theory predicting tetrahedral, trigonal planar, and bent configurations',
      'Molecular polarity and intermolecular hydrogen bonding phenomena'
    ],
    resources: [
      { id: 'res-5', name: 'VSEPR_3D_Geometry_Guide.pdf', size: '4.5 MB', type: 'PDF' }
    ],
    completedBy: [],
    quizPassedBy: [],
    quiz: {
      passPercentage: 75,
      questions: [
        {
          id: 'q-lec-3-1',
          question: 'What is the predicted bond angle in a tetrahedral molecule like Methane (CH4)?',
          options: ['90°', '120°', '109.5°', '180°'],
          correctOption: 2,
          explanation: 'Four equivalent sp3 hybridized bonds repel equally into 109.5° angles.'
        },
        {
          id: 'q-lec-3-2',
          question: 'Which type of hybridization occurs in Carbon atoms of Ethene (C2H4) containing a double bond?',
          options: ['sp', 'sp2', 'sp3', 'sp3d'],
          correctOption: 1,
          explanation: 'Carbon with one double bond and two single bonds forms sp2 hybridization.'
        },
        {
          id: 'q-lec-3-3',
          question: 'Why is Water (H2O) a bent molecule rather than linear?',
          options: [
            'Carbon-Oxygen attraction',
            'Two lone pairs of electrons on Oxygen cause greater electron repulsion',
            'It is non-polar',
            'Hydrogen atoms repel each other'
          ],
          correctOption: 1,
          explanation: 'Lone pair-lone pair repulsion compresses the H-O-H bond angle to 104.5°.'
        },
        {
          id: 'q-lec-3-4',
          question: 'Which molecule has a net zero dipole moment due to symmetric geometry?',
          options: ['H2O', 'NH3', 'CO2', 'HCl'],
          correctOption: 2,
          explanation: 'CO2 is linear, so opposing C=O bond dipole vectors cancel out completely.'
        }
      ]
    },
    status: 'published'
  },
  {
    id: 'lec-104',
    title: 'Data Structures: Hash Tables, Collisions, & Time Complexity',
    subject: 'Computer Science',
    classSec: 'Class 10-A',
    teacherId: 'u-teach-01',
    teacherName: 'Prof. Ananya Sharma',
    date: '2026-09-15',
    duration: '55 mins',
    recordingType: 'video',
    videoUrl: 'https://www.youtube.com/embed/shs0KM3wKv8',
    youtubeUrl: 'https://www.youtube.com/watch?v=shs0KM3wKv8',
    description: 'Internal mechanics of associative arrays, hash functions, separate chaining vs open addressing, and average O(1) retrieval proofs.',
    keyPoints: [
      'Hash code calculation, modular arithmetic, and uniform distribution',
      'Collision resolution strategies: chaining vs linear probing',
      'Load factor thresholding and dynamic resizing costs'
    ],
    resources: [
      { id: 'res-6', name: 'HashTable_Implementation_Code.zip', size: '540 KB', type: 'ZIP' }
    ],
    completedBy: [],
    quizPassedBy: [],
    quiz: {
      passPercentage: 75,
      questions: [
        {
          id: 'q-lec-4-1',
          question: 'What is the average time complexity for searching an element in a well-designed hash table?',
          options: ['O(log N)', 'O(N)', 'O(1)', 'O(N log N)'],
          correctOption: 2,
          explanation: 'Hash functions calculate direct array bucket indices in constant O(1) time.'
        },
        {
          id: 'q-lec-4-2',
          question: 'What is the technique where colliding elements are stored in a linked list at the same bucket?',
          options: ['Linear Probing', 'Separate Chaining', 'Double Hashing', 'Binary Partitioning'],
          correctOption: 1,
          explanation: 'Separate chaining stores collided records in a linked list at that hash table slot.'
        },
        {
          id: 'q-lec-4-3',
          question: 'When a hash table has an extremely high load factor and poor hash function, worst-case search degrades to:',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
          correctOption: 2,
          explanation: 'If all keys hash to a single bucket, search becomes a linear scan of length N.'
        },
        {
          id: 'q-lec-4-4',
          question: 'What parameter determines when a dynamic hash table triggers rehashing to a larger bucket array?',
          options: ['Load factor threshold', 'Total memory RAM', 'Processor clock speed', 'Key string length'],
          correctOption: 0,
          explanation: 'The load factor (number of elements / number of buckets) triggers auto-resizing.'
        }
      ]
    },
    status: 'published'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-2026-09-18-10A',
    date: '2026-09-18',
    classSec: 'Class 10-A',
    markedBy: 'Prof. Ananya Sharma',
    markedById: 'u-teach-01',
    timestamp: '2026-09-18T08:30:00Z',
    records: [
      { studentId: 'u-stud-01', studentName: 'Sai Anandam K.', rollNo: '10A-14', status: 'present', remarks: 'On time, active participation' },
      { studentId: 'u-stud-02', studentName: 'Priya Sundaram', rollNo: '10A-15', status: 'present', remarks: 'On time' },
      { studentId: 'u-stud-03', studentName: 'Rohit Varma', rollNo: '10A-16', status: 'late', remarks: 'Late by 10 mins (hostel bus delay)' },
    ]
  },
  {
    id: 'att-2026-09-17-10A',
    date: '2026-09-17',
    classSec: 'Class 10-A',
    markedBy: 'Prof. Ananya Sharma',
    markedById: 'u-teach-01',
    timestamp: '2026-09-17T08:30:00Z',
    records: [
      { studentId: 'u-stud-01', studentName: 'Sai Anandam K.', rollNo: '10A-14', status: 'present' },
      { studentId: 'u-stud-02', studentName: 'Priya Sundaram', rollNo: '10A-15', status: 'present' },
      { studentId: 'u-stud-03', studentName: 'Rohit Varma', rollNo: '10A-16', status: 'present' },
    ]
  },
  {
    id: 'att-2026-09-16-10A',
    date: '2026-09-16',
    classSec: 'Class 10-A',
    markedBy: 'Prof. Ananya Sharma',
    markedById: 'u-teach-01',
    timestamp: '2026-09-16T08:30:00Z',
    records: [
      { studentId: 'u-stud-01', studentName: 'Sai Anandam K.', rollNo: '10A-14', status: 'present' },
      { studentId: 'u-stud-02', studentName: 'Priya Sundaram', rollNo: '10A-15', status: 'excused', remarks: 'Approved medical appointment' },
      { studentId: 'u-stud-03', studentName: 'Rohit Varma', rollNo: '10A-16', status: 'present' },
    ]
  },
  {
    id: 'att-2026-09-15-10A',
    date: '2026-09-15',
    classSec: 'Class 10-A',
    markedBy: 'Prof. Ananya Sharma',
    markedById: 'u-teach-01',
    timestamp: '2026-09-15T08:30:00Z',
    records: [
      { studentId: 'u-stud-01', studentName: 'Sai Anandam K.', rollNo: '10A-14', status: 'present' },
      { studentId: 'u-stud-02', studentName: 'Priya Sundaram', rollNo: '10A-15', status: 'present' },
      { studentId: 'u-stud-03', studentName: 'Rohit Varma', rollNo: '10A-16', status: 'present' },
    ]
  },
  {
    id: 'att-2026-09-18-10B',
    date: '2026-09-18',
    classSec: 'Class 10-B',
    markedBy: 'Dr. K. Murali Krishna',
    markedById: 'u-teach-02',
    timestamp: '2026-09-18T08:35:00Z',
    records: [
      { studentId: 'u-stud-04', studentName: 'Aditya Narayan', rollNo: '10B-01', status: 'present' },
      { studentId: 'u-stud-05', studentName: 'Meera Nair', rollNo: '10B-02', status: 'present' },
    ]
  },
  {
    id: 'att-2026-09-18-9A',
    date: '2026-09-18',
    classSec: 'Class 9-A',
    markedBy: 'Dr. S. K. Ramanathan',
    markedById: 'u-admin-01',
    timestamp: '2026-09-18T08:40:00Z',
    records: [
      { studentId: 'u-stud-06', studentName: 'Deepak Sharma', rollNo: '9A-04', status: 'present' },
      { studentId: 'u-stud-07', studentName: 'Sneha Patil', rollNo: '9A-08', status: 'present' },
    ]
  }
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'asm-101',
    title: 'Kinematics & Force Vectors Problem Set',
    subject: 'Physics',
    classSec: 'Class 10-A',
    teacherId: 'u-teach-02',
    teacherName: 'Dr. K. Murali Krishna',
    type: 'assignment',
    totalMarks: 50,
    passMarks: 20,
    assignedDate: '2026-09-16',
    dueDate: '2026-09-24T23:59:00',
    description: 'Solve the 4 analytical numerical problem scenarios involving projectile motion, friction coefficients, and multi-body pulley assemblies.',
    instructions: [
      'Show all free body diagrams and intermediate algebraic steps clearly.',
      'State SI units for every calculated quantity (m/s, N, Joules).',
      'Submit your typed solution or uploaded scan via this digital portal.'
    ],
    attachments: [
      { id: 'att-res-1', name: 'Physics_Kinematics_Reference_Guide.pdf', size: '1.4 MB', type: 'PDF' },
      { id: 'att-res-2', name: 'Formula_Sheet_Mechanics_2026.pdf', size: '820 KB', type: 'PDF' }
    ],
    questions: [
      {
        id: 'q1',
        question: 'A 5.0 kg crate rests on a 30° incline with friction coefficient μ = 0.25. Calculate acceleration down the incline.',
        marks: 15,
        type: 'subjective'
      },
      {
        id: 'q2',
        question: 'Two blocks of masses 3 kg and 7 kg are connected over a frictionless pulley. Find system acceleration and string tension.',
        marks: 15,
        type: 'subjective'
      },
      {
        id: 'q3',
        question: 'Which of the following describes momentum conservation during an inelastic collision?',
        marks: 10,
        type: 'mcq',
        options: [
          'Kinetic energy is conserved, momentum is lost',
          'Total momentum is conserved, kinetic energy is converted to thermal/deformation energy',
          'Both kinetic energy and momentum are conserved',
          'Neither momentum nor energy is conserved'
        ],
        correctOption: 1
      },
      {
        id: 'q4',
        question: 'Derive the relationship between impulse and change in linear momentum using Newton\'s second law.',
        marks: 10,
        type: 'subjective'
      }
    ],
    submissions: [
      {
        id: 'sub-01',
        studentId: 'u-stud-01',
        studentName: 'Sai Anandam K.',
        rollNo: '10A-14',
        submittedAt: '2026-09-17T14:30:00Z',
        status: 'graded',
        submissionText: 'Problem 1: Using F_net = m*g*sin(30) - μ*m*g*cos(30), a = 9.8*(0.5 - 0.25*0.866) = 2.78 m/s².\nProblem 2: a = (7 - 3)/(7 + 3) * 9.8 = 3.92 m/s². Tension T = 2 * (3 * 7) / 10 * 9.8 = 41.16 N.\nProblem 3: Option B (Total momentum conserved, KE dissipated).\nProblem 4: F = dp/dt -> F*dt = dp -> Impulse J = Δp.',
        fileName: 'Kinematics_Solutions_SaiAnandam.pdf',
        score: 48,
        feedback: 'Exceptional precision in resolving friction vectors and correct significant figures. Excellent work Sai!',
        gradedBy: 'Dr. K. Murali Krishna',
        gradedAt: '2026-09-18T10:15:00Z'
      },
      {
        id: 'sub-02',
        studentId: 'u-stud-02',
        studentName: 'Priya Sundaram',
        rollNo: '10A-15',
        submittedAt: '2026-09-18T09:10:00Z',
        status: 'submitted',
        submissionText: 'Completed solutions with detailed free-body diagrams in attached PDF document.',
        fileName: 'Physics_Priya_HW_Term2.pdf'
      }
    ],
    status: 'active'
  },
  {
    id: 'asm-102',
    title: 'Calculus Optimization & Curve Sketching Test',
    subject: 'Mathematics',
    classSec: 'Class 10-A',
    teacherId: 'u-teach-01',
    teacherName: 'Prof. Ananya Sharma',
    type: 'test',
    totalMarks: 40,
    passMarks: 16,
    assignedDate: '2026-09-17',
    dueDate: '2026-09-26T18:00:00',
    description: 'Test covering critical points, second derivative inflection, and real-world cost-minimization problems.',
    instructions: [
      'No physical paper scratch sheets needed; answer electronically or attach your scanned work.',
      'Check both first and second order conditions for all stationary points.'
    ],
    questions: [
      {
        id: 'mq1',
        question: 'Find all local extrema and inflection points for f(x) = 2x³ - 9x² + 12x + 5.',
        marks: 20,
        type: 'subjective'
      },
      {
        id: 'mq2',
        question: 'A cylindrical tin can must hold 1000 cm³ of juice. Find the dimensions (radius and height) that minimize total surface area.',
        marks: 20,
        type: 'subjective'
      }
    ],
    submissions: [],
    status: 'active'
  },
  {
    id: 'asm-103',
    title: 'Computer Science: Algorithms & Complexity Quiz',
    subject: 'Computer Science',
    classSec: 'Class 10-A',
    teacherId: 'u-teach-01',
    teacherName: 'Prof. Ananya Sharma',
    type: 'quiz',
    totalMarks: 25,
    passMarks: 10,
    assignedDate: '2026-09-15',
    dueDate: '2026-09-28T23:59:00',
    description: 'Quick-fire assessment analyzing Big-O time and space trade-offs across sorting and search structures.',
    instructions: [
      'Answer all questions in one sitting.',
      'Auto-evaluated upon faculty review.'
    ],
    questions: [
      {
        id: 'csq1',
        question: 'What is the worst-case time complexity of QuickSort when the pivot is chosen naively as the first element on a sorted array?',
        marks: 5,
        type: 'mcq',
        options: ['O(log N)', 'O(N log N)', 'O(N²)', 'O(1)'],
        correctOption: 2
      },
      {
        id: 'csq2',
        question: 'Explain why Hash Tables offer O(1) expected time complexity but can degrade to O(N).',
        marks: 20,
        type: 'subjective'
      }
    ],
    submissions: [],
    status: 'active'
  }
];


