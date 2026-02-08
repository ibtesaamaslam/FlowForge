import React, { useState } from 'react';
import { Upload, Check, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx'; // Assuming installed via npm or environment
import { parseExcelFile } from '../services/excelParser';
import { saveTown, saveMembersBulk, addLedgerEntry } from '../services/storageService';
import { Town, Member, MemberStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

const ImportWizard: React.FC<Props> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('AREA-A');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const data = await parseExcelFile(e.target.files[0]);
        setParsedData(data);
        setStep('preview');
      } catch (err) {
        alert('Failed to parse file. Please ensure it matches the template.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImport = async () => {
    setStep('processing');
    setLoading(true);

    try {
        // Simulate async processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        for (const block of parsedData) {
            // Create Town
            const townId = uuidv4();
            const newTown: Town = {
                id: townId,
                areaId: selectedAreaId,
                name: block.townName,
                slug: block.townName.toLowerCase().replace(/\s+/g, '-'),
                createdAt: new Date().toISOString(),
                active: true,
                notes: 'Imported from Excel'
            };
            saveTown(newTown);

            // Create Members
            const membersToSave: Member[] = block.members.map((m: any) => {
                const mId = uuidv4();
                // Create initial ledger entries
                // 1. Previous Pending (if any)
                if (m.previousPending > 0) {
                    addLedgerEntry({
                        id: uuidv4(),
                        memberId: mId,
                        date: new Date().toISOString(),
                        type: 'Bill',
                        amount: m.previousPending,
                        notes: 'Previous Pending Balance (Imported)'
                    });
                }
                // 2. Current Bill
                if (m.billAmount > 0) {
                    addLedgerEntry({
                        id: uuidv4(),
                        memberId: mId,
                        date: new Date().toISOString(),
                        type: 'Bill',
                        amount: m.billAmount,
                        notes: 'Current Month Bill (Imported)'
                    });
                }

                // 3. Payment Received
                if (m.received > 0) {
                     addLedgerEntry({
                        id: uuidv4(),
                        memberId: mId,
                        date: new Date().toISOString(),
                        type: 'Payment',
                        amount: m.received,
                        method: 'Cash',
                        notes: 'Initial Payment (Imported)'
                    });
                }

                return {
                    ...m,
                    id: mId,
                    townId: townId
                } as Member;
            });

            saveMembersBulk(membersToSave);
        }

        onComplete();
    } catch (e) {
        console.error(e);
        alert('Error during import');
    } finally {
        setLoading(false);
    }
  };

  if (step === 'upload') {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
        <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {loading ? (
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        ) : (
            <FileSpreadsheet className="w-16 h-16 text-slate-400 mb-4" />
        )}
        <h3 className="text-lg font-semibold text-slate-700">Upload Excel File</h3>
        <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
          Drag and drop or click to upload. Supports .xlsx files with "Town Header" structure.
        </p>
        <div className="mt-8 text-xs text-slate-400">
            Expected: 01. Town Name (Row) &rarr; SNo, Name Phone, Package, Bill...
        </div>
      </div>
    );
  }

  if (step === 'preview') {
      return (
          <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Import Preview</h2>
                  <div className="flex items-center space-x-4">
                        <select 
                            className="border rounded px-3 py-1 text-sm bg-white text-slate-900"
                            value={selectedAreaId}
                            onChange={(e) => setSelectedAreaId(e.target.value)}
                        >
                            <option value="AREA-A">Import to Area A</option>
                            <option value="AREA-B">Import to Area B</option>
                            <option value="AREA-C">Import to Area C</option>
                            <option value="AREA-D">Import to Area D</option>
                        </select>
                        <button 
                            onClick={handleImport}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Confirm Import
                        </button>
                  </div>
              </div>

              <div className="flex-1 overflow-auto border rounded bg-white shadow-inner p-4">
                  {parsedData.map((block, idx) => (
                      <div key={idx} className="mb-6 border-b pb-4 last:border-0">
                          <h3 className="font-semibold text-lg text-blue-800 mb-2 flex items-center">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">New Town</span>
                              {block.townName}
                              <span className="ml-auto text-sm text-slate-500 font-normal">
                                  {block.members.length} Members found
                              </span>
                          </h3>
                          <div className="overflow-x-auto">
                              <table className="min-w-full text-xs text-left">
                                  <thead className="bg-slate-50 text-slate-500">
                                      <tr>
                                          <th className="px-2 py-1">Name</th>
                                          <th className="px-2 py-1">Phone</th>
                                          <th className="px-2 py-1">Package</th>
                                          <th className="px-2 py-1">Total Due</th>
                                          <th className="px-2 py-1">Balance</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {block.members.slice(0, 5).map((m: any, mi: number) => (
                                          <tr key={mi} className="border-t border-slate-100">
                                              <td className="px-2 py-1 font-medium">{m.name}</td>
                                              <td className="px-2 py-1 text-slate-500">{m.contactNo || '-'}</td>
                                              <td className="px-2 py-1">{m.packageMbps} Mbps</td>
                                              <td className="px-2 py-1">PKR {m.totalDue}</td>
                                              <td className="px-2 py-1 font-bold text-red-600">PKR {m.balance}</td>
                                          </tr>
                                      ))}
                                      {block.members.length > 5 && (
                                          <tr>
                                              <td colSpan={5} className="text-center py-1 text-slate-400 italic">
                                                  ... and {block.members.length - 5} more
                                              </td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold">Importing Data...</h3>
        <p className="text-slate-500">Creating towns and member records.</p>
    </div>
  );
};

export default ImportWizard;