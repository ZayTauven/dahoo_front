"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { DetailsPanel } from "@/components/ui/DetailsPanel";
import { Modal } from "@/components/ui/Modal";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  Building2,
  MapPin,
  Bed,
  Square,
  Search,
  Filter,
  Plus,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Home,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  Droplets,
  ShieldCheck,
  DollarSign,
  Activity,
  Brain,
  Thermometer,
  CloudRain,
  Timer,
  ScanFace,
  Image as ImageIcon,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const YIELD_DATA = [
  { month: "Jan", yield: 4.2 },
  { month: "Feb", yield: 4.8 },
  { month: "Mar", yield: 5.1 },
  { month: "Apr", yield: 6.2 },
  { month: "May", yield: 7.4 },
  { month: "Jun", yield: 8.8 },
];

const INITIAL_PROPERTIES = [
  {
    id: 1,
    name: "Skyline Penthouse",
    location: "Downtown Dubai",
    status: "Occupied",
    rent: "$12,500",
    type: "LUXURY",
    beds: 4,
    area: "450m²",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    smartScore: 98,
    yield: "14.2%",
  },
  {
    id: 2,
    name: "Azure Villa",
    location: "Palm Jumeirah",
    status: "Available",
    rent: "$21,000",
    type: "PREMIUM",
    beds: 6,
    area: "820m²",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800",
    smartScore: 92,
    yield: "11.8%",
  },
  {
    id: 3,
    name: "Emerald Heights",
    location: "Business Bay",
    status: "Maintenance",
    rent: "$8,200",
    type: "MODERN",
    beds: 2,
    area: "180m²",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    smartScore: 84,
    yield: "9.4%",
  },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredData,
  } = useLocalFilter({
    data: properties,
    searchKeys: ["name", "location", "type"],
    initialSort: { key: "name", direction: "asc" },
  });

  const categories = ["All", "Occupied", "Available", "Maintenance"];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedProperty(null);
    }, 1500);
  };

  const handleDelete = () => {
    setProperties(properties.filter(p => p.id !== selectedProperty.id));
    setSelectedProperty(null);
    setIsDeleteModalOpen(false);
  };

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp = {
      id: Date.now(),
      name: "New Architectural Node",
      location: "Active Sector",
      status: "Available",
      rent: "$15,000",
      type: "MODERN",
      beds: 3,
      area: "240m²",
      image: "https://images.unsplash.com/photo-1600607687940-47a612142e03?auto=format&fit=crop&q=80&w=800",
      smartScore: 90,
      yield: "10.5%",
    };
    setProperties([newProp, ...properties]);
    setIsAddModalOpen(false);
  };

  return (
    <Shell>
      {/* Portfolio Quick Stats */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Portfolio Asset Mass", value: properties.length.toString(), icon: Building2, color: "text-primary-emerald" },
          { label: "Occupancy Density", value: "94.2%", icon: Activity, color: "text-blue-400" },
          { label: "Yield Momentum", value: "12.4%", icon: TrendingUp, color: "text-secondary-gold" },
          { label: "Operational Load", value: "Stable", icon: Layers, color: "text-purple-400" },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-6 transition-all hover:tier-2 group">
              <div className="flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{stat.label}</p>
                   <h3 className="text-2xl font-manrope font-extrabold">{stat.value}</h3>
                </div>
                <div className={cn("p-2.5 rounded-xl bg-surface-lowest group-hover:scale-110 transition-transform", stat.color)}>
                  <stat.icon size={20} />
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Strategic{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Portfolio
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            ASSET INTELLIGENCE • {filteredData.length} ACTIVE CLUSTERS
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]"
        >
          <Plus size={18} />
          Append Asset
        </button>
      </section>

      {/* Filter Bar */}
      <Surface level="container" className="p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-3 w-full md:w-96 border border-white/5 group focus-within:border-primary-emerald/30 transition-all">
          <Search size={18} className="text-on-surface-variant group-focus-within:text-primary-emerald transition-colors" />
          <input
            type="text"
            placeholder="Search assets, clusters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-on-surface-variant/50"
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeCategory === cat || (cat === "All" && !activeCategory) ? "bg-surface-container text-primary-emerald" : "text-on-surface-variant hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </Surface>

      {/* Property Grid */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.map((prop) => (
          <AnimatedItem key={prop.id}>
            <Surface
              level="container"
              onClick={() => setSelectedProperty(prop)}
              className="group overflow-hidden cursor-pointer hover:tier-2 transition-all duration-500 hover:-translate-y-2 border-l-2 border-l-transparent hover:border-l-primary-emerald"
            >
              <div className="h-56 w-full relative overflow-hidden">
                <img src={prop.image} alt={prop.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className="bg-surface-lowest/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">{prop.type}</span>
                   {prop.smartScore > 90 && (
                     <div className="bg-primary-emerald/90 backdrop-blur-md text-surface-container text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                       <Brain size={12} /> Smart Node
                     </div>
                   )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-manrope font-extrabold text-xl group-hover:text-primary-emerald transition-colors">{prop.name}</h3>
                    <div className="flex items-center gap-1.5 text-on-surface-variant mt-1.5">
                      <MapPin size={12} className="text-secondary-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{prop.location}</span>
                    </div>
                  </div>
                   <div className="text-right">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Asset Yield</p>
                    <span className="text-xl font-manrope font-extrabold text-primary-emerald">{prop.yield}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Occupancy Index</span>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 h-1.5 bg-surface-lowest rounded-full overflow-hidden">
                            <div className="h-full bg-primary-emerald" style={{ width: '85%' }} />
                         </div>
                         <span className="text-[10px] font-extrabold">85%</span>
                      </div>
                   </div>
                   <div className="flex items-center justify-end">
                      <button className="text-[9px] font-extrabold text-secondary-gold uppercase tracking-widest hover:underline flex items-center gap-1">
                        View Blueprint <ArrowUpRight size={12} />
                      </button>
                   </div>
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      {/* Append Asset Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Append New Asset"
        description="Enter the structural parameters for the new portfolio node."
        tier="info"
        actionLabel="Deploy Node"
        onAction={() => handleAddProperty({} as any)}
      >
         <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Asset Name</label>
                  <input type="text" placeholder="e.g. Skyline Peak" className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Asset Location</label>
                  <input type="text" placeholder="e.g. Dubai Marina" className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-on-surface-variant">Cluster Class</label>
               <select className="w-full bg-surface-lowest border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary-emerald/30 accent-primary-emerald">
                  <option>LUXURY</option>
                  <option>PREMIUM</option>
                  <option>MODERN</option>
                  <option>STANDARD</option>
               </select>
            </div>
            <div className="p-4 bg-surface-lowest border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-high transition-all">
               <ImageIcon size={24} className="text-on-surface-variant/30" />
               <p className="text-[10px] font-bold text-on-surface-variant uppercase">Drop architectural renders here</p>
            </div>
         </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Decommission Asset?"
        description="This action will permanently move this node to the archive and terminate active telemetry. This cannot be undone."
        tier="danger"
        actionLabel="Confirm Decommission"
        onAction={handleDelete}
      />

      {/* Asset Intelligence Details Panel */}
      <DetailsPanel
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        title={selectedProperty?.name || ""}
        subtitle={`${selectedProperty?.type} cluster • Strategic Audit Node`}
        onSave={handleSave}
        onDelete={() => setIsDeleteModalOpen(true)}
        isSaving={isSaving}
      >
        {selectedProperty && (
          <div className="space-y-10">
            {/* Quick Edit Fields Simulation */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest">Base Rent Node</label>
                   <input 
                    type="text" 
                    defaultValue={selectedProperty.rent} 
                    className="w-full bg-surface-lowest border border-white/5 rounded-2xl px-5 py-4 text-sm font-manrope font-extrabold focus:border-primary-emerald/30 outline-none" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest">Yield Target</label>
                   <input 
                    type="text" 
                    defaultValue={selectedProperty.yield} 
                    className="w-full bg-surface-lowest border border-white/5 rounded-2xl px-5 py-4 text-sm font-manrope font-extrabold focus:border-primary-emerald/30 outline-none" 
                   />
                </div>
            </div>

            {/* Asset Yield Path */}
            <Surface level="high" className="p-6 h-64 border border-white/5">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Asset Yield Path Beta</h3>
                  <div className="flex items-center gap-1 text-primary-emerald text-[10px] font-bold">
                    <Activity size={12} className="animate-pulse" /> Live Pulse
                  </div>
               </div>
               <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={YIELD_DATA}>
                       <defs>
                        <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4edea3" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                       <XAxis dataKey="month" hide />
                       <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f1111', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                       <Area type="monotone" dataKey="yield" stroke="#4edea3" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </Surface>

            {/* Virtual Floorplan Simulation */}
            <div>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <Layers size={14} /> Structural Intelligence
                  </h3>
                   <span className="text-[10px] font-bold text-primary-emerald">12 Levels Active</span>
               </div>
               
               <div className="grid grid-cols-6 gap-2">
                 {Array.from({ length: 24 }).map((_, i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "h-12 rounded-lg border border-white/5 transition-all cursor-crosshair group flex items-center justify-center relative",
                      i % 7 === 0 ? "bg-amber-500/10 border-amber-500/20" : i % 3 === 0 ? "bg-surface-lowest" : "bg-primary-emerald/10 border-primary-emerald/20"
                    )}
                   >
                     <span className="text-[8px] font-bold text-on-surface-variant/40 group-hover:text-foreground">{i + 101}</span>
                     <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                   </div>
                 ))}
               </div>
            </div>

            {/* Sensor Telemetry Nodes */}
            <div className="space-y-4">
               <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Unit Live Telemetry</h3>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Ambient Temp", value: "24.2°C", icon: Thermometer, color: "text-amber-400" },
                    { label: "Humidity Index", value: "42%", icon: CloudRain, color: "text-blue-400" },
                    { label: "HVAC Pressure", value: "Optimal", icon: Zap, color: "text-secondary-gold" },
                    { label: "Audit Pulse", value: "48ms", icon: Timer, color: "text-primary-emerald" },
                  ].map((node, i) => (
                    <div key={i} className="p-5 bg-surface-lowest rounded-2xl border border-white/5 flex gap-4 items-center group hover:bg-surface-high transition-all">
                       <div className={cn("p-2 rounded-lg bg-surface-highest", node.color)}>
                          <node.icon size={18} />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{node.label}</p>
                          <p className="text-xs font-extrabold">{node.value}</p>
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
