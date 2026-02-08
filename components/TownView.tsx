import React, { useState, useMemo } from 'react';
import { 
    ArrowLeft, Download, Plus, Search, Filter, ChevronLeft, ChevronRight, 
    Phone, Edit2, CreditCard, Trash2, Check, X, FileSpreadsheet, MapPin
} from 'lucide-react';
import { Town, Member, Area, MemberStatus } from '../types';
import * as Storage from '../services/storageService';
import { exportTownToExcel } from '../services/csvService';

interface Props {
    area: Area | null;
    town: Town;
    members: Member[];
    onBack: () => void;
    onAddMember: () => void;
    onEditMember: (member: Member) => void;
    onDeleteMember: (id: string) => void;
    onViewLedger: (member: Member) => void;
    onRefresh: () => void;
}

const ITEMS_PER_PAGE = 50;

const TownView: React.FC<Props> = ({ 
    area, town, members, onBack, onAddMember, 
    onEditMember, onDeleteMember, onViewLedger, onRefresh 
}) => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Inline Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Member>>({});

    // Filtering & Sorting
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchesSearch = 
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                m.contactNo.includes(searchTerm) ||
                m.sno.toString().includes(searchTerm);
            
            const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        }).sort((a, b) => a.sno - b.sno);
    }, [members, searchTerm, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    const paginatedMembers = filteredMembers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );

    // Handlers
    const handleExport = () => {
        exportTownToExcel(town, filteredMembers);
    };

    const startEditing = (member: Member) => {
        setEditingId(member.id);
        setEditFormData({ ...member });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const saveEditing = () => {
        if (editingId && editFormData) {
            const original = members.find(m => m.id === editingId);
            if (original) {
                const updatedMember = { ...original, ...editFormData } as Member;
                Storage.saveMember(updatedMember);
                onRefresh();
            }
            setEditingId(null);
            setEditFormData({});
        }
    };

    const handleEditChange = (field: keyof Member, value: any) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const getStatusBadgeColor = (status: MemberStatus) => {
        switch (status) {
          case MemberStatus.Active: return 'bg-green-100 text-green-700 border border-green-200';
          case MemberStatus.Suspended: return 'bg-amber-100 text-amber-700 border border-amber-200';
          case MemberStatus.Disconnected: return 'bg-slate-100 text-slate-600 border border-slate-200';
          default: return 'bg-slate-50 text-slate-500 border border-slate-200';
        }
    };

    return (
        <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20}/>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{town.name}</h2>
                        <div className="flex items-center text-sm text-slate-500 space-x-2 mt-0.5">
                            <span className="font-medium text-blue-600">{area?.name}</span>
                            <span>•</span>
                            <span>{members.length} Total Subscribers</span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleExport}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 flex items-center transition-all shadow-sm"
                    >
                        <FileSpreadsheet size={16} className="mr-2 text-green-600"/> Export Excel
                    </button>
                    <button 
                        onClick={onAddMember}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-md active:scale-95 transition-all"
                    >
                        <Plus size={18} className="mr-2" /> Add Subscriber
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4 flex-1">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"/>
                        <input 
                            placeholder="Search by Name, Phone, ID..." 
                            className="pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full transition-all bg-white text-slate-900"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-3 h-3"/>
                        <select 
                            className="pl-8 pr-8 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:border-slate-400 text-slate-900"
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Statuses</option>
                            <option value={MemberStatus.Active}>Active Only</option>
                            <option value={MemberStatus.Suspended}>Suspended</option>
                            <option value={MemberStatus.Disconnected}>Disconnected</option>
                        </select>
                    </div>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500 mr-2">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-1.5 rounded border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-1.5 rounded border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-semibold tracking-wider shadow-sm">
                        <tr>
                            <th className="px-6 py-3 border-b">ID</th>
                            <th className="px-6 py-3 border-b w-1/4">Subscriber Details</th>
                            <th className="px-6 py-3 border-b">Package</th>
                            <th className="px-6 py-3 border-b text-right">Bill</th>
                            <th className="px-6 py-3 border-b text-right">Prev</th>
                            <th className="px-6 py-3 border-b text-right">Total</th>
                            <th className="px-6 py-3 border-b text-right">Paid</th>
                            <th className="px-6 py-3 border-b text-right">Due</th>
                            <th className="px-6 py-3 border-b text-center">Status</th>
                            <th className="px-6 py-3 border-b text-center w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                        {paginatedMembers.map((member) => {
                             const isEditing = editingId === member.id;
                             
                             return (
                                <tr key={member.id} className={`transition-colors ${isEditing ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                value={editFormData.sno} 
                                                onChange={(e) => handleEditChange('sno', parseInt(e.target.value))}
                                                className="w-12 border border-blue-300 rounded px-1 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                            />
                                        ) : member.sno}
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input 
                                                    value={editFormData.name || ''} 
                                                    onChange={(e) => handleEditChange('name', e.target.value)}
                                                    className="w-full border border-blue-300 rounded px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                                    placeholder="Name"
                                                />
                                                <input 
                                                    value={editFormData.contactNo || ''} 
                                                    onChange={(e) => handleEditChange('contactNo', e.target.value)}
                                                    className="w-full border border-blue-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                                    placeholder="Phone"
                                                />
                                                <input 
                                                    value={editFormData.address || ''} 
                                                    onChange={(e) => handleEditChange('address', e.target.value)}
                                                    className="w-full border border-blue-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                                    placeholder="Address"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{member.name}</div>
                                                <div className="flex items-center text-xs text-slate-500 mt-1">
                                                    <Phone size={10} className="mr-1"/> {member.contactNo}
                                                </div>
                                                {member.address && (
                                                    <div className="flex items-center text-xs text-slate-400 mt-0.5 truncate max-w-[200px]" title={member.address}>
                                                        <MapPin size={10} className="mr-1"/> {member.address}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <div className="flex items-center">
                                                <input 
                                                    type="number"
                                                    value={editFormData.packageMbps ?? 0} 
                                                    onChange={(e) => handleEditChange('packageMbps', parseInt(e.target.value))}
                                                    className="w-16 border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                                />
                                                <span className="ml-1 text-xs text-slate-500">Mbps</span>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                {member.packageMbps} Mbps
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right text-slate-600">
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                value={editFormData.billAmount ?? 0}
                                                onChange={(e) => handleEditChange('billAmount', parseFloat(e.target.value))}
                                                className="w-20 border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-right"
                                            />
                                        ) : `PKR ${member.billAmount}`}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400">
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                value={editFormData.previousPending ?? 0}
                                                onChange={(e) => handleEditChange('previousPending', parseFloat(e.target.value))}
                                                className="w-20 border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-right"
                                            />
                                        ) : `PKR ${member.previousPending}`}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                value={editFormData.totalDue ?? 0}
                                                onChange={(e) => handleEditChange('totalDue', parseFloat(e.target.value))}
                                                className="w-20 border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-right"
                                            />
                                        ) : `PKR ${member.totalDue}`}
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-600 font-medium">
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                value={editFormData.received ?? 0}
                                                onChange={(e) => handleEditChange('received', parseFloat(e.target.value))}
                                                className="w-20 border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-right"
                                            />
                                        ) : `PKR ${member.received}`}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                value={editFormData.balance ?? 0}
                                                onChange={(e) => handleEditChange('balance', parseFloat(e.target.value))}
                                                className="w-20 border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-red-600 font-bold text-right"
                                            />
                                        ) : (
                                            <span className={`font-bold ${member.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                PKR {member.balance}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        {isEditing ? (
                                            <select 
                                                value={editFormData.status} 
                                                onChange={(e) => handleEditChange('status', e.target.value)}
                                                className="border border-blue-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                            >
                                                {Object.values(MemberStatus).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(member.status)}`}>
                                                {member.status}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        {isEditing ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={saveEditing} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors" title="Save">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={cancelEditing} className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors" title="Cancel">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-1">
                                                <button onClick={() => startEditing(member)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => onViewLedger(member)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="History">
                                                    <CreditCard size={16} />
                                                </button>
                                                <button onClick={() => onDeleteMember(member.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                             );
                        })}
                        
                        {filteredMembers.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center text-slate-400">
                                        <Search size={32} className="mb-2 opacity-50"/>
                                        <p className="text-sm font-medium">No members found matching your criteria.</p>
                                        <button onClick={() => {setSearchTerm(''); setStatusFilter('All');}} className="mt-2 text-blue-600 hover:underline text-sm">
                                            Clear Filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TownView;