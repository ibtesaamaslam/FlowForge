import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowDownLeft, ArrowUpRight, Banknote, Calculator, Wallet, Check, AlertTriangle } from 'lucide-react';
import { Member, LedgerEntry } from '../types';
import { getLedger, addLedgerEntry } from '../services/storageService';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  member: Member;
  onClose: () => void;
  onUpdate: () => void;
  onDeleteEntry?: (id: string) => void;
}

const MemberLedger: React.FC<Props> = ({ member, onClose, onUpdate, onDeleteEntry }) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Online'>('Cash');
  const [payNotes, setPayNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Refresh ledger on mount or when member details change
  useEffect(() => {
    setEntries(getLedger(member.id));
  }, [member.id, member.balance, member.totalDue, member.received]);

  // --- Visualization Logic ---
  // New Logic: Payments prioritize clearing the LATEST bill first.
  
  // 1. Find the latest bill
  const bills = entries.filter(e => e.type === 'Bill');
  // Ledger is sorted by date desc, so first bill is latest
  const lastBill = bills.length > 0 ? bills[0] : null;

  let currentBillLabel = "CURRENT BILL";
  let currentBillTotal = 0;
  let currentBillOutstanding = 0;
  let previousDues = 0;
  let isAdvance = false;

  if (lastBill) {
      const billDate = new Date(lastBill.date);
      const monthName = billDate.toLocaleString('default', { month: 'short' }).toUpperCase();
      currentBillLabel = `BILL OF ${monthName}`;
      currentBillTotal = lastBill.amount;

      // 2. Calculate payments made AFTER or ON the bill date (Current Month Payments)
      const paymentsSinceBill = entries
        .filter(e => e.type === 'Payment' && new Date(e.date).getTime() >= billDate.getTime())
        .reduce((sum, e) => sum + e.amount, 0);
      
      // 3. Current Bill Outstanding = Bill Amount - Recent Payments (min 0)
      currentBillOutstanding = Math.max(0, currentBillTotal - paymentsSinceBill);
      
      // 4. Previous Dues = Total Balance - Current Outstanding
      // If Balance is 1200 and Current Outstanding is 0 (paid), Previous is 1200.
      // If Balance is 1700 and Current Outstanding is 500, Previous is 1200.
      previousDues = member.balance - currentBillOutstanding;
  } else {
      // No bills ever generated (fallback)
      previousDues = member.balance;
      currentBillLabel = "NO BILL YET";
  }

  // Handle Advance (Negative Previous Dues)
  if (previousDues < 0) {
      isAdvance = true;
      previousDues = Math.abs(previousDues);
  }

  const isFullyPaid = member.balance <= 0;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) return;

    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    const entry: LedgerEntry = {
        id: uuidv4(),
        memberId: member.id,
        date: new Date().toISOString(),
        type: 'Payment',
        amount: amount,
        method: payMethod,
        notes: payNotes || 'Manual Payment'
    };

    addLedgerEntry(entry);
    setPayAmount('');
    setPayNotes('');
    setShowPayForm(false);
    onUpdate(); // Trigger parent refresh
    setShowSuccessModal(true);
  };

  const handleQuickPay = (amount: number) => {
      setPayAmount(amount.toString());
      setShowPayForm(true);
  }

  const handleDelete = (id: string) => {
      if (onDeleteEntry) {
          onDeleteEntry(id);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
       
       {/* Success Overlay */}
       {showSuccessModal && (
         <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <Check size={40} strokeWidth={4} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 tracking-tight">Payment Received!</h3>
                 <p className="text-slate-500 mt-2 font-medium">The account has been updated successfully.</p>
                 <button 
                    onClick={() => setShowSuccessModal(false)} 
                    className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg"
                 >
                    Done
                 </button>
            </div>
         </div>
       )}

       {/* Modal Content */}
       <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden ring-1 ring-white/50">
          
          {/* Header */}
          <div className="flex justify-between items-center p-5 bg-white border-b border-slate-200 shrink-0">
             <div>
                <h2 className="text-2xl font-bold text-slate-800">{member.name}</h2>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold mr-2">ID: {member.sno}</span> 
                    <span className="flex items-center text-blue-600 font-medium">
                        <Wallet size={14} className="mr-1"/> {member.packageMbps} Mbps Plan
                    </span>
                </div>
             </div>
             <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X size={20}/>
             </button>
          </div>

          {/* VISUALIZATION SECTION */}
          <div className="p-6 shrink-0 bg-white">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Current Dues Breakdown</h3>
              
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  
                  {/* 1. Previous Pending / Advance */}
                  <div className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-between relative overflow-hidden ${isAdvance ? 'bg-green-50 border-green-100' : (previousDues > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100')}`}>
                      <div className="relative z-10">
                          <span className={`text-xs font-extrabold uppercase tracking-wide ${isAdvance ? 'text-green-600' : (previousDues > 0 ? 'text-red-600' : 'text-slate-400')}`}>
                              {isAdvance ? 'Advance Credit' : 'Previous Pending'}
                          </span>
                          <div className={`text-3xl font-bold mt-1 ${isAdvance ? 'text-green-700' : (previousDues > 0 ? 'text-slate-800' : 'text-slate-300')}`}>
                              PKR {previousDues.toLocaleString()}
                          </div>
                          <p className="text-xs text-slate-500 mt-2 font-medium">
                              {isAdvance ? 'Overpaid amount' : (previousDues > 0 ? 'Remains from past months' : 'No old dues pending')}
                          </p>
                      </div>
                      {!isAdvance && previousDues > 0 && <ArrowUpRight className="absolute right-4 bottom-4 text-red-200 w-12 h-12" />}
                      {isAdvance && <Check className="absolute right-4 bottom-4 text-green-200 w-12 h-12" />}
                  </div>

                  {/* Plus Sign (Hidden if Advance) */}
                  {!isAdvance && (
                      <div className="flex items-center justify-center text-slate-300">
                          <Plus size={24} strokeWidth={3} />
                      </div>
                  )}

                  {/* 2. Current Month */}
                  <div className={`flex-1 border-2 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden ${currentBillOutstanding > 0 ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className="relative z-10">
                          <span className={`text-xs font-extrabold uppercase tracking-wide ${currentBillOutstanding > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                              {currentBillLabel}
                          </span>
                          <div className={`text-3xl font-bold mt-1 ${currentBillOutstanding > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                              {currentBillOutstanding > 0 ? `PKR ${currentBillOutstanding.toLocaleString()}` : 'Paid'}
                          </div>
                           <p className="text-xs text-slate-500 mt-2 font-medium">
                              Original Bill: PKR {currentBillTotal.toLocaleString()}
                          </p>
                      </div>
                      <Calculator className={`absolute right-4 bottom-4 w-12 h-12 ${currentBillOutstanding > 0 ? 'text-blue-200' : 'text-slate-200'}`} />
                  </div>

                  {/* Equals Sign */}
                  <div className="flex items-center justify-center text-slate-300">
                      <div className="text-2xl font-bold">=</div>
                  </div>

                  {/* 3. Total Payable */}
                  <div className={`flex-[1.2] p-5 rounded-2xl shadow-lg flex flex-col justify-between text-white relative overflow-hidden ${member.balance > 0 ? 'bg-slate-800' : 'bg-green-600'}`}>
                      <div className="relative z-10">
                          <span className="text-xs font-extrabold uppercase tracking-wide opacity-80">
                              Total Payable Now
                          </span>
                          <div className="text-4xl font-bold mt-1 tracking-tight">
                              PKR {Math.max(0, member.balance).toLocaleString()}
                          </div>
                          {member.balance > 0 ? (
                              <button 
                                onClick={() => handleQuickPay(member.balance)}
                                className="mt-4 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center w-fit"
                              >
                                  <Banknote size={16} className="mr-2 text-green-600"/> Clear Full Dues
                              </button>
                          ) : (
                              <div className="mt-4 flex items-center font-bold bg-white/20 w-fit px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm">
                                  <Check size={16} className="mr-2" strokeWidth={3}/> Fully Paid
                              </div>
                          )}
                      </div>
                      {member.balance > 0 && <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>}
                  </div>
              </div>
          </div>

          {/* Ledger Table Container */}
          <div className="flex-1 overflow-auto bg-slate-50 p-6 border-t border-slate-200">
             
             {/* Add Payment Form */}
             {showPayForm ? (
                <form onSubmit={handlePayment} className="bg-white p-5 rounded-xl shadow-md border border-blue-200 mb-6 animate-in slide-in-from-top-4">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-800 text-lg flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">
                            <Banknote size={18} />
                          </div>
                          Record Payment
                      </h4>
                      <button type="button" onClick={() => setShowPayForm(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full"><X size={20}/></button>
                   </div>
                   <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                          <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">PKR</span>
                              <input 
                                  type="number" 
                                  required
                                  min="1"
                                  value={payAmount}
                                  onChange={e => setPayAmount(e.target.value)}
                                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-green-500 bg-white text-slate-900"
                                  placeholder="0.00"
                                  autoFocus
                              />
                          </div>
                      </div>
                      <div className="w-full md:w-48">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Method</label>
                          <select 
                              value={payMethod}
                              onChange={(e) => setPayMethod(e.target.value as any)}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                          >
                              <option value="Cash">Cash Handover</option>
                              <option value="Online">Online Transfer</option>
                          </select>
                      </div>
                      <div className="flex-[2]">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes (Optional)</label>
                          <input 
                              value={payNotes}
                              onChange={e => setPayNotes(e.target.value)}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                              placeholder="e.g. Paid by brother"
                          />
                      </div>
                      <div className="flex items-end">
                          <button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                              Confirm Payment
                          </button>
                      </div>
                   </div>
                </form>
             ) : (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 text-lg">Transaction History</h3>
                    <div className="flex gap-2">
                        {isFullyPaid ? (
                            <div className="flex items-center text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                                <Check size={18} className="mr-2" />
                                Paid until next month
                            </div>
                        ) : (
                            <button 
                                onClick={() => { setPayAmount(currentBillOutstanding > 0 ? currentBillOutstanding.toString() : ''); setShowPayForm(true); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center transition-all active:scale-95 hover:shadow-lg"
                            >
                                <Plus size={18} className="mr-1.5"/> Receive Payment
                            </button>
                        )}
                    </div>
                </div>
             )}

             {/* Entries List */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4 text-right">Debit (Bill)</th>
                            <th className="px-6 py-4 text-right">Credit (Received)</th>
                            <th className="px-6 py-4 text-center w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/50">
                                    No transaction history found for this subscriber.
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-mono text-xs font-medium">
                                        {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start">
                                            <div className={`mt-0.5 mr-3 p-1.5 rounded-full shrink-0 ${entry.type === 'Payment' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {entry.type === 'Payment' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${entry.type === 'Payment' ? 'text-green-700' : 'text-slate-700'}`}>
                                                    {entry.type === 'Payment' ? 'Payment Received' : entry.notes.includes('Opening') ? 'Opening Balance' : 'Monthly Bill Generated'}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5 font-medium">{entry.notes} {entry.method ? `• ${entry.method}` : ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {(entry.type === 'Bill' || entry.type === 'Adjustment') && (
                                            <span className="font-bold text-slate-700">PKR {entry.amount.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {entry.type === 'Payment' && (
                                            <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">PKR {entry.amount.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {onDeleteEntry && (
                                            <button 
                                                onClick={() => handleDelete(entry.id)}
                                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Transaction"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};

export default MemberLedger;