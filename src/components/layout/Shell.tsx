"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell = ({ children }: ShellProps) => {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header />
        <main className="flex-1 p-8 pt-6 relative overflow-y-auto overflow-x-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 animate-bloom min-w-full lg:min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
