"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import {
  Building2,
  TreePine,
  Zap,
  Droplets,
  Calendar,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Compass,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const ASSETS = [
  {
    id: 1,
    name: "The Zenith Penthouse",
    location: "Downtown District, Sky-Level",
    year: "2024",
    area: "840 sqm",
    rating: "LEED Platinum",
    status: "ICONIC",
    image: "https://images.unsplash.com/photo-1600607687940-47a612142e03?auto=format&fit=crop&q=80&w=1200",
    stats: { efficiency: 98, solar: 64, water: 92 },
  },
  {
    id: 2,
    name: "Silicon Atrium Loft",
    location: "Tech Quarter, Cluster B",
    year: "2025",
    area: "420 sqm",
    rating: "BREEAM Outstanding",
    status: "STRATEGIC",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    stats: { efficiency: 94, solar: 82, water: 88 },
  },
  {
    id: 3,
    name: "Emerald Terrace",
    location: "Eco-Hub 4, North Sector",
    year: "2023",
    area: "1,200 sqm",
    rating: "Zero Carbon",
    status: "SUSTAINABLE",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200",
    stats: { efficiency: 100, solar: 100, water: 98 },
  },
];

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  return (
    <Shell>
      <section className="flex justify-between items-end mb-16">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-5xl text-foreground tracking-tighter">
            Architectural{" "}
            <span className="text-secondary-gold font-extrabold italic">
              Showroom
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.4em] font-medium font-manrope">
            INVESTOR ACCESS • GLOBAL ASSET VITRINE
          </p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-8 py-4 rounded-full font-extrabold text-xs uppercase tracking-widest transition-all hover:text-foreground">
             <Filter size={18} />
             Sector Audit
          </button>
          <button className="flex items-center gap-2 bg-secondary-gold text-surface-container px-8 py-4 rounded-full font-extrabold text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-premium">
            <ExternalLink size={18} />
            Investor Portal
          </button>
        </div>
      </section>

      {/* Macro Portfolio Stats */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
         {[
           { label: "Portfolio Yield", value: "14.2%", icon: Zap, detail: "Current Quarter Pulse" },
           { label: "Environmental Rating", value: "A+", icon: TreePine, detail: "Sustainable Compliance" },
           { label: "Global Presence", value: "12 Nodes", icon: Compass, detail: "Regional Infrastructure" },
         ].map((stat, i) => (
           <AnimatedItem key={i}>
              <div className="flex items-center gap-6 group cursor-crosshair">
                 <div className="p-5 rounded-3xl bg-surface-lowest text-secondary-gold group-hover:bg-secondary-gold group-hover:text-surface-container transition-all shadow-premium">
                    <stat.icon size={28} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-1">{stat.label}</p>
                    <h2 className="text-3xl font-manrope font-black tracking-tighter">{stat.value}</h2>
                    <p className="text-[9px] font-bold text-on-surface-variant mt-1 italic">{stat.detail}</p>
                 </div>
              </div>
           </AnimatedItem>
         ))}
      </AnimatedSection>

      {/* Asset Gallery Grid */}
      <AnimatedSection stagger className="space-y-32">
         {ASSETS.map((asset, i) => (
           <AnimatedItem key={asset.id}>
              <div className={cn(
                "group grid grid-cols-1 lg:grid-cols-12 gap-12 items-center",
                i % 2 !== 0 && "lg:flex-row-reverse"
              )}>
                 {/* Asset Image Node */}
                 <div className={cn(
                   "lg:col-span-7 relative overflow-hidden rounded-[2rem] aspect-[16/10] shadow-2xl",
                   i % 2 !== 0 ? "lg:order-2" : "lg:order-1"
                 )}>
                    <img 
                      src={asset.image} 
                      alt={asset.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-surface-highest/60 to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                    <div className="absolute top-8 left-8">
                       <span className="bg-surface-lowest/90 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">{asset.status}</span>
                    </div>
                    <div className="absolute bottom-8 right-8 p-4 bg-secondary-gold text-surface-container rounded-full shadow-premium opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all cursor-pointer">
                       <ArrowUpRight size={24} />
                    </div>
                 </div>

                 {/* Asset Details Node */}
                 <div className={cn(
                   "lg:col-span-5 space-y-8",
                   i % 2 !== 0 ? "lg:order-1" : "lg:order-2"
                 )}>
                    <div>
                       <div className="flex items-center gap-3 text-secondary-gold mb-3">
                          <span className="text-[8px] font-black border border-secondary-gold/30 px-2 py-0.5 rounded uppercase">NODE.0{asset.id}</span>
                          <span className="h-px w-8 bg-secondary-gold/30" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{asset.rating}</span>
                       </div>
                       <h2 className="text-4xl lg:text-5xl font-manrope font-black tracking-tighter leading-none mb-6 group-hover:text-secondary-gold transition-colors">{asset.name}</h2>
                       <p className="text-sm text-on-surface-variant font-medium leading-relaxed max-w-md italic">
                          Architectural precision meets environmental excellence in the heart of the {asset.location}. A strategic pillar of the Dahoo Elite Portfolio.
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Year Delivered</p>
                          <p className="text-xl font-manrope font-black tracking-tight">{asset.year}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Total Surface</p>
                          <p className="text-xl font-manrope font-black tracking-tight">{asset.area}</p>
                       </div>
                    </div>

                    {/* Tech & Sustainable Pulse */}
                    <div className="p-8 bg-surface-lowest rounded-3xl border border-white/5 space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Zap size={18} className="text-secondary-gold" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Energy Pulse</span>
                          </div>
                          <span className="text-[10px] font-black">{asset.stats.efficiency}%</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary-gold transition-all duration-1000" style={{ width: `${asset.stats.efficiency}%` }} />
                       </div>
                       
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <TreePine size={18} className="text-primary-emerald" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Bio-Node Health</span>
                          </div>
                          <span className="text-[10px] font-black">{asset.stats.solar}%</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-emerald transition-all duration-1000" style={{ width: `${asset.stats.solar}%` }} />
                       </div>
                    </div>

                    <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gold group/btn hover:translate-x-3 transition-transform">
                       View Strategic Blueprint <ChevronRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                 </div>
              </div>
           </AnimatedItem>
         ))}
      </AnimatedSection>

      {/* Global Portfolio Footer Pulse */}
      <section className="mt-40 pt-20 border-t border-white/5 text-center">
         <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-manrope font-bold tracking-tight uppercase">Ready to Expand Your <span className="text-secondary-gold">Asset Node?</span></h2>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest leading-loose">
               Access exclusive high-value opportunities within the Dahoo Strategic ecosystem.
            </p>
            <div className="flex justify-center gap-6">
               <button className="px-10 py-4 bg-secondary-gold text-surface-container rounded-full font-black text-xs uppercase tracking-widest shadow-premium hover:scale-105 transition-transform">
                  Contact Expansion Team
               </button>
               <button className="px-10 py-4 bg-surface-lowest border border-white/10 text-foreground rounded-full font-black text-xs uppercase tracking-widest hover:bg-surface-high transition-all">
                  Request Portfolio Audit
               </button>
            </div>
         </div>
      </section>
    </Shell>
  );
}
