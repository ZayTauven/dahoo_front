"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart2,
  Layers,
  Filter,
  Download,
  Brain,
  Target,
  Globe,
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
  PieChart,
  Cell,
  Pie,
} from "recharts";

const PERFORMANCE_DATA = [
  { month: "Jan", revenue: 2400, yield: 4.2 },
  { month: "Feb", revenue: 3200, yield: 4.8 },
  { month: "Mar", revenue: 2800, yield: 5.1 },
  { month: "Apr", revenue: 4500, yield: 6.2 },
  { month: "May", revenue: 3800, yield: 5.8 },
  { month: "Jun", revenue: 5100, yield: 7.4 },
  { month: "Jul", revenue: 4800, yield: 7.1 },
];

const MIX_DATA = [
  { name: "Residential", value: 65, color: "#4edea3" },
  { name: "Commercial", value: 25, color: "#e9c349" },
  { name: "Retail", value: 10, color: "#3b82f6" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Surface level="bright" className="p-3 shadow-premium border border-white/5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-xs font-extrabold text-foreground">
                {entry.name}: {entry.name === "yield" ? `${entry.value}%` : `$${entry.value}K`}
              </p>
            </div>
          ))}
        </div>
      </Surface>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Strategic{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Intelligence
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            PORTFOLIO PERFORMANCE • AI NEURAL ANALYTICS
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-high transition-all">
            <Filter size={16} />
            Parameters
          </button>
          <button className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]">
            <Download size={16} />
            Intelligence Report
          </button>
        </div>
      </section>

      {/* Primary KPI Grid */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Gross Asset Value", value: "$184.2M", trend: "+8.4%", icon: Target, color: "text-primary-emerald" },
          { label: "Annual Net Yield", value: "7.14%", trend: "+1.2%", icon: TrendingUp, color: "text-secondary-gold" },
          { label: "Portfolio Efficiency", value: "92.4%", trend: "+4.5%", icon: Brain, color: "text-blue-400" },
          { label: "Global Occupancy", value: "98.2%", trend: "Stable", icon: Globe, color: "text-purple-400" },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-6 transition-all hover:tier-2 group">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-2.5 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform", stat.color)}>
                  <stat.icon size={22} />
                </div>
                <div className={cn("px-2 py-1 rounded-md text-[9px] font-extrabold uppercase", stat.trend.includes('+') ? "bg-primary-emerald/10 text-primary-emerald" : "bg-surface-lowest text-on-surface-variant")}>
                  {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-manrope font-extrabold">{stat.value}</h3>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Neural Performance Chart */}
        <Surface level="low" className="lg:col-span-8 p-8 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-manrope font-extrabold tracking-tight">Performance Vector</h3>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Telemetry: Revenue Alpha vs Yield Gamma</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-emerald" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Revenue (USD)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary-gold" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Yield (%)</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4edea3" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e9c349" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#e9c349" stopOpacity={0}/>
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
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#c4c7c7', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4edea3" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#e9c349" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorYield)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        {/* Neural Insights & Allocation */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Surface level="container" className="p-8 h-[250px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-emerald/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-emerald/20 transition-all" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary-emerald/10 text-primary-emerald">
                  <Brain size={18} />
                </div>
                <h3 className="font-manrope font-extrabold text-lg uppercase tracking-tight">Neural Pulse</h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-medium">
                Portfolio performance is trending <span className="text-primary-emerald font-bold">12% above market</span>. Allocation in Commercial nodes advised for Q3.
              </p>
              <button className="flex items-center gap-2 text-xs font-bold text-primary-emerald uppercase tracking-widest hover:translate-x-1 transition-transform">
                Generate Full Strategy <ArrowUpRight size={14} />
              </button>
            </div>
          </Surface>

          <Surface level="container" className="p-8 h-[218px]">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-secondary-gold/10 text-secondary-gold">
                  <PieChartIcon size={18} />
                </div>
                <h3 className="font-manrope font-extrabold text-lg uppercase tracking-tight">Asset Allocation</h3>
              </div>
              <div className="flex items-center gap-8">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MIX_DATA}
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {MIX_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {MIX_DATA.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-xs font-extrabold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
          </Surface>
        </div>
      </div>

      {/* Global Intelligence Nodes */}
      <section className="mt-12">
        <h3 className="font-manrope font-extrabold text-2xl tracking-tight mb-8 uppercase">Intelligence Nodes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Predictive Vacancy", value: "3.2%", detail: "Trend: Declining", icon: Target, color: "text-blue-400" },
            { label: "Maint. Efficiency", value: "94/100", detail: "Top 1% Percentile", icon: Layers, color: "text-secondary-gold" },
            { label: "Community Pulse", value: "Elite", detail: "Sentiment: Very High", icon: Globe, color: "text-primary-emerald" },
          ].map((node, i) => (
            <Surface key={i} level="lowest" className="p-6 flex items-center gap-5 border border-white/5 group hover:tier-2 transition-all">
               <div className={cn("p-3 rounded-xl bg-surface-container group-hover:scale-110 transition-transform", node.color)}>
                <node.icon size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{node.label}</p>
                  <h4 className="text-xl font-manrope font-extrabold">{node.value}</h4>
                  <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1">{node.detail}</p>
               </div>
            </Surface>
          ))}
        </div>
      </section>
    </Shell>
  );
}
