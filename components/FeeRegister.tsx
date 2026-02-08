import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Calendar } from 'lucide-react';
import { Town, Member, MemberStatus } from '../types';
import * as Storage from '../services/storageService';

interface Props {
  town: Town;
  members: Member[];
  onBack: () => void;
  onRefresh: () => void;
}

const FeeRegister: React.FC<Props> = ({ town, members, onBack, onRefresh }) => {
  // Default to current month YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get records for this month
  const feeRecords = Storage.getFeeRecords(selectedMonth);
  const paidMemberIds = new Set(feeRecords.map(r => r.memberId));

  const filteredMembers = useMemo(() => {
    return members
        .filter(m => m.status === MemberStatus.Active) // Only active members usually
        .filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.sno.toString().includes(searchTerm)
        )
        .sort((a, b) => a.sno - b.sno);
  }, [members, searchTerm]);

  const stats = {
      paid: filteredMembers.filter(m => paidMemberIds.has(m.id)).length,
      unpaid: filteredMembers.filter(m => !paidMemberIds.has(m.id)).length
  };

  const handleToggle = (member: Member) => {
      Storage.toggleMonthlyFee(member.id, selectedMonth, member.billAmount);
      onRefresh(); // Refresh parent data (ledgers etc)
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-in fade-in duration-300">
      
      {/* Header Area */}
      <div className="p-6">
        <div className="flex items-center text-slate-500 mb-4 cursor-pointer hover:text-slate-800 transition-colors" onClick={onBack}>
             <ArrowLeft size={20} className="mr-2" />
             <span className="font-semibold">Back to Town</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Fee Register - <span className="text-blue-600">{town.name}</span></h1>

        <div className="flex flex-col md:flex-row gap-6">
            
            {/* Controls Box */}
            <div className="bg-white p-6 rounded-xl flex-1 border border-slate-200 shadow-sm">
                 <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Month</label>
                         <input 
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg outline-none font-bold border border-slate-300 focus:ring-2 focus:ring-blue-500"
                         />
                     </div>
                     <div className="flex-[2]">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Member</label>
                         <div className="relative">
                            <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5"/>
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or ID..."
                                className="w-full bg-white text-slate-900 pl-10 pr-4 py-3 rounded-lg outline-none font-medium border border-slate-300 focus:ring-2 focus:ring-blue-500"
                            />
                         </div>
                     </div>
                 </div>
            </div>

            {/* Summary Box */}
            <div className="bg-white p-6 rounded-xl w-full md:w-80 border border-slate-200 shadow-sm flex flex-col justify-center">
                 <h3 className="text-slate-500 font-bold text-sm uppercase mb-4 text-center">Summary for {selectedMonth}</h3>
                 <div className="flex justify-around items-center">
                      <div className="text-center">
                          <div className="text-4xl font-bold text-green-600 mb-1">{stats.paid}</div>
                          <div className="text-xs font-bold text-slate-400 uppercase">Paid</div>
                      </div>
                      <div className="h-10 w-px bg-slate-200"></div>
                      <div className="text-center">
                          <div className="text-4xl font-bold text-red-600 mb-1">{stats.unpaid}</div>
                          <div className="text-xs font-bold text-slate-400 uppercase">Unpaid</div>
                      </div>
                 </div>
            </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-sm font-bold uppercase tracking-wider">
                      <tr>
                          <th className="px-6 py-4 border-b border-slate-200">Member</th>
                          <th className="px-6 py-4 text-center border-b border-slate-200">Status</th>
                          <th className="px-6 py-4 text-right border-b border-slate-200">Mark Fee</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredMembers.map(member => {
                          const isPaid = paidMemberIds.has(member.id);
                          return (
                              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 mr-4 text-xs">
                                              {member.sno}
                                          </div>
                                          <div>
                                              <div className="font-bold text-slate-900 text-lg">{member.name}</div>
                                              <div className="text-sm text-slate-400 font-mono">ID: {member.sno.toString().padStart(3, '0')}</div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                          isPaid 
                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                      }`}>
                                          {isPaid ? 'Paid' : 'Unpaid'}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="flex justify-end">
                                          <label className="relative inline-flex items-center cursor-pointer">
                                              <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={isPaid}
                                                onChange={() => handleToggle(member)}
                                              />
                                              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                                          </label>
                                      </div>
                                  </td>
                              </tr>
                          );
                      })}
                      {filteredMembers.length === 0 && (
                          <tr>
                              <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic">
                                  No active members found.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  );
};

export default FeeRegister;