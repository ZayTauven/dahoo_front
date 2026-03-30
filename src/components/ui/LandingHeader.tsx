"use client";

import Link from "next/link";
import { Globe, Moon } from "lucide-react";
import React from "react";

interface LandingHeaderProps {
  mode: "light" | "dark";
  onToggleMode: () => void;
}

export function LandingHeader({ mode, onToggleMode }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-background/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black"></div>
            <span className="font-manrope text-2xl font-black tracking-tight text-foreground">
              DAHOO
            </span>
          </Link>

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-2 rounded-full border border-black/10 bg-surface-lowest p-1 shadow-[0_1px_0_rgba(0,0,0,0.02)] md:flex"
          >
            <Link
              href="#home"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Home
            </Link>
            <Link
              href="#featured"
              className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition-colors hover:text-foreground"
            >
              Properties
            </Link>
            <Link
              href="#services"
              className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition-colors hover:text-foreground"
            >
              Services
            </Link>
            <Link
              href="#about"
              className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition-colors hover:text-foreground"
            >
              About Us
            </Link>
            <button
              type="button"
              onClick={onToggleMode}
              aria-label="Toggle light/dark mode"
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              {mode === "light" ? <Moon size={16} /> : <Globe size={16} />}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Changer la langue"
              className="hidden lg:inline-flex rounded-full border border-black/10 bg-background p-2 text-on-surface-variant transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              <Globe size={16} />
            </button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
