"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/cards/ServiceCard";
import Spinner from "@/components/ui/Spinner";
import TestimonialsSection from "@/components/reviews/TestimonialsSection";
import type { Service } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS } from "@/lib/serviceCategory";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = [
  { label: "✦ All Services", labelHi: "✦ सभी सेवाएं", value: "all", icon: "✦" },
  ...Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => ({
    value, label,
    labelHi: label,
    icon: SERVICE_CATEGORY_ICONS[value as keyof typeof SERVICE_CATEGORY_ICONS] ?? "🔮",
  })),
];

const TRUST_ITEMS = [
  { icon: "🙏", value: "50,000+", label: "Happy Clients", labelHi: "खुश ग्राहक" },
  { icon: "⭐", value: "4.9/5", label: "Google Rating", labelHi: "गूगल रेटिंग" },
  { icon: "🏆", value: "ISO", label: "9001:2015 Certified", labelHi: "9001:2015 प्रमाणित" },
  { icon: "🔒", value: "100%", label: "Confidential", labelHi: "गोपनीय" },
  { icon: "🎓", value: "25+ Yrs", label: "Experience", labelHi: "अनुभव" },
];

function ServicesContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const currentCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const url = currentCategory !== "all"
          ? `/api/services?category=${encodeURIComponent(currentCategory.toLowerCase())}`
          : "/api/services";
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = (await res.json()) as Service[];
        setServices(data); setError("");
      } catch (err: unknown) {
        console.error("Services fetch failed:", err);
        setError(t("Unable to load services right now.", "अभी सेवाएं लोड नहीं हो पा रही हैं।"));
        setServices([]);
      } finally { setLoading(false); }
    };
    fetchServices();
  }, [currentCategory]);

  const handleCategory = (value: string) => {
    if (value === "all") router.push("/services");
    else router.push(`/services?category=${value}`);
  };

  const catLabel = currentCategory === "all"
    ? t("All Services", "सभी सेवाएं")
    : SERVICE_CATEGORY_LABELS[currentCategory as keyof typeof SERVICE_CATEGORY_LABELS] ?? currentCategory;

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-[#FAF7F2]">
      {/* HERO */}
      <div className="bg-[#F97316] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-block bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-4">
            ✦ {t("Trusted by 10,000+ Souls", "10,000+ लोगों का विश्वास")} ✦
          </span>
          <h1 className="font-playfair text-3xl sm:text-5xl font-bold mb-4">
            {t("Our Astrology Services", "हमारी ज्योतिष सेवाएं")}
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-base sm:text-lg mb-6">
            {t("Ancient wisdom tailored for the modern world. Find clarity, overcome obstacles, and discover your true potential.", "आधुनिक दुनिया के लिए प्राचीन ज्ञान। स्पष्टता पाएं, बाधाओं को दूर करें, और अपनी सच्ची क्षमता खोजें।")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><span>🌟</span> {t("Vedic Astrology", "वैदिक ज्योतिष")}</span>
            <span className="flex items-center gap-1.5"><span>🪔</span> {t("Puja & Remedies", "पूजा और उपाय")}</span>
            <span className="flex items-center gap-1.5"><span>🏠</span> {t("Vastu Shastra", "वास्तु शास्त्र")}</span>
            <span className="flex items-center gap-1.5"><span>🔢</span> {t("Numerology", "अंक शास्त्र")}</span>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button key={cat.value} type="button" onClick={() => handleCategory(cat.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${currentCategory === cat.value ? "bg-[#F97316] text-white shadow-md" : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#FFF7ED] hover:text-[#F97316]"}`}>
                <span>{cat.icon}</span>
                <span>{t(cat.label, cat.labelHi || cat.label)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRUST BAR */}
      <div className="bg-[#0F172A] text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-xs">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span>{item.icon}</span>
              <span className="font-bold text-[#F97316]">{item.value}</span>
              <span className="text-white/70">{t(item.label, item.labelHi)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-[#0F172A]">{catLabel}</h2>
            {!loading && (
              <p className="text-sm text-[#64748B] mt-1">
                {services.length} {t("services available", "सेवाएं उपलब्ध")}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner className="w-10 h-10 text-[#F97316]" /></div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-[#64748B]">{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔮</div>
            <h3 className="font-playfair text-2xl font-bold text-[#0F172A] mb-2">{t("No services found", "कोई सेवा नहीं मिली")}</h3>
            <p className="text-[#64748B]">{t("Try selecting a different category.", "कोई अन्य श्रेणी चुनें।")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>

      {/* TESTIMONIALS */}
      <TestimonialsSection />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner className="w-10 h-10 text-[#F97316]" /></div>}>
      <ServicesContent />
    </Suspense>
  );
}
