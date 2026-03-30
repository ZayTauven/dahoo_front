"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Users,
  Activity,
  Home,
  DollarSign,
  Zap,
  ShieldCheck,
  Calendar,
  MousePointer2,
  ScanFace,
  Brain,
  Droplets,
  AlertTriangle,
} from "lucide-react";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PERFORMANCE_DATA = [
  { month: "Jan", revenue: 2400, yield: 4.2 },
  { month: "Feb", revenue: 3200, yield: 4.8 },
  { month: "Mar", revenue: 2800, yield: 5.1 },
  { month: "Apr", revenue: 4500, yield: 6.2 },
  { month: "May", revenue: 3800, yield: 5.8 },
  { month: "Jun", revenue: 5100, yield: 7.4 },
];

const STRATEGIC_FEED = [
  { id: 1, type: "FIELD", event: "Security Audit Confirmed", details: "Lobby Gate-01", time: "2m ago", icon: ShieldCheck, color: "text-primary-emerald" },
  { id: 2, type: "SENSOR", event: "Smart HVAC Optimized", details: "Tower A Level 4", time: "15m ago", icon: Zap, color: "text-secondary-gold" },
  { id: 3, type: "ALARM", event: "Leak Alert Detected", details: "Unit B302 Bathroom", time: "45m ago", icon: AlertTriangle, color: "text-red-400" },
  { id: 4, type: "VISIT", event: "Prospective Viewing", details: "Penthouse Delta", time: "1h ago", icon: ScanFace, color: "text-blue-400" },
];

export default function DashboardHome() {
  return (
    <Shell>
      {/* Hero Header */}
      <section className="flex flex-col gap-1 mb-8">
        <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
          Strategic{" "}
          <span className="text-primary-emerald font-extrabold italic">
            Command Center
          </span>
        </h1>
        <p className="text-on-surface-variant font-medium text-sm tracking-wide uppercase mt-2">
          Portfolio Control •{" "}
          <span className="text-secondary-gold">Real-Time Fiscal Telemetry</span>
        </p>
      </section>

      {/* Elite KPI Grid */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Portfolio Value", value: "$184.2M", trend: "+12.5%", icon: Building2, color: "text-primary-emerald" },
          { label: "Quarterly ROI", value: "8.14%", trend: "+2.1%", icon: TrendingUp, color: "text-secondary-gold" },
          { label: "Field Capacity", value: "98.2%", trend: "Stable", icon: Users, color: "text-blue-400" },
          { label: "System Health", value: "Optimal", trend: "100%", icon: Brain, color: "text-purple-400" },
        ].map((kpi, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-6 transition-all hover:tier-2 group cursor-pointer border-l-2 border-l-transparent hover:border-l-primary-emerald">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform", kpi.color)}>
                  <kpi.icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-primary-emerald bg-primary-emerald/10 px-3 py-1.5 rounded-full">
                   {kpi.trend}
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-manrope font-extrabold tracking-tight">{kpi.value}</h3>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Main Performance Vector */}
        <Surface level="low" className="lg:col-span-8 p-8 flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-manrope font-extrabold tracking-tight">Performance Vector Alpha</h3>
              <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium mt-1">Multi-Asset Yield Comparison • Q1-Q2</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-emerald shadow-[0_0_10px_rgba(78,222,163,0.3)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Live Performance</span>
              </div>
              <button className="text-[10px] bg-surface-lowest px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-on-surface hover:text-foreground transition-all">Detailed View</button>
            </div>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4edea3" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#c4c7c7', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1111', border: '1px solid #1a1c1d', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 800, color: '#4edea3' }}
                   cursor={{ stroke: '#4edea3', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4edea3" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPrimary)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-8">
             <div className="flex gap-12">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-[0.2em] mb-1">Portfolio Alpha</span>
                   <span className="text-2xl font-manrope font-extrabold text-foreground tracking-tighter">$14.2M</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-[0.2em] mb-1">Growth Index</span>
                   <span className="text-2xl font-manrope font-extrabold text-primary-emerald tracking-tighter">+12.4%</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest group cursor-pointer hover:text-foreground">Auditing Node: 01A</span>
               <div className="w-2 h-2 rounded-full bg-primary-emerald animate-pulse shadow-[0_0_10px_rgba(78,222,163,0.5)]" />
             </div>
          </div>
        </Surface>

        {/* Operational Pulse Feed */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Surface level="container" className="p-8 h-full flex flex-col no-line">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-manrope font-extrabold text-xl tracking-tight">Operational Pulse</h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-red-100/50">Live</span>
              </div>
            </div>

            <div className="space-y-8 flex-1">
              {STRATEGIC_FEED.map((item) => (
                <div key={item.id} className="flex gap-4 group cursor-pointer">
                  <div className={cn("p-2 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform h-min", item.color)}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-extrabold text-foreground group-hover:text-primary-emerald transition-colors">{item.event}</span>
                      <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase">{item.time}</span>
                    </div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-4 rounded-xl bg-surface-lowest border border-white/5 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant hover:text-foreground hover:bg-surface-high transition-all">
               Launch Terminal Matrix
            </button>
          </Surface>
        </div>
      </div>

      {/* Strategic Asset Leaderboard */}
      <section>
        <div className="flex items-center justify-between mb-8">
           <h3 className="font-manrope font-extrabold text-2xl tracking-tight uppercase">Strategic Assets</h3>
           <button className="text-[10px] font-bold uppercase tracking-widest text-primary-emerald hover:underline">Full Portfolio Map</button>
        </div>
        <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "La Résidence du Jardin", units: 142, yield: "9.2%", status: "OPTIMAL", color: "text-primary-emerald" },
            { name: "Tower Alpha Elite", units: 84, yield: "8.4%", status: "SECURE", color: "text-blue-400" },
            { name: "Penthouse Gardens", units: 12, yield: "12.8%", status: "PREMIUM", color: "text-secondary-gold" },
          ].map((asset, i) => (
            <AnimatedItem key={i}>
              <Surface level="lowest" className="p-8 group hover:-translate-y-2 transition-all cursor-pointer border-t-2 border-t-transparent hover:border-t-primary-emerald">
                <div className="flex justify-between items-center mb-6">
                  <div className="p-3 rounded-xl bg-surface-container group-hover:bg-primary-emerald/10 transition-colors">
                    <Building2 size={24} className="group-hover:text-primary-emerald transition-colors" />
                  </div>
                  <div className={cn("text-[9px] font-extrabold tracking-widest border px-3 py-1 rounded-md", asset.color + "/20 border-" + asset.color.split('-')[1] + "-400/20")}>
                    {asset.status}
                  </div>
                </div>
                <h4 className="font-manrope font-extrabold text-xl mb-2 group-hover:text-primary-emerald transition-colors">{asset.name}</h4>
                <div className="flex justify-between items-end">
                   <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{asset.units} Elite Units</p>
                    <p className="text-[10px] font-bold text-primary-emerald uppercase tracking-widest">Yield Momentum</p>
                   </div>
                   <span className="text-3xl font-manrope font-extrabold tracking-tighter">{asset.yield}</span>
                </div>
              </Surface>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </section>
    </Shell>
  );
}
