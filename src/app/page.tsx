"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building2, 
  Users, 
  Wallet, 
  Activity 
} from "lucide-react";
import React from "react";

const stats = [
  { label: "Portfolio Value", value: "$4.2M", trend: "+12.5%", icon: Building2, positive: true },
  { label: "Net Revenue", value: "$128.4K", trend: "+8.2%", icon: Wallet, positive: true },
  { label: "Occupancy Rate", value: "94.2%", trend: "-1.1%", icon: Users, positive: false },
  { label: "Active Incidents", value: "04", trend: "0.0%", icon: Activity, positive: true, color: "secondary-gold" },
];

export default function DashboardHome() {
  return (
    <Shell>
      {/* Hero Section */}
      <section className="flex flex-col gap-1">
        <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
          Portfolio <span className="text-primary-emerald font-extrabold italic">Macro-Console</span>
        </h1>
        <p className="text-on-surface-variant font-medium text-sm tracking-wide uppercase mt-2">
          Insights-First Hub • <span className="text-secondary-gold">Haute Standing Digital Experience</span>
        </p>
      </section>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Surface key={stat.label} level="container" className="p-6 group hover:translate-y-[-4px] transition-all" animate={true}>
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                stat.color === 'secondary-gold' ? 'bg-secondary-gold/10 text-secondary-gold' : 'bg-primary-emerald/10 text-primary-emerald'
              )}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold leading-none py-1 px-2 rounded-full",
                stat.positive ? "text-primary-emerald bg-primary-emerald/10" : "text-amber-500 bg-amber-500/10"
              )}>
                {stat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-on-surface-variant font-bold text-[11px] uppercase tracking-[0.15em] mb-1">
                {stat.label}
              </span>
              <span className="text-3xl font-manrope font-extrabold text-foreground tracking-tight">
                {stat.value}
              </span>
            </div>
          </Surface>
        ))}
      </div>

      {/* Main Insights Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Section */}
        <Surface level="low" className="lg:col-span-8 p-8 min-h-[480px] no-line flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-manrope font-bold text-xl text-foreground">Revenue Dynamics</h3>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">Historical Trend & Projection</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-lowest p-1 rounded-lg">
              <button className="px-4 py-1.5 text-xs font-bold bg-surface-container text-primary-emerald rounded-md shadow-sm">Monthly</button>
              <button className="px-4 py-1.5 text-xs font-bold text-on-surface-variant hover:text-foreground">Quarterly</button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* Placeholder for Recharts - I will add proper Recharts later */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-t from-primary-emerald/5 to-transparent rounded-xl" />
            </div>
            <div className="z-10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-emerald/10 flex items-center justify-center text-primary-emerald animate-pulse">
                <TrendingUp size={32} />
              </div>
              <p className="text-on-surface-variant text-sm font-medium">Recharts Engine Initializing...</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-surface-container pt-6 mt-4">
             <div className="flex gap-8">
                <div className="flex flex-col">
                   <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Target Achievement</span>
                   <span className="text-lg font-manrope font-bold text-foreground">92.4%</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Forecast Margin</span>
                   <span className="text-lg font-manrope font-bold text-primary-emerald">+14.2%</span>
                </div>
             </div>
             <button className="text-xs font-bold text-primary-emerald uppercase tracking-widest hover:underline">View Analytics Breakdown</button>
          </div>
        </Surface>

        {/* Action Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Surface level="container" className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-gold/10 rounded-full blur-3xl group-hover:bg-secondary-gold/20 transition-all" />
            <h3 className="font-manrope font-bold text-lg text-foreground mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="bg-surface-lowest p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-emerald/10 flex items-center justify-center text-primary-emerald">
                  <ArrowUpRight size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">Top Performing Asset</span>
                  <span className="text-xs text-on-surface-variant">La Résidence du Jardin</span>
                </div>
              </div>
              <div className="bg-surface-lowest p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Activity size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">Maintenance Alert</span>
                  <span className="text-xs text-on-surface-variant">HVAC Issue in Unit B302</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 bg-surface-low py-3 rounded-xl font-manrope font-bold text-xs uppercase tracking-widest text-on-surface-variant hover:bg-surface-container hover:text-foreground transition-all">
              Launch Task Manager
            </button>
          </Surface>

          <Surface level="bright" className="p-8 group cursor-pointer hover:bg-surface-bright transition-all bg-opacity-40">
            <h3 className="font-manrope font-extrabold text-2xl text-foreground mb-2 group-hover:text-primary-emerald">Elite Concierge</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Access 24/7 on-demand support for premium portfolio management and real-time auditing.</p>
            <div className="flex items-center gap-2 group">
              <span className="text-xs font-bold text-primary-emerald uppercase tracking-widest">Connect with Advisor</span>
              <ArrowUpRight size={14} className="text-primary-emerald group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Surface>
        </div>
      </div>
    </Shell>
  );
}

// Add className helper inside the file for convenience if cn import is tricky for a second
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
