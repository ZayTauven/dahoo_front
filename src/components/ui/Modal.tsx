"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle2, Info, Flame, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

type ModalTier = "info" | "success" | "warning" | "danger" | "neutral";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  tier?: ModalTier;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  cancelLabel?: string;
  showFooter?: boolean;
}

const TIER_CONFIG: Record<ModalTier, { icon: LucideIcon; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10" },
  success: { icon: CheckCircle2, color: "text-primary-emerald", bg: "bg-primary-emerald/10" },
  warning: { icon: AlertTriangle, color: "text-secondary-gold", bg: "bg-secondary-gold/10" },
  danger: { icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
  neutral: { icon: Info, color: "text-on-surface-variant", bg: "bg-surface-highest" },
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  tier = "neutral",
  icon,
  actionLabel = "Confirm",
  onAction,
  cancelLabel = "Cancel",
  showFooter = true,
}: ModalProps) {
  const config = TIER_CONFIG[tier];
  const Icon = icon || config.icon;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-surface-container border border-white/5 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
          >
            {/* Header / Accent Bar */}
            <div className={cn("h-1.5 w-full", config.color.replace("text-", "bg-"))} />
            
            <div className="p-8">
               <div className="flex justify-between items-start mb-6">
                  <div className={cn("p-4 rounded-2xl", config.bg)}>
                     <Icon size={28} className={config.color} />
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant hover:text-foreground transition-all border border-transparent hover:border-white/10"
                  >
                     <X size={18} />
                  </button>
               </div>

               <div className="space-y-2 mb-8">
                  <h2 className="text-3xl font-manrope font-black tracking-tight">{title}</h2>
                  {description && <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{description}</p>}
               </div>

               {/* Custom Content Area */}
               <div className="min-h-0 overflow-y-auto custom-scrollbar">
                  {children}
               </div>

               {/* Footer Actions */}
               {showFooter && (
                 <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={onClose}
                      className="flex-1 py-4 bg-surface-lowest text-on-surface-variant font-extrabold text-[10px] uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-surface-high hover:text-foreground transition-all"
                    >
                       {cancelLabel}
                    </button>
                    <button 
                      onClick={() => {
                        onAction?.();
                        onClose();
                      }}
                      className={cn(
                        "flex-[1.5] py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-premium hover:scale-[1.02] transition-all",
                        tier === "danger" ? "bg-red-500 text-white" : "bg-primary-emerald text-surface-container"
                      )}
                    >
                       {actionLabel}
                    </button>
                 </div>
               )}
            </div>

            {/* Subtle Reflection Node */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
