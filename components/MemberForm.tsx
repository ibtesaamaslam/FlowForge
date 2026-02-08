import React, { useState } from 'react';
import { X, Save, User, Phone, MapPin, Wifi } from 'lucide-react';
import { Member, MemberStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  townId: string;
  nextSno: number;
  onClose: () => void;
  onSave: (member: Member) => void;
}

const MemberForm: React.FC<Props> = ({ townId, nextSno, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    idCardNumber: '',
    packageMbps: 5,
    billAmount: 500,
    previousPending: 0,
    address: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = Number(formData.packageMbps) || 0;
    const bill = Number(formData.billAmount) || 0;
    const pending = Number(formData.previousPending) || 0;
    
    // We set initial financial stats to 0 here because we will use 
    // the ledger system to initialize them properly in the parent handler
    // to avoid double-counting.
    const newMember: Member = {
      id: uuidv4(),
      townId,
      sno: nextSno,
      name: formData.name,
      contactNo: formData.contactNo,
      idCardNumber: formData.idCardNumber,
      packageMbps: pkg,
      billAmount: bill,
      previousPending: pending,
      totalDue: 0, 
      received: 0,
      balance: 0,
      status: MemberStatus.Active,
      joinDate: new Date().toISOString(),
      address: formData.address,
      notes: formData.notes
    };
    onSave(newMember);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Add New Subscriber
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name *</label>
              <div className="relative">
                <input
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white text-slate-900"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number *</label>
              <div className="relative">
                 <Phone className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                 <input
                  name="contactNo"
                  required
                  value={formData.contactNo}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  placeholder="Mobile No"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ID Card No</label>
              <input
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Package (Mbps)</label>
              <div className="relative">
                 <Wifi className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                 <input
                  type="number"
                  name="packageMbps"
                  min="1"
                  value={formData.packageMbps}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Bill</label>
               <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">PKR</span>
                  <input
                    type="number"
                    name="billAmount"
                    min="0"
                    value={formData.billAmount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  />
               </div>
            </div>

            <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prev. Pending</label>
               <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">PKR</span>
                  <input
                    type="number"
                    name="previousPending"
                    min="0"
                    value={formData.previousPending}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  />
               </div>
            </div>

            <div className="col-span-2">
               <div className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Total Due on Creation:</span>
                  <span className="text-lg font-bold text-slate-900">
                    PKR {(Number(formData.billAmount) || 0) + (Number(formData.previousPending) || 0)}
                  </span>
               </div>
               <p className="text-xs text-slate-400 mt-1">This will be calculated automatically in the system ledger.</p>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address / Location</label>
              <div className="relative">
                 <MapPin className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                 <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  placeholder="Street, House No..."
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notes</label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white text-slate-900"
                placeholder="Additional comments..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-4">
             <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm"
             >
               Cancel
             </button>
             <button
               type="submit"
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center shadow-md transition-all hover:shadow-lg"
             >
               <Save size={16} className="mr-2" />
               Save Subscriber
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;