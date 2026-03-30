"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  ScanFace,
  Plus,
  Search,
  Filter,
  Users,
  Package,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  MoreHorizontal,
  Home,
  UserCheck,
  Smartphone,
  Calendar,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const INITIAL_EVENTS = [
  {
    id: 1,
    type: "VISIT",
    subject: "Prospective Tenant: Anna Smith",
    unit: "Unit B302",
    time: "10:15 AM",
    status: "CONFIRMED",
    assignee: "Guard-01",
    avatar: "AS",
  },
  {
    id: 2,
    type: "DELIVERY",
    subject: "Package for Resident B3",
    unit: "Lobby Reception",
    time: "11:30 AM",
    status: "PENDING",
    assignee: "Reception",
    avatar: "PK",
  },
  {
    id: 3,
    type: "INCIDENT",
    subject: "Water anomaly detected",
    unit: "Basement Level 2",
    time: "09:45 AM",
    status: "REPORTED",
    assignee: "Technical",
    avatar: "W1",
  },
  {
    id: 4,
    type: "INTERVENTION",
    subject: "Scheduled Elevator Check",
    unit: "Lift-A Hub",
    time: "08:00 AM",
    status: "COMPLETED",
    assignee: "Ext. Provider",
    avatar: "LC",
  },
];

export default function FieldOperationsPage() {
  const [activeTab, setActiveTab] = useState("JOURNAL");

  const {
    searchQuery,
    setSearchQuery,
    activeCategory: activeType,
    setActiveCategory: setActiveType,
    filteredData,
  } = useLocalFilter({
    data: INITIAL_EVENTS,
    searchKeys: ["subject", "unit", "assignee", "type"],
    initialSort: { key: "id", direction: "desc" },
  });

  const eventTypes = ["All", "VISIT", "DELIVERY", "INCIDENT", "INTERVENTION"];

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Field{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Terminal
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            GARDIEN OPERATIONS • REAL-TIME GROUND LOGS
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-surface-lowest text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] border border-white/5 hover:text-foreground transition-all">
            <History size={18} />
            Archive
          </button>
          <button className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]">
            <Plus size={18} />
            Log Entry
          </button>
        </div>
      </section>

      {/* Field Metrics - Staggered */}
      <AnimatedSection
        stagger
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
      >
        {[
          {
            label: "Visits Planned",
            value: "04",
            trend: "Today",
            icon: Users,
            color: "text-blue-400",
          },
          {
            label: "Deliveries Held",
            value: "12",
            trend: "Pending",
            icon: Package,
            color: "text-secondary-gold",
          },
          {
            label: "Alerts Level",
            value: "NORMAL",
            trend: "Optimal",
            icon: AlertTriangle,
            color: "text-primary-emerald",
          },
          {
            label: "Shift Progress",
            value: "6h",
            trend: "Remaining",
            icon: Clock,
            color: "text-on-surface-variant",
          },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface
              level="container"
              className="p-6 transition-all hover:tier-2 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform",
                    stat.color,
                  )}
                >
                  <stat.icon size={22} />
                </div>
                <div className="w-2 h-2 rounded-full bg-primary-emerald animate-pulse" />
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-manrope font-extrabold">
                {stat.value}
              </h3>
              <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1">
                {stat.trend}
              </p>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Event Journal */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
              {["JOURNAL", "ACTIVE TASKS", "RESIDENT LOOKUP"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                    activeTab === tab
                      ? "bg-surface-container text-primary-emerald shadow-sm"
                      : "text-on-surface-variant hover:text-foreground",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 min-w-72 border border-white/5">
              <Search size={16} className="text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search Journal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <AnimatedSection stagger className="space-y-4">
            {filteredData.map((event) => (
              <AnimatedItem key={event.id}>
                <Surface
                  level="container"
                  className="p-4 group cursor-pointer hover:tier-2 transition-all no-line border-l-4 border-l-transparent hover:border-l-primary-emerald"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-80">
                      <div className="w-12 h-12 rounded-xl bg-surface-lowest flex items-center justify-center text-primary-emerald font-extrabold text-sm border border-white/5 group-hover:scale-105 transition-transform">
                        {event.type === "VISIT" ? (
                          <Users size={20} />
                        ) : event.type === "DELIVERY" ? (
                          <Package size={20} />
                        ) : (
                          <AlertTriangle size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-manrope font-extrabold text-lg group-hover:text-primary-emerald transition-colors">
                          {event.subject}
                        </h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                          <Home size={12} className="text-secondary-gold" />{" "}
                          {event.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 lg:px-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                        Assigned Resource
                      </p>
                      <p className="text-sm font-bold flex items-center gap-2">
                        <ScanFace size={14} className="text-blue-400" />
                        {event.assignee}
                      </p>
                    </div>

                    <div className="w-32 text-right">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1">
                        {event.time}
                      </p>
                      <span
                        className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
                          event.status === "COMPLETED" ||
                            event.status === "CONFIRMED"
                            ? "bg-primary-emerald/10 text-primary-emerald"
                            : "bg-secondary-gold/10 text-secondary-gold",
                        )}
                      >
                        {event.status}
                      </span>
                    </div>

                    <button className="p-2.5 rounded-lg bg-surface-lowest text-on-surface-variant hover:text-foreground">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </Surface>
              </AnimatedItem>
            ))}
          </AnimatedSection>
        </div>

        {/* Sidebar Controls - Field Direct View */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Surface level="high" className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-emerald/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary-emerald/20 transition-all" />

            <div className="relative z-10 flex flex-col gap-6">
              <h3 className="font-manrope font-extrabold text-xl tracking-tight">
                Rapid Reporting
              </h3>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                Logged in as Guardian Vance. Ready to confirm field events for
                Hub Elite.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button className="p-5 rounded-2xl bg-surface-lowest border border-white/5 text-center flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-surface-container">
                  <UserCheck size={28} className="text-blue-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground">
                    Confirm Visit
                  </span>
                </button>
                <button className="p-5 rounded-2xl bg-surface-lowest border border-white/5 text-center flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-surface-container">
                  <Zap size={28} className="text-secondary-gold" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground">
                    Active Task
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Surface
                  level="lowest"
                  className="p-4 flex items-center justify-between group cursor-pointer hover:bg-surface-container transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center text-primary-emerald">
                      <Calendar size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Planned Agenda
                    </span>
                  </div>
                  <Smartphone size={16} className="text-on-surface-variant" />
                </Surface>
                <Surface
                  level="lowest"
                  className="p-4 flex items-center justify-between group cursor-pointer hover:bg-surface-container transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center text-red-400">
                      <AlertTriangle size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Urgent Alerts
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                </Surface>
              </div>
            </div>
          </Surface>

          <Surface level="low" className="p-8">
            <h3 className="font-manrope font-extrabold text-lg mb-6 tracking-tight">
              Operational Heartbeat
            </h3>
            <div className="space-y-6">
              {[
                {
                  label: "Connectivity",
                  status: "ESTABLISHED",
                  icon: Zap,
                  color: "text-primary-emerald",
                },
                {
                  label: "Sync Latency",
                  status: "14ms",
                  icon: Clock,
                  color: "text-blue-400",
                },
                {
                  label: "RFID Nodes",
                  status: "128 Active",
                  icon: CheckCircle2,
                  color: "text-secondary-gold",
                },
              ].map((node, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <node.icon size={16} className={node.color} />
                    <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
                      {node.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-foreground">
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </Shell>
  );
}
