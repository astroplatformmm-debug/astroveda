"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import type { Service } from "@/lib/types";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS } from "@/lib/serviceCategory";

export default function ServiceDetail() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchService = async () => {
      const id = params?.id;
      if (!id) { setNotFound(true); setLoading(false); return; }
      try {
        const res = await fetch(`/api/services/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = (await res.json()) as Service;
        setService(data);
      } catch (err: unknown) {
        console.error("Service detail fetch failed:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [params?.id]);

  const handleCta = () => {
    if (!service) return;
    // If a custom CTA link is set, use it; otherwise go to contact
    if (service.ctaLink) {
      if (service.ctaLink.startsWith("http")) { window.location.href = service.ctaLink; return; }
      router.push(service.ctaLink);
      return;
    }
    // Default: go to book-slot with service info
    const p = new URLSearchParams({
      serviceId: service._id || "",
      title: service.title,
      price: String(service.price),
    });
    router.push(`/book-slot?${p.toString()}`);
  };

  const consultNow = () => router.push("/contact");

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex justify-center">
      <Spinner className="w-10 h-10 text-[#F97316]" />
    </div>
  );

  if (notFound || !service) return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 text-center">
      <div className="text-6xl mb-4">🔮</div>
      <h1 className="font-playfair text-3xl font-bold text-[#0F172A] mb-3">Service Not Found</h1>
      <p className="text-[#64748B] mb-6">This service doesn&apos;t exist or may have been removed.</p>
      <Link href="/services" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA6C0A] transition-colors">
        ← Back to Services
      </Link>
    </div>
  );

  const category = (service.category || "astrology").toLowerCase() as keyof typeof SERVICE_CATEGORY_LABELS;
  const catIcon = SERVICE_CATEGORY_ICONS[category] ?? "🔮";
  const catLabel = SERVICE_CATEGORY_LABELS[category] ?? service.category ?? "Astrology";

  const bannerSrc = service.bannerImage || service.image;

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* ── BREADCRUMB ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-[#64748B]">
          <Link href="/" className="hover:text-[#F97316] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-[#F97316] transition-colors">Services</Link>
          {service.category && (
            <>
              <span>/</span>
              <Link href={`/services?category=${service.category}`} className="hover:text-[#F97316] transition-colors capitalize">
                {catLabel}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#0F172A] font-medium truncate max-w-[200px]">{service.title}</span>
        </nav>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="relative w-full h-[280px] sm:h-[380px] bg-gradient-to-br from-[#0F172A] to-[#1E293B] overflow-hidden">
        {bannerSrc ? (
          <img src={bannerSrc} alt={service.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[120px] opacity-10">{catIcon}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <span className="inline-flex items-center gap-1.5 bg-[#F97316]/90 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            {catIcon} {catLabel}
          </span>
          <h1 className="font-playfair text-3xl sm:text-5xl font-bold text-white mb-3 max-w-3xl leading-tight">
            {service.title}
          </h1>
          {service.shortDescription && (
            <p className="text-white/80 text-base sm:text-lg max-w-2xl">{service.shortDescription}</p>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: Main Content ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* About section */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
              <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-4">About This Service</h2>
              <div className="prose prose-orange max-w-none text-[#374151] leading-relaxed whitespace-pre-line">
                {service.description}
              </div>
            </div>

            {/* Key Points */}
            {service.keyPoints && service.keyPoints.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
                <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-6">What&apos;s Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.keyPoints.map((kp, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FED7AA]">
                      <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F172A]">{kp.label}</p>
                        {kp.desc && <p className="text-sm text-[#64748B] mt-0.5">{kp.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
                <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-6">Benefits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F172A]">{benefit.label}</p>
                        {benefit.desc && <p className="text-sm text-[#64748B] mt-0.5">{benefit.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default "what to expect" if no keyPoints */}
            {(!service.keyPoints || service.keyPoints.length === 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
                <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-4">What to Expect</h2>
                <ul className="space-y-3">
                  {["Detailed analysis of your planetary positions.", "Actionable insights and personalized remedies.", "Complete privacy and confidential consultation.", "PDF report delivered within 24 hours."].map((item, i) => (
                    <li key={i} className="flex items-start text-[#374151]">
                      <svg className="w-5 h-5 text-[#F97316] mr-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQ */}
            {service.faq && service.faq.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
                <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {service.faq.map((item, i) => (
                    <div key={i} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-[#0F172A] hover:bg-[#FAFAFA] transition-colors"
                      >
                        <span>{item.question}</span>
                        <svg className={`w-5 h-5 text-[#F97316] shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-[#64748B] leading-relaxed border-t border-[#E2E8F0]">
                          <p className="pt-3">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Pricing card */}
              <div className="bg-white rounded-2xl shadow-md border border-[#E2E8F0] p-6">
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-playfair text-4xl font-bold text-[#F97316]">₹{service.price}</span>
                </div>
                {service.duration && (
                  <div className="flex items-center gap-1.5 text-sm text-[#64748B] mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    {service.duration} session
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCta}
                  className="w-full py-3 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold rounded-xl transition-all duration-200 shadow-md text-base mb-3"
                >
                  {service.ctaText || "Book Now"} →
                </button>
                <button
                  type="button"
                  onClick={consultNow}
                  className="w-full py-3 border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white font-bold rounded-xl transition-all duration-200 text-base"
                >
                  Talk to Astrologer
                </button>

                <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-2">
                  {[
                    { icon: "✅", text: "100% Confidential" },
                    { icon: "📄", text: "Detailed PDF Report" },
                    { icon: "⚡", text: "Response within 24 hours" },
                    { icon: "🏆", text: "ISO 9001:2015 Certified" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#64748B]">
                      <span>{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category badge */}
              <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-4 text-center">
                <div className="text-4xl mb-2">{catIcon}</div>
                <p className="font-semibold text-[#0F172A]">{catLabel}</p>
                <Link href={`/services?category=${service.category}`} className="text-xs text-[#F97316] hover:underline mt-1 block">
                  Browse more {catLabel} services →
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/astrologer.png" alt="Mukesh Ravindra Gupta" className="w-12 h-12 rounded-full object-cover border-2 border-[#F97316]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div>
                    <p className="font-bold text-[#0F172A] text-sm">Mukesh Ravindra Gupta</p>
                    <p className="text-xs text-[#F97316]">Certified Vedic Astrologer</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {"⭐⭐⭐⭐⭐".split("").map((s, i) => <span key={i} className="text-[10px]">{s}</span>)}
                      <span className="text-[10px] text-[#64748B] ml-1">5.0 (12k+)</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  25+ years of expertise in Vedic Astrology, Numerology &amp; Vastu. ISO certified professional.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED SERVICES CTA ── */}
        <div className="mt-12 bg-[#0F172A] rounded-2xl py-10 px-6 text-center">
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">Explore More Services</h3>
          <p className="text-white/60 mb-6">Discover our full range of Vedic consultations and remedies.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/services" className="px-6 py-2.5 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA6C0A] transition-colors">
              All Services
            </Link>
            <Link href="/contact" className="px-6 py-2.5 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
