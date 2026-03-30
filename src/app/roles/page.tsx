"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import {
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  Edit3,
  Trash2,
  Users,
  Building2,
  CreditCard,
  Layers,
  Check,
  X,
  MoreVertical,
  History,
  AlertTriangle,
  FileCode,
  ShieldAlert,
  ChevronRight,
  Activity,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "admin", name: "Administrator", desc: "Full systemic access with destructive capability.", users: 2, color: "text-red-400" },
  { id: "manager", name: "Operations Manager", desc: "Full management of properties, CRM, and financials.", users: 5, color: "text-primary-emerald" },
  { id: "agent", name: "Leasing Agent", desc: "Access to CRM and property listings, no financials.", users: 12, color: "text-blue-400" },
  { id: "technician", name: "Technician", desc: "Maintenance terminal and field-ops reporting.", users: 8, color: "text-secondary-gold" },
  { id: "guardian", name: "Guardian", desc: "Field event logging and security alerts only.", users: 15, color: "text-purple-400" },
];

const AUDIT_TRAIL = [
  { id: 1, action: "Permission Granted", role: "Manager", user: "Alexander Vance", node: "Strategic Analytics", time: "2h ago", severity: "LOW" },
  { id: 2, action: "System Reboot", role: "Admin", user: "Cyber Root", node: "Asset Hub", time: "5h ago", severity: "MEDIUM" },
  { id: 3, action: "Temporal Access Active", role: "Resident", user: "Julian Thorne", node: "Smart House", time: "12h ago", severity: "INFO" },
  { id: 4, action: "Security Audit Pulse", role: "System", user: "Audit Bot", node: "Compliance", time: "1d ago", severity: "LOW" },
];

const CAPABILITIES = [
  { group: "Strategic Operations", items: [
    { key: "view_analytics", label: "View Macro-Analytics", roles: ["admin", "manager"] },
    { key: "manage_financials", label: "Financial Control", roles: ["admin"] },
  ]},
  { group: "Asset Management", items: [
    { key: "create_property", label: "Create Asset", roles: ["admin", "manager"] },
    { key: "edit_property", label: "Modify Asset", roles: ["admin", "manager", "agent"] },
    { key: "view_inventory", label: "View Inventory", roles: ["admin", "manager", "agent", "technician"] },
  ]},
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Capabilities{" "}
            <span className="text-secondary-gold font-extrabold italic">
              Engine
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            ACCESS PROTOCOLS • {ROLES.length} STRATEGIC ROLES DEFINED
          </p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-foreground">
             <History size={18} />
             System Logs
          </button>
          <button className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]">
            <ShieldCheck size={18} />
            Define Policy
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
        {/* Left column: Roles & Audit Trail */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
           {/* Role Selector */}
           <Surface level="container" className="flex-1 flex flex-col overflow-hidden p-0 border border-white/5 no-line">
              <div className="p-4 border-b border-white/5 bg-surface-lowest/30">
                 <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] pl-2">Strategic Tiers</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {ROLES.map((role) => (
                   <div 
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      "p-5 cursor-pointer transition-all border-l-4 relative group",
                      selectedRole.id === role.id 
                         ? "bg-surface-lowest border-l-primary-emerald" 
                         : "border-l-transparent hover:bg-surface-lowest/50"
                    )}
                   >
                     <div className="flex justify-between items-start mb-2">
                        <h4 className={cn("text-lg font-manrope font-extrabold", selectedRole.id === role.id ? "text-foreground" : "text-foreground/80")}>
                           {role.name}
                        </h4>
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{role.users} Members</span>
                     </div>
                     <p className="text-xs text-on-surface-variant/70 italic line-clamp-2">{role.desc}</p>
                   </div>
                 ))}
              </div>
           </Surface>

           {/* Security Audit Pulse */}
           <Surface level="high" className="h-64 flex flex-col p-6 border-none shadow-premium relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-gold/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-secondary-gold/10 transition-all" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <h3 className="text-[10px] font-black text-secondary-gold uppercase tracking-[0.2em]">Live Capability Audit</h3>
                 <Activity size={14} className="text-secondary-gold animate-pulse" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar relative z-10">
                 {AUDIT_TRAIL.map((log) => (
                   <div key={log.id} className="flex gap-3 hover:translate-x-1 transition-transform cursor-crosshair">
                      <div className={cn(
                        "w-1 h-6 rounded-full mt-1",
                        log.severity === "MEDIUM" ? "bg-amber-500" : log.severity === "INFO" ? "bg-blue-400" : "bg-primary-emerald"
                      )} />
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">{log.action}</p>
                         <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase">{log.user} • {log.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Surface>
        </div>

        {/* Right column: Permission Matrix */}
        <Surface level="low" className="lg:col-span-8 flex flex-col overflow-hidden p-0 border border-white/5 no-line">
           <div className="p-8 border-b border-white/5 bg-surface-lowest/30 flex justify-between items-center">
              <div>
                 <h2 className="text-2xl font-manrope font-extrabold tracking-tight">Access Capability Matrix</h2>
                 <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Target Protocol: <span className="text-primary-emerald">{selectedRole.name}</span></span>
                    <span className="bg-surface-highest text-secondary-gold text-[9px] font-black uppercase px-2 py-0.5 rounded border border-secondary-gold/20">V2.4.0</span>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="px-5 py-2.5 bg-surface-lowest rounded-xl text-[10px] font-extrabold uppercase tracking-widest hover:text-foreground">Commit Changes</button>
                 <button className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant border border-white/5 hover:text-red-400"><Trash2 size={18} /></button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {CAPABILITIES.map((group, gIdx) => (
                <div key={gIdx} className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="h-0.5 bg-surface-highest flex-1" />
                      <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.4em]">{group.group}</h4>
                      <div className="h-0.5 bg-surface-highest flex-1" />
                   </div>

                   <div className="grid grid-cols-1 gap-3">
                      {group.items.map((item, iIdx) => {
                        const hasPermission = item.roles.includes(selectedRole.id);
                        return (
                          <div key={iIdx} className={cn(
                            "flex items-center justify-between p-5 rounded-2xl border transition-all duration-500",
                            hasPermission ? "bg-surface-lowest border-white/5 hover:border-primary-emerald/30" : "bg-transparent border-white/5 opacity-40 grayscale"
                          )}>
                             <div className="flex items-center gap-5">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-700",
                                  hasPermission ? "bg-primary-emerald/10 text-primary-emerald" : "bg-surface-highest text-on-surface-variant"
                                )}>
                                   {hasPermission ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                                </div>
                                <div>
                                   <p className="text-sm font-manrope font-extrabold mb-0.5">{item.label}</p>
                                   <p className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest">Protocol.Exec_{item.key.toUpperCase()}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-8">
                                <div className="flex gap-4">
                                   <div className="p-2 rounded-lg bg-surface-highest hover:text-secondary-gold transition-colors"><Eye size={14} /></div>
                                   <div className="p-2 rounded-lg bg-surface-highest hover:text-primary-emerald transition-colors"><Edit3 size={14} /></div>
                                   <div className="p-2 rounded-lg bg-surface-highest hover:text-red-400 transition-colors"><Lock size={14} /></div>
                                </div>
                                <div className={cn(
                                  "w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-500 relative",
                                  hasPermission ? "bg-primary-emerald/20" : "bg-surface-highest"
                                )}>
                                   <div className={cn(
                                     "w-4 h-4 rounded-full transition-all duration-500 shadow-premium",
                                     hasPermission ? "translate-x-6 bg-primary-emerald" : "translate-x-0 bg-on-surface-variant/30"
                                   )} />
                                </div>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              ))}

              {/* Temporal Access Node Simulation */}
              <Surface level="high" className="p-8 bg-linear-to-br from-surface-highest to-surface-low border-none rounded-3xl group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Zap size={64} className="text-primary-emerald" />
                 </div>
                 <div className="max-w-md relative z-10">
                    <h3 className="text-xl font-manrope font-black tracking-tight mb-4 flex items-center gap-3">
                       <FileCode size={24} className="text-primary-emerald" /> Temporal Enforcement
                    </h3>
                    <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed italic opacity-80 mb-6">
                       Policy Nodes can be configured to expire automatically based on lease status or operational duration. Enabled by default for all "Resident" protocols.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-emerald flex items-center gap-2 hover:translate-x-2 transition-transform">
                       Configure Ephemeral Policies <ChevronRight size={14} />
                    </button>
                 </div>
              </Surface>
           </div>
        </Surface>
      </div>
    </Shell>
  );
}
