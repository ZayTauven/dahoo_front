"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  ShieldCheck,
  UserCheck,
  MoreHorizontal,
  Lock,
  Smartphone,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const INITIAL_USERS = [
  {
    id: 1,
    name: "Alexander Vance",
    email: "a.vance@dahoo-elite.com",
    role: "ADMINISTRATOR",
    status: "ACTIVE",
    tfa: true,
    lastSignIn: "15 min ago",
    avatar: "AV",
  },
  {
    id: 2,
    name: "Elena Rodriguez",
    email: "e.rodriguez@dahoo-ops.com",
    role: "MANAGER",
    status: "ACTIVE",
    tfa: true,
    lastSignIn: "2h ago",
    avatar: "ER",
  },
  {
    id: 3,
    name: "Marcus Thorne",
    email: "m.thorne@dahoo-security.com",
    role: "SECURITY",
    status: "ACTIVE",
    tfa: false,
    lastSignIn: "1d ago",
    avatar: "MT",
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    email: "s.jenkins@dahoo-ops.com",
    role: "AGENT",
    status: "INACTIVE",
    tfa: true,
    lastSignIn: "5d ago",
    avatar: "SJ",
  },
  {
    id: 5,
    name: "Thomas Muller",
    email: "t.muller@dahoo-maintenance.com",
    role: "TECHNICIAN",
    status: "ACTIVE",
    tfa: true,
    lastSignIn: "3h ago",
    avatar: "TM",
  },
];

export default function UsersPage() {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory: activeRole,
    setActiveCategory: setActiveRole,
    filteredData,
  } = useLocalFilter({
    data: INITIAL_USERS,
    searchKeys: ["name", "email", "role"],
    initialSort: { key: "id", direction: "asc" },
  });

  const roles = ["All", "ADMINISTRATOR", "MANAGER", "AGENT", "SECURITY", "TECHNICIAN"];

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Identity &{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Access
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            TEAM MANAGEMENT • {filteredData.length} REGISTERED ENTITIES
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]">
          <Plus size={18} />
          Invite User
        </button>
      </section>

      {/* Access Controls & Filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={cn(
                "px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeRole === role || (role === "All" && !activeRole)
                  ? "bg-surface-container text-foreground shadow-sm"
                  : "text-on-surface-variant hover:text-foreground",
              )}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 flex-1 lg:w-72 border border-white/5 group focus-within:border-primary-emerald/30 transition-all">
            <Search
              size={16}
              className="text-on-surface-variant group-focus-within:text-primary-emerald transition-colors"
            />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant border border-white/5 hover:text-foreground transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* User List - Architectural Grid */}
      <AnimatedSection stagger className="grid grid-cols-1 gap-4">
        {filteredData.map((user) => (
          <AnimatedItem key={user.id}>
            <Surface
              level="container"
              className="p-4 group cursor-pointer hover:tier-2 transition-all no-line border-l-4 border-l-transparent hover:border-l-primary-emerald"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* User Bio */}
                <div className="flex items-center gap-4 min-w-80">
                  <div className="w-12 h-12 rounded-full bg-surface-lowest flex items-center justify-center text-primary-emerald font-extrabold text-sm border border-white/5 group-hover:scale-110 transition-transform relative">
                    {user.avatar}
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface-container",
                      user.status === "ACTIVE" ? "bg-primary-emerald" : "bg-red-500"
                    )} />
                  </div>
                  <div>
                    <h4 className="font-manrope font-extrabold text-lg group-hover:text-primary-emerald transition-colors">
                      {user.name}
                    </h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                      <Mail size={12} className="text-secondary-gold" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role Status */}
                <div className="w-40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    System Role
                  </p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-blue-400" />
                    <p className="text-sm font-bold tracking-tight">{user.role}</p>
                  </div>
                </div>

                {/* Security Telemetry */}
                <div className="w-48">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Security Layer
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Lock size={12} className={cn(user.tfa ? "text-primary-emerald" : "text-on-surface-variant/30")} />
                      <span className={cn("text-[9px] font-extrabold uppercase", user.tfa ? "text-primary-emerald" : "text-on-surface-variant/50")}>
                        2FA {user.tfa ? "ON" : "OFF"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Smartphone size={12} className="text-on-surface-variant" />
                      <span className="text-[9px] font-bold uppercase text-on-surface-variant/50">
                        {user.lastSignIn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="w-32">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Health Status
                  </p>
                  <div
                    className={cn(
                      "inline-flex px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase items-center gap-1.5",
                      user.status === "ACTIVE"
                        ? "bg-primary-emerald/10 text-primary-emerald"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {user.status === "ACTIVE" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {user.status}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg bg-surface-lowest text-on-surface-variant text-[10px] font-extrabold tracking-widest uppercase hover:text-primary-emerald hover:bg-primary-emerald/5 transition-all">
                    Configure
                  </button>
                  <button className="p-2.5 rounded-lg bg-surface-lowest text-on-surface-variant hover:text-foreground transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Administrative Insights */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Surface level="low" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary-emerald/10 text-primary-emerald">
              <UserCheck size={20} />
            </div>
            <h3 className="font-manrope font-bold text-lg">Active Sessions</h3>
          </div>
          <p className="text-3xl font-manrope font-extrabold mb-1">08</p>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Across 3 geographical hubs</p>
        </Surface>

        <Surface level="low" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Lock size={20} />
            </div>
            <h3 className="font-manrope font-bold text-lg">Compliance Score</h3>
          </div>
          <p className="text-3xl font-manrope font-extrabold mb-1">94%</p>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">2FA Adoption rate improved by 12%</p>
        </Surface>

        <Surface level="low" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-secondary-gold/10 text-secondary-gold">
              <Plus size={20} />
            </div>
            <h3 className="font-manrope font-bold text-lg">Pending Invites</h3>
          </div>
          <p className="text-3xl font-manrope font-extrabold mb-1">03</p>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Awaiting teammate confirmation</p>
        </Surface>
      </section>
    </Shell>
  );
}
