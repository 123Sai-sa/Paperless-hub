import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  FileText,
  Upload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Download,
  Search,
  Filter,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  Globe,
  FolderLock,
  ShieldCheck,
} from 'lucide-react';
import { User, VaultCredential, VaultDocument } from '../types';
import { sdbmsApi } from '../services/api';

interface PrivateVaultViewProps {
  currentUser: User;
}

export const PrivateVaultView: React.FC<PrivateVaultViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'documents'>('credentials');
  
  // Credentials State
  const [credentials, setCredentials] = useState<VaultCredential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credSearch, setCredSearch] = useState('');
  const [showCredModal, setShowCredModal] = useState(false);
  const [editingCred, setEditingCred] = useState<VaultCredential | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New/Edit Credential Form State
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<VaultCredential['category']>('Education');
  const [notes, setNotes] = useState('');
  const [credError, setCredError] = useState('');

  // Documents State
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<VaultDocument['category']>('Certificate');
  const [docNotes, setDocNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [docError, setDocError] = useState('');
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Credentials & Documents
  const loadVaultData = async () => {
    try {
      setLoadingCreds(true);
      const creds = await sdbmsApi.getVaultCredentials(currentUser.id);
      setCredentials(creds);
    } catch (err) {
      console.error('Failed to load vault credentials:', err);
    } finally {
      setLoadingCreds(false);
    }

    try {
      setLoadingDocs(true);
      const docs = await sdbmsApi.getVaultDocuments(currentUser.id);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load vault documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadVaultData();
  }, [currentUser.id]);

  // Copy helper with feedback
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open Credential Modal
  const openNewCredModal = () => {
    setEditingCred(null);
    setSiteName('');
    setSiteUrl('');
    setLoginId('');
    setPassword('');
    setCategory('Education');
    setNotes('');
    setCredError('');
    setShowCredModal(true);
  };

  const openEditCredModal = (cred: VaultCredential) => {
    setEditingCred(cred);
    setSiteName(cred.siteName);
    setSiteUrl(cred.siteUrl || '');
    setLoginId(cred.loginId);
    setPassword(cred.password);
    setCategory(cred.category || 'Education');
    setNotes(cred.notes || '');
    setCredError('');
    setShowCredModal(true);
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim() || !loginId.trim() || !password.trim()) {
      setCredError('Site / Service Name, Login ID, and Password are required.');
      return;
    }

    try {
      const credData: VaultCredential = {
        id: editingCred?.id || `cred_${Date.now()}`,
        userId: currentUser.id,
        siteName: siteName.trim(),
        siteUrl: siteUrl.trim() || undefined,
        loginId: loginId.trim(),
        password: password.trim(),
        category,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      await sdbmsApi.saveVaultCredential(credData);
      setShowCredModal(false);
      loadVaultData();
    } catch (err: any) {
      setCredError(err.message || 'Failed to save credentials.');
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this credential?')) return;
    try {
      await sdbmsApi.deleteVaultCredential(id);
      loadVaultData();
    } catch (err) {
      console.error('Delete credential error:', err);
    }
  };

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setDocError('Only PDF documents are accepted in this secure locker.');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setDocError('PDF file size must not exceed 10 MB.');
      return;
    }

    setDocError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`;
      setSelectedFile({
        name: file.name,
        size: sizeStr,
        dataUrl,
      });
      if (!docTitle.trim()) {
        setDocTitle(file.name.replace(/\.pdf$/i, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      setDocError('Document title is required.');
      return;
    }
    if (!selectedFile) {
      setDocError('Please upload a PDF file.');
      return;
    }

    try {
      const docData: VaultDocument = {
        id: `doc_${Date.now()}`,
        userId: currentUser.id,
        title: docTitle.trim(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: 'application/pdf',
        fileData: selectedFile.dataUrl,
        category: docCategory,
        notes: docNotes.trim() || undefined,
        uploadDate: new Date().toISOString(),
      };

      await sdbmsApi.saveVaultDocument(docData);
      setShowDocModal(false);
      setSelectedFile(null);
      setDocTitle('');
      setDocNotes('');
      loadVaultData();
    } catch (err: any) {
      setDocError(err.message || 'Failed to save document.');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this PDF document from your vault?')) return;
    try {
      await sdbmsApi.deleteVaultDocument(id);
      loadVaultData();
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  // Filtered lists
  const filteredCredentials = credentials.filter((c) => {
    const q = credSearch.toLowerCase();
    return (
      c.siteName.toLowerCase().includes(q) ||
      c.loginId.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.siteUrl && c.siteUrl.toLowerCase().includes(q))
    );
  });

  const filteredDocuments = documents.filter((d) => {
    const q = docSearch.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.fileName.toLowerCase().includes(q) ||
      (d.category && d.category.toLowerCase().includes(q))
    );
  });

  return (
    <div id="private-vault-view" className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <span className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Confidential Private Vault
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Isolated & Encrypted
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Your personal, private digital locker to record site login IDs & passwords and store confidential PDF certificates and documents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'credentials' ? (
              <button
                type="button"
                onClick={openNewCredModal}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Site Credentials</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setDocTitle('');
                  setDocNotes('');
                  setDocError('');
                  setShowDocModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload PDF Document</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'credentials'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Site Passwords & IDs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {credentials.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Documents & Certificates</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {documents.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Credentials List */}
      {activeTab === 'credentials' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search site, ID, or category..."
                value={credSearch}
                onChange={(e) => setCredSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <span>{filteredCredentials.length} saved credential{filteredCredentials.length === 1 ? '' : 's'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                🔒 AES-256 Storage
              </span>
            </div>
          </div>

          {loadingCreds ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading your private credentials...
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Site Credentials Stored Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Keep your login credentials for online portals, educational portals (NPTEL, Swayam, Coursera), exams, or personal sites safely recorded here.
              </p>
              <button
                type="button"
                onClick={openNewCredModal}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Credential</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCredentials.map((cred) => {
                const isVisible = visiblePasswords[cred.id];
                return (
                  <div
                    key={cred.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm leading-tight">
                              {cred.siteName}
                            </h4>
                            {cred.siteUrl && (
                              <a
                                href={cred.siteUrl.startsWith('http') ? cred.siteUrl : `https://${cred.siteUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[170px]"
                              >
                                <span className="truncate">{cred.siteUrl.replace(/^https?:\/\//i, '')}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>

                        {cred.category && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                            {cred.category}
                          </span>
                        )}
                      </div>

                      {/* Login ID Box */}
                      <div className="mt-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 space-y-2 text-xs">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 flex items-center justify-between">
                            <span>Username / ID</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(cred.loginId, `user_${cred.id}`)}
                              className="text-slate-400 hover:text-amber-400 transition cursor-pointer"
                              title="Copy Username"
                            >
                              {copiedId === `user_${cred.id}` ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[9px]">
                                  <Check className="w-3 h-3" /> Copied
                                </span>
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="font-mono text-slate-200 text-xs select-all break-all">
                            {cred.loginId}
                          </div>
                        </div>

                        {/* Password Box */}
                        <div className="pt-2 border-t border-slate-800/60">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 flex items-center justify-between">
                            <span>Password</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(cred.id)}
                                className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
                                title={isVisible ? 'Hide Password' : 'Show Password'}
                              >
                                {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(cred.password, `pass_${cred.id}`)}
                                className="text-slate-400 hover:text-amber-400 transition cursor-pointer"
                                title="Copy Password"
                              >
                                {copiedId === `pass_${cred.id}` ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[9px]">
                                    <Check className="w-3 h-3" /> Copied
                                  </span>
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="font-mono text-xs select-all text-amber-300">
                            {isVisible ? cred.password : '••••••••••••'}
                          </div>
                        </div>
                      </div>

                      {cred.notes && (
                        <p className="text-[11px] text-slate-400 mt-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                          {cred.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] mt-2">
                      <span className="text-[10px] text-slate-500">
                        {new Date(cred.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCredModal(cred)}
                          className="px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCredential(cred.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                          title="Delete Credential"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PDF Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search PDF title or category..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-indigo-400 transition"
              />
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <span>{filteredDocuments.length} document{filteredDocuments.length === 1 ? '' : 's'} stored</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                📄 PDF Secure Locker
              </span>
            </div>
          </div>

          {loadingDocs ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading your private documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No PDF Documents Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Upload confidential PDF documents such as Aadhaar cards, APAAR ID certificates, marksheet backups, or fee payment receipts safely to your account.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setDocTitle('');
                  setDocNotes('');
                  setDocError('');
                  setShowDocModal(true);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Your First PDF</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-white text-sm truncate leading-tight">
                            {doc.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                            {doc.fileName}
                          </span>
                        </div>
                      </div>

                      {doc.category && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {doc.category}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-400">
                      <span>Size: <strong className="text-slate-200">{doc.fileSize}</strong></span>
                      <span>Uploaded: <strong className="text-slate-200">{new Date(doc.uploadDate).toLocaleDateString()}</strong></span>
                    </div>

                    {doc.notes && (
                      <p className="text-[11px] text-slate-400 mt-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                        {doc.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <a
                        href={doc.fileData}
                        download={doc.fileName}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                      title="Delete PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Add/Edit Site Credential */}
      {showCredModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>{editingCred ? 'Edit Site Credential' : 'Record New Site Credential'}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter login details for external websites, portals, or educational platforms. Only accessible from your account.
            </p>

            {credError && (
              <div className="mb-4 bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{credError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredential} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Site or Service Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swayam, NPTEL, DigiLocker, Coursera"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Website URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://swayam.gov.in"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Login ID / Username / Email *
                  </label>
                  <input
                    type="text"
                    placeholder="Username or email ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400 transition font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400 transition cursor-pointer"
                >
                  <option value="Education">Educational Portal (NPTEL, Swayam, Coursera)</option>
                  <option value="Examination">Examination & Competitive Portal</option>
                  <option value="Scholarship">Scholarship & Grant Portal</option>
                  <option value="Identity">Government Identity (DigiLocker, APAAR)</option>
                  <option value="Hostel">Hostel & Campus Mess Service</option>
                  <option value="Other">Other Personal / Utility Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Private Notes / Security Clues (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional remarks or recovery questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCredModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  {editingCred ? 'Save Changes' : 'Save Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Upload PDF Document */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              <span>Upload PDF Document to Vault</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Securely store certificates, ID cards, hall tickets, and marksheets. Files are strictly kept confidential in your vault.
            </p>

            {docError && (
              <div className="mb-4 bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{docError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDocument} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select PDF File *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950/60 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center">
                        <Check className="w-3.5 h-3.5" />
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{selectedFile.size}</p>
                      <span className="text-[10px] text-indigo-400 underline mt-1 block">Click to change file</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        Click to select PDF document
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        PDF format up to 10 MB supported
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. APAAR ID Card, Class 10 Certificate, Hall Ticket"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-indigo-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-indigo-400 transition cursor-pointer"
                >
                  <option value="Certificate">Certificate / Award</option>
                  <option value="APAAR & Identity">APAAR / Aadhaar Identity Document</option>
                  <option value="Admit Card / Hall Ticket">Admit Card / Examination Hall Ticket</option>
                  <option value="Fee Receipt">Fee Receipt / Financial Challan</option>
                  <option value="Hostel Pass / Slip">Hostel Gate Pass / Permission Slip</option>
                  <option value="Study Notes">Study Notes / Curriculum PDF</option>
                  <option value="Other">Other Confidential PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Reference number or description..."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-indigo-400 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PDF Document Preview */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="font-bold text-sm sm:text-base">{previewDoc.title}</h3>
                <span className="text-[11px] text-slate-400">{previewDoc.fileName} • {previewDoc.fileSize}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={previewDoc.fileData}
                download={previewDoc.fileName}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-300 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 mt-3 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 relative">
            <iframe
              src={previewDoc.fileData}
              title={previewDoc.title}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};
