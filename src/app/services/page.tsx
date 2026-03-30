"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  Waves,
  Calendar,
  Clock,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Coffee,
  Heart,
  Car,
  Wind,
  Search,
  CheckCircle2,
  Lock,
  Star,
  Activity,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const AMENITIES = [
  {
    id: 1,
    name: "Elite Infinity Pool",
    category: "WELLNESS",
    status: "OPEN",
    occupancy: "Low",
    capacity: "45 Max",
    image: "https://images.unsplash.com/photo-1540555700478-4be289a5090a?auto=format&fit=crop&q=80&w=800",
    description: "Sky-high relaxation with panoramic views of the city skyline.",
  },
  {
    id: 2,
    name: "Zenith Private Spa",
    category: "RELAXATION",
    status: "BOOKED",
    occupancy: "At Capacity",
    capacity: "12 Max",
    image: "https://images.unsplash.com/photo-1544161515-436cefb544de?auto=format&fit=crop&q=80&w=800",
    description: "Therapeutic treatments and hydrotherapy sessions in total privacy.",
  },
  {
    id: 3,
    name: "Cloud 9 Sky Lounge",
    category: "SOCIAL",
    status: "OPEN",
    occupancy: "Normal",
    capacity: "80 Max",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
    description: "The ultimate social space for networking and executive leisure.",
  },
];

export default function ServicesPage() {
  const [selectedAmenity, setSelectedAmenity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ALL");

  const {
    searchQuery,
    setSearchQuery,
    filteredData,
  } = useLocalFilter({
    data: AMENITIES,
    searchKeys: ["name", "category", "description"],
    initialSort: { key: "name", direction: "asc" },
  });

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Luxury{" "}
            <span className="text-secondary-gold font-extrabold italic">
              Amenities
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            SERVICE EXPERIENCE • REAL-TIME AVAILABILITY PULSE
          </p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 bg-surface-lowest border border-white/5 text-on-surface-variant px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:text-foreground">
             <Calendar size={18} />
             Global Schedule
          </button>
          <button className="flex items-center gap-2 bg-secondary-gold text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(233,195,73,0.2)]">
            <Plus size={18} />
            New Booking
          </button>
        </div>
      </section>

      {/* Service Categories Quick Pulse */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Wellness Hub", count: "08 ACTIVE", icon: Wind, color: "text-blue-400" },
          { label: "Elite Concierge", count: "LIVE SYNC", icon: Star, color: "text-secondary-gold" },
          { label: "Private Valet", count: "04 MIN WAIT", icon: Car, color: "text-primary-emerald" },
          { label: "Social Nodes", count: "12 EVENTS", icon: Coffee, color: "text-purple-400" },
        ].map((service, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-6 transition-all hover:tier-2 group cursor-pointer border border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-2.5 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform", service.color)}>
                  <service.icon size={20} />
                </div>
                <ChevronRight size={14} className="text-on-surface-variant/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">{service.label}</p>
              <h3 className="text-lg font-manrope font-extrabold uppercase tracking-widest">{service.count}</h3>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
          {["ALL", "WELLNESS", "SOCIAL", "PRIVATE"].map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeTab === t ? "bg-surface-container text-secondary-gold shadow-premium" : "text-on-surface-variant hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 flex-1 lg:w-96 border border-white/5 group focus-within:border-secondary-gold/30 transition-all">
            <Search size={16} className="text-on-surface-variant group-focus-within:text-secondary-gold transition-colors" />
            <input
              type="text"
              placeholder="Search services, nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
      </div>

      {/* Amenity Grid */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.map((amenity) => (
          <AnimatedItem key={amenity.id}>
            <Surface 
              level="container" 
              onClick={() => setSelectedAmenity(amenity)}
              className="group overflow-hidden cursor-pointer hover:tier-2 transition-all duration-500 hover:-translate-y-2 border-l-2 border-l-transparent hover:border-l-secondary-gold p-0"
            >
              <div className="h-64 w-full relative overflow-hidden">
                <img src={amenity.image} alt={amenity.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className="bg-surface-lowest/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">{amenity.category}</span>
                   <div className={cn(
                     "backdrop-blur-md text-surface-container text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5",
                     amenity.status === "OPEN" ? "bg-primary-emerald/90" : "bg-red-500/90"
                   )}>
                      {amenity.status === "OPEN" ? <Waves size={12} /> : <Lock size={12} />} {amenity.status}
                   </div>
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-surface-container/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-manrope font-extrabold text-xl group-hover:text-secondary-gold transition-colors leading-tight mb-2 pr-4">{amenity.name}</h3>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-xs">{amenity.description}</p>
                  </div>
                   <button className="text-on-surface-variant hover:text-secondary-gold text-right">
                      <MoreVertical size={18} />
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Asset Load</span>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 h-1 bg-surface-lowest rounded-full overflow-hidden">
                            <div className={cn(
                              "h-full transition-all duration-1000",
                              amenity.occupancy === "Low" ? "bg-primary-emerald w-1/4" : amenity.occupancy === "Normal" ? "bg-secondary-gold w-1/2" : "bg-red-500 w-full"
                            )} />
                         </div>
                         <span className="text-[10px] font-extrabold uppercase tracking-tighter">{amenity.occupancy}</span>
                      </div>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Capacity Node</span>
                      <span className="text-xs font-black tracking-widest uppercase">{amenity.capacity}</span>
                   </div>
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Availability Detail Overview */}
      <section className="mt-16">
         <div className="flex items-center gap-4 mb-8">
            <h2 className="font-manrope font-bold text-2xl text-foreground tracking-tight uppercase tracking-[0.1em]">24h Operational <span className="text-primary-emerald">Flow</span></h2>
            <div className="flex-1 h-px bg-white/5" />
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary-gold bg-secondary-gold/10 px-4 py-2 rounded-lg border border-secondary-gold/20">
               <Activity size={12} className="animate-pulse" /> Live Telemetry Pulse
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Surface key={i} level="low" className="p-6 group hover:tier-2 transition-all border border-white/5 border-b-2 border-b-transparent hover:border-b-primary-emerald">
                 <div className="flex justify-between items-center mb-6">
                    <div className="p-2.5 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform">
                       <Clock size={16} className="text-on-surface-variant/50 group-hover:text-primary-emerald" />
                    </div>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Zone 0{i + 1}</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <h4 className="text-xs font-extrabold uppercase tracking-[0.15em] mb-1">Peak Utilization</h4>
                       <p className="text-2xl font-manrope font-black tracking-tighter">1{i + 4}:00 <span className="text-sm font-bold text-on-surface-variant">UTC</span></p>
                    </div>
                    <ArrowUpRight size={18} className="text-primary-emerald/30 group-hover:text-primary-emerald transition-colors" />
                 </div>
              </Surface>
            ))}
         </div>
      </section>

      {/* Asset Maintenance Pulse Sidebar / Detail Panel Hook */}
      <section className="mt-12 flex justify-center">
         <button className="flex items-center gap-4 bg-surface-lowest text-on-surface-variant hover:text-foreground px-8 py-4 rounded-full border border-white/5 transition-all hover:scale-105 active:scale-95 shadow-premium group">
            <ShieldCheck size={20} className="group-hover:text-secondary-gold transition-colors" />
            <span className="text-xs font-extrabold uppercase tracking-widest">Verify Safety Certification Nodes</span>
            <ArrowUpRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" />
         </button>
      </section>
    </Shell>
  );
}
