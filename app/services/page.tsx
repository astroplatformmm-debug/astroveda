"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/cards/ServiceCard";
import Spinner from "@/components/ui/Spinner";
import type { Service } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ServicesContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get("category") || "all";

  const extractErrorMessage = async (response: Response) => {
    try {
      const body = await response.json();
      return body.error || `Request failed: ${response.status}`;
    } catch {
      return `Request failed: ${response.status}`;
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const url =
          currentCategory !== "all"
            ? `/api/services?category=${encodeURIComponent(currentCategory.toLowerCase())}`
            : "/api/services";
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(await extractErrorMessage(res));
        }
        const data = (await res.json()) as Service[];
        setServices(data);
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

  const categories = [
    { label: "✦ All Services", value: "all" },
    { label: "Astrology", value: "astrology" },
    { label: "Tarot Reading", value: "tarot" },
    { label: "Numerology Consultation", value: "numerology" },
    { label: "Vastu Consultation", value: "vastu" },
  ];

  const trustItems = [
    { icon: "🙏", value: "50,000+", label: "Happy Clients" },
    { icon: "⭐", value: "4.9/5", label: "Google Rating" },
    { icon: "🏆", value: "ISO", label: "9001:2015 Certified" },
    { icon: "🔒", value: "100%", label: "Confidential" },
    { icon: "🎓", value: "25+ Yrs", label: "Experience" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-[#FAF7F2]">

      {/* ── HERO BANNER ── */}
      <div className="bg-[#F97316] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center min-w-0">
          <p className="text-white/80 text-xs font-semibold tracking-widest uppercase mb-3">
            ✦ Trusted by 10,000+ Souls ✦
          </p>
          <h1 className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold mb-4 px-1">
            Our Astrology Services
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-base sm:text-lg">
            Ancient wisdom tailored for the modern world. Find clarity,
            overcome obstacles, and discover your true potential.
          </p>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 py-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  if (cat.value === "all") {
                    router.push("/services");
                  } else {
                    router.push(`/services?category=${cat.value}`);
                  }
                }}
                className={`px-4 py-2 sm:px-5 sm:py-2 rounded-full font-semibold transition-all duration-200 border-2 text-sm ${
                  currentCategory === cat.value
                    ? "bg-[#F97316] text-white border-[#F97316] shadow-md"
                    : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#F97316] hover:text-[#F97316]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVICES GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10 w-full min-w-0">
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
              <p className="text-center text-gray-500 py-12">
                No services available
              </p>
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
            {trustItems.map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-14 h-14 bg-[#FFF7ED] border border-[#FED7AA] rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                  {item.icon}
                </div>
                <div className="font-playfair text-2xl font-bold text-[#0F172A]">
                  {item.value}
                </div>
                <div className="text-xs text-[#64748B] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Spinner className="w-10 h-10 text-[#F97316]" />
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
