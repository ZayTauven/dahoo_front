"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  ShieldCheck,
  Search,
  Filter,
  Lock,
  Unlock,
  Eye,
  Video,
  Activity,
  Zap,
  Bell,
  Clock,
  MoreHorizontal,
  ChevronRight,
  UserCheck,
  Smartphone,
  MapPin,
  RefreshCcw,
  Plus,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const SECURITY_LOGS = [
  {
    id: 1,
    event: "Main Entrance Door Opened",
    user: "Sarah Jenkins",
    time: "2m ago",
    status: "SUCCESS",
    device: "RFID-READER-B3",
    location: "Lobby",
  },
  {
    id: 2,
    event: "Facial Recognition Entry",
    user: "Michael Chen",
    time: "15m ago",
    status: "SUCCESS",
    device: "SENTINEL-CAM-01",
    location: "Garage Level 1",
  },
  {
    id: 3,
    event: "Failed Access Attempt",
    user: "Unknown",
    time: "1h ago",
    status: "FAILED",
    device: "KEYPAD-04",
    location: "Service Entrance",
  },
  {
    id: 4,
    event: "Smart Lock Disarmed",
    user: "Management",
    time: "3h ago",
    status: "SUCCESS",
    device: "D_LOCK_02",
    location: "Maintenance Room",
  },
  {
    id: 5,
    event: "Motion Detected",
    user: "N/A",
    time: "5h ago",
    status: "ALERT",
    device: "PIR-SENSOR-08",
    location: "Main Perimeter",
  },
];

export default function SecurityPage() {
  const [isArmed, setIsArmed] = useState(true);

  const {
    searchQuery,
    setSearchQuery,
    activeCategory: activeStatus,
    setActiveCategory: setActiveStatus,
    filteredData,
  } = useLocalFilter({
    data: SECURITY_LOGS,
    searchKeys: ["event", "user", "device", "location"],
    initialSort: { key: "id", direction: "desc" },
  });

  const statuses = ["All", "SUCCESS", "FAILED", "ALERT"];

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Security{" "}
            <span className="text-secondary-gold font-extrabold italic">
              Command
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            DAHOO SENTINEL • SYSTEM PROTECTION ACTIVE
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsArmed(!isArmed)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:scale-[1.05] shadow-lg",
              isArmed
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/20",
            )}
          >
            {isArmed ? <ShieldCheck size={18} /> : <Unlock size={18} />}
            {isArmed ? "Disarm System" : "Arm System"}
          </button>
          <button className="flex items-center gap-2 bg-secondary-gold text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(233,195,73,0.2)]">
            <RefreshCcw size={18} />
            Reboot Matrix
          </button>
        </div>
      </section>

      {/* Security Status Grid */}
      <AnimatedSection
        stagger
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {[
          {
            label: "Surveillance",
            value: "Active",
            sub: "12 Channels",
            icon: Video,
            color: "text-blue-400",
          },
          {
            label: "Access Control",
            value: "Secure",
            sub: "All points locked",
            icon: Lock,
            color: "text-purple-400",
          },
          {
            label: "Intrusion Detection",
            value: "Clean",
            sub: "No alerts today",
            icon: Eye,
            color: "text-primary-emerald",
          },
          {
            label: "System Uptime",
            value: "99.9%",
            sub: "Since last reboot",
            icon: Zap,
            color: "text-secondary-gold",
          },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface
              level="container"
              className="p-6 group hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-surface-lowest group-hover:rotate-12 transition-transform",
                    stat.color,
                  )}
                >
                  <stat.icon size={22} />
                </div>
                <div className="w-2 h-2 rounded-full bg-primary-emerald shadow-[0_0_10px_rgba(78,222,163,0.5)] animate-pulse" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-manrope font-extrabold mb-1">
                {stat.value}
              </h3>
              <p className="text-[10px] font-bold text-on-surface-variant/70">
                {stat.sub}
              </p>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Main Live View Placeholder */}
        <AnimatedSection direction="none" delay={0.2} className="lg:col-span-2">
          <Surface
            level="container"
            className="p-0 overflow-hidden min-h-125 flex flex-col group no-line border border-white/5 bg-black/40"
          >
            <div className="p-6 flex justify-between items-center bg-surface-lowest border-b border-white/5">
              <div className="flex items-center gap-3">
                <Video
                  size={18}
                  className="text-red-400 group-hover:animate-pulse"
                />
                <h3 className="font-manrope font-extrabold text-lg uppercase tracking-widest">
                  Main Entry Cam • 01
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-red-400 animate-pulse">
                  REC • LIVE
                </span>
                <button className="p-1.5 hover:text-foreground text-on-surface-variant transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full relative flex items-center justify-center bg-linear-to-br from-background to-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(233,195,73,0.05)_0%,transparent_70%)]" />
              <div className="text-center">
                <Activity
                  size={48}
                  className="text-secondary-gold/20 mx-auto mb-4"
                />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant/50">
                  Neural Stream Buffering...
                </p>
              </div>
              {/* Cam Controls Interface Style */}
              <div className="absolute bottom-8 left-8 flex gap-4">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span className="text-[9px] font-extrabold text-white/80 uppercase">
                    Stream Latency: 42ms
                  </span>
                </div>
              </div>
            </div>
          </Surface>
        </AnimatedSection>

        {/* Access Logs Column */}
        <AnimatedSection
          direction="none"
          delay={0.4}
          className="flex flex-col gap-8"
        >
          <Surface level="container" className="p-8 no-line">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-manrope font-extrabold text-lg">
                Access Logs
              </h3>
              <button className="text-[10px] font-bold uppercase text-secondary-gold hover:underline">
                View Global
              </button>
            </div>

            <div className="space-y-6">
              {filteredData.slice(0, 4).map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div
                    className={cn(
                      "mt-1 w-2 h-2 rounded-full",
                      log.status === "SUCCESS"
                        ? "bg-primary-emerald"
                        : log.status === "FAILED"
                          ? "bg-red-400 animate-pulse"
                          : "bg-secondary-gold",
                    )}
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-secondary-gold transition-colors">
                      {log.event}
                    </p>
                    <p className="text-[10px] font-medium text-on-surface-variant uppercase mt-0.5">
                      {log.user} • {log.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            level="container"
            className="p-8 no-line bg-linear-to-br from-surface-container to-black/60"
          >
            <div className="flex items-center gap-3 mb-6">
              <Smartphone size={20} className="text-blue-400" />
              <h3 className="font-manrope font-extrabold text-lg">
                Biometric Matrix
              </h3>
            </div>
            <p className="text-xs font-medium text-on-surface-variant leading-relaxed mb-6">
              Multi-factor authentication is active for all administrative
              endpoints.
            </p>
            <div className="flex gap-4">
              <div className="flex-1 p-3 bg-surface-lowest rounded-xl border border-white/5 text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                  Face ID
                </p>
                <p className="text-xs font-extrabold text-primary-emerald">
                  ACTIVE
                </p>
              </div>
              <div className="flex-1 p-3 bg-surface-lowest rounded-xl border border-white/5 text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                  Fingerprint
                </p>
                <p className="text-xs font-extrabold text-primary-emerald">
                  ACTIVE
                </p>
              </div>
            </div>
          </Surface>
        </AnimatedSection>
      </div>

      {/* Access Controls Grid */}
      <h3 className="font-manrope font-extrabold text-xl mb-6">
        Connected Security Points
      </h3>
      <AnimatedSection
        stagger
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            name: "Main Lobby Entrance",
            device: "SMART-GATEWAY-01",
            status: "Secure",
            icon: ShieldCheck,
            color: "text-primary-emerald",
          },
          {
            name: "Garage Speed Gate",
            device: "RFID-SENSOR-B2",
            status: "Secure",
            icon: Lock,
            color: "text-blue-400",
          },
          {
            name: "Server Room Lock",
            device: "BIO-READER-V3",
            status: "Secure",
            icon: UserCheck,
            color: "text-purple-400",
          },
          {
            name: "Roof Access Hub",
            device: "GATE-O-TRON",
            status: "Armed",
            icon: MapPin,
            color: "text-secondary-gold",
          },
        ].map((point, i) => (
          <AnimatedItem key={i}>
            <Surface
              level="container"
              className="p-6 group cursor-pointer hover:tier-2 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "p-3 rounded-xl bg-surface-lowest transition-transform group-hover:scale-110",
                    point.color,
                  )}
                >
                  <point.icon size={22} />
                </div>
                <div className="px-2 py-1 rounded-md bg-primary-emerald/10 text-primary-emerald text-[9px] font-extrabold uppercase">
                  {point.status}
                </div>
              </div>
              <h4 className="font-manrope font-bold text-sm mb-1">
                {point.name}
              </h4>
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                {point.device}
              </p>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>
    </Shell>
  );
}
