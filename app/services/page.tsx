"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/cards/ServiceCard";
import Spinner from "@/components/ui/Spinner";
import type { Service } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS } from "@/lib/serviceCategory";

const CATEGORIES = [
  { label: "✦ All Services", value: "all", icon: "✦" },
  ...Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
    icon: SERVICE_CATEGORY_ICONS[value as keyof typeof SERVICE_CATEGORY_ICONS] ?? "🔮",
  })),
];

const TRUST_ITEMS = [
  { icon: "🙏", value: "50,000+", label: "Happy Clients" },
  { icon: "⭐", value: "4.9/5", label: "Google Rating" },
  { icon: "🏆", value: "ISO", label: "9001:2015 Certified" },
  { icon: "🔒", value: "100%", label: "Confidential" },
  { icon: "🎓", value: "25+ Yrs", label: "Experience" },
];

function ServicesContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const url =
          currentCategory !== "all"
            ? `/api/services?category=${encodeURIComponent(currentCategory.toLowerCase())}`
            : "/api/services";
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = (await res.json()) as Service[];
        setServices(data);
        setError("");
      } catch (err: unknown) {
        console.error("Services fetch failed:", err);
        setError("Unable to load services right now.");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [currentCategory]);

  const handleCategory = (value: string) => {
    if (value === "all") router.push("/services");
    else router.push(`/services?category=${value}`);
  };

  const catLabel =
    currentCategory === "all"
      ? "All Services"
      : SERVICE_CATEGORY_LABELS[currentCategory as keyof typeof SERVICE_CATEGORY_LABELS] ?? currentCategory;

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-[#FAF7F2]">

      {/* ── HERO BANNER ── */}
      <div className="bg-[#F97316] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-block bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-4">
            ✦ Trusted by 10,000+ Souls ✦
          </span>
          <h1 className="font-playfair text-3xl sm:text-5xl font-bold mb-4">
            Our Astrology Services
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-base sm:text-lg mb-6">
            Ancient wisdom tailored for the modern world. Find clarity, overcome obstacles, and discover your true potential.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><span>🌟</span> Vedic Astrology</span>
            <span className="flex items-center gap-1.5"><span>🪔</span> Puja &amp; Remedies</span>
            <span className="flex items-center gap-1.5"><span>🏠</span> Vastu Shastra</span>
            <span className="flex items-center gap-1.5"><span>🔢</span> Numerology</span>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold transition-all duration-200 border-2 text-sm whitespace-nowrap ${
                  currentCategory === cat.value
                    ? "bg-[#F97316] text-white border-[#F97316] shadow-md"
                    : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#F97316] hover:text-[#F97316]"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVICES GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10 w-full min-w-0">
        {/* Section heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-[#0F172A]">
              {catLabel}
            </h2>
            {!loading && (
              <p className="text-sm text-[#64748B] mt-0.5">
                {services.length} service{services.length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
          {currentCategory !== "all" && (
            <button onClick={() => router.push("/services")} className="text-sm text-[#F97316] hover:underline font-semibold">
              View all →
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="w-10 h-10 text-[#F97316]" />
          </div>
        ) : (
          <>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {services.map((service) => (
                  <ServiceCard key={service._id || service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔮</div>
                <h3 className="font-playfair text-2xl font-bold text-[#0F172A] mb-2">No services found</h3>
                <p className="text-[#64748B] mb-6">
                  {currentCategory !== "all"
                    ? `No services in the "${catLabel}" category yet.`
                    : "No services available right now."}
                </p>
                {currentCategory !== "all" && (
                  <button onClick={() => router.push("/services")} className="px-6 py-2.5 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA6C0A] transition-colors">
                    View all services
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── TRUST BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-4 w-full">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl py-10 px-6">
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-center text-[#0F172A] mb-8">
            Trusted by Thousands
          </h2>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-14 h-14 bg-[#FFF7ED] border border-[#FED7AA] rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                  {item.icon}
                </div>
                <div className="font-playfair text-2xl font-bold text-[#0F172A]">{item.value}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 w-full">
        <div className="bg-[#0F172A] rounded-2xl py-12 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#F97316/15%,transparent_60%)]" />
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 relative z-10">
            Not Sure Which Service Is Right for You?
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-6 relative z-10">
            Talk to our expert astrologer and get personalized guidance on the best path forward for you.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA6C0A] transition-colors shadow-lg relative z-10"
          >
            Talk to Astrologer Now
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="w-10 h-10 text-[#F97316]" /></div>}>
      <ServicesContent />
    </Suspense>
  );
}
