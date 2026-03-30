"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Share2, MoreHorizontal, Edit3, Trash2, CheckCircle2 } from "lucide-react";
import { Surface } from "./Surface";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface DetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  allowEdit?: boolean;
  onEditToggle?: (isEditing: boolean) => void;
  onSave?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
}

export function DetailsPanel({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children,
  allowEdit = true,
  onEditToggle,
  onSave,
  onDelete,
  isSaving = false
}: DetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Reset Edit state on close
  useEffect(() => {
    if (!isOpen) setIsEditing(false);
  }, [isOpen]);

  const handleEditToggle = () => {
    const newState = !isEditing;
    setIsEditing(newState);
    onEditToggle?.(newState);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/50 backdrop-blur-md cursor-pointer"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-160 lg:w-180 bg-surface-container border-l border-white/5 shadow-2xl flex flex-col z-[120]"
          >
            {/* Header */}
            <div className="p-10 border-b border-white/5 flex justify-between items-start bg-surface-lowest/20">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] font-black bg-primary-emerald/10 text-primary-emerald px-3 py-1 rounded-lg border border-primary-emerald/20 uppercase tracking-widest">
                       {isEditing ? "Editing Mode" : "Asset Insight"}
                    </span>
                    {subtitle && <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">{subtitle}</span>}
                 </div>
                 <h2 className="font-manrope font-black text-3xl tracking-tight leading-none group hover:text-primary-emerald transition-colors">{title}</h2>
              </div>
              
              <div className="flex items-center gap-4">
                {allowEdit && (
                  <button 
                    onClick={handleEditToggle}
                    className={cn(
                      "p-3 rounded-2xl transition-all border",
                      isEditing ? "bg-primary-emerald text-surface-container border-primary-emerald shadow-premium" : "bg-surface-lowest text-on-surface-variant border-white/5 hover:text-foreground hover:bg-surface-high"
                    )}
                  >
                    <Edit3 size={20} />
                  </button>
                )}
                <div className="w-px h-10 bg-white/5 mx-2" />
                <button 
                  onClick={onClose}
                  className="p-3 rounded-2xl bg-surface-lowest text-on-surface-variant hover:text-red-400 hover:bg-red-400/5 transition-all border border-transparent hover:border-red-400/20 group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
              {children}
            </div>

            {/* Footer Action Bar */}
            <div className="p-8 bg-surface-lowest border-t border-white/5 flex gap-6 z-10">
               {isEditing ? (
                 <>
                   <button 
                     onClick={handleEditToggle}
                     className="flex-1 py-4 bg-surface-high text-on-surface-variant font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-surface-highest hover:text-foreground transition-all"
                   >
                     Discard Changes
                   </button>
                   <button 
                     onClick={onSave}
                     className="flex-[2] py-4 bg-primary-emerald text-surface-container font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all shadow-premium"
                   >
                     {isSaving ? "Synchronizing Asset..." : "Commit Asset Changes"}
                   </button>
                 </>
               ) : (
                 <>
                   <button className="flex-1 py-4 bg-surface-lowest text-on-surface-variant font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-surface-high hover:text-foreground flex items-center justify-center gap-3 group transition-all">
                      <ExternalLink size={16} className="group-hover:text-primary-emerald" /> Master Audit Report
                   </button>
                   <button 
                     onClick={onDelete}
                     className="p-4 bg-surface-lowest border border-white/5 rounded-2xl text-on-surface-variant hover:text-red-400 hover:bg-red-400/5 transition-all group"
                   >
                      <Trash2 size={24} className="group-hover:scale-110" />
                   </button>
                 </>
               )}
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-emerald/5 rounded-full blur-[100px] -mr-48 -mb-48 pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
