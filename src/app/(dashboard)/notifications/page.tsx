"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  Bell,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  MailWarning,
  Info,
  ShieldCheck,
  Zap,
  Droplets,
  MoreHorizontal,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "AC Repair Completed",
    desc: "Technician Tech-01 has successfully repaired the AC in Penthouse 4.",
    type: "SYSTEM",
    category: "MAINTENANCE",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    title: "Unusual Energy Spike",
    desc: "A significant increase in energy consumption detected in Villa A12.",
    type: "ALERT",
    category: "SMART_HOUSE",
    time: "1h ago",
    read: false,
  },
  {
    id: 3,
    title: "Monthly Rent Invoice",
    desc: "Your invoice for April 2026 is now available for review and payment.",
    type: "FINANCIAL",
    category: "FINANCE",
    time: "3h ago",
    read: true,
  },
  {
    id: 4,
    title: "New Community Post",
    desc: "A new announcement regarding pool maintenance has been posted.",
    type: "COMMUNITY",
    category: "SOCIAL",
    time: "5h ago",
    read: true,
  },
  {
    id: 5,
    title: "Security System Armed",
    desc: "Dahoo Sentinel has been successfully armed for Unit B302.",
    type: "SECURITY",
    category: "SAFETY",
    time: "1d ago",
    read: true,
  },
];

export default function NotificationsPage() {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredData,
  } = useLocalFilter({
    data: NOTIFICATIONS,
    searchKeys: ["title", "desc", "type", "category"],
    initialSort: { key: "id", direction: "desc" },
  });

  const categories = ["All", "ALERT", "SYSTEM", "FINANCIAL"];

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Asset{" "}
            <span className="text-secondary-gold font-extrabold italic">
              Notifications
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            REAL-TIME FEED • {NOTIFICATIONS.filter((n) => !n.read).length}{" "}
            UNREAD MESSAGES
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-foreground">
            <CheckCircle2 size={18} />
            Mark All Read
          </button>
          <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-red-400">
            <Trash2 size={18} />
            Clear All
          </button>
        </div>
      </section>

      {/* Notification Inbox Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeCategory === c || (c === "All" && !activeCategory)
                  ? "bg-surface-container text-secondary-gold shadow-sm"
                  : "text-on-surface-variant hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 flex-1 lg:w-96 border border-white/5 group focus-within:border-secondary-gold/30 transition-all">
            <Search
              size={16}
              className="text-on-surface-variant group-focus-within:text-secondary-gold transition-colors"
            />
            <input
              type="text"
              placeholder="Search across all notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
      </div>

      {/* Notifications Inbox - Staggered */}
      <AnimatedSection stagger className="space-y-4">
        {filteredData.map((notif) => (
          <AnimatedItem key={notif.id}>
            <Surface
              level="container"
              className={cn(
                "p-6 group cursor-pointer hover:tier-2 transition-all duration-300 no-line border-l-4",
                notif.read
                  ? "border-l-transparent opacity-80"
                  : "border-l-secondary-gold",
              )}
            >
              <div className="flex items-start gap-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full bg-surface-lowest flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110",
                    notif.type === "ALERT"
                      ? "text-amber-500"
                      : notif.type === "SYSTEM"
                        ? "text-blue-400"
                        : notif.type === "FINANCIAL"
                          ? "text-primary-emerald"
                          : "text-purple-400",
                  )}
                >
                  {notif.type === "ALERT" ? (
                    <MailWarning size={22} />
                  ) : notif.type === "SYSTEM" ? (
                    <Info size={22} />
                  ) : notif.type === "FINANCIAL" ? (
                    <DollarSign size={22} />
                  ) : (
                    <MessageSquare size={22} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-manrope font-extrabold text-lg group-hover:text-secondary-gold transition-colors flex items-center gap-3">
                      {notif.title}
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-secondary-gold shadow-[0_0_10px_rgba(233,195,73,0.5)]" />
                      )}
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {notif.time}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium leading-relaxed max-w-2xl mb-4",
                      notif.read
                        ? "text-on-surface-variant/70"
                        : "text-on-surface-variant",
                    )}
                  >
                    {notif.desc}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex gap-3">
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant px-3 py-1 bg-surface-lowest rounded-md">
                        {notif.category}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant px-3 py-1 bg-surface-lowest rounded-md">
                        {notif.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-surface-lowest text-on-surface-variant hover:text-foreground">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-surface-lowest text-on-surface-variant hover:text-foreground">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>
    </Shell>
  );
}
