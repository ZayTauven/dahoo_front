"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  FolderArchive,
  Search,
  Filter,
  Plus,
  FileText,
  ShieldCheck,
  Lock,
  Download,
  Share2,
  Trash2,
  MoreVertical,
  ChevronRight,
  HardDrive,
  Clock,
  ExternalLink,
  Layers,
  Building2,
  Users,
  DollarSign,
  Briefcase,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const DOCUMENTS = [
  {
    id: 1,
    name: "Skyline_Penthouse_Deed.pdf",
    category: "LEGAL",
    size: "4.2 MB",
    updated: "2 days ago",
    status: "ENCRYPTED",
    type: "PDF",
    icon: Building2,
  },
  {
    id: 2,
    name: "HVAC_Blueprint_V3.dwg",
    category: "TECHNICAL",
    size: "124 MB",
    updated: "1 week ago",
    status: "SECURE",
    type: "CAD",
    icon: Layers,
  },
  {
    id: 3,
    name: "Resident_Agreement_JT.pdf",
    category: "RESIDENT",
    size: "1.8 MB",
    updated: "3h ago",
    status: "ENCRYPTED",
    type: "PDF",
    icon: Users,
  },
  {
    id: 4,
    name: "Fiscal_Audit_2025.xlsx",
    category: "FINANCIAL",
    size: "820 KB",
    updated: "5h ago",
    status: "LOCKED",
    type: "XLSX",
    icon: DollarSign,
  },
  {
    id: 5,
    name: "Staff_Policy_v4.pdf",
    category: "ADMIN",
    size: "2.4 MB",
    updated: "1 month ago",
    status: "ENCRYPTED",
    type: "PDF",
    icon: Briefcase,
  },
];

export default function DocumentsPage() {
  const [activeFolder, setActiveFolder] = useState("All");

  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredData,
  } = useLocalFilter({
    data: DOCUMENTS,
    searchKeys: ["name", "category", "type"],
    initialSort: { key: "name", direction: "asc" },
  });

  const folders = [
    { name: "All", icon: FolderArchive, count: 142 },
    { name: "Legal", icon: Building2, count: 12 },
    { name: "Technical", icon: Layers, count: 48 },
    { name: "Resident", icon: Users, count: 54 },
    { name: "Financial", icon: DollarSign, count: 28 },
  ];

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Asset{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Vault
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            UNIFIED DOCUMENTATION • {filteredData.length} SECURE RECORDS
          </p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-foreground">
             <Layers size={18} />
             Bulk Optimization
          </button>
          <button className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]">
            <Plus size={18} />
            Upload Assets
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
           <Surface level="container" className="p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-6 px-2">
                 <HardDrive size={18} className="text-primary-emerald" />
                 <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Storage Hub</h3>
              </div>
              <div className="space-y-1">
                 {folders.map((f) => (
                   <button 
                    key={f.name}
                    onClick={() => setActiveFolder(f.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group",
                      activeFolder === f.name ? "bg-primary-emerald text-surface-container shadow-premium" : "text-on-surface-variant hover:bg-surface-lowest hover:text-foreground"
                    )}
                   >
                     <div className="flex items-center gap-3">
                        <f.icon size={16} className={activeFolder === f.name ? "text-surface-container" : "text-on-surface-variant/50 group-hover:text-primary-emerald transition-colors"} />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest">{f.name}</span>
                     </div>
                     <span className={cn(
                       "text-[10px] font-bold px-2 py-0.5 rounded-md",
                       activeFolder === f.name ? "bg-white/10" : "bg-surface-lowest text-on-surface-variant"
                     )}>{f.count}</span>
                   </button>
                 ))}
              </div>
           </Surface>

           <Surface level="low" className="p-6 bg-linear-to-br from-surface-container to-surface-lowest border-none">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Security Protocol</h4>
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck size={20} className="text-primary-emerald" />
                 <span className="text-xs font-bold">AES-256 Enabled</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                 <Lock size={20} className="text-primary-emerald" />
                 <span className="text-xs font-bold">Zero-Knowledge Vault</span>
              </div>
              <div className="pt-4 border-t border-white/5 mt-4">
                 <p className="text-[9px] text-on-surface-variant leading-relaxed uppercase tracking-wider font-bold">Last Security Audit: <span className="text-secondary-gold">Today, 04:32 AM</span></p>
              </div>
           </Surface>
        </aside>

        {/* Browser Grid */}
        <div className="lg:col-span-9 space-y-6">
           {/* Filters & Search */}
           <Surface level="container" className="p-4 flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5">
              <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 w-full md:w-96 border border-white/5 group focus-within:border-primary-emerald/30 transition-all">
                <Search size={16} className="text-on-surface-variant group-focus-within:text-primary-emerald" />
                <input
                  type="text"
                  placeholder="Search secure records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
                />
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant border border-white/5 hover:text-foreground">
                    <Filter size={18} />
                 </button>
                 <div className="flex items-center gap-1 p-1 bg-surface-lowest rounded-xl border border-white/5">
                    <button className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-surface-container text-primary-emerald rounded-lg">Grid</button>
                    <button className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-foreground rounded-lg">List</button>
                 </div>
              </div>
           </Surface>

           {/* Asset Grid */}
           <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredData.map((doc) => (
                <AnimatedItem key={doc.id}>
                  <Surface level="container" className="p-6 group hover:tier-2 transition-all cursor-pointer border-l-2 border-transparent hover:border-primary-emerald relative overflow-hidden h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-3 bg-surface-lowest rounded-2xl group-hover:scale-110 transition-transform">
                          <doc.icon size={24} className="text-primary-emerald" />
                       </div>
                       <button className="text-on-surface-variant hover:text-foreground opacity-30 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={18} />
                       </button>
                    </div>

                    <div className="flex-1">
                       <h4 className="text-sm font-manrope font-extrabold mb-1 group-hover:text-primary-emerald transition-colors truncate pr-4">{doc.name}</h4>
                       <div className="flex items-center gap-2 text-on-surface-variant mb-6">
                          <span className="text-[10px] font-bold uppercase tracking-widest">{doc.category}</span>
                          <span className="text-[10px]">•</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{doc.size}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center pt-4 border-t border-white/5 mt-auto">
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            doc.status === "ENCRYPTED" ? "bg-primary-emerald" : doc.status === "SECURE" ? "bg-blue-400" : "bg-red-400"
                          )} />
                          <span className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-on-surface-variant">{doc.status}</span>
                       </div>
                       <div className="flex justify-end gap-3 text-on-surface-variant group-hover:text-foreground transition-colors">
                          <Download size={14} className="hover:text-primary-emerald transition-colors" />
                          <Share2 size={14} className="hover:text-blue-400 transition-colors" />
                       </div>
                    </div>

                    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ChevronRight size={14} className="text-primary-emerald" />
                    </div>
                  </Surface>
                </AnimatedItem>
              ))}
           </AnimatedSection>

           {/* Quick Actions Footer */}
           <Surface level="high" className="p-6 bg-linear-to-r from-surface-container to-surface-lowest border-none">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary-emerald/10 text-primary-emerald shadow-[0_0_15px_rgba(78,222,163,0.1)]">
                       <Clock size={20} />
                    </div>
                    <div>
                       <h4 className="text-sm font-extrabold">Auto-Archiving Node</h4>
                       <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Next synchronization pulse in 4h 12m</p>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary-emerald px-6 py-2 bg-primary-emerald/5 rounded-xl border border-primary-emerald/10 hover:bg-primary-emerald/10 transition-all">
                    Asset Sync History <ExternalLink size={14} />
                 </button>
              </div>
           </Surface>
        </div>
      </div>
    </Shell>
  );
}
