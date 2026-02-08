import { Area, Town, Member, LedgerEntry, MemberStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

const PREFIX = 'isp_manager_';

// Initial Data Seeding
const INITIAL_AREAS: Area[] = [
  { id: 'AREA-A', name: 'Area A', color: 'bg-blue-500' },
  { id: 'AREA-B', name: 'Area B', color: 'bg-emerald-500' },
  { id: 'AREA-C', name: 'Area C', color: 'bg-purple-500' },
  { id: 'AREA-D', name: 'Area D', color: 'bg-amber-500' },
];

export const getAreas = (): Area[] => {
  const stored = localStorage.getItem(`${PREFIX}areas`);
  if (!stored) {
    localStorage.setItem(`${PREFIX}areas`, JSON.stringify(INITIAL_AREAS));
    return INITIAL_AREAS;
  }
  return JSON.parse(stored);
};

export const getTowns = (areaId?: string): Town[] => {
  const stored = localStorage.getItem(`${PREFIX}towns`);
  const allTowns: Town[] = stored ? JSON.parse(stored) : [];
  if (areaId) {
    return allTowns.filter(t => t.areaId === areaId);
  }
  return allTowns;
};

export const saveTown = (town: Town): void => {
  const towns = getTowns();
  const index = towns.findIndex(t => t.id === town.id);
  if (index >= 0) {
    towns[index] = town;
  } else {
    towns.push(town);
  }
  localStorage.setItem(`${PREFIX}towns`, JSON.stringify(towns));
};

export const updateTown = (townId: string, updates: Partial<Town>): void => {
  const towns = getTowns();
  const index = towns.findIndex(t => t.id === townId);
  if (index >= 0) {
    towns[index] = { ...towns[index], ...updates };
    localStorage.setItem(`${PREFIX}towns`, JSON.stringify(towns));
  }
};

export const deleteTown = (townId: string): void => {
  // Cascade delete members
  let members = getMembers();
  // Filter out the members to delete
  const townMembers = members.filter(m => m.townId === townId);
  
  // Also clean up ledger for these members
  townMembers.forEach(m => {
      // We don't strictly need to delete ledger entries for performance in localstorage, 
      // but strictly speaking we should. For now, deleting the member is enough 
      // as ledger is accessed via memberId.
  });

  members = members.filter(m => m.townId !== townId);
  localStorage.setItem(`${PREFIX}members`, JSON.stringify(members));

  // Delete town
  let towns = getTowns();
  towns = towns.filter(t => t.id !== townId);
  localStorage.setItem(`${PREFIX}towns`, JSON.stringify(towns));
};

export const getMembers = (townId?: string): Member[] => {
  const stored = localStorage.getItem(`${PREFIX}members`);
  const allMembers: Member[] = stored ? JSON.parse(stored) : [];
  if (townId) {
    return allMembers.filter(m => m.townId === townId);
  }
  return allMembers;
};

export const saveMember = (member: Member): void => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  localStorage.setItem(`${PREFIX}members`, JSON.stringify(members));
};

export const deleteMember = (id: string): void => {
  let members = getMembers();
  // Filter out the member to delete
  members = members.filter(m => m.id !== id);
  localStorage.setItem(`${PREFIX}members`, JSON.stringify(members));
};

export const saveMembersBulk = (newMembers: Member[]): void => {
  const members = getMembers();
  const updatedMembers = [...members, ...newMembers];
  localStorage.setItem(`${PREFIX}members`, JSON.stringify(updatedMembers));
};

export const getLedger = (memberId: string): LedgerEntry[] => {
  const stored = localStorage.getItem(`${PREFIX}ledger`);
  const allEntries: LedgerEntry[] = stored ? JSON.parse(stored) : [];
  return allEntries.filter(e => e.memberId === memberId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addLedgerEntry = (entry: LedgerEntry): void => {
  const stored = localStorage.getItem(`${PREFIX}ledger`);
  const allEntries: LedgerEntry[] = stored ? JSON.parse(stored) : [];
  allEntries.push(entry);
  localStorage.setItem(`${PREFIX}ledger`, JSON.stringify(allEntries));
  
  recalculateMemberBalance(entry.memberId);
};

export const deleteLedgerEntry = (entryId: string, memberId: string): void => {
  const stored = localStorage.getItem(`${PREFIX}ledger`);
  let allEntries: LedgerEntry[] = stored ? JSON.parse(stored) : [];
  
  allEntries = allEntries.filter(e => e.id !== entryId);
  localStorage.setItem(`${PREFIX}ledger`, JSON.stringify(allEntries));

  recalculateMemberBalance(memberId);
};

// Internal helper to ensure member stats are always in sync with ledger
const recalculateMemberBalance = (memberId: string) => {
    const members = getMembers();
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) return;

    const member = members[index];
    // Get updated ledger (we just modified it)
    const stored = localStorage.getItem(`${PREFIX}ledger`);
    const allEntries: LedgerEntry[] = stored ? JSON.parse(stored) : [];
    const entries = allEntries.filter(e => e.memberId === memberId);

    // Reset stats
    member.totalDue = 0;
    member.received = 0;

    entries.forEach(e => {
        if (e.type === 'Bill') {
            member.totalDue += e.amount;
        } else if (e.type === 'Payment') {
            member.received += e.amount;
        } else if (e.type === 'Adjustment') {
             member.totalDue -= e.amount;
        }
    });

    member.balance = member.totalDue - member.received;
    
    // Update last payment date
    const payments = entries.filter(e => e.type === 'Payment').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    member.lastPaymentDate = payments.length > 0 ? payments[0].date : undefined;

    saveMember(member);
}

export const removeLastPayment = (memberId: string): void => {
  const stored = localStorage.getItem(`${PREFIX}ledger`);
  let allEntries: LedgerEntry[] = stored ? JSON.parse(stored) : [];
  
  // Find last payment for this member
  const memberPayments = allEntries
    .map((e, index) => ({ ...e, originalIndex: index }))
    .filter(e => e.memberId === memberId && e.type === 'Payment')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (memberPayments.length > 0) {
    const lastPayment = memberPayments[0];
    const indexToRemove = lastPayment.originalIndex;
    
    // Remove it
    allEntries.splice(indexToRemove, 1);
    localStorage.setItem(`${PREFIX}ledger`, JSON.stringify(allEntries));

    recalculateMemberBalance(memberId);
  }
};

export interface BillingAction {
    memberId: string;
    status: 'Paid' | 'Unpaid' | 'Skip'; // Paid = Bill+Pay, Unpaid = Bill Only, Skip = Nothing
    amount: number;
}

export const processAreaBilling = (monthName: string, actions: BillingAction[]): void => {
    const members = getMembers();
    const storedLedger = localStorage.getItem(`${PREFIX}ledger`);
    const ledger: LedgerEntry[] = storedLedger ? JSON.parse(storedLedger) : [];
    
    // Create a map for faster member lookup
    const memberMap = new Map(members.map(m => [m.id, m]));

    actions.forEach(action => {
        const member = memberMap.get(action.memberId);
        if (!member) return;

        if (action.status === 'Skip') return;

        // 1. Generate Bill (Common for Paid and Unpaid)
        member.totalDue += action.amount;
        
        ledger.push({
            id: uuidv4(),
            memberId: member.id,
            date: new Date().toISOString(),
            type: 'Bill',
            amount: action.amount,
            notes: `Monthly Fee - ${monthName}`
        });

        // 2. Generate Payment (Only for Paid)
        if (action.status === 'Paid') {
            member.received += action.amount;
            member.lastPaymentDate = new Date().toISOString();

            ledger.push({
                id: uuidv4(),
                memberId: member.id,
                date: new Date().toISOString(),
                type: 'Payment',
                amount: action.amount,
                method: 'Cash',
                notes: `Monthly Collection - ${monthName}`
            });
        }

        member.balance = member.totalDue - member.received;
    });

    // Save all changes
    localStorage.setItem(`${PREFIX}members`, JSON.stringify(members));
    localStorage.setItem(`${PREFIX}ledger`, JSON.stringify(ledger));
};

// --- Automatic Billing Logic ---

export const hasBillingRunForMonth = (monthKey: string): boolean => {
    const history = JSON.parse(localStorage.getItem(`${PREFIX}billing_history`) || '[]');
    return history.includes(monthKey);
};

export const markBillingRunForMonth = (monthKey: string): void => {
    const history = JSON.parse(localStorage.getItem(`${PREFIX}billing_history`) || '[]');
    if (!history.includes(monthKey)) {
        history.push(monthKey);
        localStorage.setItem(`${PREFIX}billing_history`, JSON.stringify(history));
    }
};

export const generateMonthlyBills = (monthKey: string): number => {
    // 1. Check if already run
    if (hasBillingRunForMonth(monthKey)) {
        return 0;
    }

    const members = getMembers();
    const storedLedger = localStorage.getItem(`${PREFIX}ledger`);
    const ledger: LedgerEntry[] = storedLedger ? JSON.parse(storedLedger) : [];
    let count = 0;

    // 2. Filter Active Members
    const activeMembers = members.filter(m => m.status === MemberStatus.Active);

    // 3. Process
    activeMembers.forEach(member => {
        if (member.billAmount > 0) {
            count++;
            
            // Update Member Financials
            member.totalDue += member.billAmount;
            member.balance = member.totalDue - member.received;

            // Add Ledger Entry
            ledger.push({
                id: uuidv4(),
                memberId: member.id,
                date: new Date().toISOString(),
                type: 'Bill',
                amount: member.billAmount,
                notes: `Auto Bill - ${monthKey}`
            });
        }
    });

    // 4. Save
    localStorage.setItem(`${PREFIX}members`, JSON.stringify(members));
    localStorage.setItem(`${PREFIX}ledger`, JSON.stringify(ledger));
    markBillingRunForMonth(monthKey);

    return count;
};

// Deprecated global billing (kept for compatibility if needed, but unused in UI now)
export const processMonthlyBilling = (monthName: string): number => {
  return 0; 
};

export const getAggregatedStats = (areaId?: string): {
    totalTowns: number;
    totalMembers: number;
    totalOutstanding: number;
    monthlyBilling: number;
} => {
    const towns = getTowns(areaId);
    const townIds = towns.map(t => t.id);
    const members = getMembers().filter(m => townIds.includes(m.townId));
    
    return {
        totalTowns: towns.length,
        totalMembers: members.length,
        totalOutstanding: members.reduce((acc, m) => acc + m.balance, 0),
        monthlyBilling: members.reduce((acc, m) => acc + (m.status === MemberStatus.Active ? m.billAmount : 0), 0),
    }
}

// --- FEE REGISTER LOGIC ---

interface FeeRecord {
    memberId: string;
    monthKey: string; // YYYY-MM
    ledgerEntryId: string;
    paidDate: string;
    amount: number;
}

export const getFeeRecords = (monthKey: string): FeeRecord[] => {
    const all = JSON.parse(localStorage.getItem(`${PREFIX}fee_records`) || '[]');
    return all.filter((r: FeeRecord) => r.monthKey === monthKey);
}

export const isMemberPaidForMonth = (memberId: string, monthKey: string): boolean => {
    const records = getFeeRecords(monthKey);
    return records.some(r => r.memberId === memberId);
}

export const toggleMonthlyFee = (memberId: string, monthKey: string, amount: number): boolean => {
    const all: FeeRecord[] = JSON.parse(localStorage.getItem(`${PREFIX}fee_records`) || '[]');
    const index = all.findIndex(r => r.memberId === memberId && r.monthKey === monthKey);
    
    const members = getMembers();
    const member = members.find(m => m.id === memberId);
    if (!member) return false;

    if (index >= 0) {
        // Was Paid, Make Unpaid
        const record = all[index];
        // 1. Remove ledger entry
        deleteLedgerEntry(record.ledgerEntryId, memberId);
        // 2. Remove record
        all.splice(index, 1);
        localStorage.setItem(`${PREFIX}fee_records`, JSON.stringify(all));
        return false; // Now Unpaid
    } else {
        // Was Unpaid, Make Paid
        const newLedgerId = uuidv4();
        // 1. Add ledger entry
        addLedgerEntry({
            id: newLedgerId,
            memberId: memberId,
            date: new Date().toISOString(),
            type: 'Payment',
            amount: amount,
            method: 'Cash',
            notes: `Fee Register - ${monthKey}`
        });
        // 2. Add record
        all.push({
            memberId,
            monthKey,
            ledgerEntryId: newLedgerId,
            paidDate: new Date().toISOString(),
            amount: amount
        });
        localStorage.setItem(`${PREFIX}fee_records`, JSON.stringify(all));
        return true; // Now Paid
    }
}