import { Member, Town } from '../types';
import * as XLSX from 'xlsx';

export const exportTownToExcel = (town: Town, members: Member[]) => {
  const data = members.map(m => ({
    'ID': m.sno,
    'Name': m.name,
    'Contact': m.contactNo,
    'Package (Mbps)': m.packageMbps,
    'Monthly Bill': m.billAmount,
    'Previous Pending': m.previousPending,
    'Total Due': m.totalDue,
    'Received': m.received,
    'Balance': m.balance,
    'Status': m.status,
    'Address': m.address || '',
    'Notes': m.notes || '',
    'Join Date': new Date(m.joinDate).toLocaleDateString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-width columns
  const wscols = [
    { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, 
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
    { wch: 10 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 15 }
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
  
  const safeName = town.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  XLSX.writeFile(workbook, `${safeName}_members_${new Date().toISOString().split('T')[0]}.xlsx`);
};