"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { Modal } from "@/components/ui/Modal";
import { DetailsPanel } from "@/components/ui/DetailsPanel";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  TrendingUp,
  UserPlus,
  Target,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  LineChart,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const INITIAL_LEADS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    property: "Skyline Penthouse",
    status: "NEW",
    value: "$12.5K",
    source: "Website",
    date: "2h ago",
    avatar: "SJ",
    score: 84,
    velocity: "FAST",
  },
  {
    id: 2,
    name: "Michael Chen",
    property: "Azure Villa",
    status: "QUALIFIED",
    score: 92,
    value: "$21.0K",
    source: "Referral",
    date: "5h ago",
    avatar: "MC",
    velocity: "NORMAL",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    property: "Emerald Heights",
    status: "NEGOTIATION",
    score: 78,
    value: "$8.2K",
    source: "Manual",
    date: "1d ago",
    avatar: "ER",
    velocity: "NORMAL",
  },
  {
    id: 4,
    name: "David Wilson",
    property: "The Zenith Suite",
    status: "WON",
    score: 100,
    value: "$5.4K",
    source: "Campaign",
    date: "3d ago",
    avatar: "DW",
    velocity: "FAST",
  },
  {
    id: 5,
    name: "James Bond",
    property: "Skyline Penthouse",
    status: "NEW",
    score: 65,
    value: "$15.0K",
    source: "Direct",
    date: "4h ago",
    avatar: "JB",
    velocity: "SLOW",
  },
];

export default function CRMPage() {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    activeCategory: activeStage,
    setActiveCategory: setActiveStage,
    filteredData,
  } = useLocalFilter({
    data: leads,
    searchKeys: ["name", "property", "status"],
    initialSort: { key: "id", direction: "desc" },
  });

  const stages = [
    { id: "All", label: "All Leads", icon: Users, color: "text-blue-400" },
    { id: "NEW", label: "New", icon: UserPlus, color: "text-purple-400" },
    {
      id: "QUALIFIED",
      label: "Qualified",
      icon: Target,
      color: "text-secondary-gold",
    },
    {
      id: "NEGOTIATION",
      label: "Negotiation",
      icon: Clock,
      color: "text-blue-400",
    },
    {
      id: "WON",
      label: "Won",
      icon: CheckCircle2,
      color: "text-primary-emerald",
    },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedLead(null);
    }, 1500);
  };

  const handleDelete = () => {
    setLeads(leads.filter(l => l.id !== selectedLead.id));
    setSelectedLead(null);
    setIsDeleteModalOpen(false);
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead = {
      id: Date.now(),
      name: "New Lead Opportunity",
      property: "TBD Cluster",
      status: "NEW",
      value: "$0.0K",
      source: "Manual",
      date: "just now",
      avatar: "NL",
      score: 50,
      velocity: "NORMAL",
    };
    setLeads([newLead, ...leads]);
    setIsAddModalOpen(false);
  };

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Lead{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Pipeline
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            CONVERSION MANAGEMENT • {filteredData.length} ACTIVE OPPORTUNITIES
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]"
        >
          <Plus size={18} />
          Add Opportunity
        </button>
      </section>

      {/* CRM Dashboard Stats */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Pipeline", value: "$248.5K", trend: "+12%", icon: TrendingUp, color: "text-blue-400" },
          { label: "Active Leads", value: leads.length.toString(), trend: "+8", icon: Users, color: "text-purple-400" },
          { label: "Conv. Rate", value: "24.2%", trend: "+2.1%", icon: Target, color: "text-secondary-gold" },
          { label: "Won Today", value: "03", trend: "+1", icon: CheckCircle2, color: "text-primary-emerald" },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-6 flex items-center gap-4 group">
              <div className={cn("p-3 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-manrope font-extrabold">{stat.value}</h3>
                  <span className="text-[10px] font-bold text-primary-emerald">{stat.trend}</span>
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Pipeline Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeStage === stage.id || (stage.id === "All" && !activeStage)
                  ? "bg-surface-container text-foreground shadow-sm"
                  : "text-on-surface-variant hover:text-foreground"
              )}
            >
              {stage.id !== "All" && <stage.icon size={14} className={stage.color} />}
              {stage.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 flex-1 lg:w-72 border border-white/5 group focus-within:border-primary-emerald/30 transition-all">
            <Search size={16} className="text-on-surface-variant group-focus-within:text-primary-emerald transition-colors" />
            <input
              type="text"
              placeholder="Search leads, property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <AnimatedSection stagger className="grid grid-cols-1 gap-4">
        {filteredData.map((lead) => (
          <AnimatedItem key={lead.id}>
            <Surface
              level="container"
              onClick={() => setSelectedLead(lead)}
              className="p-4 group cursor-pointer hover:tier-2 transition-all no-line border-l-4 border-l-transparent hover:border-l-primary-emerald"
            >
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                  <div className="flex items-center gap-4 min-w-75">
                    <div className="w-12 h-12 rounded-full bg-surface-lowest flex items-center justify-center text-primary-emerald font-extrabold text-sm border border-white/5 group-hover:scale-110 transition-transform">
                      {lead.avatar}
                    </div>
                    <div>
                      <h4 className="font-manrope font-extrabold text-lg group-hover:text-primary-emerald transition-colors leading-tight">
                        {lead.name}
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">
                        {lead.source} • {lead.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Target Asset</p>
                    <p className="text-sm font-bold">{lead.property}</p>
                  </div>

                  <div className="w-24">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Deal Value</p>
                    <p className="text-sm font-extrabold text-foreground">{lead.value}</p>
                  </div>

                   <div className="w-32">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Current Phase</p>
                    <div className={cn(
                      "inline-flex px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase",
                      lead.status === "WON" ? "bg-primary-emerald/10 text-primary-emerald" : "bg-purple-500/10 text-purple-400"
                    )}>
                      {lead.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-lg bg-surface-lowest text-on-surface-variant hover:text-primary-emerald transition-all">
                      <Mail size={16} />
                    </button>
                    <button className="p-2.5 rounded-lg bg-surface-lowest text-on-surface-variant hover:text-foreground">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
               </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Add Opportunity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Initialize Opportunity"
        description="Append a new node to the sales pipeline."
        tier="info"
        actionLabel="Register Potential"
        onAction={() => handleAddLead({} as any)}
      >
         <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Lead Name</label>
                  <input type="text" placeholder="e.g. Victor Hugo" className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Target Property</label>
                  <input type="text" placeholder="e.g. Marina Loft" className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Estimated Value</label>
                  <input type="text" placeholder="e.g. $15,000" className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Phase Integration</label>
                  <select className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30 accent-primary-emerald">
                     <option>NEW</option>
                     <option>QUALIFIED</option>
                     <option>NEGOTIATION</option>
                  </select>
               </div>
            </div>
         </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Archive Opportunity?"
        description="This will remove the lead from the active pipeline and terminate conversion tracking. This notice is terminal."
        tier="danger"
        actionLabel="Confirm Purge"
        onAction={handleDelete}
      />

      {/* Lead Detail Panel */}
      <DetailsPanel
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.name || ""}
        subtitle={`Lead Intensity: ${selectedLead?.score}% • Source: ${selectedLead?.source}`}
        onSave={handleSave}
        onDelete={() => setIsDeleteModalOpen(true)}
        isSaving={isSaving}
      >
        {selectedLead && (
          <div className="space-y-10">
            {/* Intensity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Surface level="high" className="p-6 border border-white/5">
                  <p className="text-[10px] font-black uppercase text-on-surface-variant mb-4">Conversion Heatmap</p>
                  <div className="flex items-center gap-6">
                     <div className="relative w-20 h-20">
                        <svg className="w-full h-full -rotate-90">
                           <circle cx="40" cy="40" r="36" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                           <circle cx="40" cy="40" r="36" fill="transparent" stroke="#4edea3" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - selectedLead.score / 100)}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <span className="text-xl font-black text-foreground">{selectedLead.score}%</span>
                        </div>
                     </div>
                     <div className="flex-1 space-y-1">
                        <p className="text-[11px] font-extrabold">{selectedLead.velocity} VELOCITY</p>
                        <p className="text-[9px] text-on-surface-variant uppercase tracking-widest leading-relaxed">High interaction frequency detected in Zone 4.</p>
                     </div>
                  </div>
               </Surface>
               <Surface level="high" className="p-6 border border-white/5 flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase text-on-surface-variant mb-2">Deal Projection</p>
                  <h3 className="text-3xl font-manrope font-black text-primary-emerald">{selectedLead.value}</h3>
                  <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">Expected Closing: Within 14 Days</p>
               </Surface>
            </div>

            {/* Negotiation History */}
            <div className="space-y-4">
               <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <LineChart size={14} /> Interaction Pulse
               </h3>
               <div className="space-y-3">
                  {[
                    { type: "EMAIL", content: "Negotiation terms sent regarding Skyline Penthouse parking rights.", date: "1h ago" },
                    { type: "CALL", content: "Outbound call: discussing annual advance payment discount.", date: "Yesterday" },
                    { type: "NOTE", content: "Lead expressed specific interest in home automation integration.", date: "2 days ago" }
                  ].map((log, i) => (
                    <div key={i} className="p-5 bg-surface-lowest border border-white/5 rounded-2xl group hover:bg-surface-high transition-colors">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-black text-primary-emerald uppercase bg-primary-emerald/5 px-2 py-0.5 rounded border border-primary-emerald/10">{log.type}</span>
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase">{log.date}</span>
                       </div>
                       <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">{log.content}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </DetailsPanel>
    </Shell>
  );
}
