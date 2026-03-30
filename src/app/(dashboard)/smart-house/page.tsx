"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";
import {
  Zap,
  Droplets,
  Thermometer,
  Lock,
  Unlock,
  Wind,
  Settings,
  ShieldCheck,
  Lightbulb,
  Tv,
  Activity,
  Power,
  Droplet,
  Maximize,
} from "lucide-react";
import React, { useState } from "react";

export default function SmartHousePage() {
  const [isLocked, setIsLocked] = useState(true);

  return (
    <Shell>
      <section className="flex flex-col gap-1 mb-8">
        <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
          My Smart{" "}
          <span className="text-primary-emerald font-extrabold italic">
            House Hub
          </span>
        </h1>
        <p className="text-on-surface-variant font-medium text-sm tracking-wide uppercase mt-2">
          IoT Real-Time Telemetry •{" "}
          <span className="text-secondary-gold">
            Architectural Control Interface
          </span>
        </p>
      </section>

      {/* Environment Stats - Staggered */}
      <AnimatedSection
        stagger
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          {
            label: "Energy Usage",
            value: "2.4 kWh",
            trend: "Normal",
            icon: Zap,
            color: "text-secondary-gold",
          },
          {
            label: "Internal Temp",
            value: "22.5°C",
            trend: "Optimal",
            icon: Thermometer,
            color: "text-blue-400",
          },
          {
            label: "Humidity",
            value: "45%",
            trend: "Good",
            icon: Droplets,
            color: "text-primary-emerald",
          },
          {
            label: "Air Quality",
            value: "Excellent",
            trend: "AQI 12",
            icon: Wind,
            color: "text-purple-400",
          },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface
              level="container"
              className="p-6 flex items-center gap-4 group hover:-translate-y-1 transition-all"
            >
              <div
                className={cn(
                  "p-3 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform",
                  stat.color,
                )}
              >
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">
                  {stat.label}
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-manrope font-extrabold">
                    {stat.value}
                  </h3>
                  <span className="text-[10px] font-bold text-primary-emerald">
                    {stat.trend}
                  </span>
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Main Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Smart Visualizer & Quick Controls */}
        <Surface
          level="container"
          className="lg:col-span-3 p-8 flex flex-col gap-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-manrope font-bold text-lg text-foreground">
              System Visualizer
            </h3>
            <button className="w-8 h-8 rounded-lg bg-surface-lowest hover:bg-surface-high transition-all flex items-center justify-center text-on-surface-variant hover:text-foreground">
              <Maximize size={16} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-10">
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Visualizer center */}
              <div className="absolute inset-0 rounded-full border border-surface-container border-dashed animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-8 rounded-full border-2 border-primary-emerald/10 border-dashed animate-[spin_10s_linear_infinite_reverse]" />
              <div className="z-10 w-48 h-48 rounded-full bg-surface-container flex flex-col items-center justify-center shadow-premium relative group">
                <div className="absolute -inset-1 rounded-full border-2 border-primary-emerald/30 group-hover:border-primary-emerald transition-colors" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-[0.2em]">
                    Current State
                  </span>
                  <span className="text-3xl font-manrope font-extrabold text-foreground tracking-tight">
                    Active
                  </span>
                </div>
                <Activity
                  className="absolute bottom-10 text-primary-emerald animate-bloom"
                  size={24}
                />
              </div>

              {/* Satellite Metrics */}
              <div className="absolute top-0 flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 rounded-full bg-surface-high border border-primary-emerald/20 flex items-center justify-center text-primary-emerald shadow-lg">
                  <Zap size={18} />
                </div>
              </div>
              <div className="absolute bottom-0 flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 rounded-full bg-surface-high border border-primary-emerald/20 flex items-center justify-center text-primary-emerald shadow-lg">
                  <Unlock size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            <Surface
              level="container"
              className="p-4 flex items-center justify-between group cursor-pointer hover:bg-surface-high transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-surface-lowest flex items-center justify-center text-primary-emerald">
                  <Power size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface">
                  Automation Engine
                </span>
              </div>
              <div className="w-8 h-4 bg-primary-emerald/20 rounded-full relative p-1 shadow-inner">
                <div className="w-2 h-2 bg-primary-emerald rounded-full ml-auto" />
              </div>
            </Surface>
            <Surface
              level="container"
              className="p-4 flex items-center justify-between group cursor-pointer hover:bg-surface-high transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-surface-lowest flex items-center justify-center text-secondary-gold">
                  <ShieldCheck size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface">
                  Security Protocol
                </span>
              </div>
              <div className="w-8 h-4 bg-surface-highest rounded-full relative p-1 shadow-inner">
                <div className="w-2 h-2 bg-on-surface-variant rounded-full" />
              </div>
            </Surface>
          </div>
        </Surface>

        {/* Security Controls & Events */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Surface level="container" className="p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-manrope font-bold text-lg text-foreground">
                Access Control
              </h3>
              <span className="text-[10px] bg-primary-emerald/10 text-primary-emerald px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                Secure Connection
              </span>
            </div>

            <div className="flex items-center justify-center py-6">
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={cn(
                  "w-48 h-48 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-500 shadow-premium group relative active:scale-95",
                  isLocked
                    ? "bg-surface-lowest text-on-surface-variant"
                    : "bg-primary-emerald text-on-primary",
                )}
              >
                {!isLocked && (
                  <div className="absolute -inset-1 rounded-[32px] border-2 border-primary-emerald animate-ping opacity-20" />
                )}
                {isLocked ? (
                  <Lock
                    size={48}
                    className="group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <Unlock
                    size={48}
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
                <span className="font-manrope font-bold text-sm tracking-widest uppercase">
                  {isLocked ? "Unit B302 Locked" : "Unit B302 Active"}
                </span>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-4">
                Recent Access Logs
              </p>
              {[
                {
                  user: "Resident A",
                  time: "10:24 AM",
                  action: "Unlock",
                  status: "success",
                },
                {
                  user: "Resident B",
                  time: "08:15 AM",
                  action: "Lock",
                  status: "success",
                },
                {
                  user: "Unknown",
                  time: "04:32 AM",
                  action: "Login Attempt",
                  status: "failed",
                },
              ].map((log, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-surface-container/30 last:border-0"
                >
                  <span className="text-sm font-semibold text-on-surface">
                    {log.user}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-on-surface-variant">
                      {log.time}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                        log.status === "success"
                          ? "bg-primary-emerald/10 text-primary-emerald"
                          : "bg-red-500/10 text-red-500",
                      )}
                    >
                      {log.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            level="bright"
            className="p-8 group cursor-pointer hover:bg-surface-bright transition-all"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Droplet className="text-blue-400" size={20} />
                <h4 className="font-manrope font-bold text-lg text-foreground">
                  Leak Detection
                </h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                System monitoring for water flow anomalies. No issues detected
                in the last 72 hours.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-emerald" />
                  <span className="text-[10px] font-bold text-primary-emerald uppercase tracking-widest">
                    Normal Ops
                  </span>
                </div>
                <button className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-foreground">
                  View Diagnostics
                </button>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </Shell>
  );
}
