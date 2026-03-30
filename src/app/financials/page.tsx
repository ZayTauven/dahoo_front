"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  DollarSign,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  TrendingUp,
  PieChart as PieChartIcon,
  ChevronRight,
  MoreHorizontal,
  Plus,
  BarChart3,
  Target,
  BadgeCheck,
  Building2,
} from "lucide-react";
import React from "react";
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

const CASHFLOW_DATA = [
  { month: "Jan", income: 4200, expense: 2100 },
  { month: "Feb", income: 3800, expense: 2400 },
  { month: "Mar", income: 5100, expense: 1800 },
  { month: "Apr", income: 4500, expense: 2900 },
  { month: "May", income: 5800, expense: 2200 },
  { month: "Jun", income: 6400, expense: 2100 },
];

const TRANSACTIONS = [
  {
    id: 1,
    desc: "Monthly Rent - Penthouse 4",
    cat: "Income",
    amount: "+$12,500",
    date: "Today",
    status: "CLEARED",
    type: "Credit",
    vip: true,
  },
  {
    id: 2,
    desc: "Strategic Security Overhaul",
    cat: "Expense",
    amount: "-$15,200",
    date: "Yesterday",
    status: "PENDING",
    type: "Debit",
    vip: true,
  },
  {
    id: 3,
    desc: "Resident Service - Villa A12",
    cat: "Income",
    amount: "+$2,100",
    date: "2d ago",
    status: "CLEARED",
    type: "Credit",
    vip: false,
  },
  {
    id: 4,
    desc: "Asset Maintenance - Lift Alpha",
    cat: "Expense",
    amount: "-$4,800",
    date: "3d ago",
    status: "CLEARED",
    type: "Debit",
    vip: false,
  },
];

export default function FinancialsPage() {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredData,
  } = useLocalFilter({
    data: TRANSACTIONS,
    searchKeys: ["desc", "cat", "status"],
    initialSort: { key: "id", direction: "desc" },
  });

  const filters = ["All", "Income", "Expense"];

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Fiscal{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Strategy Ledger
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            PORTFOLIO ACCOUNTING • AUDIT-READY TELEMETRY
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-foreground">
            <Download size={18} />
            Fiscal Package
          </button>
          <button className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]">
            <Plus size={18} />
            New Entry
          </button>
        </div>
      </section>

      {/* High-Impact Visual Ledger Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        <Surface level="low" className="lg:col-span-8 p-8 h-[340px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
                <BarChart3 size={20} className="text-primary-emerald" />
                <h3 className="text-xl font-manrope font-extrabold tracking-tight">Monthly Cashflow Vector</h3>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary-emerald" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Inflow</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-surface-highest" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Outflow</span>
               </div>
             </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CASHFLOW_DATA} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#c4c7c7', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f1111', border: '1px solid #1a1c1d', borderRadius: '12px' }}
                />
                <Bar dataKey="income" fill="#4edea3" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="expense" fill="#1a1c1d" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <div className="lg:col-span-4 flex flex-col gap-8">
           <Surface level="container" className="p-8 flex-1 group hover:tier-2 transition-all cursor-pointer no-line relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary-emerald/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-primary-emerald/20" />
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-xl bg-surface-lowest text-primary-emerald group-hover:scale-110 transition-transform">
                  <Target size={26} />
                </div>
                <div className="text-[9px] font-extrabold text-primary-emerald bg-primary-emerald/10 px-3 py-1.5 rounded-full">HEALTHY</div>
               </div>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Fiscal Health Score</p>
               <h3 className="text-3xl font-manrope font-extrabold mb-1">94.8%</h3>
               <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Global Portfolio Stability Index</p>
             </div>
           </Surface>
        </div>
      </div>

      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {[
          { label: "Gross Liquidity", value: "$4.82M", sub: "Available Funds", color: "text-primary-emerald" },
          { label: "Expected Yield", value: "9.14%", sub: "Net ROI Momentum", color: "text-secondary-gold" },
          { label: "Strategic Dues", value: "$12.4K", sub: "Pending Settlements", color: "text-blue-400" },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">{stat.label}</p>
              <h3 className="text-2xl font-manrope font-extrabold mb-1">{stat.value}</h3>
              <p className={cn("text-[9px] font-bold uppercase tracking-widest", stat.color)}>{stat.sub}</p>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveCategory(f)}
              className={cn(
                "px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeCategory === f || (f === "All" && !activeCategory)
                  ? "bg-surface-container text-primary-emerald shadow-sm"
                  : "text-on-surface-variant hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 min-w-80 border border-white/5">
           <Search size={16} className="text-on-surface-variant" />
           <input
             type="text"
             placeholder="Search Strategic Transactions..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
           />
        </div>
      </div>

      <AnimatedSection stagger className="space-y-4">
        {filteredData.map((tx) => (
          <AnimatedItem key={tx.id}>
            <Surface level="container" className={cn(
              "p-4 group cursor-pointer hover:tier-2 transition-all no-line border-l-4",
              tx.vip ? "border-l-secondary-gold" : "border-l-transparent hover:border-l-primary-emerald"
            )}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-5 min-w-96">
                  <div className={cn(
                    "p-3 rounded-xl bg-surface-lowest transition-transform group-hover:scale-110",
                    tx.amount.startsWith("+") ? "text-primary-emerald" : "text-amber-500"
                  )}>
                    {tx.amount.startsWith("+") ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h4 className="font-manrope font-extrabold text-lg group-hover:text-primary-emerald transition-colors">{tx.desc}</h4>
                       {tx.vip && <BadgeCheck size={16} className="text-secondary-gold" />}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      {tx.cat} • {tx.type}
                      {tx.vip && <span className="bg-secondary-gold/10 text-secondary-gold px-1.5 py-0.5 rounded text-[8px] tracking-widest">HIGHER-STANDING</span>}
                    </p>
                  </div>
                </div>

                <div className="w-32 text-left">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Status</p>
                   <span className={cn(
                     "text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest",
                     tx.status === "CLEARED" ? "bg-primary-emerald/10 text-primary-emerald" : "bg-blue-400/10 text-blue-400"
                   )}>{tx.status}</span>
                </div>

                <div className="flex-1 text-right lg:pr-6">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{tx.date}</p>
                   <p className={cn(
                     "text-2xl font-manrope font-extrabold tracking-tighter",
                     tx.amount.startsWith("+") ? "text-primary-emerald" : "text-foreground"
                   )}>{tx.amount}</p>
                </div>

                <button className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant hover:text-foreground">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>
    </Shell>
  );
}
