"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  FileBarChart,
  Search,
  Filter,
  Download,
  FileText,
  Table as TableIcon,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
  Printer,
  Share2,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PERFORMANCE_DATA = [
  { cluster: "Luxury", revenue: 84000, yield: 12.4, status: "UP" },
  { cluster: "Modern", revenue: 62000, yield: 9.8, status: "UP" },
  { cluster: "Premium", revenue: 95000, yield: 14.2, status: "UP" },
  { cluster: "Standard", revenue: 38000, yield: 7.4, status: "STABLE" },
];

const REPORTS = [
  { id: 1, title: "Q1 Fiscal Consolidation", date: "Mar 30, 2026", type: "PDF", size: "4.2 MB" },
  { id: 2, title: "Monthly Asset P&L", date: "Mar 28, 2026", type: "XLSX", size: "1.8 MB" },
  { id: 3, title: "Occupancy Density Audit", date: "Mar 25, 2026", type: "PDF", size: "2.4 MB" },
  { id: 4, title: "Maintenance ROI Analysis", date: "Mar 20, 2026", type: "XLSX", size: "3.1 MB" },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("CONSIDERED");

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Strategic{" "}
            <span className="text-secondary-gold font-extrabold italic">
              Reporting
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            EXECUTIVE LEDGER • FISCAL YEAR 2026/Q1
          </p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-foreground">
             <Printer size={18} />
             Print Current
          </button>
          <button className="flex items-center gap-2 bg-secondary-gold text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(233,195,73,0.2)]">
            <Download size={18} />
            Export Hub
          </button>
        </div>
      </section>

      {/* Strategic Momentum Grid */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <Surface level="high" className="p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Cluster Revenue Momentum</h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-secondary-gold" />
                     <span className="text-[9px] font-bold uppercase text-on-surface-variant">Gross ROI</span>
                  </div>
               </div>
            </div>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PERFORMANCE_DATA}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                     <XAxis dataKey="cluster" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f1111', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        cursor={{ fill: '#ffffff05' }}
                     />
                     <Bar dataKey="revenue" radius={[10, 10, 0, 0]} barSize={40}>
                        {PERFORMANCE_DATA.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#e9c349' : '#4edea3'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Surface>

         <Surface level="high" className="p-6 flex flex-col justify-between">
            <div>
               <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-6">Yield Summary Node</h3>
               <div className="space-y-6">
                  {PERFORMANCE_DATA.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-1.5 h-6 rounded-full", i % 2 === 0 ? "bg-secondary-gold" : "bg-primary-emerald")} />
                          <div>
                             <p className="text-[10px] font-bold uppercase text-on-surface-variant">{item.cluster}</p>
                             <p className="text-xs font-extrabold">{item.yield}% Yield</p>
                          </div>
                       </div>
                       <ArrowUpRight size={14} className="text-primary-emerald" />
                    </div>
                  ))}
               </div>
            </div>
            <div className="pt-6 border-t border-white/5 mt-6">
                <button className="w-full py-3 bg-surface-lowest rounded-xl text-[10px] font-extrabold uppercase tracking-widest hover:text-secondary-gold transition-colors">
                   View Detail Audit
                </button>
            </div>
         </Surface>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Performance Ledger */}
         <div className="lg:col-span-8 space-y-6">
            <Surface level="container" className="p-0 overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                   <h2 className="text-sm font-manrope font-extrabold flex items-center gap-2">
                      <TableIcon size={18} className="text-secondary-gold" /> Consolidated Operational Ledger
                   </h2>
                   <div className="flex items-center gap-2 bg-surface-lowest rounded-lg p-1 border border-white/5">
                      {["CONSIDERED", "LIVE", "ARCHIVE"].map(t => (
                        <button 
                         key={t}
                         onClick={() => setActiveTab(t)}
                         className={cn(
                           "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all",
                           activeTab === t ? "bg-surface-high text-secondary-gold" : "text-on-surface-variant hover:text-foreground"
                         )}
                        >
                          {t}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-surface-lowest/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Portfolio Node</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Revenue</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Yield Pulse</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {Array.from({ length: 6 }).map((_, i) => (
                           <tr key={i} className="hover:bg-surface-lowest/30 transition-colors group">
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-surface-high border border-white/5">
                                       <Building2 size={14} className="text-secondary-gold" />
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold">Strategic Asset 0{i + 1}</p>
                                       <p className="text-[9px] font-bold text-on-surface-variant uppercase">Downtown Cluster</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-5 text-right font-manrope font-extrabold text-sm">$42,800.00</td>
                              <td className="px-6 py-5 text-right font-manrope font-extrabold text-sm text-primary-emerald">
                                 <div className="flex items-center justify-end gap-1.5">
                                    12.4% <ArrowUpRight size={14} />
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex justify-center">
                                    <span className="px-3 py-1 bg-primary-emerald/10 text-primary-emerald text-[9px] font-black uppercase rounded-full">Optimal</span>
                                 </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                 <button className="text-on-surface-variant hover:text-secondary-gold transition-colors">
                                    <ChevronRight size={18} />
                                 </button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            </Surface>
         </div>

         {/* Export Hub Sidebar */}
         <div className="lg:col-span-4 space-y-6">
            <Surface level="container" className="p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2.5 rounded-xl bg-secondary-gold/10 text-secondary-gold">
                      <Download size={20} />
                   </div>
                   <h3 className="text-xs font-black uppercase tracking-widest">Asset Export Hub</h3>
                </div>

                <div className="space-y-4">
                   {REPORTS.map((report) => (
                     <div key={report.id} className="p-4 bg-surface-lowest rounded-xl border border-white/5 group hover:border-secondary-gold/30 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                              <FileText size={18} className="text-secondary-gold/50 group-hover:text-secondary-gold transition-colors" />
                              <h4 className="text-sm font-bold truncate pr-2">{report.title}</h4>
                           </div>
                           <span className="text-[9px] font-black bg-surface-high px-2 py-0.5 rounded text-secondary-gold">{report.type}</span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                           <span className="text-[10px] font-bold text-on-surface-variant uppercase">{report.date} • {report.size}</span>
                           <Download size={14} className="text-on-surface-variant group-hover:text-foreground hover:scale-125 transition-all" />
                        </div>
                     </div>
                   ))}
                </div>

                <button className="w-full py-4 bg-linear-to-r from-secondary-gold to-primary-emerald text-surface-container rounded-xl font-black text-xs uppercase tracking-widest mt-8 shadow-premium hover:scale-[1.02] transition-transform">
                   Generate Master Report
                </button>
            </Surface>

            <Surface level="low" className="p-6">
               <div className="flex items-center gap-3 mb-4">
                  <Activity size={20} className="text-primary-emerald" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Real-Time Sync Pulse</h4>
               </div>
               <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  Your Strategic Reports are automatically synchronized with the <span className="text-foreground font-bold">Asset Vault</span> every 24 hours.
               </p>
               <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-surface-lowest rounded-lg text-[9px] font-black uppercase tracking-widest">History</button>
                  <button className="flex-1 py-2 bg-surface-lowest rounded-lg text-[9px] font-black uppercase tracking-widest">Verify</button>
               </div>
            </Surface>
         </div>
      </div>
    </Shell>
  );
}
