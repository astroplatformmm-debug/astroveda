import Link from "next/link";
import type { Service } from "@/lib/types";

type ServiceCardData = Service & { id?: string };

export default function ServiceCard({ service }: { service: ServiceCardData }) {
  const serviceId = service._id || service.id;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#E2E8F0] flex flex-col h-full group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

      {/* ── IMAGE AREA ── */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        <img
          src={service.image || "https://picsum.photos/seed/service/600/400"}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Duration badge — top right */}
        {service.duration && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#F97316] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {service.duration}
          </div>
        )}

        {/* Orange icon circle — overlaps into card body */}
        <div className="absolute -bottom-5 left-4 w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center text-lg border-[3px] border-white shadow-md z-10">
          🔮
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-5 pt-8 flex flex-col flex-grow">

        <h3 className="font-playfair text-xl font-bold text-[#0F172A] mb-2 leading-snug">
          {service.title}
        </h3>

        <p className="text-sm text-[#64748B] line-clamp-3 mb-4 flex-grow leading-relaxed">
          {service.description}
        </p>

        {/* ── META ROW ── */}
        <div className="flex items-center gap-4 text-xs text-[#64748B] pb-3 border-b border-[#E2E8F0] mb-3">
          {service.duration && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {service.duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Detailed Report
          </span>
        </div>

        {/* ── FOOTER: PRICE + BOOK BTN ── */}
        <div className="flex items-center justify-between mt-auto">
          <span className="font-playfair text-xl font-bold text-[#F97316]">
            ₹{service.price}
          </span>
          <Link
            href={`/book-slot?serviceId=${serviceId}&title=${encodeURIComponent(service.title)}&price=${service.price}`}
            className="flex items-center gap-1.5 px-4 py-2 border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white text-sm font-semibold rounded-full transition-all duration-200"
          >
            Book Now
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}
