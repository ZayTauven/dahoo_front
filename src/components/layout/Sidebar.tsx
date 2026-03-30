"use client";

import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3, 
  Users, 
  Layers, 
  Bell, 
  ShieldCheck, 
  Settings,
  CreditCard,
  MessageSquare,
  Home,
  UserPlus,
  Key,
  Zap,
  ShieldAlert,
  ScanFace,
  Contact,
  Briefcase,
  FolderArchive,
  Globe,
  FileBarChart,
  Waves,
  Compass
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Building2, label: "Properties", href: "/properties" },
  { icon: Contact, label: "Residents & Leases", href: "/residents" },
  { icon: FileBarChart, label: "Strategic Reports", href: "/reports" },
  { icon: Waves, label: "Luxury Amenities", href: "/services" },
  { icon: Compass, label: "Public Showroom", href: "/portfolio" },
  { icon: MessageSquare, label: "Concierge Chat", href: "/messages" },
  { icon: FolderArchive, label: "Asset Vault", href: "/documents" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: CreditCard, label: "Financials", href: "/financials" },
  { icon: Users, label: "CRM Pipeline", href: "/crm" },
  { icon: Layers, label: "Maintenance", href: "/maintenance" },
  { icon: Home, label: "Smart House", href: "/smart-house" },
  { icon: Globe, label: "Community", href: "/community" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: ShieldCheck, label: "Security", href: "/security" },
  { icon: Briefcase, label: "Staff & Security", href: "/users" },
  { icon: Key, label: "Roles & Permissions", href: "/roles" },
  { icon: Zap, label: "SaaS Subscription", href: "/subscription" },
  { icon: ScanFace, label: "Field Operations", href: "/field" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-surface-low flex flex-col no-line sticky top-0 overflow-y-auto z-50">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-emerald flex items-center justify-center rounded-lg shadow-premium">
            <span className="text-on-primary font-bold text-xl">D</span>
          </div>
          <span className="font-manrope font-extrabold text-2xl tracking-tight text-foreground uppercase">
            DAHOO
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 px-1">
          <div className="w-2 h-2 rounded-full bg-secondary-gold animate-pulse" />
          <span className="text-[10px] font-manrope font-bold text-secondary-gold tracking-[0.2em] uppercase">
            Premium Elite
          </span>
        </div>
      </div>

      <nav className="flex-1 mt-8 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group",
                isActive 
                  ? "bg-surface-container text-primary-emerald shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-lowest hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-primary-emerald" : "text-on-surface-variant group-hover:text-foreground"
              )} />
              <span className={cn(
                "font-inter text-sm font-medium tracking-wide",
                isActive ? "font-semibold" : ""
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1 h-4 bg-primary-emerald rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-surface-lowest p-4 rounded-xl border-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-high rounded-full overflow-hidden border-2 border-primary-emerald/30">
              <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant text-xs">
                JD
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">John Doe</span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Property Owner</span>
            </div>
            <Settings className="w-4 h-4 ml-auto text-on-surface-variant hover:text-foreground cursor-pointer" />
          </div>
        </div>
      </div>
    </aside>
  );
};
