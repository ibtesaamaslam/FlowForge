import { Member, MemberStatus } from '../types';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

interface ParsedTownBlock {
  townName: string;
  members: Partial<Member>[];
}

// Heuristics based on "01. Pawan Media" pattern
const isTownHeader = (cellValue: any): boolean => {
  if (typeof cellValue !== 'string') return false;
  return /^\d{2}\.\s+/.test(cellValue);
};

// Normalize "5 Mb" -> 5
const parsePackage = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const match = val.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  }
  return 0;
};

// Split "John Doe 9876543210" -> { name: "John Doe", contact: "9876543210" }
const parseNamePhone = (val: any): { name: string; contact: string } => {
  if (!val) return { name: 'Unknown', contact: '' };
  const str = String(val).trim();
  
  // Try to find the last sequence of digits that looks like a phone number (7-15 digits)
  const phoneMatch = str.match(/(\d{7,15})$/);
  
  if (phoneMatch) {
    const contact = phoneMatch[0];
    const name = str.substring(0, str.lastIndexOf(contact)).trim();
    return { name: name || 'Unknown', contact };
  }
  
  return { name: str, contact: '' };
};

export const parseExcelFile = async (file: File): Promise<ParsedTownBlock[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        const blocks: ParsedTownBlock[] = [];
        let currentTown: ParsedTownBlock | null = null;

        // Iterate rows
        // Typical structure: SNo | Name Phone | Package | Bill | Pending | Total | Received | Balance
        // We look for Town Header in Col 1 (Index 1) usually, or if merged sometimes Col 0. 
        // Based on user prompt: "01. Pawan Media" followed by rows.

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const col0 = row[0]; // Usually SNo
            const col1 = row[1]; // Usually Name or Town Header

            // Check for Town Header
            if (isTownHeader(col1)) {
                if (currentTown) {
                    blocks.push(currentTown);
                }
                currentTown = {
                    townName: String(col1).replace(/^\d{2}\.\s*/, '').trim(),
                    members: []
                };
                continue;
            }

            // Check for Member Row (Col0 is numeric SNo)
            if (currentTown && typeof col0 === 'number') {
                const { name, contact } = parseNamePhone(col1);
                const pkg = parsePackage(row[2]);
                const bill = Number(row[3]) || 0;
                const pending = Number(row[4]) || 0;
                const total = Number(row[5]) || 0;
                const received = Number(row[6]) || 0;
                // Balance is row[7], but we can recompute to be safe, or take Excel's truth
                const balance = Number(row[7]) || (total - received);

                const newMember: Partial<Member> = {
                    sno: Number(col0),
                    name,
                    contactNo: contact,
                    packageMbps: pkg,
                    billAmount: bill,
                    previousPending: pending,
                    totalDue: total,
                    received: received,
                    balance: balance,
                    status: MemberStatus.Active,
                    joinDate: new Date().toISOString(), // Default to now for import
                    townId: '' // Set later
                };
                currentTown.members.push(newMember);
            }
        }
        
        if (currentTown) {
            blocks.push(currentTown);
        }

        resolve(blocks);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};