import React from 'react';
import { Users, CreditCard, AlertCircle, Map, ArrowUpRight } from 'lucide-react';
import { Area, DashboardStats } from '../types';
import * as Storage from '../services/storageService';

const StatCard = ({ title, value, sub, icon: Icon, colorClass, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between transition-transform hover:-translate-y-1 duration-200">
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      {sub && <p className="text-xs text-slate-400 mt-2 flex items-center">{trend && <ArrowUpRight size={12} className="mr-1 text-green-500"/>}{sub}</p>}
    </div>
    <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10 shadow-sm`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

interface Props {
    stats: DashboardStats;
    areas: Area[];
    onOpenArea: (area: Area) => void;
    onRunBilling?: (month: string) => void;
}

const DashboardView: React.FC<Props> = ({ stats, areas, onOpenArea }) => {

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Executive Overview</h2>
                    <p className="text-slate-500 mt-1">Real-time operational metrics and financial status.</p>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Subscribers" 
                    value={stats.totalMembers} 
                    sub="Active Accounts" 
                    icon={Users} 
                    colorClass="bg-blue-500 text-blue-600" 
                    trend={true}
                />
                <StatCard 
                    title="Monthly Revenue" 
                    value={`PKR ${stats.monthlyBilling.toLocaleString()}`} 
                    sub="Recurring Billing" 
                    icon={CreditCard} 
                    colorClass="bg-emerald-500 text-emerald-600" 
                />
                <StatCard 
                    title="Unpaid Balance" 
                    value={`PKR ${stats.totalOutstanding.toLocaleString()}`} 
                    sub="Total Pending Dues" 
                    icon={AlertCircle} 
                    colorClass="bg-red-500 text-red-600" 
                />
                <StatCard 
                    title="Service Coverage" 
                    value={stats.totalTowns} 
                    sub="Active Towns" 
                    icon={Map} 
                    colorClass="bg-purple-500 text-purple-600" 
                />
            </div>

            {/* Area Grid */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <Map className="w-5 h-5 mr-2 text-slate-400"/> Service Areas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {areas.map(area => {
                    const areaStats = Storage.getAggregatedStats(area.id);
                    return (
                    <div 
                        key={area.id}
                        onClick={() => onOpenArea(area)} 
                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all group relative flex flex-col h-full"
                    >
                        <div className={`h-2 w-full ${area.color}`} />
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{area.name}</h4>
                                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Region ID: {area.id}</p>
                                </div>
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">{areaStats.totalTowns} Towns</span>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-slate-50 mt-auto">
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-slate-500 flex items-center"><Users size={16} className="mr-2 text-slate-400"/> Active Members</span>
                                    <span className="font-semibold text-slate-700">{areaStats.totalMembers}</span>
                                </div>
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-slate-500 flex items-center"><AlertCircle size={16} className="mr-2 text-slate-400"/> Unpaid Balance</span>
                                    <span className={`font-bold ${areaStats.totalOutstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        PKR {areaStats.totalOutstanding.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;