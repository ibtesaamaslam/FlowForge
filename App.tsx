import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, Users, ArrowLeft, FileSpreadsheet, 
  Map as MapIcon, ChevronRight, Check, X, Clock, Trash2, Plus, Edit2
} from 'lucide-react';
import { Area, Town, Member, DashboardStats, MemberStatus } from './types';
import * as Storage from './services/storageService';
import MemberLedger from './components/MemberLedger';
import ImportWizard from './components/ImportWizard';
import MemberForm from './components/MemberForm';
import DashboardView from './components/DashboardView';
import TownView from './components/TownView';
import BillingModal from './components/BillingModal';
import ConfirmationModal, { ConfirmationVariant } from './components/ConfirmationModal';
import ToastContainer, { ToastMessage } from './components/Toast';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'area' | 'town' | 'import'>('dashboard');
  const [activeArea, setActiveArea] = useState<Area | null>(null);
  const [activeTown, setActiveTown] = useState<Town | null>(null);

  // Modal State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: ConfirmationVariant;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Editing State (Town)
  const [editingTownId, setEditingTownId] = useState<string | null>(null);
  const [editingTownName, setEditingTownName] = useState('');

  // Data State
  const [areas, setAreas] = useState<Area[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalTowns: 0, totalMembers: 0, totalOutstanding: 0, monthlyBilling: 0 });

  // Ledger Modal
  const [ledgerMember, setLedgerMember] = useState<Member | null>(null);

  // Initial Load
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setAreas(Storage.getAreas());
    setTowns(Storage.getTowns());
    setMembers(Storage.getMembers());
    setStats(Storage.getAggregatedStats());
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Navigation ---

  const goHome = () => {
    setCurrentView('dashboard');
    setActiveArea(null);
    setActiveTown(null);
    refreshData();
  };

  const openArea = (area: Area) => {
    setActiveArea(area);
    setCurrentView('area');
  };

  const openTown = (town: Town) => {
    setActiveTown(town);
    setCurrentView('town');
  };

  // --- Actions ---

  const handleCreateTown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArea) return;
    const form = e.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('townName') as HTMLInputElement;
    const name = nameInput.value.trim();
    
    if (name) {
      // Check for duplicate
      const existing = towns.find(t => t.name.toLowerCase() === name.toLowerCase() && t.areaId === activeArea.id);
      if (existing) {
          addToast('error', 'A town with this name already exists in this area.');
          return;
      }

      const newTown: Town = {
        id: uuidv4(),
        areaId: activeArea.id,
        name,
        slug: name.toLowerCase().replace(/\s/g, '-'),
        createdAt: new Date().toISOString(),
        active: true
      };
      Storage.saveTown(newTown);
      nameInput.value = '';
      refreshData();
      addToast('success', 'Town created successfully.');
    }
  };

  const handleStartEditTown = (e: React.MouseEvent, town: Town) => {
    e.stopPropagation();
    setEditingTownId(town.id);
    setEditingTownName(town.name);
  };

  const handleSaveTownName = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editingTownId && editingTownName.trim()) {
        Storage.updateTown(editingTownId, { name: editingTownName.trim() });
        setEditingTownId(null);
        refreshData();
        addToast('success', 'Town name updated.');
    }
  };

  const handleCancelEditTown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTownId(null);
  };

  // Confirmation Helper
  const confirmAction = (
    title: string, 
    message: string, 
    action: () => void, 
    options: { confirmLabel?: string, variant?: ConfirmationVariant } = {}
  ) => {
      setConfirmModal({
          isOpen: true,
          title,
          message,
          confirmLabel: options.confirmLabel || 'Delete',
          variant: options.variant || 'danger',
          onConfirm: () => {
              action();
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleDeleteTown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    confirmAction(
        'Delete Town',
        'Are you sure you want to delete this town? All associated subscribers and their financial records will be permanently deleted. This action cannot be undone.',
        () => {
            Storage.deleteTown(id);
            refreshData();
            addToast('success', 'Town and associated data deleted.');
        }
    );
  };

  const handleDeleteMember = (id: string) => {
    confirmAction(
        'Delete Subscriber',
        'Are you sure you want to delete this subscriber? All billing history and payment records will be permanently lost.',
        () => {
             Storage.deleteMember(id);
             refreshData();
             addToast('success', 'Subscriber record deleted.');
        }
    );
  };

  const handleSaveMember = (newMember: Member) => {
    Storage.saveMember(newMember);
    
    // Initial Ledger Setup
    if (newMember.previousPending > 0) {
      Storage.addLedgerEntry({
        id: uuidv4(),
        memberId: newMember.id,
        date: new Date().toISOString(),
        type: 'Bill',
        amount: newMember.previousPending,
        notes: 'Opening Balance'
      });
    }
    if (newMember.billAmount > 0) {
      Storage.addLedgerEntry({
         id: uuidv4(),
         memberId: newMember.id,
         date: new Date().toISOString(),
         type: 'Bill',
         amount: newMember.billAmount,
         notes: 'Initial Bill'
      });
    }

    refreshData();
    setShowMemberForm(false);
    addToast('success', 'Subscriber added successfully.');
  };

  const handleAutoBilling = (monthKey: string) => {
      confirmAction(
          'Run Automatic Billing',
          `Are you sure you want to generate bills for all active members for ${monthKey}? This will add the monthly fee to their ledger balance.`,
          () => {
              const count = Storage.generateMonthlyBills(monthKey);
              refreshData();
              addToast('success', `Generated bills for ${count} active subscribers.`);
          },
          {
              confirmLabel: 'Generate Bills',
              variant: 'primary'
          }
      );
  };

  // Views Logic
  const getAreaTowns = () => {
    if (!activeArea) return [];
    return towns.filter(t => t.areaId === activeArea.id);
  };

  const getTownMembers = () => {
    if (!activeTown) return [];
    return members.filter(m => m.townId === activeTown.id);
  };

  // Ledger Delete
  const handleDeleteLedgerEntry = (entryId: string) => {
      confirmAction(
          'Delete Transaction',
          'Are you sure you want to remove this transaction record?',
          () => {
             if (ledgerMember) {
                 Storage.deleteLedgerEntry(entryId, ledgerMember.id);
                 // Need to refresh ledger member object to update balance in modal
                 const updatedMembers = Storage.getMembers();
                 const updated = updatedMembers.find(m => m.id === ledgerMember.id);
                 if (updated) setLedgerMember(updated);
                 refreshData();
                 addToast('success', 'Transaction deleted.');
             }
          }
      );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
        
        {/* Sidebar */}
        <div className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300">
            <div className="p-6 flex items-center justify-center lg:justify-start">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/50">
                   <Users className="text-white" size={24}/>
               </div>
               <span className="ml-3 font-bold text-lg hidden lg:block tracking-tight">ISP Manager</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <button 
                    onClick={goHome}
                    className={`w-full flex items-center p-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                    <LayoutGrid size={20} />
                    <span className="ml-3 font-medium hidden lg:block">Dashboard</span>
                </button>
                <div className="pt-4 pb-2">
                    <p className="px-3 text-xs font-bold text-slate-500 uppercase hidden lg:block mb-2">Service Areas</p>
                    <div className="space-y-1">
                        {areas.map(area => (
                            <button
                                key={area.id}
                                onClick={() => openArea(area)}
                                className={`w-full flex items-center p-3 rounded-xl transition-all ${activeArea?.id === area.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${area.color} mr-3 shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                                <span className="font-medium hidden lg:block truncate">{area.name}</span>
                                {activeArea?.id === area.id && <ChevronRight size={16} className="ml-auto opacity-50 hidden lg:block"/>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-2">
                   <button 
                        onClick={() => setCurrentView('import')}
                        className={`w-full flex items-center p-3 rounded-xl transition-all ${currentView === 'import' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                   >
                       <FileSpreadsheet size={20} className="text-indigo-400" />
                       <span className="ml-3 font-medium hidden lg:block">Import Excel</span>
                   </button>
                </div>
            </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
            
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
                <div className="flex items-center text-sm text-slate-500">
                     <span 
                        onClick={goHome} 
                        className="hover:text-blue-600 cursor-pointer transition-colors"
                     >
                        Home
                     </span>
                     {activeArea && (
                         <>
                            <ChevronRight size={14} className="mx-2"/>
                            <span 
                                onClick={() => openArea(activeArea)}
                                className={`cursor-pointer transition-colors ${currentView === 'area' ? 'font-semibold text-slate-800' : 'hover:text-blue-600'}`}
                            >
                                {activeArea.name}
                            </span>
                         </>
                     )}
                     {activeTown && (
                         <>
                            <ChevronRight size={14} className="mx-2"/>
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                {activeTown.name}
                            </span>
                         </>
                     )}
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 overflow-auto bg-slate-50 relative p-8">
                {currentView === 'dashboard' && (
                    <DashboardView stats={stats} areas={areas} onOpenArea={openArea} onRunBilling={handleAutoBilling} />
                )}

                {currentView === 'import' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full p-1">
                        <ImportWizard 
                            onClose={goHome} 
                            onComplete={() => {
                                refreshData();
                                setCurrentView('dashboard');
                                addToast('success', 'Import completed successfully.');
                            }}
                        />
                    </div>
                )}

                {currentView === 'area' && activeArea && (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900">{activeArea.name}</h2>
                                <p className="text-slate-500 mt-1">Manage towns and connectivity for this region.</p>
                            </div>
                            <form onSubmit={handleCreateTown} className="flex gap-2">
                                <input 
                                    name="townName" 
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white text-slate-900"
                                    placeholder="New Town Name..."
                                    autoComplete="off"
                                />
                                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-all">
                                    <Plus size={18} className="inline mr-1"/> Create Town
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {getAreaTowns().map(town => {
                                const townMembers = members.filter(m => m.townId === town.id);
                                const activeCount = townMembers.filter(m => m.status === MemberStatus.Active).length;
                                const unpaidCount = townMembers.filter(m => m.balance > 0).length;
                                const totalBalance = townMembers.reduce((sum, m) => sum + m.balance, 0);

                                return (
                                    <div 
                                        key={town.id} 
                                        onClick={() => openTown(town)}
                                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <MapIcon size={24} />
                                            </div>
                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                {editingTownId === town.id ? (
                                                     <div className="absolute inset-0 bg-white z-20 flex items-center px-4 space-x-2">
                                                        <input 
                                                            value={editingTownName}
                                                            onChange={e => setEditingTownName(e.target.value)}
                                                            className="flex-1 border border-blue-500 rounded px-2 py-1 text-sm outline-none bg-white text-slate-900"
                                                            autoFocus
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                        <button onClick={handleSaveTownName} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={16}/></button>
                                                        <button onClick={handleCancelEditTown} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={16}/></button>
                                                     </div>
                                                ) : (
                                                    <>
                                                        <button onClick={(e) => handleStartEditTown(e, town)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={(e) => handleDeleteTown(e, town.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{town.name}</h3>
                                        <div className="text-xs text-slate-500 mb-4 flex items-center">
                                            <Clock size={12} className="mr-1"/> Added {new Date(town.createdAt).toLocaleDateString()}
                                        </div>

                                        <div className="space-y-2 border-t border-slate-100 pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Subscribers</span>
                                                <span className="font-semibold text-slate-700">{townMembers.length}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Active</span>
                                                <span className="font-semibold text-green-600">{activeCount}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Outstanding</span>
                                                <span className={`font-bold ${totalBalance > 0 ? 'text-red-500' : 'text-slate-700'}`}>PKR {totalBalance.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {getAreaTowns().length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                    <MapIcon size={48} className="mx-auto mb-4 opacity-50"/>
                                    <p className="text-lg font-medium">No towns in this area yet.</p>
                                    <p className="text-sm mt-1">Create a new town to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentView === 'town' && activeTown && (
                    <div className="h-full -m-8">
                        <TownView 
                            area={activeArea}
                            town={activeTown}
                            members={getTownMembers()}
                            onBack={() => setCurrentView('area')}
                            onAddMember={() => setShowMemberForm(true)}
                            onEditMember={setSelectedMember}
                            onDeleteMember={handleDeleteMember}
                            onViewLedger={setLedgerMember}
                            onRefresh={refreshData}
                        />
                    </div>
                )}
            </main>
        </div>

        {/* Modals & Toasts */}
        {showMemberForm && activeTown && (
            <MemberForm 
                townId={activeTown.id}
                nextSno={getTownMembers().length + 1}
                onClose={() => setShowMemberForm(false)}
                onSave={handleSaveMember}
            />
        )}

        {showBillingModal && activeArea && (
            <BillingModal 
                areaName={activeArea.name}
                members={members.filter(m => towns.filter(t => t.areaId === activeArea.id).map(t => t.id).includes(m.townId))}
                towns={towns}
                onClose={() => setShowBillingModal(false)}
                onComplete={() => {
                    refreshData();
                    setShowBillingModal(false);
                    addToast('success', 'Monthly billing processed successfully.');
                }}
            />
        )}

        {ledgerMember && (
            <MemberLedger 
                member={ledgerMember} 
                onClose={() => setLedgerMember(null)}
                onUpdate={() => {
                    refreshData();
                    // Update the modal's member object reference
                    const updated = Storage.getMembers().find(m => m.id === ledgerMember.id);
                    if (updated) setLedgerMember(updated);
                }}
                onDeleteEntry={handleDeleteLedgerEntry}
            />
        )}

        <ConfirmationModal 
            isOpen={confirmModal.isOpen}
            title={confirmModal.title}
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            confirmLabel={confirmModal.confirmLabel}
            variant={confirmModal.variant}
        />

        <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}