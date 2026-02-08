import React, { useState, useMemo } from 'react';
import { X, Check, Save, Calendar, Search } from 'lucide-react';
import { Member, Town, MemberStatus } from '../types';
import { processAreaBilling, BillingAction } from '../services/storageService';

interface Props {
  areaName: string;
  members: Member[];
  towns: Town[];
  onClose: () => void;
  onComplete: () => void;
}

const BillingModal: React.FC<Props> = ({ areaName, members, towns, onClose, onComplete }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );
  
  // Status: 'Paid' (Bill+Pay), 'Unpaid' (Bill only), 'Skip' (Nothing)
  // Default is 'Unpaid' for active members, 'Skip' for inactive? 
  // User prompt implies "mark just paid or unpaid". Assuming default is Unpaid (Active Debt).
  const [billingStatus, setBillingStatus] = useState<Record<string, 'Paid' | 'Unpaid' | 'Skip'>>(() => {
    const initial: Record<string, 'Paid' | 'Unpaid' | 'Skip'> = {};
    members.forEach(m => {
      // Only bill active members by default
      if (m.status === MemberStatus.Active) {
        initial[m.id] = 'Unpaid';
      } else {
        initial[m.id] = 'Skip';
      }
    });
    return initial;
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = (id: string, status: 'Paid' | 'Unpaid' | 'Skip') => {
    setBillingStatus(prev => ({ ...prev, [id]: status }));
  };

  const handleProcess = () => {
    if (confirm(`Confirm billing processing for ${areaName} - ${selectedMonth}? This will update member balances.`)) {
      const actions: BillingAction[] = members.map(m => ({
        memberId: m.id,
        status: billingStatus[m.id] || 'Skip',
        amount: m.billAmount
      }));

      processAreaBilling(selectedMonth, actions);
      onComplete();
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.contactNo.includes(searchTerm)
    ).sort((a, b) => {
        // Sort by Town Name then Member Name
        const townA = towns.find(t => t.id === a.townId)?.name || '';
        const townB = towns.find(t => t.id === b.townId)?.name || '';
        return townA.localeCompare(townB) || a.name.localeCompare(b.name);
    });
  }, [members, towns, searchTerm]);

  // Statistics for the footer
  const stats = useMemo(() => {
      let paidCount = 0;
      let unpaidCount = 0;
      let skippedCount = 0;
      let totalCollection = 0;
      let totalBilling = 0;

      Object.entries(billingStatus).forEach(([id, status]) => {
          const m = members.find(mem => mem.id === id);
          if (m) {
              if (status === 'Paid') {
                  paidCount++;
                  totalCollection += m.billAmount;
                  totalBilling += m.billAmount;
              } else if (status === 'Unpaid') {
                  unpaidCount++;
                  totalBilling += m.billAmount;
              } else {
                  skippedCount++;
              }
          }
      });
      return { paidCount, unpaidCount, skippedCount, totalCollection, totalBilling };
  }, [billingStatus, members]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <Calendar className="mr-2 text-blue-600" size={24}/>
                    Monthly Billing Sheet
                </h2>
                <p className="text-sm text-slate-500 mt-1">Area: <span className="font-semibold text-slate-700">{areaName}</span></p>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white border border-slate-300 rounded px-3 py-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase mr-2">Billing Month</span>
                    <input 
                        className="text-sm font-medium outline-none text-slate-700 w-32 bg-transparent"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        placeholder="e.g. March 2025"
                    />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
             <div className="relative w-72">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
                 <input 
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                    placeholder="Filter members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>
             <div className="flex space-x-4 text-sm font-medium text-slate-600">
                 <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>Paid (Bill + Collect)</div>
                 <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>Unpaid (Bill Only)</div>
                 <div className="flex items-center"><div className="w-3 h-3 bg-slate-300 rounded-sm mr-2"></div>Skip</div>
             </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 border-b">Member</th>
                            <th className="px-4 py-3 border-b">Town</th>
                            <th className="px-4 py-3 border-b">Package</th>
                            <th className="px-4 py-3 border-b text-right">Fee</th>
                            <th className="px-4 py-3 border-b text-center w-64">Status Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredMembers.map(m => {
                            const status = billingStatus[m.id];
                            const townName = towns.find(t => t.id === m.townId)?.name || 'Unknown';
                            
                            return (
                                <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${status === 'Skip' ? 'opacity-60 bg-slate-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-800">{m.name}</div>
                                        <div className="text-xs text-slate-500">{m.contactNo}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{townName}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                                            {m.packageMbps} Mbps
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-700">PKR {m.billAmount}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex bg-slate-200 rounded p-1">
                                            <button 
                                                onClick={() => handleStatusChange(m.id, 'Paid')}
                                                className={`flex-1 py-1 rounded text-xs font-bold transition-all ${status === 'Paid' ? 'bg-green-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                PAID
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(m.id, 'Unpaid')}
                                                className={`flex-1 py-1 rounded text-xs font-bold transition-all ${status === 'Unpaid' ? 'bg-red-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                UNPAID
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(m.id, 'Skip')}
                                                className={`flex-1 py-1 rounded text-xs font-bold transition-all ${status === 'Skip' ? 'bg-slate-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                SKIP
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div className="flex space-x-6 text-sm">
                <div>
                    <span className="block text-xs text-slate-500 uppercase font-bold">Total Billing</span>
                    <span className="text-lg font-bold text-slate-800">PKR {stats.totalBilling.toLocaleString()}</span>
                </div>
                <div>
                    <span className="block text-xs text-slate-500 uppercase font-bold">Cash Collection</span>
                    <span className="text-lg font-bold text-green-600">PKR {stats.totalCollection.toLocaleString()}</span>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div className="flex flex-col justify-center text-xs text-slate-500">
                    <div>Paid: <span className="font-bold text-slate-800">{stats.paidCount}</span></div>
                    <div>Unpaid: <span className="font-bold text-slate-800">{stats.unpaidCount}</span></div>
                </div>
            </div>

            <div className="flex space-x-3">
                <button 
                    onClick={onClose}
                    className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleProcess}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md flex items-center transition-all active:scale-95"
                >
                    <Save size={18} className="mr-2"/>
                    Process Transactions
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default BillingModal;