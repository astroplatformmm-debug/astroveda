"use client";

import Link from "next/link";
import type { Service } from "@/lib/types";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS } from "@/lib/serviceCategory";

export default function ServiceCard({ service }: { service: Service }) {
  const serviceId = service.slug || service._id || service.id || "";
  const category = (service.category || "astrology").toLowerCase() as keyof typeof SERVICE_CATEGORY_LABELS;
  const catIcon = SERVICE_CATEGORY_ICONS[category] ?? "🔮";
  const catLabel = SERVICE_CATEGORY_LABELS[category] ?? service.category ?? "Astrology";

  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-all duration-200 border border-[#E2E8F0] flex flex-col h-full group">
      <Link href={`/services/${serviceId}`} className="absolute inset-0 z-0 rounded-xl" aria-label={`View ${service.title}`} />
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-[#1E293B] to-[#0F172A] overflow-hidden flex items-center justify-center">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <span className="text-6xl">{catIcon}</span>
          )}
          <span className="absolute top-3 left-3 bg-[#F97316]/90 text-white text-xs font-semibold px-3 py-1 rounded-full z-20">
            {catIcon} {catLabel}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-playfair text-lg font-bold text-[#0F172A] leading-tight mb-1">
            {service.title}
          </h3>

          {service.shortDescription && (
            <p className="text-sm text-[#64748B] mb-3 line-clamp-2 flex-grow">
              {service.shortDescription}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex items-center justify-between pointer-events-auto">
            <span className="text-[#F97316] font-bold text-lg">
              ₹{service.price?.toLocaleString("en-IN")}
            </span>
            {service.duration && (
              <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                {service.duration}
              </span>
            )}
            <span className="text-xs font-semibold text-[#F97316] hover:underline">
              {service.ctaText || "Book Now"} →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
