"use client";

import Link from "next/link";
import { useState } from "react";
import type { Service } from "@/lib/types";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS } from "@/lib/serviceCategory";

type ServiceCardData = Service & { id?: string };

const CATEGORY_ICONS: Record<string, string> = {
  astrology: "🔮",
  numerology: "🔢",
  vastu: "🏠",
  tarot: "🃏",
};

export default function ServiceCard({ service }: { service: ServiceCardData }) {
  const serviceId = service._id || service.id || "";
  const href = service.slug
    ? `/services/${service.slug}`
    : `/services/${serviceId}`;

  const category = (service.category || "astrology").toLowerCase();
  const catIcon = CATEGORY_ICONS[category] ?? SERVICE_CATEGORY_ICONS[category as keyof typeof SERVICE_CATEGORY_ICONS] ?? "🔮";
  const catLabel = SERVICE_CATEGORY_LABELS[category as keyof typeof SERVICE_CATEGORY_LABELS] ?? category;

  const displayDescription = service.shortDescription || service.description;

  // Like state — persisted to localStorage
  const storageKey = `liked_service_${serviceId}`;
  const [liked, setLiked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();   // don't navigate
    e.stopPropagation();
    setLiked((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, next ? "1" : "0");
      return next;
    });
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#E2E8F0] flex flex-col h-full group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* ── IMAGE AREA ── */}
      <div className="relative w-full h-52 bg-gradient-to-br from-[#FFF7ED] to-[#FED7AA] overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">{catIcon}</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0F172A] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {catIcon} {catLabel}
        </div>

        {/* Duration badge */}
        {service.duration && (
          <div className="absolute top-3 right-3 bg-[#F97316]/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {service.duration}
          </div>
        )}

        {/* Like button */}
        <button
          type="button"
          onClick={handleLike}
          aria-label={liked ? "Unlike service" : "Like service"}
          className={`absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md border-2 transition-all duration-200 ${
            liked
              ? "bg-red-500 border-red-500 text-white scale-110"
              : "bg-white/90 border-white text-[#94A3B8] hover:text-red-500 hover:border-red-300"
          }`}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Icon circle overlapping card body */}
        <div className="absolute -bottom-5 left-4 w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center text-lg border-[3px] border-white shadow-md z-10">
          {catIcon}
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-5 pt-8 flex flex-col flex-grow">

        <h3 className="font-playfair text-xl font-bold text-[#0F172A] mb-2 leading-snug">
          {service.title}
        </h3>

        <p className="text-sm text-[#64748B] line-clamp-3 mb-4 flex-grow leading-relaxed">
          {displayDescription}
        </p>

        {/* Key points preview */}
        {service.keyPoints && service.keyPoints.length > 0 && (
          <ul className="mb-4 space-y-1">
            {service.keyPoints.slice(0, 3).map((kp, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-[#64748B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] shrink-0" />
                {kp.label}
              </li>
            ))}
          </ul>
        )}

        {/* ── META ROW ── */}
        <div className="flex items-center gap-4 text-xs text-[#64748B] pb-3 border-b border-[#E2E8F0] mb-3">
          {service.duration && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {service.duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            Detailed Report
          </span>
        </div>

        {/* ── FOOTER: PRICE + CTA ── */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-playfair text-xl font-bold text-[#F97316]">₹{service.price}</span>
            {service.duration && <p className="text-[10px] text-[#94A3B8]">{service.duration}</p>}
          </div>
          <span className="flex items-center gap-1.5 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded-full shadow-sm group-hover:bg-[#EA6C0A] transition-all duration-200">
            {service.ctaText || "View Details"}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>

      </div>
    </Link>
  );
}
