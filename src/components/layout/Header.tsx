"use client";

import { usePathname } from "next/navigation";
import { 
  Search, 
  Bell, 
  Settings, 
  Menu,
  ChevronDown
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Format pathname to title (e.g. /smart-house -> Smart House)
  const pageTitle = pathname === "/" 
    ? "Dashboard Overview" 
    : pathname.split("/").filter(Boolean)[0]
        .split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-40 transition-all duration-500">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 rounded-lg bg-surface-lowest text-on-surface-variant">
          <Menu size={20} />
        </button>
        <h2 className="text-sm font-manrope font-extrabold uppercase tracking-[0.3em] text-on-surface-variant flex items-center gap-2">
           <div className="w-1 h-1 rounded-full bg-primary-emerald shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
           {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-3 bg-surface-lowest rounded-xl px-4 py-2.5 w-80 group border border-white/5 focus-within:border-primary-emerald/30 focus-within:w-96 transition-all duration-500">
          <Search size={18} className="text-on-surface-variant group-focus-within:text-primary-emerald transition-colors" />
          <input 
            id="global-search"
            type="text" 
            placeholder="Search everything..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder:text-on-surface-variant/40"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log("Global search for:", searchQuery);
                // Placeholder for global search logic
              }
            }}
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container border border-white/10 opacity-40 group-focus-within:opacity-0 transition-opacity">
            <span className="text-[8px] font-extrabold text-on-surface-variant">/</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-surface-lowest rounded-xl border border-white/5">
            <button className="relative p-2 rounded-lg text-on-surface-variant hover:text-foreground hover:bg-surface-container transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-emerald rounded-full border-2 border-surface-lowest" />
            </button>
            <button className="p-2 rounded-lg text-on-surface-variant hover:text-foreground hover:bg-surface-container transition-all">
              <Settings size={18} />
            </button>
          </div>
          
          <div className="h-8 w-px bg-white/5 mx-2" />
          
          <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-surface-lowest transition-all border border-transparent hover:border-white/5 group">
             <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary-emerald to-emerald-700 flex items-center justify-center font-extrabold text-[10px] text-surface-container shadow-lg shadow-primary-emerald/10 group-hover:scale-105 transition-transform">
                MJ
             </div>
             <ChevronDown size={14} className="text-on-surface-variant group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};
