"use client";

import Image from "next/image";
import { ArrowRight, Bath, BedDouble, Heart, Ruler } from "lucide-react";
import React from "react";

export type Property = {
  id: number;
  title: string;
  city: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  image: string;
};

interface PropertyCardProps {
  property: Property;
  highlight?: boolean;
}

export function PropertyCard({ property, highlight }: PropertyCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-3xl border border-black/10 transition-transform duration-200 hover:-translate-y-0.5 ${
        highlight ? "bg-black text-white" : "bg-surface-lowest"
      }`}
    >
      <Image
        src={property.image}
        alt={property.title}
        width={720}
        height={480}
        sizes="(max-width: 1280px) 50vw, 30vw"
        className="h-48 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="text-2xl font-medium">{property.title}</h3>
        <p
          className={`mt-2 text-sm ${highlight ? "text-white/70" : "text-on-surface-variant"}`}
        >
          {property.city} • {property.area}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>{property.price}</span>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs ${
              highlight
                ? "border-white/20 bg-white text-black hover:bg-white/90"
                : "border-black/10 bg-background text-foreground hover:bg-black/5"
            }`}
          >
            Book Now <ArrowRight size={14} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <p className="inline-flex items-center gap-1">
            <Ruler size={14} /> {property.area}
          </p>
          <p className="inline-flex items-center gap-1">
            <BedDouble size={14} /> {property.beds} beds
          </p>
          <p className="inline-flex items-center gap-1">
            <Bath size={14} /> {property.baths} baths
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-label="Add to favorites"
            className="inline-flex items-center rounded-full border border-black/10 px-3 py-2 text-sm"
          >
            <Heart size={14} /> Favorite
          </button>
        </div>
      </div>
    </article>
  );
}
