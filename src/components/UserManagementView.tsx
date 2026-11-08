import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  CheckCircle,
  XCircle,
  KeyRound,
  Trash2,
  Edit2,
  Lock,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  Copy,
  Eye,
  EyeOff,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagementViewProps {
  users: User[];
  onAddUser: (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { id?: string }) => Promise<void>;
  onUpdateUser: (id: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onChangeStudentCredentials?: (
    studentId: string,
    params: {
      newId?: string;
      newRollNo?: string;
      newUsername?: string;
      newPassword?: string;
      apaarId?: string;
      penId?: string;
    }
  ) => Promise<void>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onChangeStudentCredentials,
}) => {
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Dedicated Student Password & ID Credential Modal State
  const [credentialStudent, setCredentialStudent] = useState<User | null>(null);
  const [credNewId, setCredNewId] = useState('');
  const [credNewRollNo, setCredNewRollNo] = useState('');
  const [credNewUsername, setCredNewUsername] = useState('');
  const [credNewPassword, setCredNewPassword] = useState('');
  const [credConfirmPassword, setCredConfirmPassword] = useState('');
  const [credApaarId, setCredApaarId] = useState('');
  const [credPenId, setCredPenId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [credSuccessMsg, setCredSuccessMsg] = useState<string | null>(null);
  const [credErrorMsg, setCredErrorMsg] = useState<string | null>(null);

  // Form State for regular Provision / Edit
  const [formId, setFormId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formClassSec, setFormClassSec] = useState('Class 10-A');
  const [formRollNo, setFormRollNo] = useState('');
  const [formApaarId, setFormApaarId] = useState('');
  const [formPenId, setFormPenId] = useState('');
  const [formNewPassword, setFormNewPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);

  // Status toggle feedback
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  // Register Counts
  const studentCount = users.filter((u) => u.role === 'student').length;
  const teacherCount = users.filter((u) => u.role === 'teacher').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const accountantCount = users.filter((u) => u.role === 'accountant').length;
  const apaarLinkedCount = users.filter((u) => u.apaarId && u.apaarId.trim().length > 0).length;

  const handleToggleStatus = async (user: User) => {
    try {
      setStatusUpdatingId(user.id);
      const nextStatus = user.status === 'active' ? 'suspended' : 'active';
      await onUpdateUser(user.id, { status: nextStatus });
      setStatusSuccessMsg(
        `Account for ${user.fullName} is now ${nextStatus.toUpperCase()}. ${
          nextStatus === 'suspended'
            ? 'Account suspended: user cannot log in.'
            : 'Account active: user can now log in.'
        }`
      );
      setTimeout(() => setStatusSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message || 'Network error'}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesQuery =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.rollNo && u.rollNo.toLowerCase() === searchValSafe(searchQuery)) ||
      (u.apaarId && u.apaarId.includes(searchQuery)) ||
      (u.classSec && u.classSec.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesQuery;
  });

  function searchValSafe(q: string) {
    return q.toLowerCase();
  }

  const handleOpenAddModal = () => {
    setFormId('');
    setFormFullName('');
    setFormUsername('');
    setFormRole('student');
    setFormEmail('');
    setFormPhone('');
    setFormClassSec('Class 10-A');
    setFormRollNo('');
    setFormApaarId('');
    setFormPenId('');
    setFormNewPassword('sai123');
    setFormConfirmPassword('sai123');
    setShowFormPassword(false);
    setFormErrorMsg(null);
    setIsAddModalOpen(true);
  };

  const handleGenerateFormPassword = () => {
    const adjectives = ['Prasanthi', 'Anandam', 'Dharma', 'Sathya', 'Prema', 'Vidya', 'Shanti'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const pass = `${adj}#${num}!`;
    setFormNewPassword(pass);
    setFormConfirmPassword(pass);
  };

  const handleExportRegisterCSV = () => {
    const headers = ['Institutional ID', 'Full Legal Name', 'Role', 'Username', 'Email', 'Phone', 'Class/Section', 'Roll No', 'APAAR ID', 'PEN ID', 'Status'];
    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.fullName.replace(/"/g, '""')}"`,
      `"${u.role.toUpperCase()}"`,
      `"${u.username}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      `"${u.classSec || ''}"`,
      `"${u.rollNo || ''}"`,
      `"${u.apaarId || ''}"`,
      `"${u.penId || ''}"`,
      `"${u.status.toUpperCase()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const roleLabel = selectedRole === 'all' ? 'All_Institutional_Register' : `${selectedRole.toUpperCase()}_Register`;
    link.setAttribute('download', `Sri_Sathya_Sai_Anandam_${roleLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenCredentialsModal = (user: User) => {
    setCredentialStudent(user);
    setCredNewId(user.id);
    setCredNewRollNo(user.rollNo || '');
    setCredNewUsername(user.username);
    setCredNewPassword('');
    setCredConfirmPassword('');
    setCredApaarId(user.apaarId || '');
    setCredPenId(user.penId || '');
    setShowPassword(false);
    setCopiedNotification(false);
    setCredSuccessMsg(null);
    setCredErrorMsg(null);
  };

  const generateStrongPassword = () => {
    const adjectives = ['Prasanthi', 'Anandam', 'Dharma', 'Sathya', 'Prema', 'Shanti', 'Vidya'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const pass = `${adj}#${num}!`;
    setCredNewPassword(pass);
    setCredConfirmPassword(pass);
    setCredErrorMsg(null);
  };

  const handleCopyCredentials = () => {
    if (!credNewPassword) return;
    const info = `Sri Sathya Sai Portal Credentials:\nName: ${credentialStudent?.fullName} (${credentialStudent?.role})\nInstitutional ID: ${credNewId}\nUsername: ${credNewUsername}\nPassword: ${credNewPassword}`;
    navigator.clipboard.writeText(info);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialStudent) return;
    setCredErrorMsg(null);

    if (!credNewId.trim()) {
      setCredErrorMsg('Account System ID cannot be empty.');
      return;
    }

    if (!credNewUsername.trim()) {
      setCredErrorMsg('Login Username cannot be empty.');
      return;
    }

    if (credNewPassword && credNewPassword !== credConfirmPassword) {
      setCredErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    if (credNewPassword && credNewPassword.length < 4) {
      setCredErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    try {
      if (onChangeStudentCredentials) {
        await onChangeStudentCredentials(credentialStudent.id, {
          newId: credNewId.trim(),
          newRollNo: credNewRollNo.trim(),
          newUsername: credNewUsername.trim(),
          newPassword: credNewPassword.trim() || undefined,
          apaarId: credApaarId.trim(),
          penId: credPenId.trim(),
        });
      } else {
        await onUpdateUser(credentialStudent.id, {
          rollNo: credNewRollNo.trim(),
          username: credNewUsername.trim(),
          apaarId: credApaarId.trim(),
          penId: credPenId.trim(),
          ...(credNewPassword.trim() ? { password: credNewPassword.trim() } : {}),
        });
      }

      setCredSuccessMsg(`Credentials for ${credentialStudent.fullName} updated and active immediately!`);
      setTimeout(() => {
        setCredentialStudent(null);
        setCredSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setCredErrorMsg(err.message || 'Failed to update credentials.');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg(null);
    if (!formFullName.trim() || !formUsername.trim() || !formEmail.trim()) {
      setFormErrorMsg('Please fill in Name, Username, and Email.');
      return;
    }

    if (!editingUser) {
      if (!formNewPassword || formNewPassword.trim().length < 4) {
        setFormErrorMsg('Password must be at least 4 characters long.');
        return;
      }
      if (formNewPassword !== formConfirmPassword) {
        setFormErrorMsg('Password and Confirm Password do not match.');
        return;
      }
      if (users.some((u) => u.username.toLowerCase() === formUsername.trim().toLowerCase())) {
        setFormErrorMsg(`Username "${formUsername.trim()}" is already registered. Please choose a different username.`);
        return;
      }
      if (users.some((u) => u.email.toLowerCase() === formEmail.trim().toLowerCase())) {
        setFormErrorMsg(`Email "${formEmail.trim()}" is already registered. Please provide a different email.`);
        return;
      }
      if (formId.trim() && users.some((u) => u.id.toLowerCase() === formId.trim().toLowerCase())) {
        setFormErrorMsg(`Institutional ID "${formId.trim()}" is already assigned to another user.`);
        return;
      }
    }

    try {
      if (editingUser) {
        await onUpdateUser(editingUser.id, {
          fullName: formFullName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || undefined,
          role: formRole,
          classSec: formClassSec.trim(),
          rollNo: formRollNo.trim() || undefined,
          apaarId: formApaarId.trim() || undefined,
          penId: formPenId.trim() || undefined,
          ...(formNewPassword.trim() ? { password: formNewPassword.trim() } : {}),
        });
        setEditingUser(null);
      } else {
        await onAddUser({
          id: formId.trim() || undefined,
          fullName: formFullName.trim(),
          username: formUsername.trim(),
          role: formRole,
          email: formEmail.trim(),
          phone: formPhone.trim() || undefined,
          classSec: formClassSec.trim(),
          rollNo: formRollNo.trim() || undefined,
          apaarId: formApaarId.trim() || undefined,
          penId: formPenId.trim() || undefined,
          status: 'active',
          twoFactorEnabled: formRole === 'admin',
          password: formNewPassword.trim(),
        });
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      setFormErrorMsg(err.message || 'Failed to save user.');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormUsername(user.username);
    setFormRole(user.role);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormClassSec(user.classSec || '');
    setFormRollNo(user.rollNo || '');
    setFormApaarId(user.apaarId || '');
    setFormPenId(user.penId || '');
    setFormNewPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Institutional User Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Governing identity, role credentials, and government APAAR/PEN registries across Sri Sathya Sai Anandam.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, APAAR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Role Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {(['all', 'admin', 'teacher', 'student', 'accountant'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                selectedRole === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Status Update Feedback Alert */}
      {statusSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{statusSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusSuccessMsg(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User & Identifier</th>
                <th className="py-3.5 px-4">Institutional Role</th>
                <th className="py-3.5 px-4">Class & Identifiers</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Status & 2FA</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">
                      {user.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      @{user.username}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        user.role === 'admin'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : user.role === 'teacher'
                          ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                          : user.role === 'student'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">
                      {user.classSec || 'Campus Staff'}
                    </div>
                    {user.apaarId && (
                      <div className="text-[10px] text-indigo-400 font-mono">
                        APAAR: {user.apaarId}
                      </div>
                    )}
                    {user.penId && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        PEN: {user.penId}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-300">{user.email}</div>
                    <div className="text-[10px] text-slate-400">{user.phone || '—'}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={statusUpdatingId === user.id}
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          user.status === 'active'
                            ? 'bg-emerald-500/15 hover:bg-rose-500/25 text-emerald-300 hover:text-rose-300 border border-emerald-500/30 hover:border-rose-500/40'
                            : 'bg-rose-500/20 hover:bg-emerald-500/25 text-rose-300 hover:text-emerald-300 border border-rose-500/40 hover:border-emerald-500/40'
                        } ${statusUpdatingId === user.id ? 'opacity-50 cursor-wait' : ''}`}
                        title={user.status === 'active' ? 'Click to SUSPEND this user (block login)' : 'Click to ACTIVATE this user (allow login)'}
                      >
                        {statusUpdatingId === user.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                        ) : user.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Active</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-0.5">⇄ Suspend</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Suspended</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-0.5">⇄ Activate</span>
                          </>
                        )}
                      </button>
                      {user.twoFactorEnabled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800">
                          2FA
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenCredentialsModal(user)}
                        className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
                        title={`Change ID & Password for ${user.fullName} (${user.role})`}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Change ID & Pass</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Edit User Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to permanently delete user ${user.fullName}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingUser ? `Edit User: ${editingUser.fullName}` : 'Provision New Institutional User'}
            </h2>

            {formErrorMsg && (
              <div className="mb-4 p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Login Identifier
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingUser)}
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. anand_sharma"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Role Privilege
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="accountant">Accountant / Bursar</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Class & Section
                  </label>
                  <input
                    type="text"
                    value={formClassSec}
                    onChange={(e) => setFormClassSec(e.target.value)}
                    placeholder="Class 10-A"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@sdbms.sai.edu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98450 ..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {formRole === 'student' && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Roll No</label>
                    <input
                      type="text"
                      value={formRollNo}
                      onChange={(e) => setFormRollNo(e.target.value)}
                      placeholder="10A-20"
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">APAAR ID</label>
                    <input
                      type="text"
                      value={formApaarId}
                      onChange={(e) => setFormApaarId(e.target.value)}
                      placeholder="9021-..."
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">PEN ID</label>
                    <input
                      type="text"
                      value={formPenId}
                      onChange={(e) => setFormPenId(e.target.value)}
                      placeholder="PEN-KA-..."
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Student Password & ID Management Modal (Admin Control) */}
      {credentialStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Admin Security Control
                  </span>
                  <span className="text-xs text-slate-400 capitalize">{credentialStudent.role} Credentials</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Change ID & Password: {credentialStudent.fullName}</span>
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Target: <span className="text-white font-semibold">{credentialStudent.fullName}</span> • Role: <span className="text-amber-300 font-bold uppercase">{credentialStudent.role}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCredentialStudent(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {credErrorMsg && (
              <div className="mb-4 p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{credErrorMsg}</span>
              </div>
            )}

            {credSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{credSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              {/* Account System ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Account System ID (Primary Key)
                </label>
                <input
                  type="text"
                  required
                  value={credNewId}
                  onChange={(e) => setCredNewId(e.target.value)}
                  placeholder="e.g. admin or u-staff-01 or STD-2026-001"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Changing this ID safely cascades across audit logs, gradebooks, transactions, and session logins.
                </p>
              </div>

              {/* Roll No and Username */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Class Roll No / Staff Code
                  </label>
                  <input
                    type="text"
                    value={credNewRollNo}
                    onChange={(e) => setCredNewRollNo(e.target.value)}
                    placeholder="e.g. 10A-14 or ADM-01"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Portal Login Username
                  </label>
                  <input
                    type="text"
                    required
                    value={credNewUsername}
                    onChange={(e) => setCredNewUsername(e.target.value)}
                    placeholder="e.g. admin or student_sai"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* New Password with Generator & Visibility Toggle */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    New Account Password
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credNewPassword}
                    onChange={(e) => setCredNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password unchanged"
                    className="w-full pl-3 pr-20 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {credNewPassword && (
                      <button
                        type="button"
                        onClick={handleCopyCredentials}
                        className="p-1 text-slate-400 hover:text-emerald-400 cursor-pointer"
                        title="Copy credentials"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {copiedNotification && (
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Credentials copied to clipboard! Share securely with user.</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credConfirmPassword}
                    onChange={(e) => setCredConfirmPassword(e.target.value)}
                    placeholder="Retype password to confirm"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* APAAR ID & PEN ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Government APAAR ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={credApaarId}
                    onChange={(e) => setCredApaarId(e.target.value)}
                    placeholder="9021-3849-5501"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Permanent Education No (PEN)
                  </label>
                  <input
                    type="text"
                    value={credPenId}
                    onChange={(e) => setCredPenId(e.target.value)}
                    placeholder="PEN-KA-2024-9182"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCredentialStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update User Credentials & ID</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
