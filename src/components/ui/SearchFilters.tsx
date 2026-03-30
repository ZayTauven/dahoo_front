"use client";

import React from "react";
import { MapPin, SlidersHorizontal } from "lucide-react";

interface SearchFiltersProps {
  activeTab: "Buy" | "Sell" | "Rent";
  setActiveTab: (value: "Buy" | "Sell" | "Rent") => void;
  selectedType: "All" | "House" | "Residential" | "Apartment";
  setSelectedType: (
    value: "All" | "House" | "Residential" | "Apartment",
  ) => void;
  lookingFor: string;
  setLookingFor: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  rooms: number;
  setRooms: (value: number) => void;
  longTerm: boolean;
  setLongTerm: (value: boolean) => void;
  showOnMap: boolean;
  setShowOnMap: (value: boolean) => void;
  onSearch: () => void;
}

export function SearchFilters({
  activeTab,
  setActiveTab,
  selectedType,
  setSelectedType,
  lookingFor,
  setLookingFor,
  location,
  setLocation,
  price,
  setPrice,
  rooms,
  setRooms,
  longTerm,
  setLongTerm,
  showOnMap,
  setShowOnMap,
  onSearch,
}: SearchFiltersProps) {
  return (
    <section className="rounded-3xl border border-black/10 bg-surface-lowest p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Find Your Perfect Home</h2>
      <div className="grid gap-3 lg:grid-cols-4">
        <label htmlFor="lookingFor" className="block">
          <span className="mb-2 block text-sm text-on-surface-variant">
            Looking for
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
              <MapPin size={14} />
            </span>
            <input
              id="lookingFor"
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              type="text"
              placeholder="Buy, Sell, Rent"
              className="h-11 w-full rounded-xl border border-black/10 bg-background px-10 text-sm outline-none focus:ring-2 focus:ring-foreground/30"
            />
          </div>
        </label>

        <label htmlFor="location" className="block">
          <span className="mb-2 block text-sm text-on-surface-variant">
            Location
          </span>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            type="text"
            placeholder="Casablanca, Rabat..."
            className="h-11 w-full rounded-xl border border-black/10 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/30"
          />
        </label>

        <label htmlFor="price" className="block">
          <span className="mb-2 block text-sm text-on-surface-variant">
            Price
          </span>
          <input
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="text"
            placeholder="$500-$3,000"
            className="h-11 w-full rounded-xl border border-black/10 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/30"
          />
        </label>

        <label htmlFor="rooms" className="block">
          <span className="mb-2 block text-sm text-on-surface-variant">
            Rooms
          </span>
          <input
            id="rooms"
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            type="number"
            min={1}
            className="h-11 w-full rounded-xl border border-black/10 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/30"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {["Buy", "Sell", "Rent"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as "Buy" | "Sell" | "Rent")}
            aria-pressed={activeTab === tab}
            className={`rounded-full px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 ${
              activeTab === tab
                ? "bg-foreground text-background"
                : "bg-surface-lighter text-on-surface-variant hover:bg-black/5"
            }`}
          >
            {tab}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowOnMap(!showOnMap)}
          className={`rounded-full px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 ${
            showOnMap
              ? "bg-foreground text-background"
              : "bg-surface-lighter text-on-surface-variant hover:bg-black/5"
          }`}
        >
          <SlidersHorizontal size={14} />{" "}
          {showOnMap ? "Hide Map" : "Show On Map"}
        </button>

        <button
          type="button"
          onClick={() => setLongTerm(!longTerm)}
          className={`rounded-full px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 ${
            longTerm
              ? "bg-foreground text-background"
              : "bg-surface-lighter text-on-surface-variant hover:bg-black/5"
          }`}
        >
          {longTerm ? "Long Term" : "Short Term"}
        </button>

        {["All", "House", "Residential", "Apartment"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              setSelectedType(
                type as "All" | "House" | "Residential" | "Apartment",
              )
            }
            aria-pressed={selectedType === type}
            className={`rounded-full px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 ${
              selectedType === type
                ? "bg-foreground text-background"
                : "bg-surface-lighter text-on-surface-variant hover:bg-black/5"
            }`}
          >
            {type}
          </button>
        ))}

        <button
          type="button"
          onClick={onSearch}
          className="ml-auto rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:scale-[1.01]"
        >
          Find Properties
        </button>
      </div>
    </section>
  );
}
