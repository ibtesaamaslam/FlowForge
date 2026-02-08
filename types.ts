export interface Area {
  id: string;
  name: string;
  color: string;
}

export interface Town {
  id: string;
  areaId: string;
  name: string;
  slug: string;
  createdAt: string;
  active: boolean;
  notes?: string;
}

export enum MemberStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Disconnected = 'Disconnected',
}

export interface Member {
  id: string;
  townId: string;
  sno: number;
  name: string;
  contactNo: string;
  idCardNumber?: string;
  packageMbps: number;
  billAmount: number;
  previousPending: number;
  totalDue: number;
  received: number;
  balance: number;
  status: MemberStatus;
  joinDate: string;
  lastPaymentDate?: string;
  address?: string;
  notes?: string;
}

export interface LedgerEntry {
  id: string;
  memberId: string;
  date: string;
  type: 'Bill' | 'Payment' | 'Adjustment';
  amount: number;
  method?: 'Cash' | 'Online' | 'Bank Transfer';
  reference?: string;
  notes?: string;
}

export interface ImportPreviewData {
  townName: string;
  members: Partial<Member>[];
}

export interface DashboardStats {
  totalTowns: number;
  totalMembers: number;
  totalOutstanding: number;
  monthlyBilling: number;
}