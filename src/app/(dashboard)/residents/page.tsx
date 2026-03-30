"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { Modal } from "@/components/ui/Modal";
import { DetailsPanel } from "@/components/ui/DetailsPanel";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  Contact,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Home,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  ChevronRight,
  UserCheck,
  CreditCard,
  ShieldCheck,
  UserPlus,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const INITIAL_RESIDENTS = [
  {
    id: 1,
    name: "Dr. Julian Thorne",
    unit: "Penthouse 4",
    email: "j.thorne@skyline.com",
    leaseStart: "Jan 12, 2024",
    leaseEnd: "Jan 12, 2026",
    rent: "$12,500",
    status: "ACTIVE",
    category: "VIP",
    avatar: "JT",
  },
  {
    id: 2,
    name: "Sarah McConnely",
    unit: "Villa A12",
    email: "s.mcconnely@gmail.com",
    leaseStart: "Mar 05, 2025",
    leaseEnd: "Mar 05, 2026",
    rent: "$21,000",
    status: "EXPIRING",
    category: "PREMIUM",
    avatar: "SM",
  },
  {
    id: 3,
    name: "Marcus Aurelius",
    unit: "Emerald Apt 2",
    email: "m.aurelius@rome.it",
    leaseStart: "Jun 20, 2024",
    leaseEnd: "Jun 20, 2025",
    rent: "$8,200",
    status: "ARREARS",
    category: "STANDARD",
    avatar: "MA",
  },
  {
    id: 4,
    name: "Elena Gilbert",
    unit: "Skyline Suite 1",
    email: "e.gilbert@mystic.com",
    leaseStart: "Sep 15, 2024",
    leaseEnd: "Sep 15, 2025",
    rent: "$5,400",
    status: "ACTIVE",
    category: "PREMIUM",
    avatar: "EG",
  },
  {
    id: 5,
    name: "Thomas Drake",
    unit: "Studio C4",
    email: "t.drake@dahoo-ops.com",
    leaseStart: "Nov 01, 2022",
    leaseEnd: "Nov 01, 2025",
    rent: "$4,200",
    status: "ACTIVE",
    category: "STANDARD",
    avatar: "TD",
  },
];

export default function ResidentsPage() {
  const [residents, setResidents] = useState(INITIAL_RESIDENTS);
  const [selectedResident, setSelectedResident] = useState<any>(null);
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
    data: residents,
    searchKeys: ["name", "unit", "email"],
    initialSort: { key: "id", direction: "asc" },
  });

  const statusFilters = ["All", "ACTIVE", "EXPIRING", "ARREARS"];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedResident(null);
    }, 1500);
  };

  const handleDelete = () => {
    setResidents(residents.filter((r) => r.id !== selectedResident.id));
    setSelectedResident(null);
    setIsDeleteModalOpen(false);
  };

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes = {
      id: Date.now(),
      name: "New Estate Resident",
      unit: "TBD",
      email: "new.resident@dahoo.com",
      leaseStart: "Apr 01, 2026",
      leaseEnd: "Apr 01, 2027",
      rent: "$4,500",
      status: "ACTIVE",
      category: "STANDARD",
      avatar: "NR",
    };
    setResidents([newRes, ...residents]);
    setIsAddModalOpen(false);
  };

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Resident{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Portfolio
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            RENTAL MANAGEMENT • {filteredData.length} ACTIVE LEASES
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-foreground">
            <FileText size={18} />
            Lease Builder
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]"
          >
            <UserPlus size={18} />
            Add Resident
          </button>
        </div>
      </section>

      {/* Resident Stats */}
      <AnimatedSection
        stagger
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {[
          {
            label: "Total Residents",
            value: residents.length.toString(),
            icon: Contact,
            color: "text-blue-400",
          },
          {
            label: "Critical Arrears",
            value: residents
              .filter((r) => r.status === "ARREARS")
              .length.toString()
              .padStart(2, "0"),
            icon: AlertCircle,
            color: "text-red-400",
          },
          {
            label: "Expiring soon",
            value: residents
              .filter((r) => r.status === "EXPIRING")
              .length.toString()
              .padStart(2, "0"),
            icon: Clock,
            color: "text-secondary-gold",
          },
          {
            label: "Compliance",
            value: "98.2%",
            icon: ShieldCheck,
            color: "text-primary-emerald",
          },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface
              level="container"
              className="p-6 transition-all hover:tier-2 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform",
                    stat.color,
                  )}
                >
                  <stat.icon size={22} />
                </div>
                <div className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                  Global Ops
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-manrope font-extrabold mb-1">
                {stat.value}
              </h3>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={cn(
                "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeStatus === s || (s === "All" && !activeStatus)
                  ? "bg-surface-container text-primary-emerald shadow-sm"
                  : "text-on-surface-variant hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 flex-1 lg:w-96 border border-white/5 group focus-within:border-primary-emerald/30 transition-all">
            <Search
              size={16}
              className="text-on-surface-variant group-focus-within:text-primary-emerald transition-colors"
            />
            <input
              type="text"
              placeholder="Search by name, unit, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
      </div>

      {/* Resident Ledger */}
      <AnimatedSection stagger className="space-y-4">
        {filteredData.map((res) => (
          <AnimatedItem key={res.id}>
            <Surface
              level="container"
              onClick={() => setSelectedResident(res)}
              className={cn(
                "p-4 group cursor-pointer hover:tier-2 transition-all no-line border-l-4",
                res.status === "ARREARS"
                  ? "border-l-red-500"
                  : res.status === "EXPIRING"
                    ? "border-l-secondary-gold"
                    : "border-l-transparent hover:border-l-primary-emerald",
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                {/* Person Bio */}
                <div className="flex items-center gap-5 min-w-96">
                  <div className="w-12 h-12 rounded-full bg-surface-lowest flex items-center justify-center text-primary-emerald font-extrabold text-sm border border-white/5 group-hover:scale-110 transition-transform">
                    {res.avatar}
                  </div>
                  <div>
                    <h4 className="font-manrope font-extrabold text-lg group-hover:text-primary-emerald transition-colors leading-tight">
                      {res.name}
                    </h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-0.5 flex items-center gap-2">
                      <Mail size={12} className="text-secondary-gold" />{" "}
                      {res.email}
                    </p>
                  </div>
                </div>

                {/* Asset Attribution */}
                <div className="w-40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Assigned Unit
                  </p>
                  <div className="flex items-center gap-2">
                    <Home size={14} className="text-blue-400" />
                    <p className="text-sm font-bold">{res.unit}</p>
                  </div>
                </div>

                {/* Lease Cycle */}
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Lease Cycle
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-foreground">
                        {res.leaseStart}
                      </span>
                      <span className="text-[8px] font-bold text-on-surface-variant/50 uppercase">
                        Started
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-on-surface-variant/30"
                    />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-foreground">
                        {res.leaseEnd}
                      </span>
                      <span className="text-[8px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
                        Ending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rent & Status */}
                <div className="w-40 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Monthly Billing
                  </p>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-manrope font-extrabold text-foreground">
                      {res.rent}
                    </span>
                    <div
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-[8px] font-extrabold tracking-widest uppercase items-center gap-1 mt-1",
                        res.status === "ACTIVE"
                          ? "bg-primary-emerald/10 text-primary-emerald"
                          : res.status === "ARREARS"
                            ? "bg-red-500/10 text-red-400 font-black animate-pulse"
                            : "bg-secondary-gold/10 text-secondary-gold",
                      )}
                    >
                      {res.status === "ACTIVE" ? (
                        <CheckCircle2 size={10} />
                      ) : res.status === "ARREARS" ? (
                        <AlertCircle size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      {res.status}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); /* Call Logic */
                    }}
                    className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant hover:text-primary-emerald transition-all"
                  >
                    <Phone size={18} />
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

      {/* Add Resident Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Resident Profile"
        description="Initialize a new resident node in the estate portfolio."
        tier="info"
        actionLabel="Register Resident"
        onAction={() => handleAddResident({} as any)}
      >
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-on-surface-variant">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Jane Smith"
                className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-on-surface-variant">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="e.g. jane@residence.com"
                className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-on-surface-variant">
                Assigned Unit
              </label>
              <input
                type="text"
                placeholder="e.g. Penthouse 4"
                className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-on-surface-variant">
                Strategic Tier
              </label>
              <select className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30 accent-primary-emerald">
                <option>STANDARD</option>
                <option>PREMIUM</option>
                <option>VIP</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Terminate Lease Node?"
        description="This will end the active lease and move the resident profile to historical archives. This action is terminal."
        tier="danger"
        actionLabel="Confirm Termination"
        onAction={handleDelete}
      />

      {/* Resident Detail Panel */}
      <DetailsPanel
        isOpen={!!selectedResident}
        onClose={() => setSelectedResident(null)}
        title={selectedResident?.name || ""}
        subtitle={`Resident Tier: ${selectedResident?.category} • unit ${selectedResident?.unit}`}
        onSave={handleSave}
        onDelete={() => setIsDeleteModalOpen(true)}
        isSaving={isSaving}
      >
        {selectedResident && (
          <div className="space-y-10">
            {/* Direct Contact Node */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 p-6 bg-surface-lowest border border-white/5 rounded-2xl hover:bg-surface-high transition-all group">
                <Mail
                  size={20}
                  className="text-secondary-gold group-hover:scale-110 transition-transform"
                />
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase text-on-surface-variant">
                    Email Dispatch
                  </p>
                  <p className="text-xs font-bold truncate max-w-30">
                    {selectedResident.email}
                  </p>
                </div>
              </button>
              <button className="flex items-center justify-center gap-3 p-6 bg-surface-lowest border border-white/5 rounded-2xl hover:bg-surface-high transition-all group">
                <Phone
                  size={20}
                  className="text-primary-emerald group-hover:scale-110 transition-transform"
                />
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase text-on-surface-variant">
                    Secure Line
                  </p>
                  <p className="text-xs font-bold">+971 50 *** ****</p>
                </div>
              </button>
            </div>

            {/* Lease Metadata */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <FileText size={14} /> Contract Lifecycle
              </h3>
              <Surface
                level="high"
                className="p-8 border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-emerald/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="grid grid-cols-2 gap-10 relative z-10">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">
                        Commencement
                      </p>
                      <p className="text-lg font-manrope font-extrabold">
                        {selectedResident.leaseStart}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">
                        Monthly Obligation
                      </p>
                      <p className="text-lg font-manrope font-extrabold text-primary-emerald">
                        {selectedResident.rent}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">
                        Expiration Node
                      </p>
                      <p className="text-lg font-manrope font-extrabold">
                        {selectedResident.leaseEnd}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">
                        Status Pulse
                      </p>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          selectedResident.status === "ACTIVE"
                            ? "bg-primary-emerald/10 text-primary-emerald"
                            : "bg-red-500/10 text-red-400",
                        )}
                      >
                        {selectedResident.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Surface>
            </div>

            {/* Payment Record Pulse */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <CreditCard size={14} /> Settlement Log
                </h3>
                <span className="text-[9px] font-black text-primary-emerald uppercase">
                  Sync: Optimal
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "#INV-842", month: "March 2026", status: "Settled" },
                  { id: "#INV-721", month: "February 2026", status: "Settled" },
                  { id: "#INV-604", month: "January 2026", status: "Settled" },
                ].map((inv, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-surface-lowest rounded-xl border border-white/5 flex justify-between items-center group hover:bg-surface-high transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={16}
                        className="text-primary-emerald"
                      />
                      <span className="text-xs font-bold">{inv.month}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase">
                        {inv.id}
                      </span>
                      <span className="text-[9px] font-black uppercase text-primary-emerald">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailsPanel>
    </Shell>
  );
}
