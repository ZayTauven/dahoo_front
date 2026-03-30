"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { useLocalFilter } from "@/hooks/useLocalFilter";
import {
  MessageSquare,
  Search,
  Plus,
  Share2,
  MoreHorizontal,
  Users,
  TrendingUp,
  ThumbsUp,
  ConciergeBell,
  ShoppingBag,
  ArrowRight,
  Star,
  Coffee,
  Car,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const COMMUNITY_POSTS = [
  {
    id: 1,
    author: "Unit B302",
    content: "Looking for recommendations for a reliable interior designer for a small renovation project.",
    category: "HELP",
    likes: 12,
    comments: 4,
    date: "3h ago",
    avatar: "B3",
  },
  {
    id: 2,
    author: "Management",
    content: "Pool maintenance scheduled for Monday, April 14th from 8 AM to 4 PM. Please plan accordingly.",
    category: "ANNOUNCEMENT",
    likes: 25,
    comments: 2,
    date: "5h ago",
    avatar: "MG",
  },
  {
    id: 3,
    author: "Unit A105",
    content: "Extremely happy with the new smart gym facilities! The equipment is top-notch.",
    category: "GENERAL",
    likes: 42,
    comments: 8,
    date: "1d ago",
    avatar: "A1",
  },
];

const MARKET_ITEMS = [
  { id: 1, title: "Designer Chair", price: "$450", unit: "C401", icon: Star },
  { id: 2, title: "Espresso Machine", price: "$200", unit: "A102", icon: Coffee },
  { id: 3, title: "Parking Space B2", price: "$150/mo", unit: "B12", icon: Car },
];

export default function CommunityPage() {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredData,
  } = useLocalFilter({
    data: COMMUNITY_POSTS,
    searchKeys: ["author", "content", "category"],
    initialSort: { key: "id", direction: "desc" },
  });

  const categories = ["All", "ANNOUNCEMENT", "HELP", "GENERAL", "MARKETPLACE"];

  return (
    <Shell>
      <section className="flex justify-between items-end mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Elite{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Social Hub
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            COMMUNITY INTERACTIONS • ASSET ECOSYSTEM
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-[0_8px_32px_rgba(78,222,163,0.2)]">
          <Plus size={18} />
          Create Post
        </button>
      </section>

      {/* Community Engagement Stats */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {[
          { label: "Active Residents", value: "348", sub: "12 online now", icon: Users, color: "text-blue-400" },
          { label: "Total Engagement", value: "1.2K", sub: "24 new today", icon: MessageSquare, color: "text-purple-400" },
          { label: "Community Rating", value: "4.9/5", sub: "+0.2 improvement", icon: Star, color: "text-secondary-gold" },
        ].map((stat, i) => (
          <AnimatedItem key={i}>
            <Surface level="container" className="p-8 group hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl bg-surface-lowest transition-transform group-hover:scale-110", stat.color)}>
                  <stat.icon size={26} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-manrope font-extrabold mb-1">{stat.value}</h3>
                  <p className="text-xs font-bold text-primary-emerald">{stat.sub}</p>
                </div>
              </div>
            </Surface>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Section */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 p-1 bg-surface-lowest rounded-xl border border-white/5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                    activeCategory === cat || (cat === "All" && !activeCategory)
                      ? "bg-surface-container text-primary-emerald shadow-sm"
                      : "text-on-surface-variant hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 min-w-64 border border-white/5">
              <Search size={16} className="text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search Feed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <AnimatedSection stagger className="space-y-6">
            {filteredData.map((post) => (
              <AnimatedItem key={post.id}>
                <Surface level="container" className="p-8 group no-line border-l-4 border-l-transparent hover:border-l-primary-emerald transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-full bg-surface-lowest flex items-center justify-center text-primary-emerald font-extrabold text-sm border border-white/5">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-manrope font-extrabold text-xl group-hover:text-primary-emerald transition-colors">{post.author}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{post.date}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase",
                          post.category === "ANNOUNCEMENT" ? "bg-amber-500/10 text-amber-500" : post.category === "HELP" ? "bg-blue-500/10 text-blue-400" : "bg-primary-emerald/10 text-primary-emerald"
                        )}>
                          {post.category}
                        </div>
                      </div>
                      <p className="text-foreground/80 leading-relaxed font-medium mb-8 max-w-2xl">{post.content}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-6">
                          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary-emerald transition-all">
                            <ThumbsUp size={18} />
                            <span className="text-xs font-bold">{post.likes}</span>
                          </button>
                          <button className="flex items-center gap-2 text-on-surface-variant hover:text-blue-400 transition-all">
                            <MessageSquare size={18} />
                            <span className="text-xs font-bold">{post.comments}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="p-2 rounded-lg bg-surface-lowest text-on-surface-variant hover:text-foreground"><Share2 size={16} /></button>
                          <button className="p-2 rounded-lg bg-surface-lowest text-on-surface-variant hover:text-foreground"><MoreHorizontal size={18} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Surface>
              </AnimatedItem>
            ))}
          </AnimatedSection>
        </div>

        {/* Sidebar Interactions Section */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Concierge Console */}
          <Surface level="high" className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-gold/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-secondary-gold/20 transition-all" />
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <ConciergeBell size={24} className="text-secondary-gold" />
                <h3 className="font-manrope font-extrabold text-xl tracking-tight">Concierge</h3>
              </div>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">Request high-standing services or specialized assistance for your unit.</p>
              
              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl bg-surface-lowest border border-white/5 flex items-center justify-between hover:bg-surface-container transition-all group/item">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Housekeeping</span>
                  <ArrowRight size={14} className="text-on-surface-variant group-hover/item:translate-x-1 transition-transform" />
                </button>
                <button className="w-full p-4 rounded-xl bg-surface-lowest border border-white/5 flex items-center justify-between hover:bg-surface-container transition-all group/item">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Guest Access</span>
                  <ArrowRight size={14} className="text-on-surface-variant group-hover/item:translate-x-1 transition-transform" />
                </button>
                <button className="w-full p-4 rounded-xl bg-surface-lowest border border-white/5 flex items-center justify-between hover:bg-surface-container transition-all group/item">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Valet Service</span>
                  <ArrowRight size={14} className="text-on-surface-variant group-hover/item:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center gap-2 text-primary-emerald mb-2">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Elite Service Active</span>
                </div>
              </div>
            </div>
          </Surface>

          {/* Marketplace Grid */}
          <Surface level="low" className="p-8">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-blue-400" />
                  <h3 className="font-manrope font-extrabold text-lg tracking-tight">Marketplace</h3>
                </div>
                <button className="text-[10px] font-extrabold uppercase text-primary-emerald">View All</button>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
               {MARKET_ITEMS.map((item) => (
                 <Surface key={item.id} level="lowest" className="p-4 flex items-center gap-4 hover:tier-2 transition-all cursor-pointer group">
                   <div className="w-10 h-10 rounded-lg bg-surface-high flex items-center justify-center text-on-surface-variant group-hover:text-foreground">
                    <item.icon size={18} />
                   </div>
                   <div className="flex-1">
                    <h5 className="text-[11px] font-extrabold uppercase tracking-widest mb-0.5">{item.title}</h5>
                    <p className="text-[10px] font-bold text-on-surface-variant">{item.unit}</p>
                   </div>
                   <span className="text-[11px] font-extrabold text-secondary-gold">{item.price}</span>
                 </Surface>
               ))}
             </div>
             
             <button className="w-full mt-6 py-3 rounded-xl bg-surface-lowest border border-dashed border-white/10 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant hover:border-primary-emerald hover:text-primary-emerald transition-all">
                + List an Item
             </button>
          </Surface>

          {/* Verification / Security Node */}
          <Surface level="container" className="p-6 bg-linear-to-br from-surface-container to-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-emerald" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary-emerald">Moderated Community</span>
            </div>
            <p className="text-[10px] font-medium text-on-surface-variant leading-relaxed">
              All interactions are governed by elite residential protocols. Secure messaging is active.
            </p>
          </Surface>
        </div>
      </div>
    </Shell>
  );
}
