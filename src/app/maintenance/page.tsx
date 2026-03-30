"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { Modal } from "@/components/ui/Modal";
import { DetailsPanel } from "@/components/ui/DetailsPanel";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  Wrench,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  MoreHorizontal,
  Home,
  Zap,
  Droplets,
  Wind,
  Brain,
  Activity,
  History,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  HardHat,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const INITIAL_INCIDENTS = [
  {
    id: 1,
    title: "AC Performance Drop",
    unit: "Penthouse 4",
    status: "PENDING",
    severity: "HIGH",
    type: "HVAC",
    date: "2h ago",
    assignee: "Tech-01",
    smart: true,
    diagnosis: "Compressor lifecycle alert",
  },
  {
    id: 2,
    title: "Critical Water Leak",
    unit: "Villa A12",
    status: "IN_PROGRESS",
    severity: "URGENT",
    type: "PLUMBING",
    date: "4h ago",
    assignee: "Tech-04",
    smart: true,
    diagnosis: "Main valve sensor trip",
  },
  {
    id: 3,
    title: "Lighting System Check",
    unit: "Garden Apt 2",
    status: "PENDING",
    severity: "LOW",
    type: "ELECTRICAL",
    date: "1d ago",
    assignee: "Unassigned",
    smart: false,
    diagnosis: "Manual inspection requested",
  },
  {
    id: 4,
    title: "Wi-Fi Node Downtime",
    unit: "Studio C4",
    status: "COMPLETED",
    severity: "NORMAL",
    type: "NETWORK",
    date: "2d ago",
    assignee: "Tech-02",
    smart: true,
    diagnosis: "Auto-reboot failure",
  },
];

export default function MaintenancePage() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    activeCategory: activeStatus,
    setActiveCategory: setActiveStatus,
    filteredData,
  } = useLocalFilter({
    data: incidents,
    searchKeys: ["title", "unit", "type", "assignee", "diagnosis"],
    initialSort: { key: "id", direction: "desc" },
  });

  const statusFilters = ["All", "PENDING", "IN_PROGRESS", "COMPLETED"];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedIncident(null);
    }, 1500);
  };

  const handleDelete = () => {
    setIncidents(incidents.filter(i => i.id !== selectedIncident.id));
    setSelectedIncident(null);
    setIsDeleteModalOpen(false);
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newIncident = {
      id: Date.now(),
      title: "New Technical Request",
      unit: "Sector TBD",
      status: "PENDING",
      severity: "NORMAL",
      type: "GENERAL",
      date: "just now",
      assignee: "Dispatch",
      smart: false,
      diagnosis: "Initial assessment pending",
    };
    setIncidents([newIncident, ...incidents]);
    setIsAddModalOpen(false);
  };

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Technical{" "}
            <span className="text-secondary-gold font-extrabold italic">
              Ops Console
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            ASSET INFRASTRUCTURE • SMART DIAGNOSTIC ACTIVE
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-foreground">
             <History size={18} />
             Technical Logs
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-secondary-gold text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(233,195,73,0.2)]"
          >
            <Plus size={18} />
            Deploy Team
          </button>
        </div>
      </section>

      {/* Operations Telemetry */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Active Tickets", value: incidents.filter(i => i.status !== "COMPLETED").length.toString(), sub: "AI-Pulse Active", icon: Wrench, color: "text-blue-400" },
          { label: "Response Speed", value: "4.2h", sub: "-15% improvement", icon: Clock, color: "text-purple-400" },
          { label: "System Health", value: "92.4%", sub: "Aggregated Score", icon: Activity, color: "text-primary-emerald" },
          { label: "Smart Coverage", value: "100%", icon: Brain, color: "text-secondary-gold" },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-6 transition-all hover:tier-2 group">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-2.5 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform", stat.color)}>
                  <stat.icon size={22} />
                </div>
                <div className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-widest">Live</div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">{stat.label}</p>
              <h3 className="text-2xl font-manrope font-extrabold mb-1">{stat.value}</h3>
              {stat.sub && <p className="text-[9px] font-bold text-primary-emerald uppercase tracking-widest">{stat.sub}</p>}
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={cn(
                "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeStatus === status || (status === "All" && !activeStatus)
                  ? "bg-surface-container text-secondary-gold shadow-sm"
                  : "text-on-surface-variant hover:text-foreground"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 flex-1 lg:w-96 border border-white/5 group focus-within:border-secondary-gold/30 transition-all">
            <Search size={16} className="text-on-surface-variant group-focus-within:text-secondary-gold transition-colors" />
            <input
              type="text"
              placeholder="Search by ticket, unit, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
      </div>

      <AnimatedSection stagger className="space-y-4">
        {filteredData.map((incident) => (
          <AnimatedItem key={incident.id}>
            <Surface 
              level="container" 
              onClick={() => setSelectedIncident(incident)}
              className={cn(
                "p-5 group cursor-pointer hover:tier-2 transition-all no-line border-l-4",
                incident.smart ? "border-l-primary-emerald" : "border-l-transparent hover:border-l-secondary-gold"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-5 min-w-96">
                  <div className={cn(
                    "p-3 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform",
                    incident.severity === "URGENT" ? "text-red-400" : incident.severity === "HIGH" ? "text-amber-500" : "text-blue-400"
                  )}>
                    {incident.type === "HVAC" ? <Wind size={22} /> : incident.type === "PLUMBING" ? <Droplets size={22} /> : <Zap size={22} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-manrope font-extrabold text-lg group-hover:text-secondary-gold transition-colors">{incident.title}</h4>
                      {incident.smart && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-emerald/10 text-primary-emerald font-extrabold text-[8px] uppercase tracking-widest">
                          <Brain size={10} /> Smart Diagnosis
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        <Home size={12} className="text-secondary-gold" /> {incident.unit}
                      </div>
                      <span className="text-on-surface-variant/20">•</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                        <Calendar size={12} /> {incident.date}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 lg:px-6">
                  {incident.smart ? (
                     <div className="p-3 rounded-xl bg-surface-lowest border border-primary-emerald/10">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-primary-emerald mb-1">AI Recommendation</p>
                        <p className="text-xs font-semibold text-foreground/80 italic line-clamp-1 group-hover:line-clamp-none transition-all">"{incident.diagnosis}"</p>
                     </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Assigned Resource</p>
                      <p className="text-sm font-bold flex items-center gap-2"><Activity size={14} className="text-blue-400" /> {incident.assignee}</p>
                    </>
                  )}
                </div>

                <div className="w-32 text-right">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Status</p>
                   <span className={cn(
                     "text-[9px] px-3 py-1 rounded-full font-extrabold uppercase tracking-widest",
                     incident.status === "COMPLETED" ? "bg-primary-emerald/10 text-primary-emerald" : incident.status === "IN_PROGRESS" ? "bg-blue-400/10 text-blue-400" : "bg-surface-lowest text-on-surface-variant"
                   )}>{incident.status.replace('_', ' ')}</span>
                </div>

                 <div className="flex items-center gap-2">
                   <button className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant hover:text-secondary-gold transition-all">
                      <ClipboardList size={20} />
                   </button>
                   <button className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant hover:text-foreground">
                      <MoreHorizontal size={20} />
                   </button>
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Add Incident Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Deploy Field Team"
        description="Initialize a high-priority technical dispatch node."
        tier="warning"
        actionLabel="Confirm Dispatch"
        onAction={() => handleAddIncident({} as any)}
      >
         <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Issue Vector</label>
                  <input type="text" placeholder="e.g. AC Failure" className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-secondary-gold/30" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Asset Node</label>
                  <input type="text" placeholder="e.g. Villa A12" className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-secondary-gold/30" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Resource Assignee</label>
                  <select className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-secondary-gold/30 accent-secondary-gold font-bold">
                     <option>Tech-01 (HVAC Specialist)</option>
                     <option>Tech-02 (Systems)</option>
                     <option>Tech-04 (Master Plumber)</option>
                     <option>Unassigned (General Pool)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Criticality Tier</label>
                  <select className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-secondary-gold/30 accent-secondary-gold font-bold">
                     <option>URGENT</option>
                     <option>HIGH</option>
                     <option>NORMAL</option>
                     <option>LOW</option>
                  </select>
               </div>
            </div>
         </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Archive Incident?"
        description="This will permanently move this operational node to historical logs. Active field telemetry will cease."
        tier="danger"
        actionLabel="Confirm Deletion"
        onAction={handleDelete}
      />

      {/* Incident Detail Panel */}
      <DetailsPanel
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.title || ""}
        subtitle={`${selectedIncident?.type} • SEVERITY: ${selectedIncident?.severity}`}
        onSave={handleSave}
        onDelete={() => setIsDeleteModalOpen(true)}
        isSaving={isSaving}
      >
        {selectedIncident && (
          <div className="space-y-10">
            {/* Status Integration */}
            <div className="flex items-center gap-3">
               <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Phase Shift</label>
               <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="grid grid-cols-3 gap-3">
               {["PENDING", "IN_PROGRESS", "COMPLETED"].map((step) => (
                 <button 
                  key={step}
                  className={cn(
                    "py-6 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 group",
                    selectedIncident.status === step ? "bg-secondary-gold text-surface-container border-secondary-gold shadow-premium" : "bg-surface-lowest border-white/5 text-on-surface-variant hover:text-foreground hover:bg-surface-high"
                  )}
                 >
                   {step === "COMPLETED" ? <CheckCircle2 size={24} /> : step === "IN_PROGRESS" ? <Activity size={24} /> : <Clock size={24} />}
                   {step.replace('_', ' ')}
                 </button>
               ))}
            </div>

            {/* AI Diagnostics Node */}
            <div className="space-y-4">
               <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <Brain size={14} className="text-primary-emerald" /> Architectural Diagnosis
               </h3>
               <Surface level="high" className="p-8 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-emerald/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-primary-emerald/20 transition-all" />
                  <div className="relative z-10">
                     <p className="text-xl font-manrope font-black text-foreground mb-4">"{selectedIncident.diagnosis}"</p>
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-xs font-bold text-on-surface-variant">
                           <ShieldCheck size={16} className="text-primary-emerald" /> Pre-emptive containment verified.
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-on-surface-variant">
                           <CheckCircle2 size={16} className="text-primary-emerald" /> Replacement cluster dispatched.
                        </div>
                     </div>
                  </div>
               </Surface>
            </div>

            {/* Field Resource Attribution */}
            <div className="space-y-4">
               <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <HardHat size={14} /> Assigned Dispatch
               </h3>
               <div className="p-6 bg-surface-lowest border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-surface-high transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-surface-highest flex items-center justify-center text-secondary-gold">
                        <UserCheck size={24} />
                     </div>
                     <div>
                        <p className="text-sm font-black text-foreground">{selectedIncident.assignee}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Master Technician • Delta Cluster</p>
                     </div>
                  </div>
                  <button className="text-[10px] font-black text-secondary-gold uppercase tracking-widest hover:underline">Connect Unit</button>
               </div>
            </div>
          </div>
        )}
      </DetailsPanel>
    </Shell>
  );
}
