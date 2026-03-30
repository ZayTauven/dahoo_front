"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import {
  CreditCard,
  Zap,
  Building2,
  Users,
  HardDrive,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Activity,
  Globe,
  Cpu,
  RefreshCw,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TELEMETRY_DATA = [
  { time: "00:00", active: 24, latency: 18 },
  { time: "04:00", active: 12, latency: 15 },
  { time: "08:00", active: 68, latency: 22 },
  { time: "12:00", active: 94, latency: 28 },
  { time: "16:00", active: 82, latency: 25 },
  { time: "20:00", active: 45, latency: 20 },
];

export default function SubscriptionPage() {
  const usageTelemetry = [
    {
      label: "Portfolio Units",
      value: "84 / 100",
      percent: 84,
      icon: Building2,
      color: "text-primary-emerald",
    },
    {
      label: "Team Members",
      value: "12 / 20",
      percent: 60,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Secure Storage",
      value: "4.2 / 10 GB",
      percent: 42,
      icon: HardDrive,
      color: "text-secondary-gold",
    },
  ];

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Subscription{" "}
            <span className="text-secondary-gold font-extrabold italic">
              Console
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            PLAN MANAGEMENT • ELITE ACCESS ENABLED
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Next Billing Cycle</span>
            <span className="text-sm font-manrope font-extrabold text-foreground">April 12, 2026</span>
          </div>
          <button className="flex items-center gap-2 bg-secondary-gold text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(233,195,73,0.2)]">
            <Zap size={18} />
            Upgrade Tier
          </button>
        </div>
      </section>

      {/* Usage Telemetry Grid */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {usageTelemetry.map((telemetry, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-6 transition-all hover:tier-2 group">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform", telemetry.color)}>
                  <telemetry.icon size={22} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{telemetry.label}</p>
                  <h3 className="text-xl font-manrope font-extrabold">{telemetry.value}</h3>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-lowest rounded-full overflow-hidden p-0.5">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", telemetry.color.replace('text-', 'bg-'))}
                  style={{ width: `${telemetry.percent}%` }}
                />
              </div>
              <p className="mt-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest text-right">
                {100 - telemetry.percent}% REMAINING CAPACITY
              </p>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* API Consumption Vector */}
        <Surface level="low" className="lg:col-span-8 p-8 relative overflow-hidden h-[500px] flex flex-col border border-white/5">
           <div className="flex justify-between items-start mb-8 z-10">
              <div>
                 <h2 className="text-2xl font-manrope font-extrabold tracking-tight">System Node Consumption</h2>
                 <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Cross-regional API Load Vector</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-primary-emerald bg-primary-emerald/10 px-3 py-1.5 rounded-lg border border-primary-emerald/20">
                    <Activity size={12} className="animate-pulse" /> Live Pulse
                 </div>
              </div>
           </div>

           <div className="flex-1 w-full min-h-0 z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={TELEMETRY_DATA}>
                    <defs>
                       <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e9c349" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#e9c349" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4edea3" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1111', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                    <Area type="monotone" dataKey="active" stroke="#e9c349" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                    <Area type="monotone" dataKey="latency" stroke="#4edea3" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           
           <div className="mt-8 flex gap-8 z-10 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-surface-highest text-secondary-gold"><RefreshCw size={14} /></div>
                 <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Auto-Scale Node</p>
                    <p className="text-sm font-extrabold uppercase tracking-widest text-secondary-gold">READY</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-surface-highest text-primary-emerald"><Globe size={14} /></div>
                 <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Global CDN</p>
                    <p className="text-sm font-extrabold uppercase tracking-widest text-primary-emerald">OPTIMAL</p>
                 </div>
              </div>
           </div>
        </Surface>

        {/* Global Hub Status */}
        <Surface level="bright" className="lg:col-span-4 p-8 flex flex-col border border-white/5 no-line">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-primary-emerald/10 text-primary-emerald">
                 <Cpu size={20} />
              </div>
              <h3 className="font-manrope font-extrabold text-xl">Global Hub Status</h3>
           </div>
           
           <div className="space-y-6 flex-1 pr-2 custom-scrollbar">
              {[
                { hub: "Node-Paris-01", status: "Active", latency: "14ms", load: "High" },
                { hub: "Node-Dubai-Elite", status: "Active", latency: "22ms", load: "Normal" },
                { hub: "Node-NY-Central", status: "Syncing", latency: "48ms", load: "Low" },
                { hub: "Node-Singapore", status: "Active", latency: "18ms", load: "Normal" },
              ].map((node, i) => (
                <div key={i} className="flex justify-between items-center border-b border-surface-bright pb-4 last:border-0 hover:translate-x-1 transition-transform cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      node.status === "Active" ? "bg-primary-emerald" : "bg-secondary-gold"
                    )} />
                    <div>
                      <p className="text-xs font-extrabold group-hover:text-primary-emerald transition-colors">{node.hub}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{node.load} Load Pulse</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold tracking-tight">{node.latency}</p>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{node.status}</span>
                  </div>
                </div>
              ))}
           </div>

           <button className="w-full mt-8 bg-surface-lowest text-on-surface-variant hover:text-foreground py-3 rounded-xl font-manrope font-bold text-[10px] uppercase tracking-widest transition-all">
              Verify Infrastructure Integrity
           </button>
        </Surface>
      </div>

      <section className="mt-12 bg-linear-to-br from-surface-lowest to-surface-container rounded-3xl p-10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-gold/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-secondary-gold/20" />
         <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
            <div className="max-w-xl">
               <span className="inline-flex px-3 py-1 bg-secondary-gold/10 text-secondary-gold text-[9px] font-extrabold uppercase tracking-widest rounded-lg border border-secondary-gold/20 mb-6 uppercase">
                  ACTIVE LICENSE: PRO-ELITE
               </span>
               <h2 className="text-4xl font-manrope font-extrabold tracking-tight leading-tight">Empowering Global Real Estate with <span className="text-secondary-gold">Dahoo Intelligence.</span></h2>
               <p className="text-sm text-on-surface-variant mt-4 leading-relaxed italic opacity-80">
                  You are currently utilizing the Pro-Elite license, with architectural node optimization enabled for all regional clusters.
               </p>
            </div>
            <div className="flex flex-col gap-4 min-w-64">
               <div className="flex items-center gap-3 p-4 bg-surface-lowest rounded-2xl border border-white/5">
                  <ShieldCheck size={24} className="text-primary-emerald" />
                  <div>
                     <p className="text-[10px] font-extrabold text-on-surface-variant uppercase">Data Sovereignty</p>
                     <p className="text-xs font-black uppercase tracking-widest">ZERO-KNOWLEDGE</p>
                  </div>
               </div>
               <button className="w-full py-4 bg-secondary-gold text-surface-container rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:scale-[1.05] transition-transform">
                  Manage Enterprise License
               </button>
            </div>
         </div>
      </section>
    </Shell>
  );
}
