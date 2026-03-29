"use client";

import { cn } from "@/lib/utils";
import { 
  Bell, 
  Search, 
  Plus, 
  HelpCircle,
  Maximize,
  LayoutGrid
} from "lucide-react";
import React from "react";

export const Header = () => {
  return (
    <header className="h-20 bg-background/60 backdrop-blur-md flex items-center px-8 sticky top-0 z-40 no-line bg-opacity-80">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative group w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-emerald transition-colors" />
          <input 
            type="text" 
            placeholder="Search properties, leads, or analytics..."
            className="w-full bg-surface-low border-none rounded-lg pl-12 pr-4 py-2.5 text-sm font-inter text-foreground placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary-emerald/50 transition-all bg-opacity-50 hover:bg-opacity-80 focus:bg-surface-container"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-lowest rounded-lg border-2 border-primary-emerald/10 cursor-pointer hover:bg-surface-low transition-colors group">
          <div className="w-2 h-2 rounded-full bg-primary-emerald" />
          <span className="text-xs font-manrope font-bold text-on-surface uppercase tracking-wide">
            Garden Residence
          </span>
          <LayoutGrid className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary-emerald" />
        </div>

        <button className="flex items-center gap-2 bg-primary-emerald text-on-primary px-4 py-2.5 rounded-lg font-manrope font-bold text-xs uppercase tracking-widest shadow-premium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Quick Action
        </button>

        <div className="h-8 w-[1px] bg-surface-high opacity-50" />

        <div className="flex items-center gap-4">
          <div className="relative p-2 rounded-lg bg-surface-low text-on-surface-variant hover:text-foreground hover:bg-surface-container cursor-pointer transition-all group">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary-emerald border-2 border-background rounded-full animate-bloom" />
          </div>
          <div className="p-2 rounded-lg bg-surface-low text-on-surface-variant hover:text-foreground hover:bg-surface-container cursor-pointer transition-all">
            <Maximize className="w-5 h-5" />
          </div>
          <div className="p-2 rounded-lg bg-surface-low text-on-surface-variant hover:text-foreground hover:bg-surface-container cursor-pointer transition-all">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
