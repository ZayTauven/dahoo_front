"use client";

import { Shell } from "@/components/layout/Shell";
import { Surface } from "@/components/ui/Surface";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import {
  Search,
  MessageSquare,
  Plus,
  MoreHorizontal,
  Send,
  Paperclip,
  User,
  ShieldCheck,
  Zap,
  Clock,
  CheckCheck,
  Smartphone,
  ScanFace,
  Layers,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const THREADS = [
  {
    id: 1,
    name: "Dr. Julian Thorne",
    role: "RESIDENT",
    unit: "Penthouse 4",
    lastMsg: "The smart lighting in the hallway isn't responding.",
    time: "2m ago",
    unread: true,
    online: true,
    avatar: "JT",
  },
  {
    id: 2,
    name: "Guardian Delta",
    role: "STAFF",
    unit: "Zone 04",
    lastMsg: "Security sweep completed. All nodes green.",
    time: "15m ago",
    unread: false,
    online: true,
    avatar: "GD",
  },
  {
    id: 3,
    name: "Sarah McConnely",
    role: "RESIDENT",
    unit: "Villa A12",
    lastMsg: "Can we schedule the pool cleaning for tomorrow?",
    time: "1h ago",
    unread: false,
    online: false,
    avatar: "SM",
  },
  {
    id: 4,
    name: "Maintenance Alpha",
    role: "SYSTEM",
    unit: "Global",
    lastMsg: "HVAC System Audit in progress for Skyline Suite.",
    time: "3h ago",
    unread: false,
    online: true,
    avatar: "MA",
  },
];

const MESSAGES = [
  { id: 1, sender: "JT", text: "Hello, the smart lighting in the hallway isn't responding to the voice command.", time: "10:42 AM", mine: false },
  { id: 2, sender: "STAFF", text: "Good morning Dr. Thorne. We've detected a slight latency in the Hub-04. I'm resetting the node now.", time: "10:44 AM", mine: true },
  { id: 3, sender: "JT", text: "Thank you. Let me know when it's back.", time: "10:45 AM", mine: false },
  { id: 4, sender: "STAFF", text: "Node reset complete. Should be active in 15 seconds.", time: "10:46 AM", mine: true },
];

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState(THREADS[0]);
  const [inputText, setInputText] = useState("");

  return (
    <Shell>
      <section className="flex justify-between items-end mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-bold text-4xl text-foreground tracking-tight">
            Concierge{" "}
            <span className="text-primary-emerald font-extrabold italic">
              Chat
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-medium font-manrope">
            DIRECT CHANNEL • {THREADS.filter(t => t.unread).length} UNREAD THREADS
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary-emerald text-surface-container px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05]">
          <Plus size={18} />
          New Thread
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* Thread List */}
        <Surface level="container" className="lg:col-span-4 flex flex-col overflow-hidden p-0 border border-white/5">
          <div className="p-4 border-b border-white/5">
             <div className="flex items-center gap-2 bg-surface-lowest rounded-xl px-4 py-2.5 border border-white/5 group focus-within:border-primary-emerald/30 transition-all">
                <Search size={16} className="text-on-surface-variant group-focus-within:text-primary-emerald" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-on-surface-variant/50"
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {THREADS.map((thread) => (
              <div 
                key={thread.id} 
                onClick={() => setSelectedThread(thread)}
                className={cn(
                  "p-5 cursor-pointer transition-all border-l-2 relative",
                  selectedThread.id === thread.id 
                    ? "bg-surface-lowest border-l-primary-emerald shadow-inner" 
                    : "border-l-transparent hover:bg-surface-lowest/50"
                )}
              >
                <div className="flex gap-4">
                   <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-surface-high flex items-center justify-center text-primary-emerald font-black border border-white/5 group-hover:scale-105 transition-transform">
                        {thread.avatar}
                      </div>
                      {thread.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface-container bg-primary-emerald shadow-[0_0_8px_rgba(78,222,163,0.4)]" />
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-extrabold truncate">{thread.name}</h4>
                        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase">{thread.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                         {thread.role === "RESIDENT" ? <User size={10} className="text-blue-400" /> : thread.role === "STAFF" ? <ScanFace size={10} className="text-secondary-gold" /> : <Layers size={10} className="text-purple-400" />}
                         <span className="text-[9px] font-black tracking-widest uppercase text-on-surface-variant/60">{thread.unit}</span>
                      </div>
                      <p className={cn(
                        "text-[11px] truncate leading-normal",
                        thread.unread ? "text-foreground font-bold" : "text-on-surface-variant/70"
                      )}>
                        {thread.lastMsg}
                      </p>
                   </div>
                   {thread.unread && (
                     <div className="w-2 h-2 rounded-full bg-primary-emerald mt-1 shadow-[0_0_8px_rgba(78,222,163,0.5)]" />
                   )}
                </div>
              </div>
            ))}
          </div>
        </Surface>

        {/* Chat window */}
        <Surface level="container" className="lg:col-span-8 flex flex-col overflow-hidden p-0 border border-white/5">
           {/* Header */}
           <div className="p-5 border-b border-white/10 flex justify-between items-center bg-surface-lowest/20">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center text-primary-emerald font-bold border border-white/5">
                    {selectedThread.avatar}
                 </div>
                 <div>
                    <h3 className="text-sm font-manrope font-extrabold">{selectedThread.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-primary-emerald uppercase tracking-widest">{selectedThread.online ? "Status: Live" : "Status: Off-Sync"}</span>
                       <span className="text-on-surface-variant/30 text-[10px]">•</span>
                       <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{selectedThread.unit} Node</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant hover:text-foreground transition-all">
                    <Smartphone size={18} />
                 </button>
                 <button className="p-2.5 rounded-xl bg-surface-lowest text-on-surface-variant hover:text-foreground transition-all">
                    <MoreHorizontal size={20} />
                 </button>
              </div>
           </div>

           {/* Messages list */}
           <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed opacity-[0.98]">
              {MESSAGES.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.mine ? "ml-auto items-end" : "items-start"
                  )}
                >
                   <div className={cn(
                     "px-5 py-4 rounded-2xl text-sm font-medium leading-relaxed relative",
                     msg.mine 
                        ? "bg-primary-emerald text-surface-container rounded-tr-none shadow-[0_10px_30px_rgba(78,222,163,0.15)]" 
                        : "bg-surface-highest text-foreground rounded-tl-none border border-white/5"
                   )}>
                      {msg.text}
                   </div>
                   <div className="flex items-center gap-2 mt-2 px-1">
                      <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase">{msg.time}</span>
                      {msg.mine && <CheckCheck size={12} className="text-primary-emerald" />}
                   </div>
                </div>
              ))}
           </div>

           {/* Input bar */}
           <div className="p-5 border-t border-white/10 bg-surface-lowest/20">
              <div className="flex items-center gap-4">
                 <button className="p-3 rounded-xl bg-surface-lowest text-on-surface-variant hover:text-primary-emerald transition-all border border-white/5">
                    <Paperclip size={20} />
                 </button>
                 <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Transmission text..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-surface-lowest border border-white/5 rounded-xl px-6 py-3.5 text-sm font-medium outline-none focus:border-primary-emerald/30 transition-all placeholder:text-on-surface-variant/30"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3 text-on-surface-variant/30">
                       <Zap size={16} className="cursor-pointer hover:text-secondary-gold" />
                       <ShieldCheck size={16} className="cursor-pointer hover:text-blue-400" />
                    </div>
                 </div>
                 <button className="p-3.5 rounded-xl bg-primary-emerald text-surface-container hover:scale-105 transition-all shadow-[0_8px_20px_rgba(78,222,163,0.2)]">
                    <Send size={22} />
                 </button>
              </div>
              <div className="flex gap-4 mt-4 px-2">
                 <button className="text-[9px] font-extrabold uppercase tracking-widest text-secondary-gold flex items-center gap-1.5 px-3 py-1.5 bg-secondary-gold/10 rounded-md border border-secondary-gold/20">
                    <Zap size={10} /> Escalate to Maintenance
                 </button>
                 <button className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant/50 hover:text-foreground transition-colors flex items-center gap-1.5">
                    <Clock size={12} /> Schedule Sync
                 </button>
              </div>
           </div>
        </Surface>
      </div>
    </Shell>
  );
}
