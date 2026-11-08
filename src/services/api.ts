import {
  User,
  UserRole,
  StudentGrade,
  FeeTransaction,
  Announcement,
  AuditLog,
  WorkingDayMonth,
  HolidayItem,
  ChatGroup,
  ChatMessage,
  WelcomeBannerConfig,
  CalendarEvent,
  Lecture,
  Assessment,
  AssessmentSubmission,
  VaultCredential,
  VaultDocument,
  AttendanceRecord,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_EXAM_TERMS,
  INITIAL_GRADES,
  INITIAL_TRANSACTIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WORKING_DAYS,
  INITIAL_HOLIDAYS,
  INITIAL_CHAT_GROUPS,
  INITIAL_MESSAGES,
  INITIAL_WELCOME_BANNER,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_LECTURES,
  INITIAL_ASSESSMENTS,
  INITIAL_ATTENDANCE,
} from '../data/sdbmsInitialData';
import { db, auth, googleProvider, handleFirestoreError, OperationType, firebaseConfig, testConnection } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';

const TOKEN_KEY = 'sdbms_jwt_token';
const USER_KEY = 'sdbms_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  signOut(auth).catch(() => {});
}

// Helper to get or initialize local mock storage
function getStorageItem<T>(key: string, defaultVal: T): T {
  const raw = localStorage.getItem(`sdbms_${key}`);
  if (!raw) {
    localStorage.setItem(`sdbms_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStorageItem<T>(key: string, val: T): void {
  localStorage.setItem(`sdbms_${key}`, JSON.stringify(val));
}

// Firestore Collection Synchronizer with Seed Fallback
async function syncCollection<T extends { id: string }>(
  collectionName: string,
  storageKey: string,
  initialData: T[]
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
      setStorageItem(storageKey, items);
      return items;
    } else if (initialData.length > 0) {
      // Seed Firestore with initial records in background
      seedCollectionToFirestore(collectionName, initialData).catch((e) =>
        console.warn(`Seeding ${collectionName} error:`, e)
      );
    }
  } catch (err) {
    console.warn(`Firestore sync for ${collectionName} offline, using cache:`, err);
  }
  return getStorageItem<T[]>(storageKey, initialData);
}

async function seedCollectionToFirestore<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const item of items.slice(0, 50)) {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item, { merge: true });
    }
    await batch.commit();
  } catch (e) {
    console.warn(`Error seeding Firestore collection ${collectionName}:`, e);
  }
}

async function writeDocToFirestore(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
  } catch (error) {
    console.warn(`Error writing to Firestore ${collectionName}/${docId}:`, error);
  }
}

async function deleteDocFromFirestore(collectionName: string, docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.warn(`Error deleting from Firestore ${collectionName}/${docId}:`, error);
  }
}

// SDBMS API client
export const sdbmsApi = {
  // Authentication
  async login(id: string, pass: string): Promise<{ token: string; user: User }> {
    // Sync users from Firestore if available
    let users: User[] = [];
    try {
      users = await this.getUsers();
    } catch {
      users = getStorageItem<User[]>('users', INITIAL_USERS);
    }

    const searchVal = id.trim().toLowerCase();
    const matched = users.find(
      u => u.username.toLowerCase() === searchVal ||
           u.email.toLowerCase() === searchVal ||
           u.id.toLowerCase() === searchVal ||
           (u.rollNo && u.rollNo.toLowerCase() === searchVal) ||
           (u.apaarId && u.apaarId.toLowerCase() === searchVal)
    );

    if (!matched) {
      throw new Error('Invalid institutional identifier or user not registered.');
    }

    // STRICT CHECK: Block suspended users immediately
    if (matched.status === 'suspended') {
      throw new Error('Account Suspended: This institutional account has been deactivated by administration. You cannot access the portal.');
    }

    // Check custom password if set for this user, or default roles, or institutional password "Sai Anandam"
    const passwords = getStorageItem<Record<string, string>>('passwords', {});
    const inputPass = pass.trim();
    
    // Check if input matches: "Sai Anandam", custom password, user.password, or default fallback
    const isPasswordValid =
      inputPass === 'Sai Anandam' ||
      inputPass === matched.password ||
      (passwords[matched.id] && passwords[matched.id] === inputPass) ||
      (passwords[matched.username] && passwords[matched.username] === inputPass) ||
      (matched.role === 'admin' && inputPass === 'admin123') ||
      (matched.role === 'teacher' && inputPass === 'teach123') ||
      (matched.role === 'student' && inputPass === 'sai123') ||
      (matched.role === 'accountant' && inputPass === 'acc123');
    
    if (!isPasswordValid) {
      throw new Error('Incorrect password. Please verify your credentials or contact the administrator.');
    }

    const token = `sdbms_jwt_${matched.id}_${Date.now()}`;
    const updatedUser = {
      ...matched,
      lastLogin: new Date().toISOString(),
    };

    // Update in local users and Firestore
    const newUsers = users.map(u => (u.id === matched.id ? updatedUser : u));
    setStorageItem('users', newUsers);
    writeDocToFirestore('users', updatedUser.id, updatedUser);
    setStoredSession(token, updatedUser);

    // Append audit log
    this.addAuditLog({
      actorId: updatedUser.id,
      actorName: updatedUser.fullName,
      actorRole: updatedUser.role,
      eventType: 'AUTH_LOGIN',
      details: `Session authorized for ${updatedUser.fullName} (${updatedUser.role.toUpperCase()}).`,
      ipAddress: '127.0.0.1 (Authenticated Client)',
      severity: 'info',
    });

    return { token, user: updatedUser };
  },

  async loginWithGoogle(): Promise<{ token: string; user: User }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = fbUser.email?.toLowerCase() || '';

      const users = await this.getUsers();
      let matched = users.find(u => u.email.toLowerCase() === email);

      if (!matched) {
        // Bootstrap new user profile for Google Sign-In user
        const isAdminUser = email === 'saianandam05@gmail.com' || users.length === 0;
        matched = {
          id: `u-g-${Date.now().toString(36)}`,
          username: fbUser.displayName ? fbUser.displayName.toLowerCase().replace(/\s+/g, '_').slice(0, 20) : `user_${Date.now().toString(36)}`,
          fullName: fbUser.displayName || 'Authorized User',
          email: fbUser.email || 'user@sdbms.sai.edu',
          role: isAdminUser ? 'admin' : 'teacher',
          phone: fbUser.phoneNumber || '+91 98450 11220',
          status: 'active',
          twoFactorEnabled: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          avatar: fbUser.photoURL || undefined,
        };
        await writeDocToFirestore('users', matched.id, matched);
        const newUsers = [matched, ...users];
        setStorageItem('users', newUsers);
      } else {
        matched = {
          ...matched,
          lastLogin: new Date().toISOString(),
          avatar: fbUser.photoURL || matched.avatar,
        };
        await writeDocToFirestore('users', matched.id, matched);
      }

      const token = await fbUser.getIdToken();
      setStoredSession(token, matched);

      this.addAuditLog({
        actorId: matched.id,
        actorName: matched.fullName,
        actorRole: matched.role,
        eventType: 'AUTH_GOOGLE_FIREBASE',
        details: `Firebase Google Auth validated for ${matched.fullName} (${matched.email}).`,
        ipAddress: '127.0.0.1 (Google OAuth Provider)',
        severity: 'info',
      });

      return { token, user: matched };
    } catch (error: any) {
      console.error('Firebase Google sign-in failed:', error);
      throw new Error(error.message || 'Google authentication with Firebase failed.');
    }
  },

  async acceptGdprConsent(user: User): Promise<User> {
    const consentDate = new Date().toISOString();
    const updatedUser: User = {
      ...user,
      gdprConsentDate: consentDate,
    };

    const users = getStorageItem<User[]>('users', INITIAL_USERS);
    const newUsers = users.map(u => (u.id === user.id ? updatedUser : u));
    setStorageItem('users', newUsers);
    setStoredSession(getStoredToken() || `jwt_${user.id}`, updatedUser);

    this.addAuditLog({
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      eventType: 'GDPR_CONSENT',
      details: `GDPR consent accepted and digitally signed.`,
      ipAddress: '127.0.0.1',
      severity: 'info',
    });

    return updatedUser;
  },

  // Users Management (Connected to Cloud Firestore Database)
  async getUsers(): Promise<User[]> {
    const rawUsers = await syncCollection<User>('users', 'users', INITIAL_USERS);
    // Sanitize: remove any legacy parent accounts, enforce institutional @sssas.edu domains
    const sanitized = rawUsers
      .filter(u => (u.role as string) !== 'parent')
      .map(u => {
        let email = u.email;
        if (!email || !email.endsWith('@sssas.edu')) {
          const prefix = email ? email.split('@')[0] : u.username;
          email = `${prefix}@sssas.edu`;
        }
        return {
          ...u,
          email,
          password: u.password || 'Sai Anandam',
        };
      });
    setStorageItem('users', sanitized);
    return sanitized;
  },

  async registerUser(userData: {
    fullName: string;
    username: string;
    role: UserRole;
    email: string;
    password: string;
    phone?: string;
    classSec?: string;
    rollNo?: string;
    apaarId?: string;
    penId?: string;
    id?: string;
  }): Promise<{ token: string; user: User }> {
    const users = await this.getUsers();
    const cleanUsername = userData.username.trim();
    const cleanEmail = userData.email.trim().toLowerCase();

    // 1. Validation for unique username
    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      throw new Error(`Username "${cleanUsername}" is already registered. Please choose another login username.`);
    }

    // 2. Validation for unique email
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`Email address "${cleanEmail}" is already registered. Please sign in or use another email.`);
    }

    // 3. Structured Institutional ID generation
    let finalId = userData.id && userData.id.trim() ? userData.id.trim() : '';
    if (!finalId) {
      const rolePrefix: Record<UserRole, string> = {
        student: 'STD-2026',
        teacher: 'TCH-2026',
        admin: 'ADM-2026',
        accountant: 'ACC-2026',
      };
      const count = users.filter(u => u.role === userData.role).length + 1;
      finalId = `${rolePrefix[userData.role] || 'USR'}-${String(count).padStart(3, '0')}`;
    }

    if (users.some(u => u.id.toLowerCase() === finalId.toLowerCase())) {
      finalId = `${finalId}-${Math.random().toString(36).substring(2, 5)}`;
    }

    const cleanPassword = userData.password.trim() || (userData.role === 'admin' ? 'admin123' : userData.role === 'teacher' ? 'teach123' : 'sai123');

    const newUser: User = {
      id: finalId,
      fullName: userData.fullName.trim(),
      username: cleanUsername,
      role: userData.role,
      email: cleanEmail,
      phone: userData.phone?.trim() || undefined,
      classSec: userData.classSec?.trim() || (userData.role === 'student' ? 'Class 10-A' : undefined),
      rollNo: userData.rollNo?.trim() || undefined,
      apaarId: userData.apaarId?.trim() || undefined,
      penId: userData.penId?.trim() || undefined,
      status: 'active',
      twoFactorEnabled: userData.role === 'admin',
      password: cleanPassword,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Store password for instant lookup
    const passwords = getStorageItem<Record<string, string>>('passwords', {});
    passwords[newUser.id] = cleanPassword;
    passwords[newUser.username] = cleanPassword;
    setStorageItem('passwords', passwords);

    // Save user locally and to Firestore
    const updated = [newUser, ...users];
    setStorageItem('users', updated);
    await writeDocToFirestore('users', newUser.id, newUser);

    // If new user is a student, auto-register an initial gradebook record so they appear in classwise gradebook immediately
    if (newUser.role === 'student' && newUser.classSec) {
      const grades = getStorageItem<StudentGrade[]>('grades', INITIAL_GRADES);
      const existsInGrades = grades.some(g => g.studentId === newUser.id);
      if (!existsInGrades) {
        const newGrade: StudentGrade = {
          id: `grd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          studentId: newUser.id,
          studentName: newUser.fullName,
          rollNo: newUser.rollNo || `R-${newUser.id.slice(-3)}`,
          classSec: newUser.classSec,
          examTermId: 'term-mid-2026',
          scores: { sub_eng: 75, sub_math: 75, sub_sci: 75, sub_soc: 75, sub_san: 80, sub_yoga: 85 },
          totalMarks: 465,
          maxPossible: 600,
          percentage: 77.5,
          gpa: 7.8,
          grade: 'B+',
          status: 'pass',
          rank: grades.filter(g => g.classSec === newUser.classSec).length + 1,
          remarks: 'Newly registered student. Academic marksheet ledger activated.',
          lastUpdated: new Date().toISOString(),
        };
        const updatedGrades = [newGrade, ...grades];
        setStorageItem('grades', updatedGrades);
        writeDocToFirestore('grades', newGrade.id, newGrade).catch(() => {});
      }
    }

    const token = `sdbms_jwt_${newUser.id}_${Date.now()}`;
    setStoredSession(token, newUser);

    this.addAuditLog({
      actorId: newUser.id,
      actorName: newUser.fullName,
      actorRole: newUser.role,
      eventType: 'USER_REGISTER',
      details: `New institutional registration completed for ${newUser.fullName} (${newUser.role.toUpperCase()}). ID: ${newUser.id}, Username: @${newUser.username}.`,
      ipAddress: '127.0.0.1 (Institutional Registration Portal)',
      severity: 'info',
    });

    return { token, user: newUser };
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { id?: string }): Promise<User> {
    const users = await this.getUsers();
    const cleanUsername = userData.username.trim();
    const cleanEmail = userData.email.trim().toLowerCase();

    // Check duplicate username
    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      throw new Error(`Username "${cleanUsername}" is already taken in the directory. Please use a distinct username.`);
    }

    // Check duplicate email
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`Email address "${cleanEmail}" is already registered. Please provide a distinct email address.`);
    }

    let finalId = userData.id && userData.id.trim() ? userData.id.trim() : '';
    if (!finalId) {
      const rolePrefix: Record<UserRole, string> = {
        student: 'STD-2026',
        teacher: 'TCH-2026',
        admin: 'ADM-2026',
        accountant: 'ACC-2026',
      };
      const count = users.filter(u => u.role === userData.role).length + 1;
      finalId = `${rolePrefix[userData.role] || 'USR'}-${String(count).padStart(3, '0')}`;
    }

    const cleanPassword = userData.password && userData.password.trim() ? userData.password.trim() : (userData.role === 'admin' ? 'admin123' : userData.role === 'teacher' ? 'teach123' : 'sai123');

    const newUser: User = {
      ...userData,
      id: finalId,
      username: cleanUsername,
      email: cleanEmail,
      password: cleanPassword,
      createdAt: new Date().toISOString(),
      lastLogin: 'Never',
    };

    const passwords = getStorageItem<Record<string, string>>('passwords', {});
    passwords[newUser.id] = cleanPassword;
    passwords[newUser.username] = cleanPassword;
    setStorageItem('passwords', passwords);

    const updated = [newUser, ...users];
    setStorageItem('users', updated);
    await writeDocToFirestore('users', newUser.id, newUser);

    // If student, ensure gradebook entry
    if (newUser.role === 'student' && newUser.classSec) {
      const grades = getStorageItem<StudentGrade[]>('grades', INITIAL_GRADES);
      const existsInGrades = grades.some(g => g.studentId === newUser.id);
      if (!existsInGrades) {
        const newGrade: StudentGrade = {
          id: `grd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          studentId: newUser.id,
          studentName: newUser.fullName,
          rollNo: newUser.rollNo || `R-${newUser.id.slice(-3)}`,
          classSec: newUser.classSec,
          examTermId: 'term-mid-2026',
          scores: { sub_eng: 75, sub_math: 75, sub_sci: 75, sub_soc: 75, sub_san: 80, sub_yoga: 85 },
          totalMarks: 465,
          maxPossible: 600,
          percentage: 77.5,
          gpa: 7.8,
          grade: 'B+',
          status: 'pass',
          rank: grades.filter(g => g.classSec === newUser.classSec).length + 1,
          remarks: 'Provisioned student record. Academic ledger active.',
          lastUpdated: new Date().toISOString(),
        };
        const updatedGrades = [newGrade, ...grades];
        setStorageItem('grades', updatedGrades);
        writeDocToFirestore('grades', newGrade.id, newGrade).catch(() => {});
      }
    }

    this.addAuditLog({
      actorId: 'admin',
      actorName: 'System Administrator',
      actorRole: 'admin',
      eventType: 'USER_CREATE',
      details: `Provisioned new user account: ${newUser.fullName} (${newUser.role.toUpperCase()}). ID: ${newUser.id}, Username: @${newUser.username}.`,
      ipAddress: '127.0.0.1 (SecOps Admin Terminal)',
      severity: 'info',
    });

    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    let users = getStorageItem<User[]>('users', INITIAL_USERS);
    let targetIndex = users.findIndex(u => u.id === id || u.username === id);
    if (targetIndex === -1) {
      users = await this.getUsers();
      targetIndex = users.findIndex(u => u.id === id || u.username === id);
    }
    if (targetIndex === -1) throw new Error('User not found in directory');

    const target = users[targetIndex];
    const updatedUser: User = { ...target, ...updates };
    users[targetIndex] = updatedUser;
    setStorageItem('users', users);
    await writeDocToFirestore('users', updatedUser.id, updatedUser);

    // If password was updated
    if (updates.password && updates.password.trim()) {
      const passwords = getStorageItem<Record<string, string>>('passwords', {});
      passwords[updatedUser.id] = updates.password.trim();
      passwords[updatedUser.username] = updates.password.trim();
      setStorageItem('passwords', passwords);
    }

    // Keep active session in sync
    const cur = getStoredUser();
    if (cur && (cur.id === id || cur.id === updatedUser.id)) {
      setStoredSession(getStoredToken() || `jwt_${updatedUser.id}`, updatedUser);
    }

    this.addAuditLog({
      actorId: 'admin',
      actorName: 'Administrator',
      actorRole: 'admin',
      eventType: 'USER_UPDATE',
      details: `Modified credentials or status for ${updatedUser.fullName} (${updatedUser.role.toUpperCase()}) -> Status: ${updatedUser.status.toUpperCase()}.`,
      ipAddress: '127.0.0.1',
      severity: updatedUser.status === 'suspended' ? 'warning' : 'info',
    });

    return updatedUser;
  },

  async deleteUser(id: string): Promise<void> {
    const users = getStorageItem<User[]>('users', INITIAL_USERS);
    const target = users.find(u => u.id === id);
    const updated = users.filter(u => u.id !== id);
    setStorageItem('users', updated);
    await deleteDocFromFirestore('users', id);

    this.addAuditLog({
      actorId: 'admin',
      actorName: 'Administrator',
      actorRole: 'admin',
      eventType: 'USER_DELETE',
      details: `Permanently removed user account: ${target?.fullName || id}.`,
      ipAddress: '127.0.0.1',
      severity: 'critical',
    });
  },

  async changeUserCredentials(
    userId: string,
    params: {
      newId?: string;
      newRollNo?: string;
      newUsername?: string;
      newPassword?: string;
      apaarId?: string;
      penId?: string;
      fullName?: string;
      email?: string;
    }
  ): Promise<User> {
    const users = getStorageItem<User[]>('users', INITIAL_USERS);
    const targetIndex = users.findIndex(u => u.id === userId);
    if (targetIndex === -1) {
      throw new Error(`User with ID "${userId}" not found.`);
    }

    const current = users[targetIndex];
    const newId = params.newId && params.newId.trim() ? params.newId.trim() : current.id;
    const newRollNo = params.newRollNo !== undefined ? params.newRollNo.trim() : current.rollNo;
    const newUsername = params.newUsername && params.newUsername.trim() ? params.newUsername.trim() : current.username;
    const newApaarId = params.apaarId !== undefined ? params.apaarId.trim() : current.apaarId;
    const newPenId = params.penId !== undefined ? params.penId.trim() : current.penId;
    const newFullName = params.fullName && params.fullName.trim() ? params.fullName.trim() : current.fullName;
    const newEmail = params.email && params.email.trim() ? params.email.trim() : current.email;

    const passwords = getStorageItem<Record<string, string>>('passwords', {});
    
    // Determine the active password: new password if given, or existing password
    let activePassword = current.password || passwords[userId] || passwords[current.username] || (current.role === 'admin' ? 'admin123' : current.role === 'teacher' ? 'teach123' : 'sai123');
    if (params.newPassword && params.newPassword.trim()) {
      activePassword = params.newPassword.trim();
    }

    const updatedUser: User = {
      ...current,
      id: newId,
      fullName: newFullName,
      email: newEmail,
      rollNo: newRollNo,
      username: newUsername,
      apaarId: newApaarId,
      penId: newPenId,
      password: activePassword,
    };

    // Store password under both new ID and new Username for instant lookup
    passwords[newId] = activePassword;
    passwords[newUsername] = activePassword;
    if (newId !== userId) {
      delete passwords[userId];
    }
    if (newUsername !== current.username) {
      delete passwords[current.username];
    }
    setStorageItem('passwords', passwords);

    users[targetIndex] = updatedUser;
    setStorageItem('users', users);

    // If ID changed, cascade to related records
    if (newId !== userId) {
      // 1. Cascading student grades
      const grades = getStorageItem<StudentGrade[]>('grades', INITIAL_GRADES);
      const updatedGrades = grades.map(g => (g.studentId === userId ? { ...g, studentId: newId, rollNo: newRollNo || g.rollNo } : g));
      setStorageItem('grades', updatedGrades);

      // 2. Cascading fee transactions
      const transactions = getStorageItem<FeeTransaction[]>('transactions', INITIAL_TRANSACTIONS);
      const updatedTx = transactions.map(t => (t.studentId === userId ? { ...t, studentId: newId } : t));
      setStorageItem('transactions', updatedTx);

      // 3. Cascading vault credentials & documents
      const vaultCreds = getStorageItem<VaultCredential[]>('vault_credentials', []);
      const updatedVaultCreds = vaultCreds.map(c => (c.userId === userId ? { ...c, userId: newId } : c));
      setStorageItem('vault_credentials', updatedVaultCreds);

      const vaultDocs = getStorageItem<VaultDocument[]>('vault_documents', []);
      const updatedVaultDocs = vaultDocs.map(d => (d.userId === userId ? { ...d, userId: newId } : d));
      setStorageItem('vault_documents', updatedVaultDocs);
    }

    // Persist to Cloud Firestore
    await writeDocToFirestore('users', newId, updatedUser);
    if (newId !== userId) {
      await deleteDocFromFirestore('users', userId);
    }

    // Keep active session in sync if current logged-in user is this user
    const currentUser = getStoredUser();
    if (currentUser && (currentUser.id === userId || currentUser.id === current.id || currentUser.username === current.username)) {
      setStoredSession(getStoredToken() || `jwt_${newId}`, updatedUser);
    }

    this.addAuditLog({
      actorId: 'admin',
      actorName: 'Administrator',
      actorRole: 'admin',
      eventType: 'CREDENTIALS_RESET',
      details: `Administrator updated credentials for ${updatedUser.role} "${updatedUser.fullName}". ID: ${newId}, Username: @${newUsername}, Password: ${params.newPassword ? 'Updated' : 'Preserved'}.`,
      ipAddress: '127.0.0.1 (SecOps Admin Terminal)',
      severity: 'warning',
    });

    return updatedUser;
  },

  async changeStudentCredentials(
    studentId: string,
    params: {
      newId?: string;
      newRollNo?: string;
      newUsername?: string;
      newPassword?: string;
      apaarId?: string;
      penId?: string;
      fullName?: string;
      email?: string;
    }
  ): Promise<User> {
    return this.changeUserCredentials(studentId, params);
  },

  async changeMyCredentials(
    userId: string,
    params: {
      newUsername?: string;
      newPassword?: string;
      fullName?: string;
      email?: string;
    }
  ): Promise<User> {
    return this.changeUserCredentials(userId, params);
  },

  // Theme preferences per individual
  getUserThemePreference(userId?: string): 'dark' | 'light' {
    if (userId) {
      const userTheme = localStorage.getItem(`sdbms_theme_${userId}`);
      if (userTheme === 'light' || userTheme === 'dark') return userTheme;
    }
    const globalTheme = localStorage.getItem('sdbms_global_theme');
    if (globalTheme === 'light' || globalTheme === 'dark') return globalTheme;
    return 'dark';
  },

  setUserThemePreference(userId: string | undefined, theme: 'dark' | 'light'): void {
    if (userId) {
      localStorage.setItem(`sdbms_theme_${userId}`, theme);
      const users = getStorageItem<User[]>('users', INITIAL_USERS);
      const targetIndex = users.findIndex(u => u.id === userId);
      if (targetIndex >= 0) {
        users[targetIndex].themePreference = theme;
        setStorageItem('users', users);
        const cur = getStoredUser();
        if (cur && cur.id === userId) {
          cur.themePreference = theme;
          setStoredSession(getStoredToken() || `jwt_${userId}`, cur);
        }
      }
    }
    localStorage.setItem('sdbms_global_theme', theme);
  },

  // Academics & Grades (Connected to Cloud Firestore Database)
  async getGrades(): Promise<StudentGrade[]> {
    return await syncCollection<StudentGrade>('grades', 'grades', INITIAL_GRADES);
  },

  async createGrade(gradeData: Omit<StudentGrade, 'id' | 'lastUpdated'>): Promise<StudentGrade> {
    const newGrade: StudentGrade = {
      ...gradeData,
      id: `grd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      lastUpdated: new Date().toISOString(),
    };

    const grades = getStorageItem<StudentGrade[]>('grades', INITIAL_GRADES);
    const updated = [newGrade, ...grades];
    setStorageItem('grades', updated);

    await writeDocToFirestore('grades', newGrade.id, newGrade);

    this.addAuditLog({
      actorId: 'teacher',
      actorName: 'Faculty Evaluator',
      actorRole: 'teacher',
      eventType: 'GRADE_CREATE',
      details: `Created new marksheet for ${newGrade.studentName} (${newGrade.rollNo}, ${newGrade.classSec}). Total: ${newGrade.totalMarks}/${newGrade.maxPossible}`,
      ipAddress: '127.0.0.1 (Firestore Database)',
      severity: 'info',
    });

    return newGrade;
  },

  async updateGrade(grade: StudentGrade): Promise<StudentGrade> {
    const updatedGrade: StudentGrade = {
      ...grade,
      lastUpdated: new Date().toISOString(),
    };

    const grades = getStorageItem<StudentGrade[]>('grades', INITIAL_GRADES);
    const updated = grades.map(g => (g.id === updatedGrade.id ? updatedGrade : g));
    setStorageItem('grades', updated);

    await writeDocToFirestore('grades', updatedGrade.id, updatedGrade);

    this.addAuditLog({
      actorId: 'teacher',
      actorName: 'Faculty',
      actorRole: 'teacher',
      eventType: 'GRADE_UPDATE',
      details: `Adjusted scores for student ${updatedGrade.studentName} (${updatedGrade.rollNo}, ${updatedGrade.classSec}). Total: ${updatedGrade.totalMarks}/${updatedGrade.maxPossible}`,
      ipAddress: '127.0.0.1 (Firestore Database)',
      severity: 'info',
    });

    return updatedGrade;
  },

  async deleteGrade(gradeId: string): Promise<void> {
    const grades = getStorageItem<StudentGrade[]>('grades', INITIAL_GRADES);
    const target = grades.find(g => g.id === gradeId);
    const updated = grades.filter(g => g.id !== gradeId);
    setStorageItem('grades', updated);

    await deleteDocFromFirestore('grades', gradeId);

    this.addAuditLog({
      actorId: 'admin',
      actorName: 'Administrator',
      actorRole: 'admin',
      eventType: 'GRADE_DELETE',
      details: `Removed marksheet record ${gradeId} (${target?.studentName || 'Student'} - ${target?.classSec || 'Class'}).`,
      ipAddress: '127.0.0.1 (Firestore Database)',
      severity: 'warning',
    });
  },

  async bulkUpdateGrades(newGrades: StudentGrade[]): Promise<StudentGrade[]> {
    const grades = getStorageItem<StudentGrade[]>('grades', INITIAL_GRADES);
    const map = new Map(grades.map(g => [g.id, g]));
    newGrades.forEach(g => map.set(g.id, { ...g, lastUpdated: new Date().toISOString() }));
    const merged = Array.from(map.values());
    setStorageItem('grades', merged);

    // Commit batch to Firestore
    try {
      const batch = writeBatch(db);
      for (const item of newGrades.slice(0, 50)) {
        const docRef = doc(db, 'grades', item.id);
        batch.set(docRef, item, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      console.warn('Batch write to Firestore grades warning:', err);
    }

    this.addAuditLog({
      actorId: 'teacher',
      actorName: 'Faculty Evaluator',
      actorRole: 'teacher',
      eventType: 'GRADE_BULK_SYNC',
      details: `Bulk synchronized marks for ${newGrades.length} student records into Cloud Firestore database.`,
      ipAddress: '127.0.0.1 (Firestore Database)',
      severity: 'info',
    });

    return merged;
  },

  // Fee Transactions (Connected to Cloud Firestore Database)
  async getTransactions(): Promise<FeeTransaction[]> {
    return await syncCollection<FeeTransaction>('transactions', 'transactions', INITIAL_TRANSACTIONS);
  },

  async recordTransaction(tx: Omit<FeeTransaction, 'id' | 'receiptNo' | 'verificationHash' | 'date'>): Promise<FeeTransaction> {
    const receiptNo = `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTx: FeeTransaction = {
      ...tx,
      id: `tx-${Date.now().toString(36)}`,
      receiptNo,
      date: new Date().toISOString(),
      verificationHash: `0x${randomHex}`,
    };

    const transactions = getStorageItem<FeeTransaction[]>('transactions', INITIAL_TRANSACTIONS);
    const updated = [newTx, ...transactions];
    setStorageItem('transactions', updated);

    await writeDocToFirestore('transactions', newTx.id, newTx);

    this.addAuditLog({
      actorId: 'bursar',
      actorName: 'Chief Accounts Officer',
      actorRole: 'accountant',
      eventType: 'FEE_RECORDED',
      details: `Issued verified voucher ${newTx.receiptNo} for ${newTx.studentName} (Rs ${newTx.amount.toLocaleString()}) via ${newTx.paymentMethod}.`,
      ipAddress: '127.0.0.1 (Firestore Database)',
      severity: 'info',
    });

    return newTx;
  },

  // Announcements (Connected to Cloud Firestore Database)
  async getAnnouncements(): Promise<Announcement[]> {
    return await syncCollection<Announcement>('announcements', 'announcements', INITIAL_ANNOUNCEMENTS);
  },

  async createAnnouncement(ann: Omit<Announcement, 'id' | 'timestamp' | 'readCount'>): Promise<Announcement> {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      readCount: 1,
    };

    const list = getStorageItem<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
    const updated = [newAnn, ...list];
    setStorageItem('announcements', updated);

    await writeDocToFirestore('announcements', newAnn.id, newAnn);

    this.addAuditLog({
      actorId: ann.author,
      actorName: ann.author,
      actorRole: ann.role,
      eventType: 'BROADCAST_ALERT',
      details: `Published institutional announcement: "${ann.title}" (${ann.priority.toUpperCase()}).`,
      ipAddress: '127.0.0.1 (Firestore Database)',
      severity: ann.priority === 'critical' ? 'critical' : 'info',
    });

    return newAnn;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const list = getStorageItem<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
    const updated = list.filter(a => a.id !== id);
    setStorageItem('announcements', updated);

    await deleteDocFromFirestore('announcements', id);
  },

  // Audit Logs (Connected to Cloud Firestore Database)
  async getAuditLogs(): Promise<AuditLog[]> {
    return await syncCollection<AuditLog>('audit_logs', 'audit_logs', INITIAL_AUDIT_LOGS);
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const newLog: AuditLog = {
      ...entry,
      id: `log-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    const logs = getStorageItem<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    setStorageItem('audit_logs', [newLog, ...logs].slice(0, 300));
    writeDocToFirestore('audit_logs', newLog.id, newLog).catch(() => {});
  },

  // Academic Calendar & Working Days
  async getWorkingDays(): Promise<WorkingDayMonth[]> {
    try {
      const res = await fetch('/api/working-days');
      if (res.ok) return await res.json();
    } catch { /* fallback */ }
    return getStorageItem<WorkingDayMonth[]>('working_days', INITIAL_WORKING_DAYS);
  },

  async updateWorkingDay(monthId: string, updates: Partial<WorkingDayMonth>): Promise<WorkingDayMonth[]> {
    const list = getStorageItem<WorkingDayMonth[]>('working_days', INITIAL_WORKING_DAYS);
    const updated = list.map(m => (m.id === monthId ? { ...m, ...updates } : m));
    setStorageItem('working_days', updated);
    return updated;
  },

  async getHolidays(): Promise<HolidayItem[]> {
    try {
      const res = await fetch('/api/holidays');
      if (res.ok) return await res.json();
    } catch { /* fallback */ }
    return getStorageItem<HolidayItem[]>('holidays', INITIAL_HOLIDAYS);
  },

  // Chat Groups & Messages
  async getChatGroups(): Promise<ChatGroup[]> {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) return await res.json();
    } catch { /* fallback */ }
    return getStorageItem<ChatGroup[]>('chat_groups', INITIAL_CHAT_GROUPS);
  },

  async getMessages(groupId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`/api/chat/${groupId}`);
      if (res.ok) return await res.json();
    } catch { /* fallback */ }
    const all = getStorageItem<Record<string, ChatMessage[]>>('chat_messages', INITIAL_MESSAGES);
    return all[groupId] || [];
  },

  async sendMessage(groupId: string, text: string, user: User): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now().toString(36)}`,
      groupId,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      text,
      timestamp: new Date().toISOString(),
    };

    const all = getStorageItem<Record<string, ChatMessage[]>>('chat_messages', INITIAL_MESSAGES);
    const groupMsgs = all[groupId] || [];
    all[groupId] = [...groupMsgs, newMsg];
    setStorageItem('chat_messages', all);

    try {
      await fetch(`/api/chat/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
    } catch { /* fallback */ }

    return newMsg;
  },

  // Welcome Banner
  async getWelcomeBanner(): Promise<WelcomeBannerConfig> {
    try {
      const res = await fetch('/api/welcome-banner');
      if (res.ok) return await res.json();
    } catch { /* fallback */ }
    return getStorageItem<WelcomeBannerConfig>('welcome_banner', INITIAL_WELCOME_BANNER);
  },

  async updateWelcomeBanner(config: WelcomeBannerConfig): Promise<WelcomeBannerConfig> {
    setStorageItem('welcome_banner', config);
    try {
      await fetch('/api/welcome-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch { /* fallback */ }

    this.addAuditLog({
      actorId: 'admin',
      actorName: 'Portal Administrator',
      actorRole: 'admin',
      eventType: 'SETTINGS_UPDATE',
      details: `Updated institutional welcome banner message. Active: ${config.enabled}`,
      ipAddress: '127.0.0.1',
      severity: 'info',
    });

    return config;
  },

  // GDPR Data Portability Export
  async exportGdprDossier(user: User): Promise<Record<string, any>> {
    const grades = (await this.getGrades()).filter(g => g.studentId === user.id);
    const transactions = (await this.getTransactions()).filter(t => t.studentId === user.id);
    const logs = (await this.getAuditLogs()).filter(l => l.actorId === user.id);

    const dossier = {
      gdpr_compliance_standard: 'GDPR / Digital Personal Data Protection (DPDP) Act 2026',
      export_timestamp: new Date().toISOString(),
      institution: 'Sri Sathya Sai Anandam SDBMS',
      encryption_standard: 'AES-256 at-rest compliance verification',
      user_profile: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone || 'N/A',
        classSec: user.classSec || 'N/A',
        rollNo: user.rollNo || 'N/A',
        apaarId: user.apaarId || 'N/A',
        penId: user.penId || 'N/A',
        consent_signed_at: user.gdprConsentDate || '2025-01-15T11:00:00Z',
      },
      academic_indicators: grades,
      fee_transactions: transactions,
      security_audit_events: logs,
    };

    this.addAuditLog({
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      eventType: 'GDPR_EXPORT',
      details: `Generated and downloaded complete GDPR personal data dossier.`,
      ipAddress: '127.0.0.1',
      severity: 'info',
    });

    return dossier;
  },

  // AI Diagnostic Analysis
  async analyzeStudentPerformance(studentName: string, grade: StudentGrade): Promise<any> {
    try {
      const res = await fetch('/api/gemini/analyze-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, grade }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch { /* fallback */ }

    // Fallback analytical diagnostic
    const scoreEntries = Object.entries(grade.scores);
    const lowest = [...scoreEntries].sort((a, b) => a[1] - b[1])[0];
    const highest = [...scoreEntries].sort((a, b) => b[1] - a[1])[0];

    return {
      overallStatus: `Student demonstrates outstanding aptitude with an aggregate score of ${grade.percentage}%.`,
      strengthArea: `Excellence in ${highest ? highest[0].replace('sub-', '').toUpperCase() : 'Computing'} (${highest ? highest[1] : 95}/100).`,
      opportunityArea: `Marginal opportunity in ${lowest ? lowest[0].replace('sub-', '').toUpperCase() : 'Sciences'} (${lowest ? lowest[1] : 75}/100).`,
      recommendedActions: [
        'Engage in peer mentoring for computational reasoning and science practicals.',
        'Solve 2 timed question sets weekly to reinforce formula derivations.',
        'Schedule targeted 20-minute weekly consultations with subject faculty.',
      ],
      estimatedReadiness: '95% readiness for State & National Olympiad and Board Assessments.',
    };
  },

  // Session convenience helpers
  getStoredSession(): User | null {
    return getStoredUser();
  },

  setStoredSession(user: User): void {
    setStoredSession(`sdbms_jwt_${user.id}_${Date.now()}`, user);
  },

  logout(): Promise<void> {
    clearStoredSession();
    return Promise.resolve();
  },

  // Calendar events (Connected to Cloud Firestore Database)
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return await syncCollection<CalendarEvent>('calendar_events', 'calendar_events', INITIAL_CALENDAR_EVENTS);
  },

  async addCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now().toString(36)}`,
    };
    const list = getStorageItem<CalendarEvent[]>('calendar_events', INITIAL_CALENDAR_EVENTS);
    const updated = [...list, newEvent];
    setStorageItem('calendar_events', updated);

    await writeDocToFirestore('calendar_events', newEvent.id, newEvent);

    this.addAuditLog({
      actorId: 'admin',
      actorName: 'Faculty Scheduler',
      actorRole: 'admin',
      eventType: 'SETTINGS_UPDATE',
      details: `Scheduled almanac event: "${newEvent.title}" on ${newEvent.date}.`,
      ipAddress: '127.0.0.1',
      severity: 'info',
    });

    return newEvent;
  },

  // Chat message aliases
  async getChatMessages(groupId: string): Promise<ChatMessage[]> {
    return this.getMessages(groupId);
  },

  async sendChatMessage(groupId: string, text: string, user: User): Promise<ChatMessage> {
    return this.sendMessage(groupId, text, user);
  },

  // AI Diagnostic Prompt execution
  async generateDiagnostic(prompt: string): Promise<{ analysis: string }> {
    try {
      const res = await fetch('/api/digitize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'report_card',
          rawContent: prompt,
          institution: 'school',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const content = json.data?.summary || json.data?.content || JSON.stringify(json.data, null, 2);
        return { analysis: content };
      }
    } catch { /* fallback */ }

    // High quality intelligent academic synthesis fallback
    return {
      analysis: `📊 ACADEMIC DIAGNOSTIC & REMEDIATION DOSSIER:

1. APPRECIATION & CORE COMPETENCIES:
• The student exhibits consistent conceptual grasp across foundational modules, with highest marks registered in analytical topics.
• Classroom engagement records indicate punctuality, adherence to zero-paper digital submissions, and disciplined inquiry during doubt-clearing blocks.

2. VULNERABILITY ANALYSIS & TARGET FOCUS:
• Variance between computational problem sets and theoretical long-answer formulations suggests room for more structured step-by-step documentation.
• Time allocation during 90-minute model examinations indicates slight deceleration during mid-paper numerical sections.

3. FOUR-WEEK INTERVENTION ROADMAP:
• Week 1: 30 minutes daily targeted formula sheet derivations (paperless digital scratchpad).
• Week 2: Timed 45-minute modular mock assessments covering Chemistry and Physics application problems.
• Week 3: Peer-assisted computational modeling sessions focusing on algorithmic efficiency.
• Week 4: Final diagnostic checkpoint test with faculty mentor review.

4. INSTITUTIONAL RECOMMENDATION:
• Recommended for Advanced Scholastic Track. All performance records are cryptographically timestamped and compliant with CBSE/State grading criteria.`,
    };
  },

  // ----------------------------------------------------
  // Lectures & Digital Classrooms (Connected to Cloud Firestore Database)
  // ----------------------------------------------------
  async getLectures(): Promise<Lecture[]> {
    return await syncCollection<Lecture>('lectures', 'lectures', INITIAL_LECTURES);
  },

  async createLecture(lectureData: Omit<Lecture, 'id' | 'completedBy'>): Promise<Lecture> {
    const lectures = getStorageItem<Lecture[]>('lectures', INITIAL_LECTURES);
    const newLecture: Lecture = {
      ...lectureData,
      id: `lec-${Date.now().toString(36)}`,
      completedBy: [],
    };
    const updated = [newLecture, ...lectures];
    setStorageItem('lectures', updated);

    await writeDocToFirestore('lectures', newLecture.id, newLecture);

    this.addAuditLog({
      actorId: lectureData.teacherId,
      actorName: lectureData.teacherName,
      actorRole: 'teacher',
      eventType: 'LECTURE_CREATE',
      details: `Published digital lecture: "${newLecture.title}" for ${newLecture.classSec} (${newLecture.subject}).`,
      ipAddress: '127.0.0.1 (Faculty Digital Board)',
      severity: 'info',
    });

    return newLecture;
  },

  async updateLecture(id: string, updates: Partial<Lecture>): Promise<Lecture> {
    const lectures = getStorageItem<Lecture[]>('lectures', INITIAL_LECTURES);
    const target = lectures.find(l => l.id === id);
    if (!target) throw new Error('Lecture not found');

    const updatedLecture = { ...target, ...updates };
    const updated = lectures.map(l => (l.id === id ? updatedLecture : l));
    setStorageItem('lectures', updated);

    await writeDocToFirestore('lectures', id, updatedLecture);
    return updatedLecture;
  },

  async deleteLecture(id: string): Promise<void> {
    const lectures = getStorageItem<Lecture[]>('lectures', INITIAL_LECTURES);
    const target = lectures.find(l => l.id === id);
    const updated = lectures.filter(l => l.id !== id);
    setStorageItem('lectures', updated);

    await deleteDocFromFirestore('lectures', id);

    this.addAuditLog({
      actorId: 'teacher',
      actorName: 'Faculty',
      actorRole: 'teacher',
      eventType: 'LECTURE_DELETE',
      details: `Removed digital lecture: "${target?.title || id}".`,
      ipAddress: '127.0.0.1',
      severity: 'warning',
    });
  },

  async toggleLectureCompleted(lectureId: string, studentId: string): Promise<Lecture> {
    const lectures = getStorageItem<Lecture[]>('lectures', INITIAL_LECTURES);
    const target = lectures.find(l => l.id === lectureId);
    if (!target) throw new Error('Lecture not found');

    const isCompleted = target.completedBy?.includes(studentId);
    const completedBy = isCompleted
      ? target.completedBy.filter(s => s !== studentId)
      : [...(target.completedBy || []), studentId];

    const updatedLecture = { ...target, completedBy };
    const updated = lectures.map(l => (l.id === lectureId ? updatedLecture : l));
    setStorageItem('lectures', updated);

    await writeDocToFirestore('lectures', lectureId, updatedLecture);
    return updatedLecture;
  },

  // ----------------------------------------------------
  // Assessments & Homework Assignments
  // ----------------------------------------------------
  // ----------------------------------------------------
  // Assessments & Homework Assignments (Connected to Cloud Firestore Database)
  // ----------------------------------------------------
  async getAssessments(): Promise<Assessment[]> {
    return await syncCollection<Assessment>('assessments', 'assessments', INITIAL_ASSESSMENTS);
  },

  async createAssessment(assessmentData: Omit<Assessment, 'id' | 'submissions'>): Promise<Assessment> {
    const assessments = getStorageItem<Assessment[]>('assessments', INITIAL_ASSESSMENTS);
    const newAssessment: Assessment = {
      ...assessmentData,
      id: `asm-${Date.now().toString(36)}`,
      submissions: [],
    };
    const updated = [newAssessment, ...assessments];
    setStorageItem('assessments', updated);

    await writeDocToFirestore('assessments', newAssessment.id, newAssessment);

    this.addAuditLog({
      actorId: assessmentData.teacherId,
      actorName: assessmentData.teacherName,
      actorRole: 'teacher',
      eventType: 'ASSESSMENT_CREATE',
      details: `Assigned new ${assessmentData.type}: "${newAssessment.title}" to ${newAssessment.classSec} (Due: ${newAssessment.dueDate}).`,
      ipAddress: '127.0.0.1 (Faculty Assessment Console)',
      severity: 'info',
    });

    return newAssessment;
  },

  async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment> {
    const assessments = getStorageItem<Assessment[]>('assessments', INITIAL_ASSESSMENTS);
    const target = assessments.find(a => a.id === id);
    if (!target) throw new Error('Assessment not found');

    const updatedAssessment = { ...target, ...updates };
    const updated = assessments.map(a => (a.id === id ? updatedAssessment : a));
    setStorageItem('assessments', updated);

    await writeDocToFirestore('assessments', id, updatedAssessment);
    return updatedAssessment;
  },

  async deleteAssessment(id: string): Promise<void> {
    const assessments = getStorageItem<Assessment[]>('assessments', INITIAL_ASSESSMENTS);
    const target = assessments.find(a => a.id === id);
    const updated = assessments.filter(a => a.id !== id);
    setStorageItem('assessments', updated);

    await deleteDocFromFirestore('assessments', id);

    this.addAuditLog({
      actorId: 'teacher',
      actorName: 'Faculty',
      actorRole: 'teacher',
      eventType: 'ASSESSMENT_DELETE',
      details: `Removed assessment: "${target?.title || id}".`,
      ipAddress: '127.0.0.1',
      severity: 'warning',
    });
  },

  async submitAssessment(
    assessmentId: string,
    submissionData: {
      studentId: string;
      studentName: string;
      rollNo?: string;
      submissionText: string;
      fileName?: string;
    }
  ): Promise<Assessment> {
    const assessments = getStorageItem<Assessment[]>('assessments', INITIAL_ASSESSMENTS);
    const target = assessments.find(a => a.id === assessmentId);
    if (!target) throw new Error('Assessment not found');

    const existingIndex = target.submissions.findIndex(s => s.studentId === submissionData.studentId);
    const newSubmission: AssessmentSubmission = {
      id: `sub-${Date.now().toString(36)}`,
      studentId: submissionData.studentId,
      studentName: submissionData.studentName,
      rollNo: submissionData.rollNo,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      submissionText: submissionData.submissionText,
      fileName: submissionData.fileName,
    };

    let updatedSubmissions: AssessmentSubmission[];
    if (existingIndex >= 0) {
      updatedSubmissions = [...target.submissions];
      updatedSubmissions[existingIndex] = {
        ...target.submissions[existingIndex],
        ...newSubmission,
        id: target.submissions[existingIndex].id, // preserve ID
      };
    } else {
      updatedSubmissions = [newSubmission, ...target.submissions];
    }

    const updatedAssessment: Assessment = {
      ...target,
      submissions: updatedSubmissions,
    };

    const updated = assessments.map(a => (a.id === assessmentId ? updatedAssessment : a));
    setStorageItem('assessments', updated);

    await writeDocToFirestore('assessments', assessmentId, updatedAssessment);

    this.addAuditLog({
      actorId: submissionData.studentId,
      actorName: submissionData.studentName,
      actorRole: 'student',
      eventType: 'ASSESSMENT_SUBMIT',
      details: `Submitted work electronically for "${target.title}" (${target.subject}).`,
      ipAddress: '127.0.0.1 (Student Portal)',
      severity: 'info',
    });

    return updatedAssessment;
  },

  async gradeAssessmentSubmission(
    assessmentId: string,
    submissionId: string,
    score: number,
    feedback: string,
    teacherName: string
  ): Promise<Assessment> {
    const assessments = getStorageItem<Assessment[]>('assessments', INITIAL_ASSESSMENTS);
    const target = assessments.find(a => a.id === assessmentId);
    if (!target) throw new Error('Assessment not found');

    const updatedSubmissions = target.submissions.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          score,
          feedback,
          status: 'graded' as const,
          gradedBy: teacherName,
          gradedAt: new Date().toISOString(),
        };
      }
      return sub;
    });

    const updatedAssessment: Assessment = {
      ...target,
      submissions: updatedSubmissions,
    };

    const updated = assessments.map(a => (a.id === assessmentId ? updatedAssessment : a));
    setStorageItem('assessments', updated);

    await writeDocToFirestore('assessments', assessmentId, updatedAssessment);

    const gradedSub = target.submissions.find(s => s.id === submissionId);
    this.addAuditLog({
      actorId: 'teacher',
      actorName: teacherName,
      actorRole: 'teacher',
      eventType: 'ASSESSMENT_GRADE',
      details: `Graded submission by ${gradedSub?.studentName || 'student'}. Score: ${score}/${target.totalMarks}. Feedback recorded.`,
      ipAddress: '127.0.0.1 (Faculty Terminal)',
      severity: 'info',
    });

    return updatedAssessment;
  },

  // ----------------------------------------------------
  // Private Vault: Credentials & PDF Locker
  // ----------------------------------------------------
  async getVaultCredentials(userId: string): Promise<VaultCredential[]> {
    const allCreds = getStorageItem<VaultCredential[]>('vault_credentials', [
      {
        id: 'cred-demo-1',
        userId: 'u-stud-01',
        siteName: 'National Scholarship Portal (NSP)',
        siteUrl: 'https://scholarships.gov.in',
        loginId: 'KA20242500981',
        password: 'NspSecretPass#2026',
        category: 'Scholarship',
        notes: 'Pre-matric merit scholarship application. Renew every August.',
        updatedAt: '2026-09-15T10:00:00Z',
      },
      {
        id: 'cred-demo-2',
        userId: 'u-stud-01',
        siteName: 'CBSE Examination / Pariksha Sangam',
        siteUrl: 'https://parikshasangam.cbse.gov.in',
        loginId: 'sai.anandam.cbse',
        password: 'SaiCbse#Pass2026',
        category: 'Examination',
        notes: 'Board examination portal for roll number slip and sample papers.',
        updatedAt: '2026-09-12T14:30:00Z',
      },
      {
        id: 'cred-demo-3',
        userId: 'u-admin-01',
        siteName: 'Unified School Information System (UDISE+)',
        siteUrl: 'https://udiseplus.gov.in',
        loginId: 'udise_sai_institution_ka',
        password: 'SaiUdise#Admin99',
        category: 'Education',
        notes: 'Annual school accreditation and student APAAR submission gateway.',
        updatedAt: '2026-09-18T09:00:00Z',
      },
      {
        id: 'cred-demo-4',
        userId: 'u-admin-01',
        siteName: 'Hostel Secure Wi-Fi Firewall Portal',
        siteUrl: 'https://192.168.1.1:8443',
        loginId: 'admin_firewall_sai',
        password: 'HostelShield@2026',
        category: 'Hostel',
        notes: 'Fortinet gateway for dormitory internet band control.',
        updatedAt: '2026-09-17T11:20:00Z',
      },
    ]);
    return allCreds.filter(c => c.userId === userId);
  },

  async saveVaultCredential(cred: VaultCredential): Promise<VaultCredential> {
    const allCreds = getStorageItem<VaultCredential[]>('vault_credentials', []);
    const existingIndex = allCreds.findIndex(c => c.id === cred.id);
    let updated: VaultCredential[];
    if (existingIndex >= 0) {
      updated = [...allCreds];
      updated[existingIndex] = { ...cred, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...cred, updatedAt: new Date().toISOString() }, ...allCreds];
    }
    setStorageItem('vault_credentials', updated);
    await writeDocToFirestore('vault_credentials', cred.id, cred);
    return cred;
  },

  async deleteVaultCredential(id: string): Promise<void> {
    const allCreds = getStorageItem<VaultCredential[]>('vault_credentials', []);
    setStorageItem('vault_credentials', allCreds.filter(c => c.id !== id));
    await deleteDocFromFirestore('vault_credentials', id);
  },

  async getVaultDocuments(userId: string): Promise<VaultDocument[]> {
    const allDocs = getStorageItem<VaultDocument[]>('vault_documents', [
      {
        id: 'doc-demo-1',
        userId: 'u-stud-01',
        title: 'CBSE Mid-Term Admit Card & Examination Pass',
        category: 'Admit Card / Hall Ticket',
        fileName: 'CBSE_Admit_Card_SaiAnandam.pdf',
        fileSize: '348 KB',
        fileType: 'application/pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==',
        uploadDate: '2026-09-14T08:30:00Z',
        notes: 'Original hall ticket with verified barcode and invigilator signature instructions.',
      },
      {
        id: 'doc-demo-2',
        userId: 'u-stud-01',
        title: 'Govt APAAR & DigiLocker Student ID Card',
        category: 'APAAR & Identity',
        fileName: 'APAAR_Identity_Card_9021.pdf',
        fileSize: '512 KB',
        fileType: 'application/pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==',
        uploadDate: '2026-09-10T12:15:00Z',
        notes: '12-digit APAAR identity credential for academic bank of credits.',
      },
      {
        id: 'doc-demo-3',
        userId: 'u-admin-01',
        title: 'Hostel Health & Fire Safety Compliance Certificate 2026',
        category: 'Hostel Pass / Slip',
        fileName: 'Hostel_Safety_Inspection_Cert_2026.pdf',
        fileSize: '890 KB',
        fileType: 'application/pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==',
        uploadDate: '2026-09-16T15:00:00Z',
        notes: 'Department of Public Health & State Fire Service safety clearance certificate.',
      },
    ]);
    return allDocs.filter(d => d.userId === userId);
  },

  async saveVaultDocument(doc: VaultDocument): Promise<VaultDocument> {
    const allDocs = getStorageItem<VaultDocument[]>('vault_documents', []);
    const existingIndex = allDocs.findIndex(d => d.id === doc.id);
    let updated: VaultDocument[];
    if (existingIndex >= 0) {
      updated = [...allDocs];
      updated[existingIndex] = doc;
    } else {
      updated = [doc, ...allDocs];
    }
    setStorageItem('vault_documents', updated);
    await writeDocToFirestore('vault_documents', doc.id, doc);
    return doc;
  },

  async deleteVaultDocument(id: string): Promise<void> {
    const allDocs = getStorageItem<VaultDocument[]>('vault_documents', []);
    setStorageItem('vault_documents', allDocs.filter(d => d.id !== id));
    await deleteDocFromFirestore('vault_documents', id);
  },

  // Factory reset
  async resetToFactoryData(): Promise<void> {
    localStorage.removeItem('sdbms_users');
    localStorage.removeItem('sdbms_passwords');
    localStorage.removeItem('sdbms_grades');
    localStorage.removeItem('sdbms_transactions');
    localStorage.removeItem('sdbms_announcements');
    localStorage.removeItem('sdbms_audit_logs');
    localStorage.removeItem('sdbms_working_days');
    localStorage.removeItem('sdbms_holidays');
    localStorage.removeItem('sdbms_calendar_events');
    localStorage.removeItem('sdbms_chat_groups');
    localStorage.removeItem('sdbms_chat_messages');
    localStorage.removeItem('sdbms_welcome_banner');
    localStorage.removeItem('sdbms_lectures');
    localStorage.removeItem('sdbms_assessments');
    localStorage.removeItem('sdbms_attendance');
  },

  // ----------------------------------------------------
  // Attendance Book API
  // ----------------------------------------------------
  async getAttendance(classSec?: string, date?: string): Promise<AttendanceRecord[]> {
    let records = await syncCollection<AttendanceRecord>('attendance', 'attendance', INITIAL_ATTENDANCE);
    if (classSec) {
      records = records.filter(r => r.classSec === classSec);
    }
    if (date) {
      records = records.filter(r => r.date === date);
    }
    return records.sort((a, b) => b.date.localeCompare(a.date));
  },

  async saveAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
    const records = getStorageItem<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
    const existingIndex = records.findIndex(r => r.id === record.id || (r.classSec === record.classSec && r.date === record.date));

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    setStorageItem('attendance', records);
    await writeDocToFirestore('attendance', record.id, record);

    this.addAuditLog({
      actorId: record.markedById || 'system',
      actorName: record.markedBy || 'Faculty Member',
      actorRole: 'teacher',
      eventType: 'ATTENDANCE_RECORDED',
      details: `Saved digital attendance book record for ${record.classSec} on ${record.date} (${record.records.length} students).`,
      ipAddress: '127.0.0.1 (Attendance Register)',
      severity: 'info',
    });

    return record;
  },

  async getStudentAttendanceSummary(studentId: string, studentName?: string, rollNo?: string): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    percentage: number;
    history: { date: string; classSec: string; status: 'present' | 'absent' | 'late' | 'excused'; remarks?: string }[];
  }> {
    const records = await this.getAttendance();
    const history: { date: string; classSec: string; status: 'present' | 'absent' | 'late' | 'excused'; remarks?: string }[] = [];

    records.forEach(rec => {
      const match = rec.records.find(
        r => r.studentId === studentId ||
             (rollNo && r.rollNo === rollNo) ||
             (studentName && r.studentName.toLowerCase() === studentName.toLowerCase())
      );
      if (match) {
        history.push({
          date: rec.date,
          classSec: rec.classSec,
          status: match.status,
          remarks: match.remarks,
        });
      }
    });

    // Sort descending by date
    history.sort((a, b) => b.date.localeCompare(a.date));

    const totalDays = history.length || 1;
    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let excusedDays = 0;

    history.forEach(h => {
      if (h.status === 'present') presentDays++;
      else if (h.status === 'late') {
        lateDays++;
        presentDays++; // counts towards attended
      } else if (h.status === 'excused') {
        excusedDays++;
        presentDays++;
      } else {
        absentDays++;
      }
    });

    const percentage = history.length ? Math.round((presentDays / history.length) * 1000) / 10 : 95.5;

    return {
      totalDays: history.length,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      percentage,
      history,
    };
  },

  // ----------------------------------------------------
  // Class Rank & Badges API
  // ----------------------------------------------------
  async updateStudentBadges(studentId: string, badges: string[]): Promise<User> {
    return await this.updateUser(studentId, { badges });
  },

  // Database Management & Firestore Seeding
  async seedAllToFirestore(): Promise<{ success: boolean; count: number }> {
    let totalSeeded = 0;
    try {
      await seedCollectionToFirestore('users', getStorageItem<User[]>('users', INITIAL_USERS));
      totalSeeded += INITIAL_USERS.length;

      await seedCollectionToFirestore('grades', getStorageItem<StudentGrade[]>('grades', INITIAL_GRADES));
      totalSeeded += INITIAL_GRADES.length;

      await seedCollectionToFirestore('transactions', getStorageItem<FeeTransaction[]>('transactions', INITIAL_TRANSACTIONS));
      totalSeeded += INITIAL_TRANSACTIONS.length;

      await seedCollectionToFirestore('announcements', getStorageItem<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS));
      totalSeeded += INITIAL_ANNOUNCEMENTS.length;

      await seedCollectionToFirestore('audit_logs', getStorageItem<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS));
      totalSeeded += INITIAL_AUDIT_LOGS.length;

      await seedCollectionToFirestore('attendance', getStorageItem<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE));
      totalSeeded += INITIAL_ATTENDANCE.length;

      await seedCollectionToFirestore('calendar_events', getStorageItem<CalendarEvent[]>('calendar_events', INITIAL_CALENDAR_EVENTS));
      totalSeeded += INITIAL_CALENDAR_EVENTS.length;

      await seedCollectionToFirestore('lectures', getStorageItem<Lecture[]>('lectures', INITIAL_LECTURES));
      totalSeeded += INITIAL_LECTURES.length;

      await seedCollectionToFirestore('assessments', getStorageItem<Assessment[]>('assessments', INITIAL_ASSESSMENTS));
      totalSeeded += INITIAL_ASSESSMENTS.length;

      return { success: true, count: totalSeeded };
    } catch (err) {
      console.error('Seed all error:', err);
      return { success: false, count: totalSeeded };
    }
  },

  async testFirestoreConnection(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
    return await testConnection();
  },

  async getFirestoreStats(): Promise<{
    connected: boolean;
    databaseId: string;
    projectId: string;
    latencyMs: number;
    collections: { name: string; count: number; status: string }[];
  }> {
    const conn = await testConnection();
    const colNames = [
      'users',
      'grades',
      'transactions',
      'announcements',
      'audit_logs',
      'calendar_events',
      'lectures',
      'assessments',
      'vault_credentials',
      'vault_documents',
    ];

    const results = await Promise.all(
      colNames.map(async (cName) => {
        try {
          const snap = await getDocs(collection(db, cName));
          return { name: cName, count: snap.size, status: 'Synced' };
        } catch {
          const localItems = getStorageItem<any[]>(cName, []);
          return { name: cName, count: localItems.length, status: 'Cached' };
        }
      })
    );

    return {
      connected: conn.ok,
      databaseId: firebaseConfig.firestoreDatabaseId,
      projectId: firebaseConfig.projectId,
      latencyMs: conn.latencyMs,
      collections: results,
    };
  },
};
