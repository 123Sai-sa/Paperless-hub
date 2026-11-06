import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  Download,
  Printer,
  ShieldCheck,
  Search,
  CheckCircle2,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { FeeTransaction, User } from '../types';

interface FeeLedgerViewProps {
  transactions: FeeTransaction[];
  currentUser: User;
  onRecordTransaction: (tx: Omit<FeeTransaction, 'id' | 'receiptNo' | 'verificationHash' | 'date'>) => Promise<FeeTransaction>;
}

export const FeeLedgerView: React.FC<FeeLedgerViewProps> = ({
  transactions,
  currentUser,
  onRecordTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<FeeTransaction | null>(null);

  // Form State
  const [formStudentName, setFormStudentName] = useState('Sai Anandam K.');
  const [formStudentId, setFormStudentId] = useState('u-stud-01');
  const [formClassSec, setFormClassSec] = useState('Class 10-A');
  const [formCategory, setFormCategory] = useState<FeeTransaction['category']>('Tuition Fee');
  const [formAmount, setFormAmount] = useState('18500');
  const [formMethod, setFormMethod] = useState<FeeTransaction['paymentMethod']>('UPI');
  const [formNotes, setFormNotes] = useState('Term-2 tuition fee paid online.');

  const canRecord = ['admin', 'accountant'].includes(currentUser.role);

  const filteredTx = transactions.filter((t) => {
    if (currentUser.role === 'student' && !t.studentName.includes('Sai') && t.studentId !== currentUser.id) {
      return false;
    }
    if (currentUser.role === 'parent' && !t.studentName.includes('Sai')) {
      return false;
    }
    return (
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalSum = filteredTx.reduce((acc, t) => acc + t.amount, 0);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName || !formAmount) return;

    await onRecordTransaction({
      studentId: formStudentId,
      studentName: formStudentName,
      classSec: formClassSec,
      category: formCategory,
      amount: parseFloat(formAmount) || 0,
      paymentMethod: formMethod,
      status: 'verified',
      cashierName: `${currentUser.fullName} (${currentUser.role.toUpperCase()})`,
      notes: formNotes,
    });
    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ['Receipt No', 'Student Name', 'Class', 'Category', 'Amount', 'Method', 'Date', 'Verification Hash'];
    const rows = filteredTx.map((t) => [
      t.receiptNo,
      t.studentName,
      t.classSec,
      t.category,
      t.amount,
      t.paymentMethod,
      new Date(t.date).toLocaleDateString(),
      t.verificationHash,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SDBMS_Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>Digital Fee Ledger & Verified Receipts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Eliminates multi-copy carbon receipt slips with cryptographic tamper-evident hashes. Instant audit reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>

          {canRecord && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue Digital Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase">Filtered Collections</div>
          <div className="text-2xl font-black text-white mt-1">₹ {totalSum.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">100% Digital Reconciliation</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase">Vouchers Issued</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{filteredTx.length} Verified Slips</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zero carbon paper books used</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase">Verification Algorithm</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">SHA-256 HMAC</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tamper-evident audit compliance</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search receipt, student or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method & Date</th>
                <th className="py-3 px-4">Verification Hash</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {tx.receiptNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{tx.studentName}</div>
                    <div className="text-[10px] text-slate-400">{tx.classSec}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                    ₹ {tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200">{tx.paymentMethod}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-indigo-400">
                    {tx.verificationHash.slice(0, 16)}...
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveReceipt(tx)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Voucher</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Fee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              Issue Digital Fee Voucher
            </h2>

            <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={formStudentName}
                  onChange={(e) => setFormStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Class & Section
                  </label>
                  <input
                    type="text"
                    value={formClassSec}
                    onChange={(e) => setFormClassSec(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Amount (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Fee Head
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500"
                  >
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Laboratory Fee">Laboratory Fee</option>
                    <option value="Library Deposit">Library Deposit</option>
                    <option value="Hostel Boarding">Hostel Boarding</option>
                    <option value="Exam Fee">Exam Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Payment Gateway / Method
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                    <option value="Cash Voucher">Cash Voucher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Reconciliation Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500"
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  Generate Verified Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cryptographic Verified Receipt Voucher Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            {/* Stamp / Watermark */}
            <div className="absolute right-6 top-6 px-3 py-1 border-2 border-emerald-600 rounded-lg text-emerald-700 font-mono font-bold text-xs uppercase tracking-widest rotate-6 select-none">
              VERIFIED • ZERO PAPER
            </div>

            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/sai_anandam_real_logo.png"
                  alt="Sri Sathya Sai Anandam School"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                    Sri Sathya Sai Anandam School • Bursar Treasury
                  </div>
                  <h2 className="text-xl font-serif font-black uppercase tracking-tight mt-0.5">
                    Official Electronic Fee Receipt
                  </h2>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Receipt #{activeReceipt.receiptNo}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs py-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student Name</span>
                <strong className="text-slate-900">{activeReceipt.studentName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Class & Section</span>
                <span className="font-semibold text-slate-800">{activeReceipt.classSec}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fee Classification</span>
                <span className="font-semibold text-slate-800">{activeReceipt.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Gateway</span>
                <span className="font-semibold text-slate-800">{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction Timestamp</span>
                <span className="font-semibold text-slate-800">{new Date(activeReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-800">Total Paid Amount</span>
                <strong className="text-emerald-700 font-black text-base">₹ {activeReceipt.amount.toLocaleString()}</strong>
              </div>
            </div>

            {/* Notes */}
            {activeReceipt.notes && (
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2">
                <strong>Notes:</strong> {activeReceipt.notes}
              </div>
            )}

            {/* Cryptographic hash box */}
            <div className="mt-4 p-3 bg-slate-900 text-white rounded-xl text-[10px] font-mono">
              <div className="text-slate-400">Cryptographic Verification Signature:</div>
              <div className="text-amber-400 break-all mt-0.5">{activeReceipt.verificationHash}</div>
              <div className="text-slate-500 text-[9px] mt-1">
                Issued by: {activeReceipt.cashierName} • Direct SDBMS Blockchain/Ledger Hash
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
